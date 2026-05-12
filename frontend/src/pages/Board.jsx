import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReactSortable } from 'react-sortablejs';
import { taskAPI, boardAPI } from '../services/api';
import AddTaskModal from '../components/modals/AddTaskModal';
import InviteMemberModal from '../components/modals/InviteMemberModal';

export default function Board() {
  const { id: boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    loadData();
  }, [boardId]);

  const loadData = async () => {
    try {
      const [boardsRes, tasksRes] = await Promise.all([
        boardAPI.getAll(),
        taskAPI.getAll(boardId),
      ]);
      setBoard(boardsRes.data.find((b) => b._id === boardId));
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskAPI.update(taskId, { status: newStatus });
    } catch (err) {
      console.error(err);
      loadData(); // โหลดใหม่ถ้า error
    }
  };

  const deleteTask = async (id) => {
    if (!confirm('ต้องการลบงานนี้?')) return;
    try {
      await taskAPI.delete(id);
      loadData();
    } catch (err) {
      alert('ลบไม่สำเร็จ');
    }
  };

  // Handler สำหรับ drag-drop
  const setColumn = (status) => (newList) => {
    setTasks((prev) => {
      const others = prev.filter((t) => t.status !== status);
      return [...others, ...newList.map((t) => ({ ...t, status }))];
    });

    // อัปเดต status ใน backend สำหรับ task ที่ย้ายเข้ามาใหม่
    newList.forEach((task) => {
      if (task.status !== status) {
        updateTaskStatus(task._id, status);
      }
    });
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-3">
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <h2 className="text-lg font-semibold">{board?.name}</h2>
          <div className="flex -space-x-2">
            {board?.members?.map((m) => (
              <div
                key={m}
                title={m}
                className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold border-2 border-white text-xs"
              >
                {m.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center text-xs font-medium text-slate-500 hover:text-blue-600 bg-white px-3 py-1.5 rounded-full border"
          >
            <i className="fas fa-user-plus mr-1.5"></i> เชิญเพื่อน
          </button>
        </div>

        <button
          onClick={() => setShowAddTask(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center justify-center"
        >
          <i className="fas fa-plus mr-2 text-xs"></i> สร้างงาน
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-6 md:overflow-x-auto pb-4">
        <KanbanColumn
          title="ต้องทำ"
          color="slate"
          tasks={todoTasks}
          setTasks={setColumn('todo')}
          onDelete={deleteTask}
        />
        <KanbanColumn
          title="กำลังทำ"
          color="blue"
          tasks={inProgressTasks}
          setTasks={setColumn('in-progress')}
          onDelete={deleteTask}
        />
        <KanbanColumn
          title="เสร็จแล้ว"
          color="emerald"
          tasks={doneTasks}
          setTasks={setColumn('done')}
          onDelete={deleteTask}
        />
      </div>

      <AddTaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        boardId={boardId}
        onCreated={loadData}
      />
      <InviteMemberModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        boardId={boardId}
        onInvited={loadData}
      />
    </div>
  );
}

function KanbanColumn({ title, color, tasks, setTasks, onDelete }) {
  const colorMap = {
    slate: 'border-t-slate-300',
    blue: 'border-t-blue-400',
    emerald: 'border-t-emerald-400',
  };
  const headerColor = {
    slate: { text: 'text-slate-700', badge: 'bg-slate-100 text-slate-600' },
    blue: { text: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' },
    emerald: { text: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-700' },
  };

  return (
    <div className={`flex-shrink-0 w-full md:w-[320px] bg-white rounded-2xl flex flex-col shadow-sm border-t-4 ${colorMap[color]} border-x border-b`}>
      <div className="px-5 py-4 flex justify-between items-center border-b">
        <h3 className={`font-semibold text-sm ${headerColor[color].text}`}>
          {title}
        </h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${headerColor[color].badge}`}>
          {tasks.length}
        </span>
      </div>

      <ReactSortable
        list={tasks}
        setList={setTasks}
        group="kanban"
        animation={200}
        ghostClass="ghost-card"
        className="px-4 py-4 flex-1 kanban-column bg-slate-50/50 min-h-[200px]"
      >
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onDelete={onDelete} />
        ))}
      </ReactSortable>
    </div>
  );
}

function TaskCard({ task, onDelete }) {
  let dueBadge = null;
  if (task.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    let badgeClass = 'text-slate-400';
    if (task.status !== 'done') {
      if (diffDays < 0) badgeClass = 'text-rose-500 bg-rose-50 px-2 py-0.5 rounded';
      else if (diffDays <= 2) badgeClass = 'text-orange-500 bg-orange-50 px-2 py-0.5 rounded';
    } else {
      badgeClass = 'text-emerald-500';
    }

    dueBadge = (
      <div className={`mt-3 text-xs font-medium ${badgeClass} inline-flex items-center`}>
        <i className="far fa-calendar-alt mr-1"></i>
        {new Date(task.dueDate).toLocaleDateString('th-TH')}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-3 cursor-grab hover:shadow-md hover:border-blue-200 transition-all group">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm leading-snug">{task.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task._id);
          }}
          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition ml-2"
        >
          <i className="fas fa-trash-alt text-xs"></i>
        </button>
      </div>
      {task.desc && (
        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{task.desc}</p>
      )}
      {dueBadge}
    </div>
  );
}