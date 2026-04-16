export const FORM_LIMITS = {
  aidTypeCode: 50,
  aidTypeName: 150,
  aidTypeUnit: 50,
  count: 3,
  email: 255,
  evidenceLabel: 150,
  evidenceType: 100,
  kkNik: 32,
  longNote: 1000,
  money: 15,
  name: 150,
  note: 500,
  otp: 6,
  password: 72,
  phone: 30,
  postalCode: 10,
  regionName: 100,
  relationship: 100,
  rtRw: 10,
  search: 100,
  text: 150,
  url: 2048,
  username: 100,
};

export const clampText = (value, max) => value.slice(0, max);

export const digitsOnly = (value, max) =>
  value.replace(/\D/g, '').slice(0, max);

export const phoneOnly = (value, max) =>
  value.replace(/[^\d+]/g, '').slice(0, max);
