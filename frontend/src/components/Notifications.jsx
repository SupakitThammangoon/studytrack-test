import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI, boardAPI, invitationAPI } from '../services/api';

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [taskNotifs, setTaskNotifs] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [tasksRes, boardsRes, invitesRes] = await Promise.all([
        taskAPI.getAll(),
        boardAPI.getAll(),
        invitationAPI.getMine(),
      ]);

      // Task notifications (งานใกล้ครบกำหนด)
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
      setTaskNotifs(list);
      setInvitations(invitesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id) => {
    try {
      await invitationAPI.accept(id);
      await loadAll();
      // Reload page เพื่อให้ Sidebar เห็นบอร์ดใหม่
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

  const handleReject = async (id) => {
    try {
      await invitationAPI.reject(id);
      await loadAll();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
  };

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

  const totalCount = taskNotifs.length + invitations.length;

  return (
    <div className="relative notification-wrapper">
      <button
        onClick={() => setOpen(!open)}
        className="text-gray-400 hover:text-blue-600 relative p-2 rounded-full hover:bg-slate-50 transition-colors"
      >
        <i className="fas fa-bell"></i>
        {totalCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <h3 className="font-semibold text-sm">การแจ้งเตือน</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {/* คำเชิญเข้าบอร์ด */}
            {invitations.map((inv) => (
              <div key={inv._id} className="p-4 border-b border-gray-50 bg-blue-50/30">
                <p className="text-sm text-gray-800">
                  <span className="font-semibold">{inv.fromUser}</span> เชิญคุณเข้าบอร์ด
                </p>
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  <i className="fas fa-folder text-xs mr-1"></i>
                  {inv.boardName}
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => handleAccept(inv._id)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg"
                  >
                    ยอมรับ
                  </button>
                  <button
                    onClick={() => handleReject(inv._id)}
                    className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg"
                  >
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            ))}

            {/* Task ใกล้ครบกำหนด */}
            {taskNotifs.map((n) => (
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
            ))}

            {totalCount === 0 && (
              <div className="p-6 text-center text-sm text-gray-400">
                ไม่มีการแจ้งเตือน
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}