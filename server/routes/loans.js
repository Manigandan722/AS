const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Customer = require('../models/Customer');
const CashFlow = require('../models/CashFlow');
const { protect, authorizeRole } = require('../middleware/auth');

// All routes protected
router.use(protect);

// @route GET /api/loans
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { aadhaar: { $regex: search, $options: 'i' } },
        { loanNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, loans, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/loans/:id
router.get('/:id', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });
    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route POST /api/loans
router.post('/', async (req, res) => {
  try {
    const {
      customerName, mobile, aadhaar, address,
      itemCategory, goldType, goldWeight, goldPurity, goldValue,
      loanAmount, interestRate, loanDate, dueDate,
    } = req.body;

    // Upsert customer
    let customer = await Customer.findOne({ mobile });
    if (!customer) {
      customer = await Customer.create({ name: customerName, mobile, aadhaar, address });
    }

    const loan = await Loan.create({
      customerName, mobile, aadhaar, address, customerId: customer._id,
      itemCategory, goldType, goldWeight, goldPurity, goldValue,
      loanAmount, interestRate,
      loanDate: loanDate || new Date(),
      dueDate,
      status: 'Pending',
    });

    res.status(201).json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PUT /api/loans/:id
router.put('/:id', async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });
    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PATCH /api/loans/:id/approve
router.patch('/:id/approve', async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });

    loan.status = 'Approved';
    await loan.save();

    // Create cash out record for loan disbursement
    await CashFlow.create({
      type: 'out',
      amount: loan.loanAmount,
      description: `Loan disbursed to ${loan.customerName} (${loan.loanNumber})`,
      category: 'Loan Disbursement',
      loanId: loan._id,
      date: new Date(),
    });

    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PATCH /api/loans/:id/reject
router.patch('/:id/reject', async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected' },
      { returnDocument: 'after' }
    );
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });
    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PATCH /api/loans/:id/close
router.patch('/:id/close', async (req, res) => {
  try {
    const { collectionAmount, description } = req.body;
    const loan = await Loan.findById(req.params.id);
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });

    loan.status = 'Closed';
    loan.closedDate = new Date();
    await loan.save();

    // Record cash in for loan closure
    await CashFlow.create({
      type: 'in',
      amount: collectionAmount || loan.loanAmount,
      description: description || `Loan closed by ${loan.customerName} (${loan.loanNumber})`,
      category: 'Loan Closure',
      loanId: loan._id,
      date: new Date(),
    });

    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PATCH /api/loans/:id/release-gold
router.patch('/:id/release-gold', async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      { goldReleased: true },
      { returnDocument: 'after' }
    );
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found.' });
    res.json({ success: true, loan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route DELETE /api/loans/:id
router.delete('/:id', authorizeRole('admin'), async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Loan deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
