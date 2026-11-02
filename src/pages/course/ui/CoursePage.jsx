import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { average } from '../../../shared/lib/numbers';
import { useCatalog } from '../../../entities/catalog';
import { Breadcrumb } from '../../../widgets/breadcrumb';
import { CourseInfoDrawer } from '../../../widgets/course-info-drawer';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { TopicCard } from '../../../entities/catalog';
import { NotFoundState } from '../../../widgets/not-found-state';

export function CoursePage({ progress, activity, onPlanCourse, userCourses, onUpdateCourse }) {
  const { courseById, topicById } = useCatalog();
  const { id } = useParams();
  const [infoOpen, setInfoOpen] = useState(false);
  const course = courseById(id);
  const membership = userCourses.find(item => item.courseId === id);

  useEffect(() => setInfoOpen(false), [id]);

  if (!course) return <NotFoundState />;

  const value = average(course.topics.map(topicId => progress[topicId]));
  const cardCount = course.topics.reduce((count, topicId) => count + topicById(topicId).cards.length, 0);

  return (
    <>
      <Breadcrumb current={course.title} />
      <div className="page-heading">
        <span className="eyebrow">{course.category}</span>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        <div className="course-heading-actions">
          <button type="button" className="button secondary" onClick={() => onUpdateCourse(id, { status: membership?.status === 'active' ? 'archived' : 'active' })}>
            {membership?.status === 'active' ? 'В архив' : 'Добавить в мои курсы'}
          </button>
          <button type="button" className="button secondary" aria-pressed={Boolean(membership?.favorite)} onClick={() => onUpdateCourse(id, { favorite: !membership?.favorite, status: membership?.status || 'active' })}>
            {membership?.favorite ? '★ В избранном' : '☆ В избранное'}
          </button>
          <button type="button" className="course-info-open" onClick={() => setInfoOpen(true)}>
            Информация о курсе <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="button secondary course-plan-button" onClick={() => onPlanCourse(course.id)}>
            Составить план
          </button>
        </div>
      </div>
      <div className="course-summary">
        <div>
          <span className="muted">Общий прогресс</span>
          <div className="large-value">{value}<span>%</span></div>
        </div>
        <div className="summary-bar">
          <ProgressBar value={value} />
          <p>Тем: {course.topics.length} · {cardCount} карточек</p>
        </div>
        <Link className="button primary" to={`/training?course=${id}`}>
          Начать тренировку <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="section-title">
        <h2>Темы курса</h2>
        <span className="muted">Выберите тему для изучения</span>
      </div>
      <div className="topic-list">
        {course.topics.map(topicId => (
          <TopicCard key={topicId} topic={topicById(topicId)} value={progress[topicId]} />
        ))}
      </div>
      <CourseInfoDrawer
        course={course}
        progress={progress}
        activity={activity}
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
      />
    </>
  );
}
