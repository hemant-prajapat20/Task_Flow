import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { CheckSquare, Clock, Calendar, AlertCircle, Loader2, Layout } from 'lucide-react';

const GlobalTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllTasks = async () => {
    try {
      setIsLoading(true);
      // 1. Fetch all boards
      const { data: boards } = await api.get('/boards');
      
      // 2. Fetch all tasks for each board
      const tasksPromises = boards.map(board => api.get(`/tasks/board/${board._id}`));
      const tasksResponses = await Promise.all(tasksPromises);
      
      // 3. Combine tasks and attach the board title to each
      let allTasks = [];
      tasksResponses.forEach((res, index) => {
        const boardTasks = res.data.map(task => ({
          ...task,
          boardTitle: boards[index].title,
          boardId: boards[index]._id
        }));
        allTasks = [...allTasks, ...boardTasks];
      });

      // Sort by newest first by default
      allTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
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

  const priorityColors = {
    low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    medium: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  };

  const statusColors = {
    'todo': 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    'done': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CheckSquare className="w-48 h-48 text-indigo-500 transform rotate-12 translate-x-8 -translate-y-8" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">All Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl">
            A comprehensive list of every task across all your project boards.
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No tasks found. Create a board and add tasks to see them here!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {tasks.map(task => (
              <div key={task._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColors[task.status]}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    <Link to={`/board/${task.boardId}`} className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                      <Layout className="h-3.5 w-3.5" />
                      {task.boardTitle}
                    </Link>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {task.title}
                  </h3>
                  
                  {task.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 max-w-3xl">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 shrink-0 md:w-64 justify-end">
                  {task.estimatedEffort && (
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      {task.estimatedEffort}
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <div className={`flex items-center gap-1.5 text-sm font-medium ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>
                      {isOverdue(task.dueDate) && task.status !== 'done' ? <AlertCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" /> }
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalTasks;
