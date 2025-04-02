const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const keyRoutes = require('./routes/keyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');
const { isAdmin } = require('./middleware/admin');

const app = express();
const PORT = process.env.PORT || 5000;


require('dotenv').config();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS for all routes
app.use(helmet()); // Set security headers
app.use(morgan('dev')); // Logging
// Routes
app.use('/api/auth', protect, authRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/keys', protect, keyRoutes);
app.use('/api/admin', protect, isAdmin, adminRoutes);
app.use('/api/analytics', protect, analyticsRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve the BUILT files from dist, not the source files
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/', 'index.html'));
  });
}


// Start server
const connectDB = require('./config/db');
connectDB().then(() => {
  console.log('MongoDB connected successfully');
  // Start server inside the then() to ensure DB is connected first
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app; // Export for testing