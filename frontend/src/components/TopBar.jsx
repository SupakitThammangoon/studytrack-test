import { useLocation } from 'react-router-dom';
import Notifications from './Notifications';

export default function TopBar({ onMenuClick }) {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === '/') return 'ภาพรวม (Dashboard)';
    if (location.pathname === '/calendar') return 'ปฏิทินงาน';
    if (location.pathname.startsWith('/board/')) return 'Kanban Board';
    return 'StudyTrack';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-10">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="md:hidden text-gray-500 mr-4 hover:text-gray-700"
        >
          <i className="fas fa-bars text-lg"></i>
        </button>
        <h2 className="text-base md:text-lg font-semibold text-gray-800">
          {getTitle()}
        </h2>
      </div>

      <Notifications />
    </header>
  );
}