import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { getCourseKnowledgeCounts } from '../utils/progress';

/** Показывает количество карточек, темы и категории знаний выбранного курса. */
export function CourseInfoDrawer({ course, progress, open, onClose }) {
  const { topicById } = useCatalog();
  // Сохраняет фокус на панели и блокирует прокрутку страницы во время просмотра.
  useBodyScrollLock(open, onClose);

  if (!course) return null;

  // Подготавливает итоговые числа для информационных блоков панели.
  const courseTopics = course.topics.map(topicById).filter(Boolean);
  const cardCount = courseTopics.reduce((total, topic) => total + topic.cards.length, 0);
  const categoryCounts = getCourseKnowledgeCounts(course, progress, topicById);

  return (
    <div className={`course-info-layer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="course-info-backdrop"
        aria-label="Закрыть информацию о курсе"
        onClick={onClose}
      />
      <aside className="course-info-drawer" role="dialog" aria-modal="true" aria-labelledby="course-info-title">
        <header className="course-info-header">
          <div>
            <span className="eyebrow">Информация о курсе</span>
            <h2 id="course-info-title">{course.title}</h2>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Закрыть">×</button>
        </header>

        <section className="course-info-total" aria-label="Количество карточек">
          <span>Всего в курсе</span>
          <strong>{cardCount}</strong>
          <small>карточек</small>
        </section>

        <section className="course-knowledge" aria-labelledby="knowledge-title">
          <span className="eyebrow" id="knowledge-title">Распределение знаний</span>
          <div className="course-knowledge-grid">
            <div className="knowledge-know">
              <strong>{categoryCounts.know}</strong>
              <span>Знаю</span>
            </div>
            <div className="knowledge-partly">
              <strong>{categoryCounts.partly}</strong>
              <span>Не уверен</span>
            </div>
            <div className="knowledge-forgot">
              <strong>{categoryCounts.forgot}</strong>
              <span>Не знаю</span>
            </div>
          </div>
        </section>

        <section className="course-info-topics" aria-labelledby="course-info-topics-title">
          <div className="course-info-section-title">
            <h3 id="course-info-topics-title">Темы курса</h3>
            <span>{courseTopics.length}</span>
          </div>
          <div className="course-info-topic-list">
            {courseTopics.map(topic => (
              <Link to={`/topics/${topic.id}`} key={topic.id} onClick={onClose}>
                <span>
                  <strong>{topic.title}</strong>
                  <small>{topic.cards.length} карточки</small>
                </span>
                <b>{progress[topic.id]}%</b>
              </Link>
            ))}
          </div>
        </section>

        <Link className="button primary course-info-action" to={`/training?course=${course.id}`} onClick={onClose}>
          Начать тренировку <span aria-hidden="true">→</span>
        </Link>
      </aside>
    </div>
  );
}
