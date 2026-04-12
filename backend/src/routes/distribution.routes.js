const express = require('express');
const router = express.Router();

const distributionController = require('../controllers/distribution.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.use(authenticate);

// List distributions
router.get('/', requirePermission('DISTRIBUTION_LIST_BASIC'), distributionController.listAll);

// Get distribution detail
router.get('/:id', requirePermission('DISTRIBUTION_LIST_BASIC'), distributionController.getById);

// Create distribution
router.post('/', requirePermission('DISTRIBUTION_CREATE'), distributionController.create);

// Update distribution status
router.patch('/:id/status', requirePermission('DISTRIBUTION_UPDATE'), distributionController.updateStatus);

// Upload proof
router.post(
  '/:id/proof',
  requirePermission('DISTRIBUTION_PROOF_UPLOAD'),
  upload.single('file'),
  distributionController.uploadProof
);

module.exports = router;
