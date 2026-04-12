const express = require('express');
const router = express.Router();

const aidApplicationController = require('../controllers/aidApplication.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { createApplicationSchema } = require('../validators/aidApplication.validator');

// All aid application routes require authentication
router.use(authenticate);

// List my applications (any authenticated user)
router.get('/my', aidApplicationController.getMyApplications);

// List all applications (admin view — admin_main, admin_staff, pengawas)
router.get('/all', requirePermission('APPLICATION_LIST'), aidApplicationController.getAll);

// Get application by ID
router.get('/:id', aidApplicationController.getApplicationById);

// Create application draft
router.post('/', requirePermission('APPLICATION_CREATE'), validate(createApplicationSchema), aidApplicationController.createApplication);

// Submit application
router.post('/:id/submit', requirePermission('APPLICATION_SUBMIT'), aidApplicationController.submitApplication);

// Update application status (workflow transition — admin_main, admin_staff)
router.patch('/:id/status', requirePermission('APPLICATION_UPDATE_STATUS'), aidApplicationController.updateStatus);

module.exports = router;

