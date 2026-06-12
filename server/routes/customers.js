const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route GET /api/customers
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { aadhaar: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, customers, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/customers/:id/loans
router.get('/:id/loans', async (req, res) => {
  try {
    const loans = await Loan.find({ customerId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, loans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
