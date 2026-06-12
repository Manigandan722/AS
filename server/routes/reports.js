const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const CashFlow = require('../models/CashFlow');
const Expense = require('../models/Expense');
const { protect, authorizeRole } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRole('admin'));

const getRange = (type, dateStr) => {
  let start, end;
  if (type === 'daily') {
    start = new Date(dateStr || Date.now());
    start.setHours(0, 0, 0, 0);
    end = new Date(start.getTime() + 86400000);
  } else if (type === 'weekly') {
    start = new Date(dateStr || Date.now());
    start.setDate(start.getDate() - start.getDay());
    start.setHours(0, 0, 0, 0);
    end = new Date(start.getTime() + 7 * 86400000);
  } else if (type === 'monthly') {
    const d = dateStr ? new Date(dateStr) : new Date();
    start = new Date(d.getFullYear(), d.getMonth(), 1);
    end = new Date(d.getFullYear(), d.getMonth() + 1, 1);
  }
  return { start, end };
};

// @route GET /api/reports?type=daily|weekly|monthly&date=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { type = 'daily', date } = req.query;
    const { start, end } = getRange(type, date);

    const [loansIssued, loansClosed, cashIn, cashOut, expenses] = await Promise.all([
      Loan.find({ status: 'Approved', loanDate: { $gte: start, $lt: end } }),
      Loan.find({ status: 'Closed', closedDate: { $gte: start, $lt: end } }),
      CashFlow.aggregate([{ $match: { type: 'in', date: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      CashFlow.aggregate([{ $match: { type: 'out', date: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Expense.aggregate([{ $match: { date: { $gte: start, $lt: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const totalLoanAmount = loansIssued.reduce((s, l) => s + l.loanAmount, 0);
    const totalClosed = loansClosed.reduce((s, l) => s + l.loanAmount, 0);
    const totalCashIn = cashIn[0]?.total || 0;
    const totalCashOut = cashOut[0]?.total || 0;
    const totalExpenses = expenses[0]?.total || 0;
    const profit = totalCashIn - totalCashOut;

    res.json({
      success: true,
      report: {
        type,
        period: { start, end },
        loansIssued: loansIssued.length,
        totalLoanAmount,
        loansClosed: loansClosed.length,
        totalClosed,
        cashIn: totalCashIn,
        cashOut: totalCashOut,
        expenses: totalExpenses,
        profit,
        loans: loansIssued,
        closedLoans: loansClosed,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
