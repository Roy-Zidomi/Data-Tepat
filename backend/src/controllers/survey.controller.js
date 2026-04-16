const { upload } = require('../middlewares/upload.middleware');
const cloudinary = require('../config/cloudinary');
const prisma = require('../config/database');
const fs = require('fs');
const { successResponse, errorResponse } = require('../utils/response');

class SurveyController {
  
  /**
   * Mengunggah 1 atau lebih foto survei ke Cloudinary.
   * Dibatasi oleh upload.array('photos', 5) di router (max 5 foto per kali post).
   */
  async uploadPhotos(req, res, next) {
    try {
      const surveyId = BigInt(req.params.surveyId);
      const userId = BigInt(req.user.id);
      
      // Ambil metadata opsional dari body (caption bisa array jika upload banyak, disinkronkan dgn index)
      // karena formData append caption[]
      const captions = req.body.captions || []; 
      
      // Cek apakah survey ada
      const survey = await prisma.survey.findUnique({ where: { id: surveyId } });
      if (!survey) {
        // bersihkan file
        if (req.files) req.files.forEach(f => fs.unlinkSync(f.path));
        return errorResponse(res, 'Survei tidak ditemukan', 404);
      }

      if (!req.files || req.files.length === 0) {
        return errorResponse(res, 'Tidak ada file foto yang terlampir', 400);
      }

      const uploadedPhotos = [];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        try {
          // Upload ke Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `bantutepat/surveys/${surveyId.toString()}`,
            use_filename: true,
            unique_filename: true,
          });

          const caption = Array.isArray(captions) ? captions[i] : (captions || null);

          // Simpan ke database
          const photoRecord = await prisma.surveyPhoto.create({
            data: {
              survey_id: surveyId,
              file_url: result.secure_url,
              cloudinary_public_id: result.public_id,
              caption: caption,
              uploaded_by_user_id: userId,
            }
          });

          uploadedPhotos.push(JSON.parse(JSON.stringify(photoRecord, (_, v) => typeof v === 'bigint' ? v.toString() : v)));

        } catch (uploadError) {
          console.error('[Cloudinary Upload Error]', uploadError);
          // file yg gagal upload diabaikan saja atau bisa throw error (kita abaikan saja dan lanjut foto lain jika ada)
        } finally {
          // Hapus file sementara dari disk lokal
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      return successResponse(res, uploadedPhotos, 'Foto survei berhasil diunggah', 201);
    } catch (error) {
      // Cleanup local files in case of outer error
      if (req.files) {
        req.files.forEach(f => {
          if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
        });
      }
      next(error);
    }
  }

  /**
   * Mengambil daftar foto milik suatu survei
   */
  async listPhotos(req, res, next) {
    try {
      const surveyId = BigInt(req.params.surveyId);
      
      const photos = await prisma.surveyPhoto.findMany({
        where: { survey_id: surveyId },
        include: {
          uploadedByUser: {
            select: { name: true, role: true }
          }
        },
        orderBy: { uploaded_at: 'desc' }
      });

      const formatted = JSON.parse(JSON.stringify(photos, (_, v) => typeof v === 'bigint' ? v.toString() : v));

      return successResponse(res, formatted, 'Daftar foto survei berhasil diambil');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menghapus 1 foto survei dari DB dan Cloudinary
   */
  async deletePhoto(req, res, next) {
    try {
      const surveyId = BigInt(req.params.surveyId);
      const photoId = BigInt(req.params.photoId);

      const targetPhoto = await prisma.surveyPhoto.findUnique({
        where: { id: photoId }
      });

      if (!targetPhoto) {
        return errorResponse(res, 'Foto tidak ditemukan', 404);
      }

      if (targetPhoto.survey_id !== surveyId) {
        return errorResponse(res, 'Foto tidak valid untuk survei ini', 400);
      }

      // Hapus dari cloudinary
      if (targetPhoto.cloudinary_public_id) {
        try {
          await cloudinary.uploader.destroy(targetPhoto.cloudinary_public_id);
        } catch (cloudinaryErr) {
          console.error('[Cloudinary Destroy Error]', cloudinaryErr);
        }
      }

      // Hapus data dari database
      await prisma.surveyPhoto.delete({
        where: { id: photoId }
      });

      return successResponse(res, null, 'Foto survei berhasil dihapus');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SurveyController();
