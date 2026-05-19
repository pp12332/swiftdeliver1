const express = require('express');
const Order = require('../models/Order');
const protect = require('../middleware/auth');
const router = express.Router();

// CREATE ORDER
router.post('/', protect, async (req, res) => {
  try {
    const { packageType, speed, from, to, recipient, scheduledAt, photo } = req.body;
    const order = new Order({ customer: req.user._id, packageType, speed, from, to, recipient, scheduledAt, photo,
      timeline: [{ status: 'pending', note: 'Order placed' }]
    });
    await order.save();
    res.status(201).json({ message: 'Order created!', order });
  } catch(err) { console.error(err); res.status(500).json({ error: 'Failed to create order.' }); }
});

// GET MY ORDERS
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch(err) { res.status(500).json({ error: 'Failed.' }); }
});

// GET SINGLE ORDER
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id, customer: req.user._id }).populate('driver','name phone vehicle');
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    res.json({ order });
  } catch(err) { res.status(500).json({ error: 'Failed.' }); }
});

// CANCEL ORDER
router.patch('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id, customer: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (['delivered','cancelled'].includes(order.status)) return res.status(400).json({ error: 'Cannot cancel this order.' });
    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', note: 'Cancelled by customer' });
    await order.save();
    res.json({ message: 'Order cancelled.', order });
  } catch(err) { res.status(500).json({ error: 'Failed.' }); }
});

module.exports = router;
