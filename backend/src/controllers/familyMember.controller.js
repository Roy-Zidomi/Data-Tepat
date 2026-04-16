const familyMemberService = require('../services/familyMember.service');
const { successResponse } = require('../utils/response');

class FamilyMemberController {
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
}

module.exports = new FamilyMemberController();
