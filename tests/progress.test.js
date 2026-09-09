import test from 'node:test';
import assert from 'node:assert/strict';
import { clampProgress, getCourseKnowledgeCounts } from '../src/utils/progress.js';

test('прогресс ограничивается диапазоном от 0 до 100', () => {
  assert.equal(clampProgress(-7), 0);
  assert.equal(clampProgress(42), 42);
  assert.equal(clampProgress(107), 100);
});

test('карточки курса распределяются по уровням знания', () => {
  const topicMap = { a: { id: 'a', cards: [1, 2] }, b: { id: 'b', cards: [1] }, c: { id: 'c', cards: [1, 2, 3] } };
  const result = getCourseKnowledgeCounts({ topics: ['a', 'b', 'c'] }, { a: 80, b: 55, c: 10 }, id => topicMap[id]);
  assert.deepEqual(result, { know: 2, partly: 1, forgot: 3 });
});
