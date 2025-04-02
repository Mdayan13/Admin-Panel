import React, { useState } from 'react';
import { redeemReferralCode } from '../../services/userService';
import { useAuth } from '../../hooks/useAuth';

const ReferralRedeem = () => {
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { refreshUser } = useAuth();

  const handleRedeem = async (e) => {
    e.preventDefault();
    
    if (!referralCode.trim()) {
      setError('Please enter a referral code');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await redeemReferralCode(referralCode);
      setSuccess({
        message: 'Referral code redeemed successfully!',
        amount: result.amount,
        newBalance: result.newBalance
      });
      setReferralCode('');
      
      // Refresh user data to update balance in UI
      refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to redeem referral code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Redeem Referral Code</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">{success.message}</p>
          <p className="mt-1">Added ₹{success.amount} to your balance.</p>
          <p className="mt-1">New balance: ₹{success.newBalance}</p>
        </div>
      )}
      
      <form onSubmit={handleRedeem}>
        <div className="mb-4">
          <label htmlFor="referralCode" className="block text-gray-700 text-sm font-medium mb-2">
            Enter Referral Code
          </label>
          <input
            type="text"
            id="referralCode"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your referral code here"
            disabled={loading}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !referralCode.trim()}
          className={`w-full py-2 px-4 rounded font-medium ${
            loading || !referralCode.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Redeeming...' : 'Redeem Code'}
        </button>
      </form>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Contact the admin on Telegram to purchase referral codes for adding balance.</p>
        <a 
          href="https://t.me/yourusername" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          Contact on Telegram
        </a>
      </div>
    </div>
  );
};

export default ReferralRedeem;