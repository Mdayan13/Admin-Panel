import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserKeys, revokeKey } from '../../services/keyService';
import Layout from '../../components/layout/Layout';

const KeysManagement = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'
  const [search, setSearch] = useState('');
  const [keyToRevoke, setKeyToRevoke] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchKeys();
  }, [isAuthenticated, navigate]);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const data = await getUserKeys();
      setKeys(data);
    } catch (error) {
      console.error('Error fetching keys:', error);
      setError('Failed to load keys. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeClick = (key) => {
    setKeyToRevoke(key);
    setShowModal(true);
  };

  const handleRevokeConfirm = async () => {
    try {
      await revokeKey(keyToRevoke.id);
      // Update the key status in the local state
      setKeys(keys.map(key => 
        key.id === keyToRevoke.id 
          ? { ...key, status: 'revoked', isActive: false } 
          : key
      ));
      setShowModal(false);
    } catch (error) {
      console.error('Error revoking key:', error);
      setError('Failed to revoke key. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'revoked':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredKeys = keys.filter(key => {
    // Filter by status
    if (filter !== 'all' && key.status !== filter) {
      return false;
    }
    
    // Filter by search term (key code or notes)
    if (search && !key.code.toLowerCase().includes(search.toLowerCase()) && 
        !key.notes.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading keys...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Keys Management</h1>
          <button
            onClick={() => navigate('/user/generate-key')}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Generate New Key
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            {error}
          </div>
        )}
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-full ${
                  filter === 'all' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1 rounded-full ${
                  filter === 'active' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('expired')}
                className={`px-3 py-1 rounded-full ${
                  filter === 'expired' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                Expired
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search by key or notes"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Keys Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredKeys.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No keys found matching your filters.</p>
              <button
                onClick={() => {
                  setFilter('all');
                  setSearch('');
                }}
                className="mt-2 text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devices
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm">{key.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(key.status)}`}>
                          {key.status.charAt(0).toUpperCase() + key.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(key.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(key.expiresAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {key.activeDevices}/{key.deviceLimit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                        {key.notes || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => navigate(`/user/keys-management/${key.id}`)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </button>
                        {key.status === 'active' && (
                          <button
                            onClick={() => handleRevokeClick(key)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Revoke Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Revoke Key</h3>
            <p className="mb-4">
              Are you sure you want to revoke this key? This action cannot be undone and the key will immediately stop working.
            </p>
            <p className="font-mono bg-gray-100 p-2 rounded mb-4">
              {keyToRevoke?.code}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Revoke Key
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default KeysManagement;