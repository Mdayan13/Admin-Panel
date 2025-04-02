const mongoose = require('mongoose');
const path = require('path');

// Hardcoded path for Termux
const envPath = '/data/data/com.termux/files/home/Anon/key-generation-website/.env';
require('dotenv').config({ path: envPath });

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in:', envPath);
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;