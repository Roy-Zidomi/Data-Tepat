const express = require('express');
const router = express.Router();

const householdController = require('../controllers/household.controller');
const familyMemberController = require('../controllers/familyMember.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { 
  createHouseholdSchema, 
  updateHouseholdSchema, 
  householdParamsSchema 
} = require('../validators/household.validator');

// All household routes require authentication
router.use(authenticate);

// List and Create
router.get('/', householdController.getAll);
router.post(
  '/', 
  validate(createHouseholdSchema, 'body'), 
  householdController.create
);

// Detail, Update, Delete
router.get(
  '/:id', 
  validate(householdParamsSchema, 'params'), 
  householdController.getById
);

router.post(
  '/:id/members',
  validate(householdParamsSchema, 'params'),
  familyMemberController.addMembers
);

router.put(
  '/:id', 
  validate(householdParamsSchema, 'params'), 
  validate(updateHouseholdSchema, 'body'), 
  householdController.update
);

router.delete(
  '/:id', 
  validate(householdParamsSchema, 'params'), 
  authorize('admin', 'petugas'), // Only admin and petugas
  householdController.delete
);

module.exports = router;
