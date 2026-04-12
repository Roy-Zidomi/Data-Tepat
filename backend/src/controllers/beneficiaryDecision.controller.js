const beneficiaryDecisionService = require('../services/beneficiaryDecision.service');
const { successResponse } = require('../utils/response');

class BeneficiaryDecisionController {
  async listAll(req, res, next) {
    try {
      const { data, meta } = await beneficiaryDecisionService.listAll(req.query);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, { records: result, meta }, 'Decisions retrieved');
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await beneficiaryDecisionService.getById(req.params.id);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Decision details retrieved');
    } catch (error) { next(error); }
  }

  async createDecision(req, res, next) {
    try {
      const decision = await beneficiaryDecisionService.createDecision(req.body, req.user);
      const result = JSON.parse(JSON.stringify(decision, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Decision created successfully', 201);
    } catch (error) { next(error); }
  }
}

module.exports = new BeneficiaryDecisionController();
