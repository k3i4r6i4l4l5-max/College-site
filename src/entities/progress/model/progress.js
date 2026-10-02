export const clampProgress = value => Math.max(0, Math.min(100, value));

export function getCourseKnowledgeCounts(course, progress, topicById) {
  return course.topics.reduce((counts, topicId) => {
    const topic = topicById(topicId);
    if (!topic) return counts;
    const value = progress[topicId] ?? 0;
    const category = value >= 70 ? 'know' : value >= 40 ? 'partly' : 'forgot';
    return { ...counts, [category]: counts[category] + topic.cards.length };
  }, { know: 0, partly: 0, forgot: 0 });
}
