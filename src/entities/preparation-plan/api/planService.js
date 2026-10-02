import { request } from '../../../shared/api/request';

export const planService = {
  getActive: () => request({ resource: 'plans', action: 'get', path: '/preparation-plans/active' }),
  save: body => request({ resource: 'plans', action: 'save', path: '/preparation-plans', method: 'POST', body }),
  remove: id => request({ resource: 'plans', action: 'delete', path: `/preparation-plans/${id}`, method: 'DELETE' }),
};
