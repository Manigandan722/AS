const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const CashFlow = require('../models/CashFlow');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await Expense.countDocuments();
    const expenses = await Expense.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, expenses, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/expenses
router.post('/', async (req, res) => {
  try {
    const { expenseName, amount, date, description } = req.body;
    const expense = await Expense.create({ expenseName, amount, date: date || new Date(), description });

    // Also record as cash out
    await CashFlow.create({
      type: 'out',
      amount,
      description: `Expense: ${expenseName}${description ? ' - ' + description : ''}`,
      category: 'Shop Expense',
      date: date || new Date(),
    });

    res.status(201).json({ success: true, expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Expense deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
