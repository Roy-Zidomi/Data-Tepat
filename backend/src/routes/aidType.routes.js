const express = require('express');
const router = express.Router();

const aidTypeController = require('../controllers/aidType.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createAidTypeSchema, updateAidTypeSchema } = require('../validators/aidType.validator');

router.use(authenticate);

router.get('/', requirePermission('AID_TYPE_LIST'), aidTypeController.listAll);
router.get('/:id', requirePermission('AID_TYPE_LIST'), aidTypeController.getById);
router.post('/', requirePermission('AID_TYPE_CREATE'), validate(createAidTypeSchema), aidTypeController.create);
router.put('/:id', requirePermission('AID_TYPE_UPDATE'), validate(updateAidTypeSchema), aidTypeController.update);
router.delete('/:id', requirePermission('AID_TYPE_DELETE'), aidTypeController.delete);

module.exports = router;
