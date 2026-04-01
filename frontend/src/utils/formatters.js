/**
 * Date, currency, and text formatting utilities for the BantuTepat frontend.
 */

/** Format a date string to Indonesian locale */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/** Format a date string to short format */
export const formatDateShort = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Format a date string to include time */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/** Format number as Indonesian Rupiah currency */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/** Format a number with dot separators */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('id-ID').format(num);
};

/** Truncate text to a max length */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '-';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/** Mask sensitive NIK: show first 4 and last 4 characters */
export const maskNIK = (nik) => {
  if (!nik) return '-';
  if (nik.length <= 8) return '****';
  return nik.substring(0, 4) + '****' + nik.substring(nik.length - 4);
};

/** Capitalize first letter of each word */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};
