const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');  // ← ADD THIS LINE

dotenv.config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected Successfully'))
.catch((err) => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// =============================================
// API ROUTES - MUST COME BEFORE STATIC FILES
// =============================================
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Student Authentication API is running' });
});

// =============================================
// STATIC FILE SERVING - ADD THIS ENTIRE BLOCK
// =============================================
// This serves your React frontend in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Any route that is not an API route will be redirected to the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}
// =============================================
// END OF STATIC FILE SERVING BLOCK
// =============================================

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});