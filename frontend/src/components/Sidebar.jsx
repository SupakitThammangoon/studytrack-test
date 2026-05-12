import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { boardAPI } from '../services/api';
import AddBoardModal from './modals/AddBoardModal';

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [boards, setBoards] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const loadBoards = async () => {
    try {
      const res = await boardAPI.getAll();
      setBoards(res.data);
    } catch (err) {
      console.error('โหลดบอร์ดไม่สำเร็จ:', err);
    }
  };

  useEffect(() => {
    if (user) loadBoards();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;
  const isActiveBoard = (id) => location.pathname === `/board/${id}`;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative z-40 md:z-20
          w-64 h-full bg-slate-900 flex flex-col shadow-xl
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <i className="fas fa-book-open text-xl text-blue-500 mr-3"></i>
          <span className="text-lg font-bold text-white">StudyTrack</span>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1.5 px-4">
            <li>
              <Link
                to="/"
                onClick={onClose}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isActive('/')
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className="fas fa-chart-pie w-6"></i>
                ภาพรวม
              </Link>
            </li>
            <li>
              <Link
                to="/calendar"
                onClick={onClose}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  isActive('/calendar')
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <i className="fas fa-calendar-alt w-6"></i>
                ปฏิทิน
              </Link>
            </li>
          </ul>

          {/* Boards section */}
          <div className="mt-8 px-5 mb-3 flex justify-between items-center">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              วิชาเรียน / โปรเจกต์
            </h3>
            <button
              onClick={() => setShowModal(true)}
              className="text-slate-500 hover:text-white p-1 transition-colors"
              title="สร้างบอร์ดใหม่"
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>

          <ul className="space-y-1 px-4">
            {boards.length === 0 ? (
              <li className="px-4 py-2 text-xs text-slate-500 italic">
                ยังไม่มีบอร์ด กด + เพื่อสร้าง
              </li>
            ) : (
              boards.map((board) => (
                <li key={board._id}>
                  <Link
                    to={`/board/${board._id}`}
                    onClick={onClose}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg truncate transition-all ${
                      isActiveBoard(board._id)
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <i className="fas fa-folder w-6"></i>
                    <span className="truncate">{board.name}</span>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center p-2 rounded-lg">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">
                {user?.username}
              </p>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </aside>

      <AddBoardModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={loadBoards}
      />
    </>
  );
}