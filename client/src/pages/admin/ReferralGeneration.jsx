import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { generateReferralCode, getAllReferralCodes } from '../../services/adminServices';

// Components
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

const ReferralGeneration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [referralCodes, setReferralCodes] = useState([]);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Check if user is admin, if not redirect
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch existing referral codes
  useEffect(() => {
    const fetchReferralCodes = async () => {
      try {
        setLoading(true);
        const response = await getAllReferralCodes();
        setReferralCodes(response.data);
      } catch (error) {
        setAlert({
          show: true,
          type: 'error',
          message: error.response?.data?.message || 'Failed to fetch referral codes'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReferralCodes();
  }, []);

  // Handle generate referral code
  const handleGenerateCode = async (e) => {
    e.preventDefault();
    
    if (!amount) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Please enter an amount'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await generateReferralCode({
        amount: parseFloat(amount),
        description: description || `₹${amount} Balance Referral`
      });
      
      setReferralCodes([response.data, ...referralCodes]);
      
      setAlert({
        show: true,
        type: 'success',
        message: 'Referral code generated successfully!'
      });
      
      // Reset form
      setAmount('');
      setDescription('');
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: error.response?.data?.message || 'Failed to generate referral code'
      });
    } finally {
      setLoading(false);
    }
  };

  // Copy referral code to clipboard
  const copyToClipboard = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Referral Code Generation</h1>
        
        {alert.show && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert({ ...alert, show: false })} 
          />
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate New Referral Code</h2>
          
          <form onSubmit={handleGenerateCode}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  placeholder="Enter amount"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Description (Optional)
                </label>
                <Input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? 'Generating...' : 'Generate Referral Code'}
            </Button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Referral Codes</h2>
          
          {loading && referralCodes.length === 0 ? (
            <p className="text-gray-500">Loading referral codes...</p>
          ) : referralCodes.length === 0 ? (
            <p className="text-gray-500">No referral codes generated yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {referralCodes.map((code, index) => (
                    <tr key={code._id}>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                        {code.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ₹{code.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {code.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(code.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          code.isRedeemed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {code.isRedeemed ? 'Redeemed' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => copyToClipboard(code.code, index)}
                          disabled={code.isRedeemed}
                          className={`text-indigo-600 hover:text-indigo-900 ${
                            code.isRedeemed ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {copiedIndex === index ? 'Copied!' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ReferralGeneration;