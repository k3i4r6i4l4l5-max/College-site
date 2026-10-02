import React from 'react';

export function CompletePlanItemButton({ plan, dayNumber, topicId, completed, onSavePlan }) {
  async function toggle() {
    const schedule = plan.schedule.map(day => {
      if (day.day !== dayNumber) return day;
      const completedIds = day.completedTopicIds || [];
      return {
        ...day,
        completedTopicIds: completedIds.includes(topicId)
          ? completedIds.filter(id => id !== topicId)
          : [...completedIds, topicId],
      };
    });
    await onSavePlan({ ...plan, schedule });
  }

  return <button type="button" aria-pressed={completed} onClick={toggle}>{completed ? 'Выполнено' : 'Отметить'}</button>;
}
