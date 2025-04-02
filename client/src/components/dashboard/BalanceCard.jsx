import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const BalanceCard = () => {
  const { user } = useAuth();
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Account Balance</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
          Active
        </span>
      </div>
      
      <div className="mt-4">
        <p className="text-gray-500 text-sm">Available Balance</p>
        <div className="flex items-end mt-1">
          <span className="text-3xl font-bold text-gray-800">₹{user?.balance || 0}</span>
          <span className="text-gray-500 text-sm ml-2 mb-1">INR</span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Keys Generated</p>
            <p className="text-lg font-semibold">{user?.keysGenerated || 0}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Keys</p>
            <p className="text-lg font-semibold">{user?.activeKeys || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <a 
          href="https://t.me/yourusername" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-center transition duration-150"
        >
          Contact on Telegram to Add Balance
        </a>
      </div>
    </div>
  );
};

export default BalanceCard;