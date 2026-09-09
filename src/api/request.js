import { apiRequest, ApiError, DATA_SOURCE } from './client';
import { mockRequest } from './mockBackend';

export async function request({ resource, action, path, ...options }) {
  if (DATA_SOURCE === 'mock') {
    try { return await mockRequest(resource, action, options.body || options.query || {}); }
    catch (error) { throw error instanceof ApiError ? error : new ApiError(error.message, error); }
  }
  return apiRequest(path, options);
}
