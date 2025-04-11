const mongoose = require('mongoose');

require('dotenv').config();

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI missing in environment variables');
  process.exit(1);
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
};
module.exports = connectDB;