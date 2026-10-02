import { apiRequest, ApiError, DATA_SOURCE } from './client';

let mockHandler;
export function setMockHandler(handler) { mockHandler = handler; }

export async function request({ resource, action, path, ...options }) {
  if (DATA_SOURCE === 'mock') {
    if (!mockHandler) throw new ApiError('Mock backend не настроен.', { code: 'MOCK_NOT_CONFIGURED' });
    try { return await mockHandler(resource, action, options.body || options.query || {}); }
    catch (error) { throw error instanceof ApiError ? error : new ApiError(error.message, error); }
  }
  return apiRequest(path, options);
}
