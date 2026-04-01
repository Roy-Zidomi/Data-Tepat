const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const householdRoutes = require('./household.routes');
// We will add the other routes here

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

router.use('/auth', authRoutes);
router.use('/households', householdRoutes);
// We will add the other modules here progressively

module.exports = router;
