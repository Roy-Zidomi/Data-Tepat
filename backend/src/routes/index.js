const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

const authRoutes = require('./auth.routes');
const householdRoutes = require('./household.routes');
const documentRoutes = require('./document.routes');
const aidApplicationRoutes = require('./aidApplication.routes');
const complaintRoutes = require('./complaint.routes');
const adminRoutes = require('./admin.routes');

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

router.get('/aid-types', async (req, res) => {
  try {
    const aidTypes = await prisma.aidType.findMany({ where: { is_active: true } });
    const formatted = JSON.parse(JSON.stringify(aidTypes, (k, v) => (typeof v === 'bigint' ? v.toString() : v)));
    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed fetching aid types' });
  }
});

router.use('/auth', authRoutes);
router.use('/households', householdRoutes);
router.use('/documents', documentRoutes);
router.use('/aid-applications', aidApplicationRoutes);
router.use('/complaints', complaintRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
