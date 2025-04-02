import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} KeyGen. All rights reserved.
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/terms" className="text-sm text-gray-500 hover:text-gray-700">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-gray-700">
              Privacy Policy
            </Link>
            
            <a
              href="https://t.me/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              <svg 
                className="w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.21-1.59.15-.15 2.62-2.31 2.68-2.5.01-.03.01-.14-.06-.2-.07-.07-.18-.04-.25-.02-.11.02-1.86 1.14-5.27 3.35-.5.33-.95.49-1.35.48-.44-.01-1.29-.22-1.92-.41-.78-.23-1.39-.35-1.34-.75.03-.2.38-.41 1.03-.63 4.05-1.7 6.75-2.8 8.1-3.32 3.85-1.48 4.65-1.74 5.17-1.74.12 0 .37.03.54.17.14.15.17.36.2.52-.02.15-.03.3-.05.43z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;