export class ApiError extends Error {
  constructor(message, { status = 0, code = 'UNKNOWN_ERROR', details = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace(/\/$/, '');
export const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE === 'api' ? 'api' : 'mock';

async function parseResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    throw new ApiError(payload?.message || 'Не удалось выполнить запрос.', {
      status: response.status,
      code: payload?.code || `HTTP_${response.status}`,
      details: payload?.details,
    });
  }
  return payload;
}

export async function apiRequest(path, options = {}) {
  const { query, body, signal, headers, ...requestOptions } = options;
  const url = new URL(`${API_URL}${path}`, window.location.origin);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });

  let response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      signal,
      ...requestOptions,
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Сервер недоступен. Проверьте соединение и попробуйте ещё раз.', { code: 'NETWORK_ERROR' });
  }

  if (response.status === 401) window.dispatchEvent(new CustomEvent('practice:unauthorized'));
  return parseResponse(response);
}
