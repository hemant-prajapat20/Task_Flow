import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Layout, Trash2, Edit2, X, Search, ChevronDown, Grid, List as ListIcon, MoreVertical, Briefcase, Rocket, Lightbulb, Clock, CheckCircle2, TrendingUp, CheckSquare, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      // Fetch boards
      const { data: boardsData } = await api.get('/boards');
      setBoards(boardsData);

      // Fetch tasks for all boards in parallel to compute statistics locally (No backend changes!)
      if (boardsData.length > 0) {
        const tasksPromises = boardsData.map(board => api.get(`/tasks/board/${board._id}`));
        const tasksResponses = await Promise.all(tasksPromises);
        const allTasks = tasksResponses.flatMap(res => res.data);
        setTasks(allTasks);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stats Calculations
  const totalBoards = boards.length;
  const totalTasks = tasks.length;
  const todoTasks = tasks.filter(t => t.status === 'todo').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  
  const todoPercentage = totalTasks ? Math.round((todoTasks / totalTasks) * 100) : 0;
  const inProgressPercentage = totalTasks ? Math.round((inProgressTasks / totalTasks) * 100) : 0;
  const completedPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const boardsWithStats = boards.map(board => {
    // Some tasks might have board as an object, others as an ID string depending on population
    const boardTasks = tasks.filter(t => t.board === board._id || t.board?._id === board._id || t.boardId === board._id);
    const completed = boardTasks.filter(t => t.status === 'done').length;
    const completionRate = boardTasks.length ? Math.round((completed / boardTasks.length) * 100) : 0;
    return { ...board, taskCount: boardTasks.length, completionRate };
  });

  // Board Actions
  const openCreateModal = () => {
    setEditingBoardId(null);
    setNewBoardTitle('');
    setNewBoardDescription('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (e, board) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingBoardId(board._id);
    setNewBoardTitle(board.title);
    setNewBoardDescription(board.description || '');
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBoardId(null);
    setNewBoardTitle('');
    setNewBoardDescription('');
    setError('');
  };

  const handleSubmitBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      if (editingBoardId) {
        await api.put(`/boards/${editingBoardId}`, { title: newBoardTitle, description: newBoardDescription });
      } else {
        await api.post('/boards', { title: newBoardTitle, description: newBoardDescription });
      }
      closeModal();
      fetchDashboardData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save board');
    }
  };

  const handleDeleteBoard = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board? All tasks inside will be lost.')) {
      try {
        await api.delete(`/boards/${id}`);
        fetchDashboardData();
      } catch (err) {
        console.error('Failed to delete board:', err);
      }
    }
  };

  // Helper for generating deterministic beautiful gradients/icons based on index
  const cardStyles = [
    { bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500', icon: Briefcase, gradient: 'from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20' },
    { bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500', icon: Rocket, gradient: 'from-emerald-400/10 to-teal-500/10 dark:from-emerald-400/20 dark:to-teal-500/20' },
    { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-500', icon: Lightbulb, gradient: 'from-amber-400/10 to-orange-500/10 dark:from-amber-400/20 dark:to-orange-500/20' },
    { bg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-500', icon: Layout, gradient: 'from-rose-400/10 to-pink-500/10 dark:from-rose-400/20 dark:to-pink-500/20' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Hero Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
            My Boards <span className="text-indigo-400">✨</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Manage your projects and tasks in one place.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-sm shadow-indigo-500/20 active:scale-95 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          New Board
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Boards */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-500 shrink-0">
            <Layout className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Boards</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalBoards}</h3>
            <p className="text-emerald-500 text-xs font-semibold mt-1">+2 this month</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
            <CheckSquare className="h-7 w-7" />
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalTasks}</h3>
            <p className="text-emerald-500 text-xs font-semibold mt-1">+12 this week</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">In Progress</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{inProgressTasks}</h3>
            <p className="text-slate-400 text-xs font-medium mt-1">{inProgressPercentage}% of total</p>
          </div>
          <div className="w-16 h-8 text-amber-500 opacity-50"><TrendingUp className="h-full w-full" /></div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-5">
          <div className="h-14 w-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Completed</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{completedTasks}</h3>
            <p className="text-slate-400 text-xs font-medium mt-1">{completedPercentage}% of total</p>
          </div>
          <div className="w-16 h-8 text-emerald-500 opacity-50"><TrendingUp className="h-full w-full" /></div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      {totalBoards > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          
          {/* Task Status Chart (Horizontal Stacked Bar) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-center">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-indigo-500" /> Task Breakdown
              </h3>
              <span className="text-sm font-medium text-slate-500">{totalTasks} Total</span>
            </div>
            
            {/* The Stacked Bar */}
            <div className="h-6 w-full flex rounded-full overflow-hidden mb-6 bg-slate-100 dark:bg-slate-700">
              {totalTasks === 0 ? (
                <div className="w-full h-full bg-slate-200 dark:bg-slate-700"></div>
              ) : (
                <>
                  <div style={{ width: `${todoPercentage}%` }} className="bg-slate-400 dark:bg-slate-500 hover:opacity-90 transition-opacity cursor-pointer relative group"></div>
                  <div style={{ width: `${inProgressPercentage}%` }} className="bg-amber-400 dark:bg-amber-500 hover:opacity-90 transition-opacity cursor-pointer"></div>
                  <div style={{ width: `${completedPercentage}%` }} className="bg-emerald-500 hover:opacity-90 transition-opacity cursor-pointer"></div>
                </>
              )}
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500"></div> To Do
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{todoPercentage}%</div>
                <div className="text-xs text-slate-400">{todoTasks} tasks</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500"></div> In Progress
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{inProgressPercentage}%</div>
                <div className="text-xs text-slate-400">{inProgressTasks} tasks</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Done
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{completedPercentage}%</div>
                <div className="text-xs text-slate-400">{completedTasks} tasks</div>
              </div>
            </div>
          </div>

          {/* Project Completion Chart (Vertical List) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-indigo-500" /> Project Completion
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-5 custom-scrollbar max-h-64">
              {boardsWithStats.length === 0 ? (
                <div className="text-center text-sm text-slate-500">No projects to display.</div>
              ) : (
                boardsWithStats.map(board => (
                  <div key={board._id}>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{board.title}</h4>
                        <p className="text-xs text-slate-500">{board.taskCount} total tasks</p>
                      </div>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{board.completionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${board.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      )}

      {/* Board Cards Grid */}
      {boards.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl border-dashed">
          <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
            <Layout className="h-8 w-8 text-indigo-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
            Create your first board to start organizing your tasks and tracking your progress.
          </p>
          <button
            onClick={openCreateModal}
            className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors inline-flex items-center gap-2 shadow-sm shadow-indigo-500/20"
          >
            <Plus className="h-5 w-5" />
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {boards.map((board, index) => {
            const style = cardStyles[index % cardStyles.length];
            const Icon = style.icon;
            // Dummy avatars based on index for the mockup feel
            const avatars = [
              `https://ui-avatars.com/api/?name=John&background=random`,
              `https://ui-avatars.com/api/?name=Sarah&background=random`,
              `https://ui-avatars.com/api/?name=Mike&background=random`
            ];

            return (
              <div key={board._id} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                {/* Header Gradient Area */}
                <div className={`h-32 w-full bg-gradient-to-br ${style.gradient} relative p-5 flex items-start justify-between shrink-0`}>
                  <div className={`p-2.5 rounded-xl ${style.bg} shadow-sm backdrop-blur-sm`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="relative group/menu">
                    <button className="p-1.5 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 rounded-lg backdrop-blur-sm transition-colors text-slate-700 dark:text-slate-300">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10 p-1">
                      <button onClick={(e) => openEditModal(e, board)} className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"><Edit2 className="h-3.5 w-3.5"/> Edit</button>
                      <button onClick={(e) => handleDeleteBoard(e, board._id)} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2"><Trash2 className="h-3.5 w-3.5"/> Delete</button>
                    </div>
                  </div>
                </div>

                {/* Body Area */}
                <Link to={`/board/${board._id}`} className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-500 transition-colors">{board.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                    {board.description || 'No description provided.'}
                  </p>
                  
                  <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-6 w-fit">
                    Project Board
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex -space-x-2">
                      {avatars.map((avatar, i) => (
                        <img key={i} src={avatar} alt="Team member" className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800" />
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        +2
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <Clock className="h-3.5 w-3.5" />
                      Updated {Math.floor(Math.random() * 5) + 1}d ago
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}



      {/* Create Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold">{editingBoardId ? 'Edit Board' : 'Create New Board'}</h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitBoard} className="p-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-lg text-sm font-medium mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Board Title</label>
                  <input
                    type="text"
                    required
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g., Marketing Campaign"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-slate-700 dark:text-slate-300">Description</label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                    placeholder="Brief description of this project..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-sm shadow-indigo-500/20 transition-all">
                  {editingBoardId ? 'Save Changes' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
