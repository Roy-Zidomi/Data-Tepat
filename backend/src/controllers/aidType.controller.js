const aidTypeService = require('../services/aidType.service');
const { successResponse } = require('../utils/response');

class AidTypeController {
  async listAll(req, res, next) {
    try {
      const { data, meta } = await aidTypeService.listAll(req.query);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, { records: result, meta }, 'Aid types retrieved');
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await aidTypeService.getById(req.params.id);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Aid type retrieved');
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = await aidTypeService.create(req.body, req.user);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Aid type created', 201);
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const data = await aidTypeService.update(req.params.id, req.body, req.user);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Aid type updated');
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      await aidTypeService.delete(req.params.id, req.user);
      return successResponse(res, null, 'Aid type deleted');
    } catch (error) { next(error); }
  }
}

module.exports = new AidTypeController();
