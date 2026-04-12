const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  createUserSchema,
  updateUserSchema,
  userParamsSchema,
  toggleActiveSchema,
} = require('../validators/user.validator');

// All user management routes require authentication
router.use(authenticate);

// List all users — admin_main only
router.get(
  '/',
  requirePermission('USER_LIST'),
  userController.listAll
);

// Get user by ID — admin_main only
router.get(
  '/:id',
  requirePermission('USER_LIST'),
  validate(userParamsSchema, 'params'),
  userController.getById
);

// Create user — admin_main only
router.post(
  '/',
  requirePermission('USER_CREATE'),
  validate(createUserSchema),
  userController.createUser
);

// Update user profile — admin_main only
router.put(
  '/:id',
  requirePermission('USER_UPDATE'),
  validate(userParamsSchema, 'params'),
  validate(updateUserSchema),
  userController.updateUser
);

// Update user role — admin_main only
router.patch(
  '/:id/role',
  requirePermission('USER_UPDATE'),
  validate(userParamsSchema, 'params'),
  userController.updateRole
);

// Toggle active status — admin_main only
router.patch(
  '/:id/active',
  requirePermission('USER_TOGGLE_ACTIVE'),
  validate(userParamsSchema, 'params'),
  validate(toggleActiveSchema),
  userController.toggleActive
);

module.exports = router;
