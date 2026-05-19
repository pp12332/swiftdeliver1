const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:       { type:String, required:true, trim:true },
  email:      { type:String, required:true, unique:true, lowercase:true, trim:true },
  phone:      { type:String, trim:true },
  password:   { type:String, minlength:6 },
  role:       { type:String, enum:['customer','driver'], default:'customer' },
  vehicle:    { model:String, plate:String },
  isVerified: { type:Boolean, default:false },
  otp:        { code:String, expiresAt:Date },
  googleId:   String,
  createdAt:  { type:Date, default:Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function(candidate) {
  return require('bcryptjs').compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
