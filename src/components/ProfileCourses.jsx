import React from 'react';
import { Link } from 'react-router-dom';
import { average } from '../utils/numbers';
import { useCatalog } from '../context/CatalogContext';
import { ProgressBar } from './ProgressBar';

/** Показывает курсы пользователя и рассчитывает средний прогресс каждого курса. */
export function ProfileCourses({ progress, userCourses = [] }) {
  const { courses } = useCatalog();
  const visibleCourses = courses.filter(course => userCourses.some(item => item.courseId === course.id && item.status !== 'archived'));
  return (
    <section className="profile-section profile-courses" aria-labelledby="profile-courses-title">
      <div className="profile-section-heading">
        <div>
          <span className="eyebrow">Ваша библиотека</span>
          <h2 id="profile-courses-title">Мои курсы</h2>
        </div>
        <span>{visibleCourses.length} курса</span>
      </div>
      <div className="profile-course-grid">
        {visibleCourses.map(course => {
          const value = average(course.topics.map(topicId => progress[topicId]));
          return (
            <Link className="profile-course-item" to={`/courses/${course.id}`} key={course.id}>
              <span
                className="profile-course-image"
                style={{ '--profile-course-image': `url("${course.image}")` }}
                aria-hidden="true"
              />
              <span className="profile-course-copy">
                <small>{course.category}</small>
                <strong>{course.title}</strong>
                <span className="profile-course-progress-label"><span>Прогресс</span><b>{value}%</b></span>
                <ProgressBar value={value} label={`Прогресс курса ${course.title}`} />
              </span>
              <span className="profile-course-arrow" aria-hidden="true">→</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
