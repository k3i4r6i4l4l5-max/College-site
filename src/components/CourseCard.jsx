import React from 'react';
import { average } from '../data';
import { ProgressBar } from './ProgressBar';
import { getCourseKnowledgeCounts } from '../utils/progress';

export function CourseCard({ course, progress, onOpen, selected }) {
  const value = average(course.topics.map(id => progress[id]));
  const knowledge = getCourseKnowledgeCounts(course, progress);

  return (
    <article className={`course-tile ${selected ? 'selected' : ''}`}>
      <button
        type="button"
        className={`course-card course-card-${course.id}`}
        style={{ '--course-image': `url("${course.image}")` }}
        onClick={() => onOpen(course)}
        aria-haspopup="dialog"
        aria-label={`Открыть информацию о курсе «${course.title}»`}
      >
        <span className="course-card-title">{course.title}</span>
      </button>
      <div className="course-card-progress">
        <div className="progress-label">
          <span>Прогресс курса</span>
          <strong>{value}%</strong>
        </div>
        <ProgressBar value={value} label={course.title} />
        <div className="course-card-knowledge" aria-label="Распределение карточек по уровню знания">
          <span><strong>{knowledge.know}</strong><small>Знаю</small></span>
          <span><strong>{knowledge.partly}</strong><small>Не уверен</small></span>
          <span><strong>{knowledge.forgot}</strong><small>Не знаю</small></span>
        </div>
      </div>
    </article>
  );
}
