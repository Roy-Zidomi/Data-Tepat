const householdService = require('../services/household.service');
const { successResponse } = require('../utils/response');

class HouseholdController {
  async getAll(req, res, next) {
    try {
      const { data, meta } = await householdService.getAll(req.query, req.user);
      return successResponse(res, { records: data, meta }, 'Households retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await householdService.getById(req.params.id, req.user);
      return successResponse(res, data, 'Household retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = await householdService.create(req.body, req.user);
      return successResponse(res, data, 'Household created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const data = await householdService.update(req.params.id, req.body, req.user);
      return successResponse(res, data, 'Household updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await householdService.delete(req.params.id, req.user);
      return successResponse(res, null, 'Household deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new HouseholdController();
