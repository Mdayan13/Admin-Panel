import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isAuthenticated, isAdmin, logout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed w-full z-50">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap">KeyGen</span>
          </Link>
        </div>
        
        <div className="flex items-center md:order-2">
          {isAuthenticated ? (
            <div className="flex items-center">
              <button 
                type="button"
                className="flex mr-3 text-sm bg-gray-100 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white">
                  {isAdmin ? 'A' : 'U'}
                </div>
              </button>
              
              {/* Dropdown menu */}
              <div
                className={`${
                  isMenuOpen ? 'block' : 'hidden'
                } absolute top-10 right-4 z-50 my-4 text-base list-none bg-white rounded divide-y divide-gray-100 shadow`}
              >
                <div className="py-3 px-4">
                  <span className="block text-sm text-gray-900">
                    {isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      to={isAdmin ? "/admin/dashboard" : "/dashboard"}
                      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-gray-800 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2"
              >
                Register
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button
            data-collapse-toggle="mobile-menu"
            type="button"
            className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;