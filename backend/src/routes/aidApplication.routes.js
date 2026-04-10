const express = require('express');
const router = express.Router();

const aidApplicationController = require('../controllers/aidApplication.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { createApplicationSchema } = require('../validators/aidApplication.validator');

// All aid application routes require authentication
router.use(authenticate);

// List my applications
router.get('/my', aidApplicationController.getMyApplications);

// Get application by ID
router.get('/:id', aidApplicationController.getApplicationById);

// Create application draft
router.post('/', validate(createApplicationSchema), aidApplicationController.createApplication);

// Submit application
router.post('/:id/submit', aidApplicationController.submitApplication);

module.exports = router;
