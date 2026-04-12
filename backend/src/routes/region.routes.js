const express = require('express');
const router = express.Router();

const regionController = require('../controllers/region.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requirePermission } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createRegionSchema, updateRegionSchema, regionParamsSchema } = require('../validators/region.validator');

router.use(authenticate);

// List regions — all authenticated users
router.get('/', requirePermission('REGION_LIST'), regionController.listAll);

// Get region by ID
router.get('/:id', requirePermission('REGION_LIST'), validate(regionParamsSchema, 'params'), regionController.getById);

// Create region — admin_main, admin_staff
router.post('/', requirePermission('REGION_CREATE'), validate(createRegionSchema), regionController.create);

// Update region — admin_main, admin_staff
router.put('/:id', requirePermission('REGION_UPDATE'), validate(regionParamsSchema, 'params'), validate(updateRegionSchema), regionController.update);

// Delete region — admin_main only
router.delete('/:id', requirePermission('REGION_DELETE'), validate(regionParamsSchema, 'params'), regionController.delete);

module.exports = router;
