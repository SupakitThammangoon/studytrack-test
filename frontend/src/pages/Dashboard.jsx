import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, boardAPI } from '../services/api';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksRes, boardsRes] = await Promise.all([
        taskAPI.getAll(),
        boardAPI.getAll(),
      ]);
      setTasks(tasksRes.data);
      setBoards(boardsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>;
  }

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const urgentTasks = tasks.filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const diffDays = Math.ceil((new Date(t.dueDate) - today) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  });

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
        <StatCard
          icon="fa-tasks"
          color="blue"
          label="งานทั้งหมด"
          value={totalTasks}
        />
        <StatCard
          icon="fa-check-circle"
          color="emerald"
          label="งานที่เสร็จแล้ว"
          value={doneTasks}
        />
        <StatCard
          icon="fa-clock"
          color="rose"
          label="งานใกล้ถึงกำหนด"
          value={urgentTasks.length}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Progress Bars */}
        <div className="bg-white rounded-2xl shadow-sm p-7 border border-gray-100">
          <h3 className="text-base font-bold mb-6">
            <i className="fas fa-chart-line text-gray-400 mr-2"></i>
            ความคืบหน้าแต่ละวิชา
          </h3>
          <div className="space-y-5">
            {boards.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                ยังไม่มีวิชา/โปรเจกต์
              </p>
            ) : (
              boards.map((board) => {
                const bTasks = tasks.filter((t) => t.boardId === board._id);
                const percent =
                  bTasks.length > 0
                    ? Math.round(
                        (bTasks.filter((t) => t.status === 'done').length /
                          bTasks.length) *
                          100
                      )
                    : 0;
                let barColor = 'bg-blue-500';
                if (percent === 100) barColor = 'bg-emerald-400';
                else if (percent > 0 && percent < 30) barColor = 'bg-orange-400';

                return (
                  <div key={board._id}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium truncate pr-4">
                        {board.name}
                      </span>
                      <span className="text-xs font-bold text-gray-500">
                        {percent}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`${barColor} h-1.5 rounded-full transition-all duration-1000`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="bg-white rounded-2xl shadow-sm p-7 border border-gray-100">
          <h3 className="text-base font-bold mb-6">
            <i className="fas fa-exclamation-circle text-orange-400 mr-2"></i>
            งานที่ต้องทำด่วน
          </h3>
          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                ไม่มีงานด่วน 🎉
              </p>
            ) : (
              urgentTasks.map((task) => {
                const diffDays = Math.ceil(
                  (new Date(task.dueDate) - today) / (1000 * 60 * 60 * 24)
                );
                const board = boards.find((b) => b._id === task.boardId);
                const color =
                  diffDays === 0
                    ? 'text-rose-500 bg-rose-50 border-rose-100'
                    : 'text-orange-500 bg-orange-50 border-orange-100';
                return (
                  <div
                    key={task._id}
                    onClick={() => navigate(`/board/${task.boardId}`)}
                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div>
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {board?.name || ''}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${color}`}>
                      {diffDays === 0 ? 'วันนี้!' : `อีก ${diffDays} วัน`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, color, label, value }) {
  const colorMap = {
    blue: 'text-blue-500',
    emerald: 'text-emerald-500',
    rose: 'text-rose-500',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center mb-2 text-gray-500">
        <i className={`fas ${icon} mr-2 ${colorMap[color]}`}></i>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  );
}