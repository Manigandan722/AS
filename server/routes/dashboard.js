const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const CashFlow = require('../models/CashFlow');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

router.use(protect);

const startOf = (unit) => {
  const now = new Date();
  if (unit === 'day') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (unit === 'week') {
    const d = new Date(now);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  if (unit === 'month') return new Date(now.getFullYear(), now.getMonth(), 1);
  if (unit === 'year') return new Date(now.getFullYear(), 0, 1);
  return new Date(0);
};

// @route GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const openingCash = Number(process.env.OPENING_CASH || 0);

    // Cash calculations
    const [totalIn, totalOut] = await Promise.all([
      CashFlow.aggregate([{ $match: { type: 'in' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      CashFlow.aggregate([{ $match: { type: 'out' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    const totalCashIn = totalIn[0]?.total || 0;
    const totalCashOut = totalOut[0]?.total || 0;
    const availableCash = openingCash + totalCashIn - totalCashOut;

    // Today's stats
    const todayStart = startOf('day');
    const [todayIn, todayOut, todayExpenses] = await Promise.all([
      CashFlow.aggregate([{ $match: { type: 'in', date: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      CashFlow.aggregate([{ $match: { type: 'out', date: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { date: { $gte: todayStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    // Monthly stats
    const monthStart = startOf('month');
    const [monthlyIn, monthlyExpenses] = await Promise.all([
      CashFlow.aggregate([{ $match: { type: 'in', date: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { date: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    // Loan stats
    const [totalLoans, activeLoans, closedLoans, pendingLoans] = await Promise.all([
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'Approved' }),
      Loan.countDocuments({ status: 'Closed' }),
      Loan.countDocuments({ status: 'Pending' }),
    ]);

    // Loan amounts
    const [dailyLoans, weeklyLoans, monthlyLoans, totalOutstanding] = await Promise.all([
      Loan.aggregate([{ $match: { status: 'Approved', loanDate: { $gte: startOf('day') } } }, { $group: { _id: null, total: { $sum: '$loanAmount' } } }]),
      Loan.aggregate([{ $match: { status: 'Approved', loanDate: { $gte: startOf('week') } } }, { $group: { _id: null, total: { $sum: '$loanAmount' } } }]),
      Loan.aggregate([{ $match: { status: 'Approved', loanDate: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$loanAmount' } } }]),
      Loan.aggregate([{ $match: { status: 'Approved' } }, { $group: { _id: null, total: { $sum: '$loanAmount' } } }]),
    ]);

    // Cash flow trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const [cin, cout] = await Promise.all([
        CashFlow.aggregate([{ $match: { type: 'in', date: { $gte: dayStart, $lt: dayEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        CashFlow.aggregate([{ $match: { type: 'out', date: { $gte: dayStart, $lt: dayEnd } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      ]);
      last7Days.push({
        date: dayStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        cashIn: cin[0]?.total || 0,
        cashOut: cout[0]?.total || 0,
      });
    }

    const monthlyProfit = (monthlyIn[0]?.total || 0) - (monthlyExpenses[0]?.total || 0);

    res.json({
      success: true,
      data: {
        availableCash,
        totalLoans,
        activeLoans,
        closedLoans,
        pendingLoans,
        todayCollections: todayIn[0]?.total || 0,
        todayExpenses: todayExpenses[0]?.total || 0,
        monthlyProfit,
        loanStats: {
          daily: dailyLoans[0]?.total || 0,
          weekly: weeklyLoans[0]?.total || 0,
          monthly: monthlyLoans[0]?.total || 0,
          outstanding: totalOutstanding[0]?.total || 0,
        },
        cashFlowTrend: last7Days,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
