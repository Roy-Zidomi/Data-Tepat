const cloudinary = require('../config/cloudinary');
const prisma = require('../config/database');
const fs = require('fs');
const { successResponse, errorResponse } = require('../utils/response');
const { buildPaginationMeta, generateApplicationNo } = require('../utils/helpers');
const { calculateTotalScore, determinePriorityLevel } = require('../utils/scoring');

class SurveyController {
  serialize(data) {
    return JSON.parse(
      JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
    );
  }

  toNullableDecimal(value) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  toNullableBoolean(value) {
    if (value === null || value === undefined) return null;
    return Boolean(value);
  }

  addChecklistItem(rows, itemCode, itemLabel, { valueText = null, valueNumber = null, valueBoolean = null, notes = null } = {}) {
    if (valueText === null && valueNumber === null && valueBoolean === null && notes === null) return;
    rows.push({
      item_code: itemCode,
      item_label: itemLabel,
      value_text: valueText,
      value_number: valueNumber,
      value_boolean: valueBoolean,
      notes,
    });
  }

  buildChecklistRows(household) {
    const rows = [];
    const economic = household.economicCondition || {};
    const housing = household.housingCondition || {};
    const assets = household.householdAsset || {};
    const vulnerability = household.vulnerability || {};

    this.addChecklistItem(rows, 'household_nomor_kk', 'Nomor KK', { valueText: household.nomor_kk || null });
    this.addChecklistItem(rows, 'household_head_name', 'Nama Kepala Keluarga', { valueText: household.nama_kepala_keluarga || null });
    this.addChecklistItem(rows, 'household_address', 'Alamat', { valueText: household.alamat || null });

    this.addChecklistItem(rows, 'economic_income_total', 'Pendapatan Bulanan Total', {
      valueNumber: this.toNullableDecimal(economic.monthly_income_total),
    });
    this.addChecklistItem(rows, 'economic_basic_expense', 'Pengeluaran Pokok Bulanan', {
      valueNumber: this.toNullableDecimal(economic.monthly_basic_expense),
    });
    this.addChecklistItem(rows, 'economic_dependents_count', 'Jumlah Tanggungan', {
      valueNumber: this.toNullableDecimal(economic.dependents_count),
    });
    this.addChecklistItem(rows, 'economic_income_source', 'Sumber Pendapatan', {
      valueText: economic.income_source || null,
    });

    this.addChecklistItem(rows, 'housing_house_condition', 'Kondisi Rumah', { valueText: housing.house_condition || null });
    this.addChecklistItem(rows, 'housing_floor_type', 'Jenis Lantai', { valueText: housing.floor_type || null });
    this.addChecklistItem(rows, 'housing_roof_type', 'Jenis Atap', { valueText: housing.roof_type || null });
    this.addChecklistItem(rows, 'housing_wall_type', 'Jenis Dinding', { valueText: housing.wall_type || null });
    this.addChecklistItem(rows, 'housing_bedroom_count', 'Jumlah Kamar Tidur', {
      valueNumber: this.toNullableDecimal(housing.bedroom_count),
    });
    this.addChecklistItem(rows, 'housing_clean_water_access', 'Akses Air Bersih', {
      valueBoolean: this.toNullableBoolean(housing.clean_water_access),
    });
    this.addChecklistItem(rows, 'housing_electricity_access', 'Akses Listrik', {
      valueBoolean: this.toNullableBoolean(housing.electricity_access),
    });

    this.addChecklistItem(rows, 'asset_owns_house', 'Memiliki Rumah', {
      valueBoolean: this.toNullableBoolean(assets.owns_house),
    });
    this.addChecklistItem(rows, 'asset_has_motorcycle', 'Memiliki Motor', {
      valueBoolean: this.toNullableBoolean(assets.has_motorcycle),
    });
    this.addChecklistItem(rows, 'asset_has_car', 'Memiliki Mobil', {
      valueBoolean: this.toNullableBoolean(assets.has_car),
    });
    this.addChecklistItem(rows, 'asset_other_assets', 'Aset Lainnya', {
      valueText: assets.other_assets || null,
    });

    this.addChecklistItem(rows, 'vuln_disaster_victim', 'Korban Bencana', {
      valueBoolean: this.toNullableBoolean(vulnerability.is_disaster_victim),
    });
    this.addChecklistItem(rows, 'vuln_severe_illness', 'Ada Anggota Sakit Berat', {
      valueBoolean: this.toNullableBoolean(vulnerability.has_severe_ill_member),
    });
    this.addChecklistItem(rows, 'vuln_disability', 'Ada Anggota Disabilitas', {
      valueBoolean: this.toNullableBoolean(vulnerability.has_disabled_member),
    });
    this.addChecklistItem(rows, 'vuln_elderly', 'Ada Anggota Lansia', {
      valueBoolean: this.toNullableBoolean(vulnerability.has_elderly_member),
    });
    this.addChecklistItem(rows, 'vuln_notes', 'Catatan Kerentanan', {
      valueText: vulnerability.special_condition_notes || null,
    });

    return rows;
  }

