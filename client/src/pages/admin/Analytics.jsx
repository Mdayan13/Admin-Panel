import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  getAnalyticsSummary,
  getKeyGenerationStats,
  getUserGrowthData,
  getRevenueData
} from '../../services/analyticsService';

// Components
import Layout from '../../components/layout/Layout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalUsers: 0,
    totalKeys: 0,
    activeKeys: 0,
    totalRevenue: 0,
    avgKeyPrice: 0
  });
  const [timeFrame, setTimeFrame] = useState('month'); // 'week', 'month', 'year'
  const [keyStats, setKeyStats] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [keyTypeDistribution, setKeyTypeDistribution] = useState([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Check if user is admin, if not redirect
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);

        // Fetch summary data
        const summaryResponse = await getAnalyticsSummary();
        setSummaryData(summaryResponse.data);

        // Fetch key generation stats
        const keyStatsResponse = await getKeyGenerationStats(timeFrame);
        setKeyStats(keyStatsResponse.data);

        // Fetch user growth data
        const userGrowthResponse = await getUserGrowthData(timeFrame);
        setUserGrowth(userGrowthResponse.data);

        // Fetch revenue data
        const revenueResponse = await getRevenueData(timeFrame);
        setRevenueData(revenueResponse.data);

        // Create key type distribution data
        const keyDistribution = [
          { name: '1 hour', value: 0 },
          { name: '6 hours', value: 0 },
          { name: '12 hours', value: 0 },
          { name: '1 day', value: 0 },
          { name: '3 days', value: 0 },
          { name: '7 days', value: 0 },
          { name: '15 days', value: 0 },
          { name: '30 days', value: 0 },
          { name: '60 days', value: 0 }
        ];

        // Populate with data from the key stats
        keyStatsResponse.data.forEach(item => {
          // This assumes your key stats include the distribution data
          // You would need to structure your API response accordingly
          if (item.keyDistribution) {
            item.keyDistribution.forEach(dist => {
              const found = keyDistribution.find(k => k.name === dist.name);
              if (found) {
                found.value += dist.count;
              }
            });
          }
        });

        setKeyTypeDistribution(keyDistribution);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeFrame]);

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

          <div className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setTimeFrame('week')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md ${timeFrame === 'week'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Week
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('month')}
              className={`px-4 py-2 text-sm font-medium ${timeFrame === 'month'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Month
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('year')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md ${timeFrame === 'year'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              Year
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold">{summaryData.totalUsers}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Keys Generated</h3>
                <p className="text-2xl font-bold">{summaryData.totalKeys}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Active Keys</h3>
                <p className="text-2xl font-bold">{summaryData.activeKeys}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold">{formatCurrency(summaryData.totalRevenue)}</p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-sm font-medium text-gray-500">Avg. Key Price</h3>
                <p className="text-2xl font-bold">{formatCurrency(summaryData.avgKeyPrice)}</p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
      </div>{sikandar}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Key Generation Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Key Generation Trends</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={keyStats}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#82ca9d" name="Keys Generated" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">User Growth</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={userGrowth}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#0088FE"
                        name="New Users"
                      />
                      <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#FF8042"
                        name="Total Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Key Types Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Key Duration Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={keyTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {keyTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} keys`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics;