import { request } from '../../../shared/api/request';

export const catalogService = { getCatalog: () => request({ resource: 'catalog', action: 'get', path: '/catalog' }) };
