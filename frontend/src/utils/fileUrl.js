const FALLBACK_API_BASE = '/api/v1';

const getApiBase = () => import.meta.env.VITE_API_URL || FALLBACK_API_BASE;

export const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const apiBase = getApiBase();

  // Local dev with Vite proxy can keep relative paths so /uploads is proxied to backend.
  if (apiBase.startsWith('/')) {
    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  }

  const origin = apiBase.replace(/\/api\/v1\/?$/, '');
  if (!origin) {
    return fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  }

  return `${origin}${fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`}`;
};

