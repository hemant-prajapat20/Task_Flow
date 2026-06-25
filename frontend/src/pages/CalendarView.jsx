import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Layout, Clock } from 'lucide-react';

const CalendarView = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Manage current month/year view based on Indian Standard Time
  const [currentDate, setCurrentDate] = useState(() => {
    // Initialize with current date in IST
    const istString = new Date().toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    return new Date(istString);
  });

  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      const { data: boards } = await api.get('/boards');
      const tasksPromises = boards.map(board => api.get(`/tasks/board/${board._id}`));
      const tasksResponses = await Promise.all(tasksPromises);
      
      let allTasks = [];
      tasksResponses.forEach((res, index) => {
        const boardTasks = res.data.map(task => ({
          ...task,
          boardTitle: boards[index].title,
          boardId: boards[index]._id
        }));
        allTasks = [...allTasks, ...boardTasks];
      });
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // Calendar Logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const totalCells = firstDay + daysInMonth;
  const totalRows = Math.ceil(totalCells / 7);
  const gridRowsClass = totalRows === 6 ? 'grid-rows-6' : (totalRows === 5 ? 'grid-rows-5' : 'grid-rows-4');

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Helper to format date to YYYY-MM-DD in IST for exact string matching
  const getISTDateString = (dateObj) => {
    const istString = dateObj.toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    const istDate = new Date(istString);
    const d = istDate.getDate();
    const m = istDate.getMonth() + 1;
    const y = istDate.getFullYear();
    return `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
  };

  const getTasksForDay = (day) => {
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskISTDateStr = getISTDateString(new Date(task.dueDate));
      return taskISTDateStr === dateStr;
    });
  };

  const isToday = (day) => {
    const today = new Date();
    const istString = today.toLocaleString("en-US", {timeZone: "Asia/Kolkata"});
    const istToday = new Date(istString);
    return day === istToday.getDate() && month === istToday.getMonth() && year === istToday.getFullYear();
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-800 shrink-0 gap-4 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="p-2.5 sm:p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Project Calendar</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Timezone: Indian Standard Time (IST)</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-4 bg-slate-50 dark:bg-slate-800/50 sm:bg-transparent p-2 sm:p-0 rounded-2xl sm:rounded-none">
          <button onClick={prevMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 sm:hover:bg-slate-100 dark:sm:hover:bg-slate-800 rounded-xl transition-colors shadow-sm sm:shadow-none">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <input 
            type="month"
            value={`${year}-${(month + 1).toString().padStart(2, '0')}`}
            onChange={(e) => {
              if (e.target.value) {
                const [y, m] = e.target.value.split('-');
                setCurrentDate(new Date(parseInt(y), parseInt(m) - 1, 1));
              }
            }}
            className="text-lg sm:text-xl font-bold w-40 sm:w-48 text-center text-slate-900 dark:text-white bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-indigo-500 rounded-lg outline-none transition-all py-1 px-2 cursor-pointer"
          />
          <button onClick={nextMonth} className="p-2 hover:bg-white dark:hover:bg-slate-700 sm:hover:bg-slate-100 dark:sm:hover:bg-slate-800 rounded-xl transition-colors shadow-sm sm:shadow-none">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto flex flex-col">
        <div className="min-w-[800px] flex flex-col h-full">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
          {days.map(day => (
            <div key={day} className="py-3 text-center text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className={`flex-1 grid grid-cols-7 ${gridRowsClass} auto-rows-fr`}>
          {/* Empty cells before the 1st */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="border-b border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30"></div>
          ))}
          
          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayTasks = getTasksForDay(day);
            const today = isToday(day);
            
            return (
              <div key={day} className={`border-b border-r border-slate-100 dark:border-slate-800/50 p-2 overflow-hidden flex flex-col transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30
                ${today ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
              >
                <div className="flex justify-between items-center mb-1 shrink-0">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full
                    ${today ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                  {dayTasks.map(task => (
                    <Link 
                      key={task._id} 
                      to={`/board/${task.boardId}`}
                      className={`block p-2 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all ${priorityColors[task.priority]} shadow-sm`}
                    >
                      <h4 className="text-xs font-bold truncate mb-0.5">{task.title}</h4>
                      <p className="text-[10px] opacity-80 truncate flex items-center gap-1">
                        <Layout className="h-3 w-3" /> {task.boardTitle}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Empty cells after the last day */}
          {Array.from({ length: (42 - (firstDay + daysInMonth)) % 7 }).map((_, i) => (
            <div key={`empty-end-${i}`} className="border-b border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/30 dark:bg-slate-900/30"></div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
