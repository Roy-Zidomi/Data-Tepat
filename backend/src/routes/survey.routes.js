const express = require('express');
const router = express.Router();
const surveyController = require('../controllers/survey.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission, requireAnyPermission } = require('../middlewares/rbac.middleware');
const { upload } = require('../middlewares/upload.middleware');

router.use(authenticate);

// Fitur unggah foto survei memerlukan permission
// Di sini kita izinkan relawan dan admin. (Mengacu ke RBAC system di rbac.middleware)
// Sementara kita hardcode check agar relawan & admin_main/admin_staff bisa.
const allowedRoles = ['admin_main', 'admin_staff', 'relawan'];

const permitUpload = (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
  }
  next();
};

// Modul CRUD khusus sub-resource /surveys/:surveyId/photos
router.get('/:surveyId/photos', permitUpload, surveyController.listPhotos);
router.post('/:surveyId/photos', permitUpload, upload.array('photos', 5), surveyController.uploadPhotos);
router.delete('/:surveyId/photos/:photoId', permitUpload, surveyController.deletePhoto);

module.exports = router;
