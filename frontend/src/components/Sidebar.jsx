import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Columns, CheckSquare, Calendar, BarChart2, Users, Settings, LogOut, CheckCircle2, Sparkles, ChevronDown, Layout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const navLinks = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'All Boards', icon: Layout, path: '/boards' },
    { name: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { name: 'Calendar', icon: Calendar, path: '/calendar' },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-transparent">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-indigo-500 text-white p-1.5 rounded-lg shadow-sm">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TaskFlow</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium
                ${active
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
            >
              <link.icon className={`h-5 w-5 transition-colors ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 w-full p-2 mb-2 rounded-xl transition-colors">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-200 dark:border-indigo-800/50 shrink-0">
            {getInitials(user.name || user.username)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate capitalize">{user.name || user.username}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
