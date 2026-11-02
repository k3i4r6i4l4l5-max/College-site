import test from 'node:test';
import assert from 'node:assert/strict';
import { clampProgress, getCourseKnowledgeCounts } from '../src/entities/progress/model/progress.js';

test('прогресс ограничивается диапазоном от 0 до 100', () => {
  assert.equal(clampProgress(-7), 0);
  assert.equal(clampProgress(42), 42);
  assert.equal(clampProgress(107), 100);
});

const course = { topics: ['a', 'b'] };
const topicById = id => ({ a: { cards: [1, 2] }, b: { cards: [1] } })[id];
test('без ответов все категории знания равны нулю', () => {
  assert.deepEqual(getCourseKnowledgeCounts(course, [], topicById), { know: 0, partly: 0, forgot: 0 });
});
test('категории учитывают последнюю оценку каждой карточки, а не процент темы', () => {
  const answer = (topicId, cardIndex, rating, day) => ({ topicId, cardIndex, rating, timestamp: `2026-10-0${day}T12:00:00Z` });
  const activity = [answer('a', 0, 'know', 2), answer('a', 0, 'forgot', 1), answer('b', 0, 'partly', 1), answer('a', 1, 'forgot', 1), answer('other', 0, 'know', 1)];
  assert.deepEqual(getCourseKnowledgeCounts(course, activity, topicById), { know: 1, partly: 1, forgot: 1 });
});
