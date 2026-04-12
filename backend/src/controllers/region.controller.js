const regionService = require('../services/region.service');
const { successResponse } = require('../utils/response');

class RegionController {
  async listAll(req, res, next) {
    try {
      const { data, meta } = await regionService.listAll(req.query);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, { records: result, meta }, 'Regions retrieved');
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await regionService.getById(req.params.id);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Region retrieved');
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const data = await regionService.create(req.body, req.user);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Region created', 201);
    } catch (error) { next(error); }
  }

  async update(req, res, next) {
    try {
      const data = await regionService.update(req.params.id, req.body, req.user);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Region updated');
    } catch (error) { next(error); }
  }

  async delete(req, res, next) {
    try {
      await regionService.delete(req.params.id, req.user);
      return successResponse(res, null, 'Region deleted');
    } catch (error) { next(error); }
  }
}

module.exports = new RegionController();
