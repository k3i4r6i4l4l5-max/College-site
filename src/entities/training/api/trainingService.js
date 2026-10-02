import { request } from '../../../shared/api/request';

export const trainingService = {
  getActive: () => request({ resource: 'training', action: 'active', path: '/training-sessions/active' }),
  start: body => request({ resource: 'training', action: 'start', path: '/training-sessions', method: 'POST', body }),
  answer: (sessionId, cardId, rating) => request({ resource: 'training', action: 'answer', path: `/training-sessions/${sessionId}/answers`, method: 'POST', body: { sessionId, cardId, rating } }),
  complete: sessionId => request({ resource: 'training', action: 'complete', path: `/training-sessions/${sessionId}/complete`, method: 'POST', body: { sessionId } }),
};
