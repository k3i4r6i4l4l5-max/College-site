import { request } from './request';

export const authService = {
  getSession: () => request({ resource: 'auth', action: 'session', path: '/auth/session' }),
  login: body => request({ resource: 'auth', action: 'login', path: '/auth/login', method: 'POST', body }),
  register: body => request({ resource: 'auth', action: 'register', path: '/auth/register', method: 'POST', body }),
  logoutAll: () => request({ resource: 'auth', action: 'logoutAll', path: '/auth/logout-all', method: 'POST' }),
};
export const catalogService = { getCatalog: () => request({ resource: 'catalog', action: 'get', path: '/catalog' }) };
export const userService = {
  updateProfile: body => request({ resource: 'profile', action: 'update', path: '/users/me', method: 'PATCH', body }),
  changePassword: body => request({ resource: 'profile', action: 'password', path: '/users/me/password', method: 'PUT', body }),
  deleteAccount: () => request({ resource: 'profile', action: 'delete', path: '/users/me', method: 'DELETE' }),
  getSettings: () => request({ resource: 'settings', action: 'get', path: '/users/me/settings' }),
  updateSettings: body => request({ resource: 'settings', action: 'update', path: '/users/me/settings', method: 'PATCH', body }),
  getCourses: () => request({ resource: 'userCourses', action: 'get', path: '/users/me/courses' }),
  updateCourse: (courseId, changes) => request({ resource: 'userCourses', action: 'update', path: `/users/me/courses/${courseId}`, method: 'PATCH', body: { courseId, changes } }),
};
export const trainingService = {
  getActive: () => request({ resource: 'training', action: 'active', path: '/training-sessions/active' }),
  start: body => request({ resource: 'training', action: 'start', path: '/training-sessions', method: 'POST', body }),
  answer: (sessionId, cardId, rating) => request({ resource: 'training', action: 'answer', path: `/training-sessions/${sessionId}/answers`, method: 'POST', body: { sessionId, cardId, rating } }),
  complete: sessionId => request({ resource: 'training', action: 'complete', path: `/training-sessions/${sessionId}/complete`, method: 'POST', body: { sessionId } }),
};
export const progressService = {
  getProgress: () => request({ resource: 'progress', action: 'get', path: '/progress' }),
  getActivity: () => request({ resource: 'activity', action: 'get', path: '/activity' }),
};
export const planService = {
  getActive: () => request({ resource: 'plans', action: 'get', path: '/preparation-plans/active' }),
  save: body => request({ resource: 'plans', action: 'save', path: '/preparation-plans', method: 'POST', body }),
  remove: id => request({ resource: 'plans', action: 'delete', path: `/preparation-plans/${id}`, method: 'DELETE' }),
};
