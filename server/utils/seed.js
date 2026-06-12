const User = require('../models/User');
const CashFlow = require('../models/CashFlow');

const seedAdmin = async () => {
  try {
    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existing) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@asnk.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123',
        role: 'admin',
      });
      console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);
    } else {
      console.log('ℹ️  Admin user already exists.');
    }
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  }
};

module.exports = seedAdmin;
