import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Sun, Moon, Menu, Layout, CheckSquare, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const Navbar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ boards: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Theme Management
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  // Initials Generator
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Close Search Dropdown on Click Outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search API Call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        setShowDropdown(true);
        try {
          const { data } = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`);
          setResults(data);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults({ boards: [], tasks: [] });
        setShowDropdown(false);
      }
    }, 300); // Wait 300ms after user stops typing to fetch

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header className="bg-transparent border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3 sm:py-0 sm:h-20 flex flex-wrap items-center justify-between shrink-0 gap-y-3 gap-x-4">
      
      {/* Left Section */}
      <div className="order-1 flex items-center gap-4 lg:gap-6 w-auto lg:w-1/3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Welcome Message (Exactly as requested) */}
        <span className="text-[15px] font-medium text-slate-700 dark:text-slate-200 hidden lg:block">
          Welcome, <span className="font-bold text-slate-900 dark:text-white capitalize">{user.name || user.username}</span> 👋
        </span>
      </div>

      {/* Center Section: Global Search */}
      <div className="order-3 sm:order-2 flex-1 flex justify-center w-full min-w-full sm:min-w-0 lg:w-1/3 relative px-1 sm:px-4" ref={searchRef}>
        <div className="relative w-full max-w-md xl:max-w-lg z-30">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isSearching ? (
              <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-slate-400" />
            )}
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchQuery.trim().length > 0) setShowDropdown(true); }}
            className={`w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border ${showDropdown ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700'} rounded-full text-sm outline-none transition-all shadow-sm`}
            placeholder="Search tasks, boards, and projects..."
          />

          {/* Search Results Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden max-h-96 overflow-y-auto">
              {!isSearching && results.boards.length === 0 && results.tasks.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No results found for "{searchQuery}"
                </div>
              ) : (
                <div className="py-2">
                  
                  {/* Board Results */}
                  {results.boards.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Boards</div>
                      {results.boards.map(board => (
                        <Link 
                          key={board._id} 
                          to={`/board/${board._id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-md shrink-0">
                            <Layout className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{board.title}</h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">{board.description || 'Project Board'}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Task Results */}
                  {results.tasks.length > 0 && (
                    <div>
                      <div className="px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Tasks</div>
                      {results.tasks.map(task => (
                        <Link 
                          key={task._id} 
                          to={`/board/${task.board?._id || task.board}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-md shrink-0">
                            <CheckSquare className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Status: <span className="uppercase text-[10px] font-bold">{task.status}</span> • Priority: <span className="uppercase text-[10px] font-bold">{task.priority}</span>
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Theme & Avatar */}
      <div className="order-2 sm:order-3 flex items-center justify-end gap-3 sm:gap-6 w-auto lg:w-1/3">
        <button 
          onClick={toggleTheme}
          className="p-2 sm:p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 shadow-sm transition-colors"
        >
          {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block"></div>

        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm border border-indigo-200 dark:border-indigo-800/50 select-none">
          {getInitials(user.name || user.username)}
        </div>
      </div>

    </header>
  );
};

export default Navbar;
