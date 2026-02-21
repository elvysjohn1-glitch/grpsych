const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grpsych';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || '';
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || '';

app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define User schema with unique email
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.get('/api/ping', (req, res) => res.json({ok:true}));

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email: email.toLowerCase(), password_hash: hash });
    const saved = await user.save();
    return res.status(201).json({ id: saved._id, name: saved.name, email: saved.email });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Email already registered' });
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    return res.json({ id: user._id, name: user.name, email: user.email });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Mock M-Pesa STK Push endpoint (simulate push)
app.post('/api/mpesa/stkpush', async (req, res) => {
  const { amount, phone, currency } = req.body || {};
  if (!amount || !phone) return res.status(400).json({ error: 'Missing amount or phone' });
  // In real integration, call M-Pesa API with credentials and handle response
  console.log(`Simulating STK push to ${phone} for ${amount} ${currency}`);
  // simulate async push
  setTimeout(()=>{
    return res.json({ ok:true, message: 'STK push simulated' });
  }, 1200);
});

// Placeholder PayPal create endpoint
app.post('/api/paypal/create', (req, res) => {
  const { amount, currency } = req.body || {};
  if (!amount) return res.status(400).json({ error: 'Missing amount' });
  // If PayPal credentials present, you'd call PayPal API here. For now return sandbox URL.
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    return res.json({ approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?amount=${amount}&currency=${currency}` });
  }
  // TODO: implement real PayPal create payment using PAYPAL_CLIENT_ID and PAYPAL_SECRET
  return res.json({ approvalUrl: `https://www.sandbox.paypal.com/checkoutnow?amount=${amount}&currency=${currency}` });
});

// Warn if credentials are missing (useful during startup)
if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) console.warn('PAYPAL_CLIENT_ID/SECRET not set — PayPal runs in placeholder mode');
if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) console.warn('MPESA consumer key/secret not set — M-Pesa runs in placeholder mode');

app.listen(PORT, () => console.log(`Auth API listening on http://localhost:${PORT}`));
