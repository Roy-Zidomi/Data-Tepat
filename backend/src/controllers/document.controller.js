const documentService = require('../services/document.service');
const { successResponse } = require('../utils/response');

class DocumentController {
  async uploadDocument(req, res, next) {
    try {
      const { household_id, document_type } = req.body;
      const file = req.file;

      if (!file) {
        throw { statusCode: 400, message: 'File is required' };
      }

      // Convert local path to a URL relative string
      const fileUrl = `${req.protocol}://${req.get('host')}/${file.path.replace(/\\\\/g, '/')}`;

      const document = await documentService.uploadDocument(
        file,
        fileUrl,
        { household_id, document_type },
        req.user
      );

      // Serialize bigints
      const docStr = JSON.parse(JSON.stringify(document, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, docStr, 'Document uploaded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyDocuments(req, res, next) {
    try {
      const documents = await documentService.getMyDocuments(req.user);
      
      const docStr = JSON.parse(JSON.stringify(documents, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, docStr, 'My documents retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getDocumentsByHousehold(req, res, next) {
    try {
      const documents = await documentService.getDocumentsByHousehold(req.params.householdId, req.user);
      
      const docStr = JSON.parse(JSON.stringify(documents, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, docStr, 'Documents retrieved');
    } catch (error) {
      next(error);
    }
  }

  async verifyDocument(req, res, next) {
    try {
      const { status, note } = req.body;
      const documentId = req.params.id;
      
      const verification = await documentService.verifyDocument(documentId, status, note, req.user.id);
      
      const verStr = JSON.parse(JSON.stringify(verification, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));

      return successResponse(res, verStr, 'Document verified');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DocumentController();
