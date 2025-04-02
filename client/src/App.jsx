// App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Layout
import Layout from './components/layout/Layout';

// Public pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// User (Rebrander) pages
import UserDashboard from './pages/user/Dashboard';
import GenerateKey from './pages/user/GenerateKey';
import KeysManagement from './pages/user/keysManagement';
import Profile from './pages/user/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import ReferralGeneration from './pages/admin/ReferralGeneration';
import Analytics from './pages/admin/Analytics';

const App = () => {
  const { user, loading } = useAuth();

  // Show loading indicator while auth state is being determined
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">hu</div>
    </div>;
  }

  return (
    <>
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={!user ? <Login /> : <Navigate to={user.isAdmin ? '/admin/dashboard' : '/dashboard'} />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to={user.isAdmin ? '/admin/dashboard' : '/dashboard'} />} />

      {/* Protected user routes */}
      <Route element={<ProtectedRoute user={user} allowAdmin={false} />}>
        <Route path="/dashboard" element={<Layout><UserDashboard /></Layout>} />
        <Route path="/generate-key" element={<Layout><GenerateKey /></Layout>} />
        <Route path="/keys" element={<Layout><KeysManagement /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
      </Route>

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute user={user} adminOnly={true} />}>
        <Route path="/admin/dashboard" element={<Layout><AdminDashboard /></Layout>} />
        <Route path="/admin/users" element={<Layout><UserManagement /></Layout>} />
        <Route path="/admin/referrals" element={<Layout><ReferralGeneration /></Layout>} />
        <Route path="/admin/analytics" element={<Layout><Analytics /></Layout>} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </>
  );
};

// Protected route component
const ProtectedRoute = ({ user, adminOnly = false }) => {
  const { Outlet } = require('react-router-dom');

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If admin only route but user is not admin
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  // If regular user route but user is admin
  if (!adminOnly && user.isAdmin) {
    return <Navigate to="/admin/dashboard" />;
  }

  return <Outlet />;
};

export default App;