import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import contexts
import { useAuth } from '../../hooks/useAuth';

// Import services
import { getUserProfile, updateUserProfile } from '../../services/userService';

// Import components
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    telegramUsername: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userData = await getUserProfile();
        setFormData({
          ...formData,
          username: userData.username,
          email: userData.email || '',
          telegramUsername: userData.telegramUsername || ''
        });
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch profile data');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match if user is updating password
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      return setError('New passwords do not match');
    }

    try {
      setLoading(true);
      
      // Only include password fields if user is updating password
      const updateData = {
        telegramUsername: formData.telegramUsername,
      };
      
      if (formData.currentPassword && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const result = await updateUserProfile(updateData);
      
      if (result.success) {
        setSuccess('Profile updated successfully');
        // Update user context if necessary
        updateUser({
          ...user,
          telegramUsername: formData.telegramUsername
        });
        
        // Clear password fields
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
      
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
          
          {error && <Alert type="error" message={error} className="mb-4" />}
          {success && <Alert type="success" message={success} className="mb-4" />}
          
          <form onSubmit={handleUpdateProfile}>
            <div className="mb-4">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={true} // Username cannot be changed
                className="bg-gray-100" // Visual indication that it's disabled
              />
              <p className="text-sm text-gray-500 mt-1">Username cannot be changed</p>
            </div>
            
            <div className="mb-4">
              <Input
                label="Email (Optional)"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email address"
              />
            </div>
            
            <div className="mb-4">
              <Input
                label="Telegram Username"
                name="telegramUsername"
                value={formData.telegramUsername}
                onChange={handleChange}
                placeholder="Your Telegram username"
              />
              <p className="text-sm text-gray-500 mt-1">This will be used for payment communications</p>
            </div>
            
            <div className="border-t border-gray-200 my-6 pt-6">
              <h2 className="text-lg font-semibold mb-4">Change Password</h2>
              
              <div className="mb-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="mb-4">
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                />
              </div>
              
              <div className="mb-6">
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;