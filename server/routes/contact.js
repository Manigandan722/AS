const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect } = require('../middleware/auth');

// @route POST /api/contact (public)
router.post('/', async (req, res) => {
  try {
    const { name, mobile, message } = req.body;
    if (!name || !mobile || !message)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    const msg = await ContactMessage.create({ name, mobile, message });
    res.status(201).json({ success: true, message: 'Message sent successfully!', data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route GET /api/contact (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route PATCH /api/contact/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await ContactMessage.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