  async resolveOrCreateApplication(tx, householdId, userId) {
    const activeApplication = await tx.aidApplication.findFirst({
      where: {
        household_id: householdId,
        status: { notIn: ['approved', 'rejected', 'cancelled'] },
      },
      orderBy: { created_at: 'desc' },
    });

    if (activeApplication) return activeApplication;

    const aidType = await tx.aidType.findFirst({
      where: { is_active: true },
      orderBy: { id: 'asc' },
    });

    if (!aidType) {
      throw { statusCode: 400, message: 'Belum ada jenis bantuan aktif. Hubungi admin utama.' };
    }

    const created = await tx.aidApplication.create({
      data: {
        household_id: householdId,
        aid_type_id: aidType.id,
        application_no: generateApplicationNo(),
        submitted_by_user_id: userId,
        submission_date: new Date(),
        status: 'field_survey',
        current_step_note: 'Permohonan dibuat otomatis saat relawan mengirim hasil survei.',
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        application_id: created.id,
        old_status: null,
        new_status: 'field_survey',
        changed_by_user_id: userId,
        reason: 'Auto-create from field survey submission',
      },
    });

    return created;
  }

  async setApplicationStatus(tx, applicationId, fromStatus, toStatus, userId, reason) {
    if (fromStatus === toStatus) return toStatus;

    await tx.aidApplication.update({
      where: { id: applicationId },
      data: {
        status: toStatus,
        current_step_note: reason,
      },
    });

    await tx.applicationStatusHistory.create({
      data: {
        application_id: applicationId,
        old_status: fromStatus,
        new_status: toStatus,
        changed_by_user_id: userId,
        reason,
      },
    });

    return toStatus;
  }

