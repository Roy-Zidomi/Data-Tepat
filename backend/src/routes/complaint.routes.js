const express = require('express');
const router = express.Router();

const complaintController = require('../controllers/complaint.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { submitComplaintSchema } = require('../validators/complaint.validator');

// All complaint routes require authentication
router.use(authenticate);

// Submit complaint (warga)
router.post('/', requirePermission('COMPLAINT_CREATE'), validate(submitComplaintSchema), complaintController.submitComplaint);

// List my complaints (warga)
router.get('/my', requirePermission('COMPLAINT_LIST_OWN'), complaintController.getMyComplaints);

// List all complaints (admin view — admin_main, admin_staff)
router.get('/all', requirePermission('COMPLAINT_LIST_ALL'), complaintController.getAllComplaints);

// Get complaint by ID (admin_main, admin_staff)
router.get('/:id', requirePermission('COMPLAINT_LIST_ALL'), complaintController.getById);

// Resolve/reject complaint (admin_main only)
router.patch('/:id/resolve', requirePermission('COMPLAINT_RESOLVE'), complaintController.resolveComplaint);

module.exports = router;
