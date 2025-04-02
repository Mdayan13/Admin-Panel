import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserDashboard } from '../../services/userService';
import BalanceCard from '../../components/dashboard/BalanceCard';
import KeyHistory from '../../components/dashboard/KeyHistory';
import Layout from '../../components/layout/Layout';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    recentKeys: [],
    keyStats: {
      total: 0,
      active: 0,
      expired: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getUserDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Welcome, {user?.username || 'User'}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <BalanceCard balance={dashboardData.balance} />
          
          {/* Key Statistics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Key Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-xl font-bold">{dashboardData.keyStats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Active</p>
                <p className="text-xl font-bold text-green-600">{dashboardData.keyStats.active}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm">Expired</p>
                <p className="text-xl font-bold text-red-600">{dashboardData.keyStats.expired}</p>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/user/generate-key')}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
              >
                Generate Key
              </button>
              <button 
                onClick={() => navigate('/user/redeem-code')}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
              >
                Redeem Code
              </button>
            </div>
          </div>
        </div>
        
        {/* Recent Key History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Keys</h2>
            <button 
              onClick={() => navigate('/user/keys-management')}
              className="text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>
          <KeyHistory keys={dashboardData.recentKeys} limit={5} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;