const aidApplicationService = require('../services/aidApplication.service');
const { successResponse } = require('../utils/response');

class AidApplicationController {
  async createApplication(req, res, next) {
    try {
      const application = await aidApplicationService.createApplication(req.body, req.user.id);

      const appStr = JSON.parse(JSON.stringify(application, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, appStr, 'Application draft created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async submitApplication(req, res, next) {
    try {
      const application = await aidApplicationService.submitApplication(req.params.id, req.user.id);

      const appStr = JSON.parse(JSON.stringify(application, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, appStr, 'Application submitted successfully');
    } catch (error) {
      next(error);
    }
  }

  async getMyApplications(req, res, next) {
    try {
      const applications = await aidApplicationService.getMyApplications(req.user.id);

      const appStr = JSON.parse(JSON.stringify(applications, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, appStr, 'Applications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getApplicationById(req, res, next) {
    try {
      const application = await aidApplicationService.getApplicationById(req.params.id);

      const appStr = JSON.parse(JSON.stringify(application, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, appStr, 'Application details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { data, meta } = await aidApplicationService.getAll(req.query);

      const appStr = JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, { records: appStr, meta }, 'All applications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const updated = await aidApplicationService.updateStatus(req.params.id, status, reason, req.user);

      const appStr = JSON.parse(JSON.stringify(updated, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, appStr, 'Application status updated');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AidApplicationController();