  async submitFromHousehold(req, res, next) {
    try {
      const householdId = BigInt(req.params.householdId);
      const userId = BigInt(req.user.id);
      const {
        summary = null,
        recommendation = null,
        matches_submitted_data = null,
        location_lat = null,
        location_lng = null,
      } = req.body || {};

      const allowedRecommendation = ['strongly_recommended', 'recommended', 'conditional', 'not_recommended'];
      if (recommendation && !allowedRecommendation.includes(recommendation)) {
        return errorResponse(res, 'Recommendation tidak valid', 400);
      }

      const submission = await prisma.$transaction(async (tx) => {
        const household = await tx.household.findUnique({
          where: { id: householdId },
          include: {
            economicCondition: true,
            housingCondition: true,
            householdAsset: true,
            vulnerability: true,
            documents: {
              orderBy: { uploaded_at: 'desc' },
              include: {
                verifications: { orderBy: { verified_at: 'desc' }, take: 1 },
              },
            },
          },
        });

        if (!household) {
          throw { statusCode: 404, message: 'Rumah tangga tidak ditemukan' };
        }

        const latestFieldPhoto = household.documents.find((doc) => ['foto_rumah', 'foto_lapangan'].includes(doc.document_type));
        if (!latestFieldPhoto) {
          throw { statusCode: 400, message: 'Unggah minimal foto rumah atau foto lapangan sebelum kirim survei.' };
        }

        const application = await this.resolveOrCreateApplication(tx, householdId, userId);
        let currentStatus = application.status;

        if (currentStatus !== 'field_survey') {
          currentStatus = await this.setApplicationStatus(
            tx,
            application.id,
            currentStatus,
            'field_survey',
            userId,
            'Relawan memulai finalisasi hasil survei lapangan.'
          );
        }

        const survey = await tx.survey.create({
          data: {
            application_id: application.id,
            surveyor_user_id: userId,
            survey_date: new Date(),
            location_lat: this.toNullableDecimal(location_lat),
            location_lng: this.toNullableDecimal(location_lng),
            summary: summary || null,
            matches_submitted_data:
              matches_submitted_data === null || matches_submitted_data === undefined
                ? null
                : Boolean(matches_submitted_data),
            recommendation: recommendation || null,
            status: 'completed',
          },
        });

        const checklistRows = this.buildChecklistRows(household).map((item) => ({
          ...item,
          survey_id: survey.id,
        }));
        if (checklistRows.length > 0) {
          await tx.surveyChecklist.createMany({ data: checklistRows });
        }

        const latestDocumentsByType = {};
        household.documents.forEach((doc) => {
          if (!latestDocumentsByType[doc.document_type]) {
            latestDocumentsByType[doc.document_type] = doc;
          }
        });

        const photoPayload = Object.values(latestDocumentsByType)
          .filter((doc) => ['foto_rumah', 'foto_lapangan'].includes(doc.document_type) && doc.file_url)
          .map((doc) => ({
            survey_id: survey.id,
            file_url: doc.file_url,
            caption: `Sumber dokumen: ${doc.document_type}`,
            uploaded_by_user_id: doc.uploaded_by_user_id || userId,
          }));

        if (photoPayload.length > 0) {
          await tx.surveyPhoto.createMany({ data: photoPayload });
        }

        currentStatus = await this.setApplicationStatus(
          tx,
          application.id,
          currentStatus,
          'scoring',
          userId,
          'Data survei selesai, masuk proses skoring otomatis.'
        );

        const scoreData = calculateTotalScore({
          economicCond: household.economicCondition,
          housingCond: household.housingCondition,
          assets: household.householdAsset,
          vulnerability: household.vulnerability,
        });
        const priorityLevel = determinePriorityLevel(scoreData.totalScore);

        await tx.scoringResult.create({
          data: {
            application_id: application.id,
            income_score: scoreData.incomeScore,
            dependents_score: scoreData.dependentsScore,
            housing_score: scoreData.housingScore,
            asset_score: scoreData.assetScore,
            vulnerability_score: scoreData.vulnerabilityScore,
            history_aid_score: scoreData.historyAidScore,
            total_score: scoreData.totalScore,
            priority_level: priorityLevel,
            scoring_version: '1.0.0',
            scored_by_user_id: userId,
            score_note: 'Automated scoring generated from completed field survey.',
          },
        });

        currentStatus = await this.setApplicationStatus(
          tx,
          application.id,
          currentStatus,
          'admin_review',
          userId,
          'Skoring selesai, siap finalisasi oleh admin staff.'
        );

        const refreshedSurvey = await tx.survey.findUnique({
          where: { id: survey.id },
          include: {
            application: {
              select: {
                id: true,
                application_no: true,
                status: true,
                household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
              },
            },
            _count: { select: { checklists: true, photos: true } },
          },
        });

        return refreshedSurvey;
      });

      return successResponse(res, this.serialize(submission), 'Hasil survei berhasil dikirim', 201);
    } catch (error) {
      next(error);
    }
  }

  async getMyResults(req, res, next) {
    try {
      const { page = 1, limit = 20, search, status } = req.query;
      const take = parseInt(limit, 10);
      const skip = (parseInt(page, 10) - 1) * take;

      const where = {};
      if (req.user.role === 'relawan') {
        where.surveyor_user_id = BigInt(req.user.id);
      }
      if (status) where.status = status;
      if (search) {
        where.application = {
          household: {
            OR: [
              { nama_kepala_keluarga: { contains: search, mode: 'insensitive' } },
              { nomor_kk: { contains: search, mode: 'insensitive' } },
            ],
          },
        };
      }

      const [total, records] = await Promise.all([
        prisma.survey.count({ where }),
        prisma.survey.findMany({
          where,
          skip,
          take,
          orderBy: { survey_date: 'desc' },
          include: {
            application: {
              select: {
                id: true,
                application_no: true,
                status: true,
                household: { select: { id: true, nomor_kk: true, nama_kepala_keluarga: true } },
              },
            },
            _count: { select: { checklists: true, photos: true } },
          },
        }),
      ]);

      return successResponse(
        res,
        this.serialize({
          records,
          meta: buildPaginationMeta(total, page, limit),
        }),
        'Riwayat hasil survei berhasil diambil'
      );
    } catch (error) {
      next(error);
    }
  }
  
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

          uploadedPhotos.push(this.serialize(photoRecord));

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

      const formatted = this.serialize(photos);

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
