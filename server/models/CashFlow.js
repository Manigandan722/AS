const mongoose = require('mongoose');

const cashFlowSchema = new mongoose.Schema({
  type: { type: String, enum: ['in', 'out'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: [
      'Loan Disbursement',
      'Interest Collection',
      'Loan Closure',
      'Additional Deposit',
      'Shop Expense',
      'Salary',
      'Electricity Bill',
      'Other',
    ],
    default: 'Other',
  },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan' },
  date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('CashFlow', cashFlowSchema);
