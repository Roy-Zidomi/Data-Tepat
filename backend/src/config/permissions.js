/**
 * Centralized Permission Matrix for BantuTepat RBAC
 * 
 * Defines which roles can perform which actions.
 * Used by rbac.middleware.js for route-level authorization.
 */

const ROLES = {
  ADMIN_MAIN: 'admin_main',
  ADMIN_STAFF: 'admin_staff',
  PENGAWAS: 'pengawas',
  RELAWAN: 'relawan',
  WARGA: 'warga',
};

const ALL_ROLES = Object.values(ROLES);

const ADMIN_ROLES = [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF];

/**
 * Permission definitions: action → allowed roles
 */
const PERMISSIONS = {
  // ── User Management ──
  USER_LIST:           [ROLES.ADMIN_MAIN],
  USER_CREATE:         [ROLES.ADMIN_MAIN],
  USER_UPDATE:         [ROLES.ADMIN_MAIN],
  USER_DELETE:         [ROLES.ADMIN_MAIN],
  USER_TOGGLE_ACTIVE:  [ROLES.ADMIN_MAIN],

  // ── Household ──
  HOUSEHOLD_LIST:      ALL_ROLES,
  HOUSEHOLD_CREATE:    [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.RELAWAN, ROLES.WARGA],
  HOUSEHOLD_UPDATE:    [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.RELAWAN, ROLES.WARGA],
  HOUSEHOLD_DELETE:    [ROLES.ADMIN_MAIN],

  // ── Documents ──
  DOCUMENT_UPLOAD:     [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.RELAWAN, ROLES.WARGA],
  DOCUMENT_VERIFY:     [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  DOCUMENT_LIST:       ALL_ROLES,

  // ── Aid Applications ──
  APPLICATION_CREATE:  [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.WARGA],
  APPLICATION_LIST:    ALL_ROLES,
  APPLICATION_DETAIL:  ALL_ROLES,
  APPLICATION_SUBMIT:  [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.WARGA],
  APPLICATION_UPDATE_STATUS: [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],

  // ── Beneficiary Decisions ──
  DECISION_LIST:       [ROLES.ADMIN_MAIN, ROLES.PENGAWAS],
  DECISION_CREATE:     [ROLES.ADMIN_MAIN],
  DECISION_UPDATE:     [ROLES.ADMIN_MAIN],

  // ── Distributions ──
  DISTRIBUTION_LIST:   [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.PENGAWAS],
  DISTRIBUTION_CREATE: [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  DISTRIBUTION_UPDATE: [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  DISTRIBUTION_PROOF_UPLOAD: [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.RELAWAN],

  // ── Surveys ──
  SURVEY_LIST:         [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.RELAWAN, ROLES.PENGAWAS],
  SURVEY_CREATE:       [ROLES.RELAWAN],
  SURVEY_UPDATE:       [ROLES.RELAWAN],

  // ── Complaints ──
  COMPLAINT_CREATE:    [ROLES.WARGA],
  COMPLAINT_LIST_OWN:  [ROLES.WARGA],
  COMPLAINT_LIST_ALL:  [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  COMPLAINT_RESOLVE:   [ROLES.ADMIN_MAIN],

  // ── Regions ──
  REGION_LIST:         ALL_ROLES,
  REGION_CREATE:       ADMIN_ROLES,
  REGION_UPDATE:       ADMIN_ROLES,
  REGION_DELETE:       [ROLES.ADMIN_MAIN],

  // ── Aid Types ──
  AID_TYPE_LIST:       ALL_ROLES,
  AID_TYPE_CREATE:     ADMIN_ROLES,
  AID_TYPE_UPDATE:     ADMIN_ROLES,
  AID_TYPE_DELETE:     [ROLES.ADMIN_MAIN],

  // ── Audit Logs ──
  AUDIT_LOG_FULL:      [ROLES.ADMIN_MAIN, ROLES.PENGAWAS],
  AUDIT_LOG_LIMITED:   [ROLES.ADMIN_STAFF],

  // ── Dashboard ──
  DASHBOARD_ADMIN:     ADMIN_ROLES,
  DASHBOARD_OWN:       ALL_ROLES,

  // ── Warga Account Creation ──
  WARGA_ACCOUNT_CREATE: [ROLES.ADMIN_MAIN],
};

/**
 * Application workflow state transitions: which roles can trigger each transition
 */
const APPLICATION_TRANSITIONS = {
  'draft→submitted':                [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.WARGA],
  'submitted→initial_validation':   [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  'initial_validation→document_verification': [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  'document_verification→field_survey':       [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  'field_survey→scoring':           [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  'scoring→admin_review':           [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF],
  'admin_review→approved':          [ROLES.ADMIN_MAIN],
  'admin_review→rejected':          [ROLES.ADMIN_MAIN],
  'submitted→cancelled':            [ROLES.ADMIN_MAIN, ROLES.WARGA],
};

/**
 * Distribution workflow state transitions
 */
const DISTRIBUTION_TRANSITIONS = {
  'recorded→allocated':   ADMIN_ROLES,
  'allocated→sent':       ADMIN_ROLES,
  'sent→delivered':       [ROLES.ADMIN_MAIN, ROLES.ADMIN_STAFF, ROLES.RELAWAN],
  'delivered→completed':  ADMIN_ROLES,
  'allocated→failed':     ADMIN_ROLES,
  'sent→failed':          ADMIN_ROLES,
};

module.exports = {
  ROLES,
  ALL_ROLES,
  ADMIN_ROLES,
  PERMISSIONS,
  APPLICATION_TRANSITIONS,
  DISTRIBUTION_TRANSITIONS,
};
