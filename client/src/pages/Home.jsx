import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  // Function to determine where to redirect authenticated users
  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login';
    return user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Key Generation Platform
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mb-10 text-gray-300">
            Generate, manage and distribute access keys for your clients with our secure platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3 border border-white hover:bg-white hover:text-gray-900 rounded-md font-medium transition duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              title="Secure Key Generation"
              description="Generate unique, secure keys with customizable parameters and expiration times."
              icon="🔐"
            />
            <FeatureCard
              title="Flexible Time Options"
              description="Choose from multiple duration options ranging from 1 hour to 60 days."
              icon="⏱️"
            />
            <FeatureCard
              title="Device Management"
              description="Set how many devices can use a single key simultaneously."
              icon="📱"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 md:left-6 top-0 h-full w-0.5 bg-blue-600"></div>
            <Step number="1" title="Register an Account" description="Create your account with a username and password." />
            <Step number="2" title="Purchase Balance" description="Contact us via Telegram to add balance to your account." />
            <Step number="3" title="Generate Keys" description="Use your balance to generate keys with custom parameters." />
            <Step number="4" title="Distribute to Clients" description="Share generated keys with your clients for app access." />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Join our platform today and start generating secure access keys for your clients.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-blue-700 hover:bg-gray-200 rounded-md font-medium transition duration-300"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Key Generation Platform. All rights reserved.</p>
          <p className="mt-2">
            For support, contact us on{' '}
            <a
              href="https://t.me/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              Telegram
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

// Helper Components
const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-gray-700 p-6 rounded-lg text-center">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

const Step = ({ number, title, description }) => (
  <div className="ml-10 md:ml-16 mb-10 relative">
    <div className="absolute -left-10 md:-left-16 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

export default Home;