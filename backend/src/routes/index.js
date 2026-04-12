const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

const authRoutes = require('./auth.routes');
const householdRoutes = require('./household.routes');
const documentRoutes = require('./document.routes');
const aidApplicationRoutes = require('./aidApplication.routes');
const complaintRoutes = require('./complaint.routes');
const adminRoutes = require('./admin.routes');
const userRoutes = require('./user.routes');
const regionRoutes = require('./region.routes');
const aidTypeRoutes = require('./aidType.routes');
const decisionRoutes = require('./decision.routes');
const distributionRoutes = require('./distribution.routes');

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
router.use('/users', userRoutes);
router.use('/regions', regionRoutes);
router.use('/aid-types-admin', aidTypeRoutes);
router.use('/decisions', decisionRoutes);
router.use('/distributions', distributionRoutes);

module.exports = router;

