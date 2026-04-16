const express = require('express');
const router = express.Router();

const decisionController = require('../controllers/beneficiaryDecision.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');

router.use(authenticate);

// List all decisions — admin_main, admin_staff, pengawas
router.get('/', requirePermission('DECISION_LIST'), decisionController.listAll);

// Get decision by ID — admin_main, admin_staff, pengawas
router.get('/:id', requirePermission('DECISION_LIST'), decisionController.getById);

// Create decision (approve/reject/waitlist) — admin_main, admin_staff
router.post('/', requirePermission('DECISION_CREATE'), decisionController.createDecision);

module.exports = router;
