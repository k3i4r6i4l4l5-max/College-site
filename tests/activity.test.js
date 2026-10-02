import test from 'node:test';
import assert from 'node:assert/strict';
import { getProblemCards, getTopicProgressHistory } from '../src/entities/activity/model/activity.js';

const topics = { js: { id: 'js', title: 'JavaScript', cards: [['Q1', 'A1'], ['Q2', 'A2']] } };
const activity = [
  { id: '1', topicId: 'js', cardIndex: 0, rating: 'partly', progressAfter: 40, timestamp: '2026-09-01T10:00:00Z' },
  { id: '2', topicId: 'js', cardIndex: 0, rating: 'forgot', progressAfter: 33, timestamp: '2026-09-02T10:00:00Z' },
  { id: '3', topicId: 'js', cardIndex: 1, rating: 'partly', progressAfter: 31, timestamp: '2026-09-03T10:00:00Z' },
];

test('проблемные карточки ранжируются по числу сложных ответов', () => {
  const result = getProblemCards(activity, { topics: ['js'] }, id => topics[id]);
  assert.equal(result[0].question, 'Q1');
  assert.equal(result[0].partly + result[0].forgot, 2);
});

test('история темы возвращается в хронологическом порядке', () => {
  const result = getTopicProgressHistory([...activity].reverse(), 'js');
  assert.deepEqual(result.map(point => point.value), [40, 33, 31]);
});
