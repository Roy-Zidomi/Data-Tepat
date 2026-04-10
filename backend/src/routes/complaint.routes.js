const express = require('express');
const router = express.Router();

const complaintController = require('../controllers/complaint.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { submitComplaintSchema } = require('../validators/complaint.validator');

// All complaint routes require authentication
router.use(authenticate);

// Submit complaint
router.post('/', validate(submitComplaintSchema), complaintController.submitComplaint);

// List my complaints
router.get('/my', complaintController.getMyComplaints);

module.exports = router;
