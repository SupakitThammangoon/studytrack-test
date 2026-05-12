import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check-circle text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">เข้าสู่ระบบสำเร็จ! 🎉</h1>
          <p className="text-gray-500 mt-2">ยินดีต้อนรับ <strong>{user?.username}</strong></p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-4">
          <p className="text-xs text-gray-500 mb-1">ID:</p>
          <p className="text-sm font-mono text-gray-700 break-all">{user?._id}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Token (preview):</p>
          <p className="text-xs font-mono text-gray-700 break-all">{user?.token?.substring(0, 50)}...</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full bg-rose-600 text-white font-medium py-2.5 rounded-lg hover:bg-rose-700 transition-all"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>ออกจากระบบ
        </button>
      </div>
    </div>
  );
}