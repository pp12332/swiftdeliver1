require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing environment variables:', missing.join(', '));
  process.exit(1);
}

const app = express();

// Allow all origins so your frontend can connect
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.json({ status: 'SwiftDeliver API is running!', version: '1.0.0' });
});

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

const PORT = process.env.PORT || 3000;

console.log('🔌 Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });
