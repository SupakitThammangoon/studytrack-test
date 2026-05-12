import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, boardAPI } from '../services/api';

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const [tasksRes, boardsRes] = await Promise.all([
        taskAPI.getAll(),
        boardAPI.getAll(),
      ]);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const list = [];
      tasksRes.data.forEach((task) => {
        if (task.status !== 'done' && task.dueDate) {
          const due = new Date(task.dueDate);
          const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 2) {
            const board = boardsRes.data.find((b) => b._id === task.boardId);
            list.push({
              taskId: task._id,
              boardId: task.boardId,
              title: task.title,
              boardName: board?.name || '',
              daysLeft: diffDays,
            });
          }
        }
      });
      setNotifs(list);
    } catch (err) {
      console.error(err);
    }
  };

  // Close dropdown when click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('.notification-wrapper')) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [open]);

  return (
    <div className="relative notification-wrapper">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-blue-600 relative p-2 rounded-full hover:bg-slate-50 transition-colors"
      >
        <i className="fas fa-bell"></i>
        {notifs.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <h3 className="font-semibold text-sm">การแจ้งเตือน</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                ไม่มีการแจ้งเตือน
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.taskId}
                  onClick={() => {
                    setOpen(false);
                    navigate(`/board/${n.boardId}`);
                  }}
                  className="p-4 border-b border-gray-50 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    <i className="fas fa-folder text-gray-400 mr-1"></i>
                    {n.boardName}
                  </p>
                  <p className={`text-xs font-medium mt-2 flex items-center ${
                    n.daysLeft === 0 ? 'text-rose-500' : 'text-orange-500'
                  }`}>
                    <i className="far fa-clock mr-1"></i>
                    {n.daysLeft === 0 ? 'ครบกำหนดวันนี้!' : `อีก ${n.daysLeft} วัน`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}