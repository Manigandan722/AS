const mongoose = require('mongoose');

// Counter schema for auto-incrementing loan numbers per year
const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.model('Counter', counterSchema);

const loanSchema = new mongoose.Schema({
  loanNumber: { type: String, unique: true },

  // Customer info (embedded snapshot)
  customerName: { type: String, required: true },
  mobile: { type: String, required: true },
  aadhaar: { type: String },
  address: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },

  // Gold info
  goldType: { type: String, required: true },
  goldWeight: { type: Number, required: true },
  goldPurity: { type: String, required: true },
  goldValue: { type: Number, required: true },

  // Loan info
  loanAmount: { type: Number, required: true },
  interestRate: { type: Number, required: true },
  loanDate: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Closed', 'Rejected'],
    default: 'Pending',
  },
  closedDate: { type: Date },
  goldReleased: { type: Boolean, default: false },
  notes: { type: String },
}, { timestamps: true });

// Auto-generate loan number before saving
loanSchema.pre('save', async function (next) {
  if (this.loanNumber) return next();
  const year = new Date().getFullYear();
  const counterId = `loan_${year}`;
  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.loanNumber = `ASNK-${year}-${String(counter.seq).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
