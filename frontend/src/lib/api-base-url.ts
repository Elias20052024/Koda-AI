const configuredApiOrigin = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') ?? '';
export const apiOrigin = configuredApiOrigin || (import.meta.env.BASE_URL ?? '').replace(/\/$/, '');
export const apiBaseUrl = `${apiOrigin}/api`;
