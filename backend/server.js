// Force Node.js to use reliable public DNS servers
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Then, proceed with your other imports...

// ... rest of your server.js code

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.vercel.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch((err) => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Student Authentication API is running' });
});

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