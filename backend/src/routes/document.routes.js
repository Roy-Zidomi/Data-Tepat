const express = require('express');
const router = express.Router();

const documentController = require('../controllers/document.controller');
const { validate } = require('../middlewares/validate.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const { uploadDocumentSchema, verifyDocumentSchema } = require('../validators/document.validator');

// All document routes require authentication
router.use(authenticate);

// Protected routes (owner or roles logic inside service based on token)
router.post(
  '/',
  upload.single('file'),
  validate(uploadDocumentSchema),
  documentController.uploadDocument
);

router.get('/household/:householdId', documentController.getDocumentsByHousehold);

// Verification is restricted to Admin & Petugas & Relawan
router.patch(
  '/:id/verify',
  authorize('admin', 'petugas', 'relawan'),
  validate(verifyDocumentSchema),
  documentController.verifyDocument
);

module.exports = router;
