export const clampProgress = value => Math.max(0, Math.min(100, value));

export function getCourseKnowledgeCounts(course, activity, topicById) {
  const latest = new Map();
  for (const entry of activity) {
    if (!course.topics.includes(entry.topicId) || !topicById(entry.topicId)?.cards[entry.cardIndex]
      || !['know', 'partly', 'forgot'].includes(entry.rating)) continue;
    const key = `${entry.topicId}:${entry.cardIndex}`;
    if (!latest.has(key) || Date.parse(entry.timestamp) >= Date.parse(latest.get(key).timestamp)) latest.set(key, entry);
  }
  return [...latest.values()].reduce((counts, entry) => {
    counts[entry.rating] += 1;
    return counts;
  }, { know: 0, partly: 0, forgot: 0 });
}
