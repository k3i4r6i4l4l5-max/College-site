import { request } from '../../../shared/api/request';

export const authService = {
  getSession: () => request({ resource: 'auth', action: 'session', path: '/auth/session' }),
  login: body => request({ resource: 'auth', action: 'login', path: '/auth/login', method: 'POST', body }),
  register: body => request({ resource: 'auth', action: 'register', path: '/auth/register', method: 'POST', body }),
  logoutAll: () => request({ resource: 'auth', action: 'logoutAll', path: '/auth/logout-all', method: 'POST' }),
};
