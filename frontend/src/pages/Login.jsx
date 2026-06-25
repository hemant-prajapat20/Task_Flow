import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 hover:shadow-2xl transition-shadow duration-500">
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-center">Welcome back</h1>
          <p className="text-secondary mt-2">Enter your details to access your account</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-900/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all duration-200 outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl shadow-sm hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
