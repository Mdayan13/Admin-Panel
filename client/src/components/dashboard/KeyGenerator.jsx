import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateKey } from '../../services/keyService';

const KeyGenerator = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deviceLimit, setDeviceLimit] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(null);

  // Pricing tiers as provided
  const pricingTiers = [
    { id: '1h', duration: '1 hour', price: 5, hours: 1 },
    { id: '6h', duration: '6 hours', price: 10, hours: 6 },
    { id: '12h', duration: '12 hours', price: 20, hours: 12 },
    { id: '1d', duration: '1 day', price: 50, hours: 24 },
    { id: '3d', duration: '3 days', price: 100, hours: 72 },
    { id: '7d', duration: '7 days', price: 200, hours: 168 },
    { id: '15d', duration: '15 days', price: 400, hours: 360 },
    { id: '30d', duration: '30 days', price: 700, hours: 720 },
    { id: '60d', duration: '60 days', price: 1000, hours: 1440 }
  ];

  const handleGenerateKey = async () => {
    if (!selectedDuration) {
      setError('Please select a duration');
      return;
    }

    if (deviceLimit < 1) {
      setError('Device limit must be at least 1');
      return;
    }

    // Find the selected tier
    const tier = pricingTiers.find(tier => tier.id === selectedDuration);
    if (!tier) {
      setError('Invalid duration selected');
      return;
    }

    // Calculate total cost
    const totalCost = tier.price * deviceLimit;

    // Check if user has enough balance
    if ((user?.balance || 0) < totalCost) {
      setError('Insufficient balance to generate this key');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await generateKey({
        durationHours: tier.hours,
        deviceLimit,
        price: totalCost
      });

      setSuccess({
        message: 'Key generated successfully!',
        key: response.key,
        expiresAt: response.expiresAt
      });
    } catch (err) {
      setError(err.message || 'Failed to generate key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Generate New Key</h2>
      
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">{success.message}</p>
          <p className="mt-2">Your key: <span className="font-mono bg-gray-100 p-1 rounded">{success.key}</span></p>
          <p className="mt-1 text-sm">Expires: {new Date(success.expiresAt).toLocaleString()}</p>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Select Duration
        </label>
        <div className="grid grid-cols-3 gap-2">
          {pricingTiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedDuration(tier.id)}
              className={`p-3 rounded border ${
                selectedDuration === tier.id
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{tier.duration}</div>
              <div className="text-sm">₹{tier.price}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Device Limit
        </label>
        <div className="flex items-center">
          <button
            onClick={() => setDeviceLimit(Math.max(1, deviceLimit - 1))}
            className="bg-gray-200 px-3 py-1 rounded-l"
            disabled={deviceLimit <= 1}
          >
            -
          </button>
          <input
            type="number"
            value={deviceLimit}
            onChange={(e) => setDeviceLimit(Math.max(1, parseInt(e.target.value) || 1))}
            className="border-t border-b border-gray-300 p-1 w-16 text-center"
            min="1"
          />
          <button
            onClick={() => setDeviceLimit(deviceLimit + 1)}
            className="bg-gray-200 px-3 py-1 rounded-r"
          >
            +
          </button>
          <span className="ml-2 text-gray-500">
            {deviceLimit > 1 ? `(₹${selectedDuration ? pricingTiers.find(t => t.id === selectedDuration).price * deviceLimit : 0} total)` : ''}
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={handleGenerateKey}
          disabled={loading || !selectedDuration}
          className={`w-full py-2 px-4 rounded font-medium ${
            loading || !selectedDuration
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Key'}
        </button>
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Your current balance: ₹{user?.balance || 0}</p>
        {selectedDuration && (
          <p>
            Cost for selected configuration: ₹{pricingTiers.find(tier => tier.id === selectedDuration).price * deviceLimit}
          </p>
        )}
      </div>
    </div>
  );
};

export default KeyGenerator;