import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    telegramUsername: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { username, password, confirmPassword, telegramUsername } = formData;

      // Validate inputs
      if (!username || !password || !confirmPassword || !telegramUsername) {
        throw new Error('Please fill in all fields');
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!telegramUsername.startsWith('@')) {
        throw new Error('Telegram username must start with @');
      }

      // Call register function from auth context
      await register(username, password, telegramUsername);

      // Navigate to login page after successful registration
      navigate('/login', {
        state: { message: 'Registration successful! Please login with your credentials.' }
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Create an Account</h1>

        {error && <Alert type="error" message={error} className="mb-4" />}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>

          <div className="mb-4">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Choose a password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              At least 6 characters. No password recovery available.
            </p>
          </div>

          <div className="mb-4">
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="mb-6">
            <Input
              label="Telegram Username"
              type="text"
              name="telegramUsername"
              value={formData.telegramUsername}
              onChange={handleChange}
              placeholder="@yourtelegramusername"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Required for balance payments and support
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;