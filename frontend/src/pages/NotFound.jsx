import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] text-center">
      <h1 className="text-9xl font-bold text-slate-200 dark:text-slate-800">404</h1>
      <h2 className="text-2xl font-bold mt-4">Page not found</h2>
      <p className="text-secondary mt-2 mb-8 max-w-md">
        Sorry, we couldn't find the page you're looking for. Perhaps you've mistyped the URL or the page has been moved.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-sm"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFound;
