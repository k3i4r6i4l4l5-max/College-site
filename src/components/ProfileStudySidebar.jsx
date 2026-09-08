import React from 'react';
import { Link } from 'react-router-dom';

const weakTopics = [
  { id: 'threads', title: 'Multithreading', value: 38 },
  { id: 'spring', title: 'Spring', value: 45 },
  { id: 'sql', title: 'SQL', value: 61 },
];

export function ProfileStudySidebar({ embedded = false }) {
  const content = (
    <>
      <section className="profile-today-card">
        <span className="eyebrow">Сегодня</span>
        <h2>Продолжите подготовку</h2>
        <div className="profile-today-stats">
          <div><strong>7</strong><span>карточек<br />к повторению</span></div>
          <div><strong>2</strong><span>слабые<br />темы</span></div>
        </div>
        <Link className="button primary" to="/training?mode=weak">
          Начать тренировку <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="profile-repeat-card">
        <div className="profile-sidebar-heading">
          <span className="eyebrow">Фокус</span>
          <h2>Рекомендуется повторить</h2>
        </div>
        <div className="profile-weak-list">
          {weakTopics.map(topic => (
            <Link to={`/topics/${topic.id}`} key={topic.id}>
              <span>{topic.title}</span>
              <strong>{topic.value}%</strong>
            </Link>
          ))}
        </div>
        <Link className="profile-sidebar-link" to="/progress">
          Все слабые темы <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="profile-last-card">
        <div className="profile-last-cover" aria-hidden="true">
          <span className="profile-last-title">Java Junior Interview</span>
        </div>
        <div className="profile-last-content">
          <span className="eyebrow">Последняя активность</span>
          <div className="profile-last-topic">
            <div>
              <small>Тема</small>
              <strong>Spring</strong>
            </div>
            <b>45%</b>
          </div>
          <div className="profile-last-progress" aria-hidden="true"><span /></div>
          <div className="profile-last-meta">
            <span>12 карточек</span>
            <span>сегодня, 18:42</span>
          </div>
          <Link className="button secondary" to="/training?topic=spring">
            Продолжить <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );

  if (embedded) {
    return <div className="profile-study-sidebar-content">{content}</div>;
  }

  return <aside className="profile-study-sidebar" aria-label="План обучения">{content}</aside>;
}
