import { courses, topicById } from '../data';
import { STORAGE_KEYS } from '../constants';

const RATINGS = ['know', 'partly', 'forgot'];

const demoPattern = {
  java: [
    [5, 2, 1],
    [3, 2, 2],
    [4, 1, 2],
    [2, 3, 1],
    [6, 2, 1],
    [3, 1, 3],
    [4, 2, 2],
  ],
  web: [
    [3, 2, 1],
    [4, 1, 1],
    [2, 2, 2],
    [5, 1, 0],
    [3, 2, 1],
    [2, 1, 2],
    [4, 2, 0],
  ],
  math: [
    [1, 1, 2],
    [2, 1, 1],
    [1, 2, 1],
    [2, 0, 2],
    [1, 1, 1],
    [2, 1, 2],
    [1, 2, 2],
  ],
};

function createDemoActivity() {
  const now = new Date();

  return courses.flatMap(course => demoPattern[course.id].flatMap((counts, dayOffset) => {
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - dayOffset);
    timestamp.setHours(12, 0, 0, 0);

    return counts.flatMap((count, ratingIndex) => (
      Array.from({ length: count }, (_, index) => {
        const topicId = course.topics[(dayOffset + index) % course.topics.length];
        const topic = topicById(topicId);

        return {
          id: `demo-${course.id}-${dayOffset}-${ratingIndex}-${index}`,
          topicId,
          cardIndex: (dayOffset + ratingIndex + index) % topic.cards.length,
          rating: RATINGS[ratingIndex],
          progressAfter: Math.max(0, Math.min(100, topic.progress - dayOffset * 6 + index * 2)),
          timestamp: timestamp.toISOString(),
        };
      })
    ));
  }));
}

function isActivityEntry(entry) {
  return entry
    && typeof entry.id === 'string'
    && typeof entry.topicId === 'string'
    && Number.isInteger(entry.cardIndex)
    && RATINGS.includes(entry.rating)
    && Number.isFinite(entry.progressAfter)
    && !Number.isNaN(Date.parse(entry.timestamp));
}

export function readActivity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.activity);
    if (raw === null) return createDemoActivity();
    const saved = JSON.parse(raw);
    if (!Array.isArray(saved)) return createDemoActivity();
    const validEntries = saved.filter(isActivityEntry);
    return validEntries.length ? validEntries : createDemoActivity();
  } catch {
    return createDemoActivity();
  }
}

export function saveActivity(activity) {
  try {
    localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity));
  } catch {
    // График продолжает обновляться в React, даже если localStorage недоступен.
  }
}

export function addActivityEntry(activity, topicId, rating, cardIndex, progressAfter) {
  const entry = {
    id: `${Date.now()}-${activity.length}`,
    topicId,
    cardIndex,
    rating,
    progressAfter,
    timestamp: new Date().toISOString(),
  };

  return [...activity, entry].slice(-2000);
}

export function getCourseActivity(activity, course, days) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  return activity.reduce((counts, entry) => {
    if (!course.topics.includes(entry.topicId) || Date.parse(entry.timestamp) < cutoff.getTime()) {
      return counts;
    }

    return { ...counts, [entry.rating]: counts[entry.rating] + 1 };
  }, { know: 0, partly: 0, forgot: 0 });
}

export function getProblemCards(activity, course) {
  const problemCards = new Map();

  activity.forEach(entry => {
    if (!course.topics.includes(entry.topicId) || entry.rating === 'know') return;
    const topic = topicById(entry.topicId);
    const card = topic?.cards[entry.cardIndex];
    if (!card) return;

    const key = `${entry.topicId}:${entry.cardIndex}`;
    const current = problemCards.get(key) || {
      topic,
      cardIndex: entry.cardIndex,
      question: card[0],
      partly: 0,
      forgot: 0,
      lastAnsweredAt: entry.timestamp,
    };

    current[entry.rating] += 1;
    if (Date.parse(entry.timestamp) > Date.parse(current.lastAnsweredAt)) {
      current.lastAnsweredAt = entry.timestamp;
    }
    problemCards.set(key, current);
  });

  return [...problemCards.values()]
    .sort((a, b) => (
      (b.partly + b.forgot) - (a.partly + a.forgot)
      || b.forgot - a.forgot
      || Date.parse(b.lastAnsweredAt) - Date.parse(a.lastAnsweredAt)
    ))
    .slice(0, 5);
}

export function getTopicProgressHistory(activity, topicId) {
  return activity
    .filter(entry => entry.topicId === topicId)
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    .slice(-8)
    .map(entry => ({
      id: entry.id,
      value: entry.progressAfter,
      timestamp: entry.timestamp,
    }));
}
