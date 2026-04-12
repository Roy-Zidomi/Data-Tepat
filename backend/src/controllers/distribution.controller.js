const distributionService = require('../services/distribution.service');
const { successResponse } = require('../utils/response');

class DistributionController {
  async listAll(req, res, next) {
    try {
      const { data, meta } = await distributionService.listAll(req.query);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, { records: result, meta }, 'Distributions retrieved');
    } catch (error) { next(error); }
  }

  async getById(req, res, next) {
    try {
      const data = await distributionService.getById(req.params.id);
      const result = JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Distribution details retrieved');
    } catch (error) { next(error); }
  }

  async create(req, res, next) {
    try {
      const distribution = await distributionService.createDistribution(req.body, req.user);
      const result = JSON.parse(JSON.stringify(distribution, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Distribution created', 201);
    } catch (error) { next(error); }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const updated = await distributionService.updateStatus(req.params.id, status, reason, req.user);
      const result = JSON.parse(JSON.stringify(updated, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Distribution status updated');
    } catch (error) { next(error); }
  }

  async uploadProof(req, res, next) {
    try {
      const file = req.file;
      if (!file) {
        throw { statusCode: 400, message: 'File is required' };
      }

      const fileUrl = `${req.protocol}://${req.get('host')}/${file.path.replace(/\\\\/g, '/')}`;
      const proofData = {
        proof_type: req.body.proof_type || 'photo',
        file_url: fileUrl,
        caption: req.body.caption,
      };

      const proof = await distributionService.uploadProof(req.params.id, proofData, req.user);
      const result = JSON.parse(JSON.stringify(proof, (_, v) => typeof v === 'bigint' ? v.toString() : v));
      return successResponse(res, result, 'Proof uploaded', 201);
    } catch (error) { next(error); }
  }
}

module.exports = new DistributionController();
