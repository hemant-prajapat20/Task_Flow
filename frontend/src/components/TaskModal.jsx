import React, { useState, useEffect } from 'react';
import { X, Sparkles, Calendar, Clock, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const TaskModal = ({ isOpen, onClose, onSubmit, task, boardId }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    estimatedEffort: ''
  });
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        estimatedEffort: task.estimatedEffort || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: '',
        estimatedEffort: ''
      });
    }
    setAiError('');
    setAiSuggestion(null);
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const suggestEstimate = async () => {
    if (!formData.title) {
      setAiError('Please enter a task title first');
      return;
    }

    setIsAiLoading(true);
    setAiError('');

    try {
      const { data } = await api.post('/ai/suggest-estimate', {
        title: formData.title,
        description: formData.description
      });
      
      setAiSuggestion(data);
      
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to get AI suggestion');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg my-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-surface-light dark:bg-surface-dark z-10 rounded-t-2xl">
          <h3 className="text-lg font-semibold">{task ? 'Edit Task' : 'Create Task'}</h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="What needs to be done?"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-y min-h-[100px]"
                placeholder="Add more details..."
              />
            </div>

            {/* AI Assistant Section */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                    Let AI estimate effort and suggest a due date based on your title & description.
                  </p>
                  {aiError && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {aiError}
                    </p>
                  )}
                </div>
                <button
                  id="ai-btn"
                  type="button"
                  onClick={suggestEstimate}
                  disabled={isAiLoading}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800/50 dark:hover:bg-indigo-700/80 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <div className="h-3.5 w-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  Suggest
                </button>
              </div>

              {aiSuggestion && (
                <div className="mt-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-indigo-100 dark:border-indigo-800/50 animate-in slide-in-from-top-2">
                  <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2">AI Suggestion Preview:</h5>
                  <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 mb-3">
                    <p><span className="font-semibold">Description:</span> {aiSuggestion.description}</p>
                    <p><span className="font-semibold">Priority:</span> <span className="capitalize">{aiSuggestion.priority}</span></p>
                    <p><span className="font-semibold">Status:</span> <span className="capitalize">{aiSuggestion.status}</span></p>
                    <p><span className="font-semibold">Effort:</span> {aiSuggestion.effort}</p>
                    <p><span className="font-semibold">Due:</span> {aiSuggestion.dueDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          description: aiSuggestion.description || prev.description,
                          priority: aiSuggestion.priority || prev.priority,
                          status: aiSuggestion.status || prev.status,
                          estimatedEffort: aiSuggestion.effort || prev.estimatedEffort,
                          dueDate: aiSuggestion.dueDate || prev.dueDate
                        }));
                        setAiSuggestion(null);
                      }}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                      Accept & Fill
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiSuggestion(null)}
                      className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-secondary" />
                  Effort Estimate
                </label>
                <input
                  type="text"
                  name="estimatedEffort"
                  value={formData.estimatedEffort}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none"
                  placeholder="e.g. 2 hours, 1 day, Size M"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-secondary" />
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all duration-200"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
