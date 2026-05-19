const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const protect = require('../middleware/auth');
const { generateOTP, sendOTP } = require('../utils/email');
const router = express.Router();

const token = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { name, email, phone, password, role, vehicle } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password required.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Email already registered.' });
    const otp = generateOTP();
    const user = new User({ name, email, phone, password, role: role||'customer', vehicle, isVerified:false, otp:{ code:otp, expiresAt:new Date(Date.now()+10*60000) } });
    await user.save();
    try { await sendOTP(email, otp, name); } catch(e) { console.error('Email error:', e.message); }
    res.status(201).json({ message: 'Account created! Check your email for a verification code.', userId: user._id });
  } catch(err) { console.error(err); res.status(500).json({ error: 'Something went wrong.' }); }
});

// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.isVerified) return res.status(400).json({ error: 'Already verified.' });
    if (!user.otp || user.otp.code !== otp) return res.status(400).json({ error: 'Invalid code.' });
    if (new Date() > user.otp.expiresAt) return res.status(400).json({ error: 'Code expired. Request a new one.' });
    user.isVerified = true; user.otp = undefined;
    await user.save();
    res.json({ message: 'Verified!', token: token(user._id), user });
  } catch(err) { res.status(500).json({ error: 'Something went wrong.' }); }
});

// RESEND OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now()+10*60000) };
    await user.save();
    await sendOTP(user.email, otp, user.name);
    res.json({ message: 'New code sent.' });
  } catch(err) { res.status(500).json({ error: 'Failed to resend.' }); }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) return res.status(401).json({ error: 'Invalid email or password.' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!user.isVerified) return res.status(401).json({ error: 'Please verify your email first.', needsVerification:true, userId:user._id });
    res.json({ message: 'Logged in!', token: token(user._id), user });
  } catch(err) { res.status(500).json({ error: 'Something went wrong.' }); }
});

// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });
    if (!user) return res.json({ message: 'If that email exists, a code was sent.' });
    const otp = generateOTP();
    user.otp = { code: otp, expiresAt: new Date(Date.now()+10*60000) };
    await user.save();
    await sendOTP(user.email, otp, user.name);
    res.json({ message: 'Reset code sent.', userId: user._id });
  } catch(err) { res.status(500).json({ error: 'Failed.' }); }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user || !user.otp || user.otp.code !== otp) return res.status(400).json({ error: 'Invalid or expired code.' });
    if (new Date() > user.otp.expiresAt) return res.status(400).json({ error: 'Code expired.' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    user.password = newPassword; user.otp = undefined;
    await user.save();
    res.json({ message: 'Password reset! You can now log in.' });
  } catch(err) { res.status(500).json({ error: 'Failed.' }); }
});

// GET PROFILE
router.get('/me', protect, (req, res) => res.json({ user: req.user }));

// UPDATE PROFILE
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (name) req.user.name = name;
    if (phone) req.user.phone = phone;
    await req.user.save();
    res.json({ message: 'Updated!', user: req.user });
  } catch(err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
