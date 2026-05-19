const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId:    { type:String, unique:true },
  customer:   { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  driver:     { type:mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  packageType:{ type:String, enum:['letter','small','medium','large'], required:true },
  speed:      { type:String, enum:['standard','express','urgent'], required:true },
  from: {
    address:  { type:String, required:true },
    lat:      Number,
    lng:      Number,
  },
  to: {
    address:  { type:String, required:true },
    lat:      Number,
    lng:      Number,
  },
  recipient: {
    name:     { type:String, required:true },
    phone:    { type:String, required:true },
    notes:    String,
  },
  scheduledAt: Date,
  status: {
    type: String,
    enum: ['pending','assigned','picked_up','in_transit','delivered','cancelled'],
    default: 'pending'
  },
  photo:      String,
  timeline: [{
    status:    String,
    time:      { type:Date, default:Date.now },
    note:      String,
  }],
  createdAt:  { type:Date, default:Date.now }
});

// Auto-generate order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = 'ORD-' + String(8000 + count + 1).padStart(4, '0');
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
