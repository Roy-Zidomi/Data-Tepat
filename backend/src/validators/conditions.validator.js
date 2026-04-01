const { z } = require('zod');

const conditionParamsSchema = z.object({
  householdId: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

const upsertEconomicConditionSchema = z.object({
  monthly_income_total: z.number().min(0).optional().nullable(),
  income_source: z.string().max(150).optional().nullable(),
  head_job_status: z.string().max(100).optional().nullable(),
  monthly_basic_expense: z.number().min(0).optional().nullable(),
  dependents_count: z.number().int().min(0).optional().nullable(),
  has_other_income_source: z.boolean().optional(),
  debt_estimation: z.number().min(0).optional().nullable(),
  notes: z.string().optional().nullable()
});

const upsertHousingConditionSchema = z.object({
  home_ownership_status: z.enum(['milik_sendiri', 'kontrak', 'menumpang', 'lainnya']).optional().nullable(),
  house_condition: z.enum(['layak', 'semi_layak', 'tidak_layak']).optional().nullable(),
  floor_type: z.string().max(100).optional().nullable(),
  roof_type: z.string().max(100).optional().nullable(),
  wall_type: z.string().max(100).optional().nullable(),
  clean_water_access: z.boolean().optional().nullable(),
  electricity_access: z.boolean().optional().nullable(),
  sanitation_type: z.string().max(100).optional().nullable(),
  bedroom_count: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable()
});

const upsertHouseholdAssetSchema = z.object({
  owns_house: z.boolean().optional().nullable(),
  has_bicycle: z.boolean().optional(),
  has_motorcycle: z.boolean().optional(),
  has_car: z.boolean().optional(),
  has_other_land: z.boolean().optional(),
  productive_assets: z.string().optional().nullable(),
  savings_range: z.string().max(100).optional().nullable(),
  other_assets: z.string().optional().nullable()
});

const upsertHouseholdVulnerabilitySchema = z.object({
  is_disaster_victim: z.boolean().optional(),
  lost_job_recently: z.boolean().optional(),
  has_severe_ill_member: z.boolean().optional(),
  has_disabled_member: z.boolean().optional(),
  has_elderly_member: z.boolean().optional(),
  has_pregnant_member: z.boolean().optional(),
  has_school_children: z.boolean().optional(),
  ever_received_aid_before: z.boolean().optional().nullable(),
  special_condition_notes: z.string().optional().nullable()
});

module.exports = {
  conditionParamsSchema,
  upsertEconomicConditionSchema,
  upsertHousingConditionSchema,
  upsertHouseholdAssetSchema,
  upsertHouseholdVulnerabilitySchema
};
