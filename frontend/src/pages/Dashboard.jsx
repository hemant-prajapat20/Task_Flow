import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Layout, Trash2, Edit2, X } from 'lucide-react';

const Dashboard = () => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [error, setError] = useState('');

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/boards');
      setBoards(data);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    try {
      await api.post('/boards', {
        title: newBoardTitle,
        description: newBoardDescription
      });
      setIsModalOpen(false);
      setNewBoardTitle('');
      setNewBoardDescription('');
      fetchBoards();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create board');
    }
  };

  const handleDeleteBoard = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this board? All tasks inside will be lost.')) {
      try {
        await api.delete(`/boards/${id}`);
        fetchBoards();
      } catch (err) {
        console.error('Failed to delete board:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Boards</h1>
          <p className="text-secondary mt-1">Manage your projects and tasks</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm hover:shadow-primary/30 hover:shadow-lg active:scale-95 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Create Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-16 bg-surface-light dark:bg-surface-dark border border-slate-200 dark:border-slate-800 rounded-2xl border-dashed">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Layout className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
          <p className="text-secondary mb-6 max-w-sm mx-auto">
            Create your first board to start organizing your tasks and tracking your progress.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {boards.map(board => (
            <Link
              key={board._id}
              to={`/board/${board._id}`}
              className="group block p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/40 dark:hover:border-primary/40 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Layout className="h-6 w-6 text-primary" />
                </div>
                <button
                  onClick={(e) => handleDeleteBoard(e, board._id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Delete Board"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">{board.title}</h3>
              <p className="text-secondary text-sm line-clamp-2">
                {board.description || 'No description provided.'}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                Created {new Date(board.createdAt).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Board Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">Create New Board</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateBoard} className="p-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Board Title</label>
                  <input
                    type="text"
                    required
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                    placeholder="e.g., Marketing Campaign"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={newBoardDescription}
                    onChange={(e) => setNewBoardDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Brief description of this project..."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Create Board
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
