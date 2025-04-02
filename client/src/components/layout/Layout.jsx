// client/src/components/layout/Layout.jsx
import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ 
  children, 
  isAuthenticated = false, 
  isAdmin = false, 
  logout,
  withSidebar = true
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar 
        isAuthenticated={isAuthenticated} 
        isAdmin={isAdmin} 
        logout={logout} 
      />
      
      <div className="flex flex-grow pt-14">
        {isAuthenticated && withSidebar && (
          <Sidebar isAdmin={isAdmin} />
        )}
        
        <main className={`flex-grow p-4 ${isAuthenticated && withSidebar ? 'sm:ml-64' : ''}`}>
          <div className="py-4">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;