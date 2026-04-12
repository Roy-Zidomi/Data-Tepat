const complaintService = require('../services/complaint.service');
const { successResponse } = require('../utils/response');

class ComplaintController {
  async submitComplaint(req, res, next) {
    try {
      const complaint = await complaintService.submitComplaint(req.body, req.user.id);

      const compStr = JSON.parse(JSON.stringify(complaint, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, compStr, 'Complaint submitted successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyComplaints(req, res, next) {
    try {
      const complaints = await complaintService.getMyComplaints(req.user.id);

      const compStr = JSON.parse(JSON.stringify(complaints, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, compStr, 'Complaints retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getAllComplaints(req, res, next) {
    try {
      const { data, meta } = await complaintService.getAllComplaints(req.query);

      const compStr = JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, { records: compStr, meta }, 'All complaints retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const complaint = await complaintService.getById(req.params.id);

      const compStr = JSON.parse(JSON.stringify(complaint, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, compStr, 'Complaint details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async resolveComplaint(req, res, next) {
    try {
      const updated = await complaintService.resolveComplaint(req.params.id, req.body, req.user);

      const compStr = JSON.parse(JSON.stringify(updated, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, compStr, 'Complaint resolved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComplaintController();
