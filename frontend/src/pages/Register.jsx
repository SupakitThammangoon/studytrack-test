import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร');
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      await register(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-800 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-user-plus text-3xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">สมัครสมาชิก</h1>
          <p className="text-gray-400 mt-2 text-sm">สร้างบัญชีใหม่เพื่อใช้งาน StudyTrack</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wide">
              ชื่อผู้ใช้
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
              placeholder="อย่างน้อย 3 ตัวอักษร"
              required
              minLength={3}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-600 text-xs font-semibold mb-2 uppercase tracking-wide">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>

          <div className="text-center mt-6">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">
              มีบัญชีแล้ว? เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}