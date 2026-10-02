import { request } from '../../../shared/api/request';

export const progressService = {
  getProgress: () => request({ resource: 'progress', action: 'get', path: '/progress' }),
  getActivity: () => request({ resource: 'activity', action: 'get', path: '/activity' }),
};
