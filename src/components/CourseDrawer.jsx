import React from 'react';
import { Link } from 'react-router-dom';
import { average, topicById } from '../data';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ProgressBar } from './ProgressBar';

function knowledgeLabel(value) {
  if (value === 0) return 'Не начато';
  if (value >= 75) return 'Уверенно';
  if (value >= 50) return 'Закрепляется';
  return 'Стоит повторить';
}

export function CourseDrawer({ course, progress, open, onClose }) {
  useBodyScrollLock(open, onClose);
  if (!course) return null;

  const courseTopics = course.topics.map(topicById);
  const value = average(courseTopics.map(topic => progress[topic.id]));
  const completed = courseTopics.filter(topic => progress[topic.id] >= 70).length;
  const totalCards = courseTopics.reduce((sum, topic) => sum + topic.cards.length, 0);

  return (
    <div className={`course-drawer-layer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="course-drawer-backdrop"
        aria-label="Закрыть информацию о курсе"
        onClick={onClose}
      />
      <aside className="course-drawer" role="dialog" aria-modal="true" aria-labelledby="course-drawer-title">
        <header className="course-drawer-header">
          <span className="eyebrow">{course.category}</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Закрыть">×</button>
        </header>
        <h2 id="course-drawer-title">{course.title}</h2>
        <p className="course-drawer-description">{course.description}</p>
        <div className="drawer-overall">
          <div className="progress-label">
            <span>Общий прогресс</span>
            <strong>{value}%</strong>
          </div>
          <ProgressBar value={value} label={`Прогресс курса ${course.title}`} />
        </div>
        <div className="drawer-stats">
          <div><strong>{courseTopics.length}</strong><span>тем</span></div>
          <div><strong>{completed}</strong><span>освоено</span></div>
          <div><strong>{totalCards}</strong><span>карточек</span></div>
        </div>
        <div className="drawer-section-title">
          <h3>Темы курса</h3>
          <span>{completed} из {courseTopics.length} пройдено</span>
        </div>
        <div className="drawer-topic-list">
          {courseTopics.map(topic => (
            <Link key={topic.id} className="drawer-topic" to={`/topics/${topic.id}`}>
              <div className="drawer-topic-heading">
                <strong>{topic.title}</strong>
                <span className={progress[topic.id] > 0 && progress[topic.id] < 50 ? 'weak' : ''}>
                  {knowledgeLabel(progress[topic.id])}
                </span>
              </div>
              <p>{topic.description}</p>
              <div className="drawer-topic-progress">
                <ProgressBar value={progress[topic.id]} label={topic.title} />
                <strong>{progress[topic.id]}%</strong>
              </div>
            </Link>
          ))}
        </div>
        <div className="drawer-actions">
          <Link className="button primary" to={`/courses/${course.id}`} onClick={onClose}>
            Открыть курс <span aria-hidden="true">→</span>
          </Link>
          <Link className="text-link" to={`/training?course=${course.id}`} onClick={onClose}>
            Начать тренировку
          </Link>
        </div>
      </aside>
    </div>
  );
}
