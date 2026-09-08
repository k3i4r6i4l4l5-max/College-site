import { STORAGE_KEYS } from '../constants';
import { topicById } from '../data';

const MINUTES_PER_TOPIC = 20;

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || min));
}

export function readPreparationPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.preparationPlan));
    if (!saved?.courseId || !Array.isArray(saved.schedule)) return null;
    return saved;
  } catch {
    return null;
  }
}

export function createPreparationPlan(course, progress, requestedDays, requestedMinutes) {
  const days = clampNumber(requestedDays, 1, 60);
  const minutesPerDay = clampNumber(requestedMinutes, 15, 180);
  const topics = course.topics
    .map(topicById)
    .filter(Boolean)
    .sort((left, right) => progress[left.id] - progress[right.id]);

  const weightedQueue = [];
  const repetitions = topics.map(topic => ({
    topic,
    count: 1 + Math.ceil((100 - progress[topic.id]) / 25),
  }));
  const maxRepetitions = Math.max(...repetitions.map(item => item.count));

  for (let round = 0; round < maxRepetitions; round += 1) {
    repetitions.forEach(item => {
      if (item.count > round) weightedQueue.push(item.topic.id);
    });
  }

  const topicsPerDay = Math.max(1, Math.floor(minutesPerDay / MINUTES_PER_TOPIC));
  let queueIndex = 0;
  const schedule = Array.from({ length: days }, (_, dayIndex) => {
    const topicIds = Array.from({ length: topicsPerDay }, () => {
      const topicId = weightedQueue[queueIndex % weightedQueue.length];
      queueIndex += 1;
      return topicId;
    });

    return { day: dayIndex + 1, topicIds };
  });

  return {
    courseId: course.id,
    days,
    minutesPerDay,
    createdAt: new Date().toISOString(),
    schedule,
  };
}

export function savePreparationPlan(plan) {
  try {
    localStorage.setItem(STORAGE_KEYS.preparationPlan, JSON.stringify(plan));
  } catch {
    // План продолжает работать в состоянии React, если localStorage недоступен.
  }
}

export function preparationPlanToday(plan) {
  const created = new Date(plan.createdAt);
  const today = new Date();
  created.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const elapsedDays = Math.max(0, Math.floor((today - created) / 86400000));
  const dayIndex = Math.min(elapsedDays, plan.schedule.length - 1);

  return {
    dayIndex,
    daysRemaining: Math.max(0, plan.days - elapsedDays),
    topicIds: plan.schedule[dayIndex]?.topicIds || [],
  };
}
