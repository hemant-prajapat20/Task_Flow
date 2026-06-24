import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, LayoutDashboard, Moon, Sun, User, Search, Layout, CheckCircle } from 'lucide-react';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ boards: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ boards: [], tasks: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await api.get(`/search?q=${searchQuery}`);
        setSearchResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResultClick = (path) => {
    setIsDropdownOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  return (
    <nav className="bg-surface-light dark:bg-surface-dark shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary shrink-0">
          <LayoutDashboard className="h-6 w-6" />
          <span className="hidden sm:inline">TaskFlow</span>
        </Link>
        
        {user && (
          <div className="flex-1 max-w-xl mx-auto relative" ref={dropdownRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search boards and tasks..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-primary/50 text-sm outline-none transition-all"
              />
            </div>

            {isDropdownOpen && searchQuery.trim() && (
              <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-slate-500">Searching...</div>
                ) : searchResults.boards.length === 0 && searchResults.tasks.length === 0 ? (
                  <div className="p-4 text-center text-sm text-slate-500">No results found for "{searchQuery}"</div>
                ) : (
                  <div className="max-h-96 overflow-y-auto py-2">
                    {searchResults.boards.length > 0 && (
                      <div className="px-3 pb-1">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Boards</h4>
                        {searchResults.boards.map(board => (
                          <button
                            key={board._id}
                            onClick={() => handleResultClick(`/board/${board._id}`)}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-md">
                              <Layout className="h-4 w-4" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium truncate">{board.title}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.boards.length > 0 && searchResults.tasks.length > 0 && (
                      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />
                    )}

                    {searchResults.tasks.length > 0 && (
                      <div className="px-3 pt-1">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Tasks</h4>
                        {searchResults.tasks.map(task => (
                          <button
                            key={task._id}
                            onClick={() => handleResultClick(`/board/${task.board?._id || task.board}`)}
                            className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-md">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-sm font-medium truncate">{task.title}</p>
                              <p className="text-xs text-slate-500 truncate">{task.board?.title ? `in ${task.board.title}` : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>
          
          {user ? (
            <div className="flex items-center gap-2 sm:gap-6">
              <span className="hidden sm:flex items-center gap-2 text-sm font-medium">
                Welcome, {user.name.split(' ')[0]} 👏
              </span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-2 py-1 rounded-md"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-3 py-2 text-sm font-medium hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/register" className="px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
