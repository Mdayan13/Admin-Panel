import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NotFound = () => {
  const { isAuthenticated, user } = useAuth();

  // Determine the appropriate home link based on authentication status and role
  const getHomeLink = () => {
    if (!isAuthenticated) return '/';
    return user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <div className="mb-8 mt-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h2>
          <p className="text-gray-600">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>
        
        <Link 
          to={getHomeLink()} 
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 inline-flex items-center gap-2"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to {isAuthenticated ? 'Dashboard' : 'Home'}
        </Link>
      </div>
      
      {/* Optional: Additional links or information */}
      <div className="mt-8 text-gray-500 text-sm">
        <p>
          If you believe this is an error, please contact{' '}
          <a 
            href="https://t.me/yourusername" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 hover:underline"
          >
            support on Telegram
          </a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;