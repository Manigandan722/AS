const express = require('express');
const router = express.Router();
const CashFlow = require('../models/CashFlow');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route GET /api/cashflow
router.get('/', async (req, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 30 } = req.query;
    let query = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
    }
    const total = await CashFlow.countDocuments(query);
    const flows = await CashFlow.find(query)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('loanId', 'loanNumber');
    res.json({ success: true, flows, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/cashflow
router.post('/', async (req, res) => {
  try {
    const { type, amount, description, category, date } = req.body;
    const flow = await CashFlow.create({ type, amount, description, category, date: date || new Date() });
    res.status(201).json({ success: true, flow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/cashflow/:id
router.delete('/:id', async (req, res) => {
  try {
    await CashFlow.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Entry deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
