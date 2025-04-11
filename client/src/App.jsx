// App.jsx
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Loading from './components/common/Loading'; // Common components
import Layout from './components/layout/Layout'; // Layout component
import { useAuth } from './hooks/useAuth'; // Hook
import AdminDashboard from './pages/admin/Dashboard'; // Admin pages
import Analytics from './pages/admin/Analytics';
import ReferralGeneration from './pages/admin/ReferralGeneration';
import UserManagement from './pages/admin/UserManagement';
import Login from './pages/auth/Login'; // Auth pages
import Register from './pages/auth/Register';
import Home from './pages/Home'; // Public pages
import NotFound from './pages/NotFound';
import UserDashboard from './pages/user/Dashboard'; // User pages
import GenerateKey from './pages/user/GenerateKey';
import KeysManagement from './pages/user/keysManagement';
import Profile from './pages/user/Profile';
import { handleRedirect } from './utils/handleRedirect'; // Utility

const App = () => {
    const { user, loading } = useAuth();

    // Show loading indicator while auth state is being determined
    if (loading) {
        return <Loading />;
    }

    return (
        <>
            <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route
                    path="/login"
                    element={!user ? <Login /> : <Navigate to={handleRedirect(user)} />}
                />
                <Route
                    path="/register"
                    element={!user ? <Register /> : <Navigate to={handleRedirect(user)} />}
                />

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
                    <Route
                        path="/admin/referrals"
                        element={<Layout><ReferralGeneration /></Layout>}
                    />
                    <Route path="/admin/analytics" element={<Layout><Analytics /></Layout>} />
                </Route>

                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

// Helper function to determine where to redirect non-admin users
const getUserRedirectPath = (user) => {
    return user?.isAdmin ? "/admin/dashboard" : "/dashboard";
};

// Protected route component
const ProtectedRoute = ({ user, adminOnly = false }) => {
    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && !user.isAdmin) {
        return <Navigate to={getUserRedirectPath(user)} />;
    }

    return <Outlet />;
};

export default App;