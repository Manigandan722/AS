const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  aadhaar: { type: String, trim: true },
  address: { type: String, trim: true },
}, { timestamps: true });

customerSchema.index({ name: 'text', mobile: 'text', aadhaar: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
