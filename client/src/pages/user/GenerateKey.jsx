import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { generateKey, getKeyPricing } from '../../services/keyService';
import Layout from '../../components/layout/Layout';

const GenerateKey = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    duration: '',
    deviceLimit: 1,
    notes: ''
  });
  
  const [pricing, setPricing] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchPricingAndBalance = async () => {
      try {
        setLoading(true);
        // Fetch pricing tiers from API
        const pricingData = await getKeyPricing();
        setPricing(pricingData.pricing);
        setUserBalance(pricingData.userBalance);
        
        // Set default duration to first option
        if (pricingData.pricing.length > 0) {
          setFormData(prev => ({
            ...prev,
            duration: pricingData.pricing[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching pricing data:', error);
        setError('Failed to load pricing information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingAndBalance();
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Get selected pricing tier
    const selectedTier = pricing.find(tier => tier.id === formData.duration);
    
    // Check if user has sufficient balance
    if (userBalance < selectedTier.price) {
      setError('Insufficient balance to generate this key. Please add funds to your account.');
      return;
    }
    
    try {
      setGenerating(true);
      const response = await generateKey({
        durationId: formData.duration,
        deviceLimit: parseInt(formData.deviceLimit),
        notes: formData.notes
      });
      
      setSuccess('Key generated successfully!');
      // Update user balance
      setUserBalance(prev => prev - selectedTier.price);
      
      // Reset form except duration
      setFormData(prev => ({
        ...prev,
        deviceLimit: 1,
        notes: ''
      }));
      
      // Navigate to key details after a delay
      setTimeout(() => {
        navigate(`/user/keys-management/${response.keyId}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error generating key:', error);
      setError(error.message || 'Failed to generate key. Please try again.');
    } finally {
      setGenerating(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading key generation options...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Generate New Key</h1>
          
          {/* Balance Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-2">Your Balance</h2>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">₹{userBalance.toFixed(2)}</span>
              <button 
                onClick={() => navigate('/user/redeem-code')}
                className="text-blue-600 hover:underline text-sm"
              >
                Add funds
              </button>
            </div>
          </div>
          
          {/* Key Generation Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit}>
              {/* Error and Success Messages */}
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
                  {success}
                </div>
              )}
              
              {/* Duration Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Key Duration
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {pricing.map((tier) => (
                    <div key={tier.id} className="relative">
                      <input
                        type="radio"
                        id={tier.id}
                        name="duration"
                        value={tier.id}
                        checked={formData.duration === tier.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <label
                        htmlFor={tier.id}
                        className={`block border rounded-lg p-4 text-center cursor-pointer transition ${
                          formData.duration === tier.id 
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500' 
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold">{tier.label}</div>
                        <div className="text-lg font-bold">₹{tier.price}</div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Device Limit */}
              <div className="mb-4">
                <label htmlFor="deviceLimit" className="block text-gray-700 font-medium mb-2">
                  Device Limit
                </label>
                <select
                  id="deviceLimit"
                  name="deviceLimit"
                  value={formData.deviceLimit}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'device' : 'devices'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Maximum number of devices that can use this key simultaneously
                </p>
              </div>
              
              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="notes" className="block text-gray-700 font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add notes about this key (e.g., client name, purpose)"
                ></textarea>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => navigate('/user/dashboard')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className={`bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition ${
                    generating ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {generating ? 'Generating...' : 'Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GenerateKey;