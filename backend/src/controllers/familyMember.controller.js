const familyMemberService = require('../services/familyMember.service');
const { successResponse } = require('../utils/response');

class FamilyMemberController {
  constructor() {
    this.addMembers = this.addMembers.bind(this);
    this.updateMember = this.updateMember.bind(this);
    this.deleteMember = this.deleteMember.bind(this);
  }

  async addMembers(req, res, next) {
    try {
      const { id } = req.params; // household ID
      const membersPayload = req.body.members || [req.body]; // accept array or single object

      const data = await familyMemberService.addMembers(id, membersPayload, req.user);
      return successResponse(res, data, 'Family members added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async updateMember(req, res, next) {
    try {
      const { id: householdId, memberId } = req.params;
      const data = await familyMemberService.updateMember(householdId, memberId, req.body, req.user);
      return successResponse(res, data, 'Family member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteMember(req, res, next) {
    try {
      const { id: householdId, memberId } = req.params;
      await familyMemberService.deleteMember(householdId, memberId, req.user);
      return successResponse(res, null, 'Family member deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FamilyMemberController();
