import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { average, courses, topicById } from '../data';
import { Breadcrumb } from '../components/Breadcrumb';
import { ProgressBar } from '../components/ProgressBar';
import { TopicCard } from '../components/TopicCard';
import { NotFoundPage } from './NotFoundPage';

export function CoursePage({ progress }) {
  const { id } = useParams();
  const course = courses.find(item => item.id === id);
  if (!course) return <NotFoundPage />;

  const value = average(course.topics.map(topicId => progress[topicId]));
  const cardCount = course.topics.reduce((count, topicId) => count + topicById(topicId).cards.length, 0);

  return (
    <>
      <Breadcrumb current={course.title} />
      <div className="page-heading">
        <span className="eyebrow">{course.category}</span>
        <h1>{course.title}</h1>
        <p>{course.description}</p>
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
    </>
  );
}
