import React, { useState, useEffect } from 'react';
import { fetchUserKeys } from '../../services/keyService';

const KeyHistory = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'expired'

  useEffect(() => {
    const loadKeys = async () => {
      try {
        setLoading(true);
        const data = await fetchUserKeys();
        setKeys(data);
        setError(null);
      } catch (err) {
        setError('Failed to load keys. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadKeys();
  }, []);

  const getStatusClass = (expiryDate, usageCount, deviceLimit) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < now) {
      return 'bg-red-100 text-red-800'; // Expired
    } else if (usageCount >= deviceLimit) {
      return 'bg-yellow-100 text-yellow-800'; // Device limit reached
    } else {
      return 'bg-green-100 text-green-800'; // Active
    }
  };
  
  const getStatusText = (expiryDate, usageCount, deviceLimit) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    
    if (expiry < now) {
      return 'Expired';
    } else if (usageCount >= deviceLimit) {
      return 'Limit Reached';
    } else {
      return 'Active';
    }
  };

  const filteredKeys = keys.filter(key => {
    const now = new Date();
    const expiry = new Date(key.expiresAt);
    
    if (filter === 'active') {
      return expiry > now && key.usageCount < key.deviceLimit;
    } else if (filter === 'expired') {
      return expiry < now || key.usageCount >= key.deviceLimit;
    } else {
      return true; // Show all
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Key History</h2>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-3 py-1 text-sm rounded-md ${
              filter === 'expired' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Expired/Used
          </button>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8 text-gray-500">
          Loading keys...
        </div>
      )}
      
      {error && (
        <div className="text-center py-8 text-red-500">
          {error}
        </div>
      )}
      
      {!loading && !error && filteredKeys.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No keys found.
        </div>
      )}
      
      {!loading && !error && filteredKeys.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKeys.map((key) => (
                <tr key={key._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{key.keyCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusClass(key.expiresAt, key.usageCount, key.deviceLimit)}`}>
                      {getStatusText(key.expiresAt, key.usageCount, key.deviceLimit)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {Math.round(
                      (new Date(key.expiresAt) - new Date(key.createdAt)) / 
                      (1000 * 60 * 60)
                    )} hours
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.usageCount}/{key.deviceLimit} devices
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(key.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(key.expiresAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KeyHistory;