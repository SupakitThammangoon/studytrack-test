import { useState } from 'react';
import { boardAPI } from '../../services/api';

export default function InviteMemberModal({ open, onClose, boardId, onInvited }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!username.trim()) {
      alert('กรุณากรอกชื่อผู้ใช้');
      return;
    }
    setLoading(true);
    try {
      await boardAPI.addMember(boardId, username);
      setUsername('');
      onInvited?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold mb-2">เชิญเพื่อนร่วมทีม</h2>
        <p className="text-sm text-gray-500 mb-5">ใส่ชื่อผู้ใช้ของเพื่อนเพื่อเพิ่มเข้าบอร์ด</p>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          autoFocus
          className="w-full border border-gray-200 p-3 rounded-lg mb-6 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          placeholder="ชื่อผู้ใช้..."
        />
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'กำลังเชิญ...' : 'เชิญเข้าทีม'}
          </button>
        </div>
      </div>
    </div>
  );
}