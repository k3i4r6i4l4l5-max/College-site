import { request } from '../../../shared/api/request';

export const userService = {
  updateProfile: body => request({ resource: 'profile', action: 'update', path: '/users/me', method: 'PATCH', body }),
  changePassword: body => request({ resource: 'profile', action: 'password', path: '/users/me/password', method: 'PUT', body }),
  deleteAccount: () => request({ resource: 'profile', action: 'delete', path: '/users/me', method: 'DELETE' }),
  getSettings: () => request({ resource: 'settings', action: 'get', path: '/users/me/settings' }),
  updateSettings: body => request({ resource: 'settings', action: 'update', path: '/users/me/settings', method: 'PATCH', body }),
  getCourses: () => request({ resource: 'userCourses', action: 'get', path: '/users/me/courses' }),
  updateCourse: (courseId, changes) => request({ resource: 'userCourses', action: 'update', path: `/users/me/courses/${courseId}`, method: 'PATCH', body: { courseId, changes } }),
};
