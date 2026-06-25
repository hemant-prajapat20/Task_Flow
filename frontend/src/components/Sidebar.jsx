import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Columns, CheckSquare, Calendar, BarChart2, Users, Settings, LogOut, CheckCircle2, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    { name: 'My Boards', icon: Columns, path: '#boards' },
    { name: 'Tasks', icon: CheckSquare, path: '#tasks' },
    { name: 'Calendar', icon: Calendar, path: '#calendar' },
    { name: 'Analytics', icon: BarChart2, path: '#analytics' },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen flex flex-col shrink-0">
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
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                isActive && link.path === '/'
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`
            }
          >
            <link.icon className={`h-5 w-5 ${link.path === '/' ? 'text-indigo-500' : ''}`} />
            {link.name}
          </NavLink>
        ))}
      </nav>

      {/* Upgrade to Pro Banner */}
      <div className="px-4 mb-4">
        <div className="p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-b from-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-900/10 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full mb-3">
            <Sparkles className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Upgrade to Pro</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 px-2">Unlock advanced features and insights.</p>
          <button className="w-full py-2 text-sm font-semibold text-indigo-600 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 w-full p-2 mb-2 rounded-xl transition-colors">
          <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-sm border border-indigo-200 dark:border-indigo-800/50 shrink-0">
            {getInitials(user.username)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate capitalize">{user.username}</p>
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
  );
};

export default Sidebar;
