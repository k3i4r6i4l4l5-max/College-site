import test from 'node:test';
import assert from 'node:assert/strict';
import { createPreparationPlan, preparationPlanToday } from '../src/entities/preparation-plan/model/preparationPlan.js';

const topicMap = { weak: { id: 'weak' }, strong: { id: 'strong' } };

test('план ставит слабую тему первой и создаёт выбранное число дней', () => {
  const plan = createPreparationPlan({ id: 'course', topics: ['strong', 'weak'] }, { strong: 80, weak: 20 }, 7, 45, id => topicMap[id]);
  assert.equal(plan.schedule.length, 7);
  assert.equal(plan.schedule[0].topicIds[0], 'weak');
  assert.equal(plan.schedule[0].topicIds.length, 2);
  assert.deepEqual(plan.schedule[0].completedTopicIds, []);
});

test('текущий день плана не выходит за пределы расписания', () => {
  const result = preparationPlanToday({ createdAt: '2020-01-01T00:00:00Z', days: 3, schedule: [{}, {}, { topicIds: ['last'] }] });
  assert.equal(result.dayIndex, 2);
  assert.deepEqual(result.topicIds, ['last']);
});
