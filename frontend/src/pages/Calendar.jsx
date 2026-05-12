import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';

const monthNames = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const res = await taskAPI.getAll();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const cells = [];

  // Empty cells ก่อนวันที่ 1
  for (let i = 0; i < firstDay; i++) {
    cells.push(
      <div
        key={`empty-${i}`}
        className="bg-slate-50/50 min-h-[80px] md:min-h-[100px] p-2"
      ></div>
    );
  }

  // วันที่ในเดือน
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).toISOString().split('T')[0] === dateStr;
    });
    const isToday = dateStr === todayStr;

    cells.push(
      <div
        key={day}
        className={`bg-white min-h-[80px] md:min-h-[100px] p-2 hover:bg-slate-50 transition ${
          isToday ? 'bg-blue-50/30' : ''
        }`}
      >
        <div className={`text-xs font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
          {isToday ? (
            <span className="bg-blue-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">
              {day}
            </span>
          ) : (
            day
          )}
        </div>
        <div>
          {dayTasks.map((t) => (
            <div
              key={t._id}
              onClick={() => navigate(`/board/${t.boardId}`)}
              title={t.title}
              className={`text-[10px] mt-1 p-1 px-1.5 rounded border truncate cursor-pointer font-medium ${
                t.status === 'done'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100'
              }`}
            >
              {t.title}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg md:text-xl font-bold">
            {monthNames[month]} {year + 543}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => changeMonth(-1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50"
            >
              <i className="fas fa-chevron-left text-xs"></i>
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50"
            >
              <i className="fas fa-chevron-right text-xs"></i>
            </button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden border border-gray-100">
          <div className="grid grid-cols-7 text-center font-medium bg-white py-3 border-b text-xs md:text-sm text-slate-500">
            <div>อา.</div>
            <div>จ.</div>
            <div>อ.</div>
            <div>พ.</div>
            <div>พฤ.</div>
            <div>ศ.</div>
            <div>ส.</div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-100 border border-slate-100">
            {cells}
          </div>
        </div>
      </div>
    </div>
  );
}