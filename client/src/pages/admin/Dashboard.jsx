import React, { useState, useEffect } from 'react';

// Import contexts
import { useAuth } from '../../hooks/useAuth';

// Import services
import { getAdminDashboardStats } from '../../services/adminServices';

// Import components
import Layout from '../../components/layout/Layout';
import Alert from '../../components/common/Alert';

// Import dashboard components
import StatsCard from '../../components/dashboard/StatsCard';
import LineChart from '../../components/dashboard/LineChart';
import BarChart from '../../components/dashboard/BarChart';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeKeys: 0,
    totalRevenue: 0,
    keysGenerated: 0,
    recentActivity: [],
    keysByDuration: {},
    revenueByPeriod: []
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const dashboardData = await getAdminDashboardStats();
        setStats(dashboardData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon="users"
            colorClass="bg-blue-500"
          />
          <StatsCard 
            title="Active Keys" 
            value={stats.activeKeys} 
            icon="key"
            colorClass="bg-green-500"
          />
          <StatsCard 
            title="Total Revenue" 
            value={`₹${stats.totalRevenue.toLocaleString()}`} 
            icon="currency-rupee"
            colorClass="bg-purple-500"
          />
          <StatsCard 
            title="Keys Generated" 
            value={stats.keysGenerated} 
            icon="chart-bar"
            colorClass="bg-yellow-500"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Revenue Trend</h2>
            <LineChart 
              data={stats.revenueByPeriod} 
              xKey="period" 
              yKey="amount" 
              color="#8b5cf6"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Keys by Duration</h2>
            <BarChart 
              data={Object.entries(stats.keysByDuration).map(([duration, count]) => ({
                duration,
                count
              }))} 
              xKey="duration" 
              yKey="count" 
              color="#10b981"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentActivity.map((activity, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{activity.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {stats.recentActivity.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No recent activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;