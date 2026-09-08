import { topicById, topics } from '../data';
import { RATING_DELTAS, STORAGE_KEYS } from '../constants';

export function clampProgress(value) {
  return Math.max(0, Math.min(100, value));
}

export function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.progress) || '{}');
    return Object.fromEntries(
      topics.map(topic => [
        topic.id,
        Number.isFinite(saved?.[topic.id])
          ? clampProgress(saved[topic.id])
          : topic.progress,
      ]),
    );
  } catch {
    return Object.fromEntries(topics.map(topic => [topic.id, topic.progress]));
  }
}

export function rateTopic(progress, topicId, rating) {
  return {
    ...progress,
    [topicId]: clampProgress(progress[topicId] + RATING_DELTAS[rating]),
  };
}

export function getCourseKnowledgeCounts(course, progress) {
  return course.topics.reduce((counts, topicId) => {
    const topic = topicById(topicId);
    if (!topic) return counts;

    const value = progress[topicId] ?? 0;
    const category = value >= 70 ? 'know' : value >= 40 ? 'partly' : 'forgot';
    return { ...counts, [category]: counts[category] + topic.cards.length };
  }, { know: 0, partly: 0, forgot: 0 });
}
