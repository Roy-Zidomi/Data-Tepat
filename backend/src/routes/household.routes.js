const express = require('express');
const router = express.Router();

const householdController = require('../controllers/household.controller');
const familyMemberController = require('../controllers/familyMember.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { 
  createHouseholdSchema, 
  updateHouseholdSchema, 
  householdParamsSchema 
} = require('../validators/household.validator');

// All household routes require authentication
router.use(authenticate);

// List and Create
router.get('/', requirePermission('HOUSEHOLD_LIST'), householdController.getAll);
router.post(
  '/',
  requirePermission('HOUSEHOLD_CREATE'),
  validate(createHouseholdSchema, 'body'), 
  householdController.create
);

// Detail, Update, Delete
router.get(
  '/:id',
  requirePermission('HOUSEHOLD_LIST'),
  validate(householdParamsSchema, 'params'), 
  householdController.getById
);

router.post(
  '/:id/members',
  requirePermission('HOUSEHOLD_UPDATE'),
  validate(householdParamsSchema, 'params'),
  familyMemberController.addMembers
);

router.put(
  '/:id',
  requirePermission('HOUSEHOLD_UPDATE'),
  validate(householdParamsSchema, 'params'), 
  validate(updateHouseholdSchema, 'body'), 
  householdController.update
);

router.delete(
  '/:id',
  requirePermission('HOUSEHOLD_DELETE'),
  validate(householdParamsSchema, 'params'), 
  householdController.delete
);

module.exports = router;
