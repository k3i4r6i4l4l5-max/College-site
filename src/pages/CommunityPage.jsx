import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';

const communityCourses = [
  {
    id: 'algorithms',
    title: 'Алгоритмы для собеседований',
    author: 'Алексей Морозов',
    description: 'Практика по структурам данных, оценке сложности и типовым задачам.',
    topics: 8,
    students: 418,
    symbol: 'A*',
    target: '/courses/java',
  },
  {
    id: 'frontend-interview',
    title: 'Frontend: вопросы и практика',
    author: 'Мария Лебедева',
    description: 'Подборка вопросов по браузеру, JavaScript и современной вёрстке.',
    topics: 6,
    students: 276,
    symbol: 'JS',
    target: '/courses/web',
  },
  {
    id: 'statistics',
    title: 'Статистика без перегрузки',
    author: 'Учебная группа Sigma',
    description: 'Короткие объяснения и карточки для повторения основных формул.',
    topics: 5,
    students: 193,
    symbol: 'σ',
    target: '/courses/math',
  },
];

function CatalogCard({ title, description, meta, symbol, image, to, badge }) {
  return (
    <Link className="community-course-card" to={to}>
      <span
        className={`community-course-cover${image ? ' has-image' : ''}`}
        style={image ? { '--community-image': `url("${image}")` } : undefined}
        aria-hidden="true"
      >
        {!image && symbol}
      </span>
      <span className="community-course-content">
        <span className="community-course-badge">{badge}</span>
        <strong>{title}</strong>
        <span className="community-course-description">{description}</span>
        <span className="community-course-meta">{meta}</span>
      </span>
      <span className="community-course-arrow" aria-hidden="true">→</span>
    </Link>
  );
}

export function CommunityPage() {
  const { courses } = useCatalog();
  return (
    <div className="community-page">
      <header className="page-heading community-heading">
        <span className="eyebrow">Учитесь вместе</span>
        <h1>Сообщество</h1>
        <p>Выбирайте программы от команды сервиса и подборки, которыми делятся другие участники.</p>
      </header>

      <section className="community-section" aria-labelledby="official-courses-title">
        <div className="community-section-heading">
          <div>
            <span className="eyebrow">Проверено редакцией</span>
            <h2 id="official-courses-title">Официальные курсы</h2>
          </div>
          <span className="community-count">{courses.length}</span>
        </div>
        <div className="community-catalog-grid">
          {courses.map(course => (
            <CatalogCard
              key={course.id}
              title={course.title}
              description={course.description}
              meta={`${course.topics.length} тем`}
              image={course.image}
              to={`/courses/${course.id}`}
              badge="Официальный курс"
            />
          ))}
        </div>
      </section>

      <section className="community-section community-authors" aria-labelledby="community-courses-title">
        <div className="community-section-heading">
          <div>
            <span className="eyebrow">Создано участниками</span>
            <h2 id="community-courses-title">Курсы от сообщества</h2>
          </div>
          <span className="community-count">{communityCourses.length}</span>
        </div>
        <div className="community-catalog-grid">
          {communityCourses.map(course => (
            <CatalogCard
              key={course.id}
              title={course.title}
              description={course.description}
              meta={`${course.author} · ${course.topics} тем · ${course.students} участников`}
              symbol={course.symbol}
              to={course.target}
              badge="От сообщества"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
