export function getCourseActivity(activity, course, days) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return activity.reduce((counts, entry) => {
    if (!course.topics.includes(entry.topicId) || Date.parse(entry.timestamp) < cutoff.getTime()) return counts;
    return { ...counts, [entry.rating]: counts[entry.rating] + 1 };
  }, { know: 0, partly: 0, forgot: 0 });
}

export function getProblemCards(activity, course, topicById) {
  const problemCards = new Map();
  activity.forEach(entry => {
    if (!course.topics.includes(entry.topicId) || entry.rating === 'know') return;
    const topic = topicById(entry.topicId);
    const card = topic?.cards[entry.cardIndex];
    if (!card) return;
    const key = `${entry.topicId}:${entry.cardIndex}`;
    const current = problemCards.get(key) || { topic, cardIndex: entry.cardIndex, question: card[0], partly: 0, forgot: 0, lastAnsweredAt: entry.timestamp };
    current[entry.rating] += 1;
    if (Date.parse(entry.timestamp) > Date.parse(current.lastAnsweredAt)) current.lastAnsweredAt = entry.timestamp;
    problemCards.set(key, current);
  });
  return [...problemCards.values()].sort((a, b) => (b.partly + b.forgot) - (a.partly + a.forgot) || b.forgot - a.forgot || Date.parse(b.lastAnsweredAt) - Date.parse(a.lastAnsweredAt)).slice(0, 5);
}

export function getTopicProgressHistory(activity, topicId) {
  return activity.filter(entry => entry.topicId === topicId).sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp)).slice(-8).map(entry => ({ id: entry.id, value: entry.progressAfter, timestamp: entry.timestamp }));
}
