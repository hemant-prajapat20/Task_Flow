import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BoardView from './pages/BoardView';
import GlobalTasks from './pages/GlobalTasks';
import CalendarView from './pages/CalendarView';
import NotFound from './pages/NotFound';
import Sidebar from './components/Sidebar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import React, { useState } from 'react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex w-full h-full">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
                <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#f4f7fe] dark:bg-slate-900 w-full min-w-0">
                  <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                  <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/board/:id" element={<BoardView />} />
                      <Route path="/tasks" element={<GlobalTasks />} />
                      <Route path="/calendar" element={<CalendarView />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App
