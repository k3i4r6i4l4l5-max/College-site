import React from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';

/**
 * Собирает блоки текущей тренировки, слабых тем и последней активности.
 * В режиме embedded возвращает содержимое без собственного элемента aside.
 */
export function ProfileStudySidebar({ embedded = false, activity = [], progress = {} }) {
  const { topics, courseForTopic } = useCatalog();
  const weakTopics = topics.filter(topic => progress[topic.id] > 0 && progress[topic.id] < 70).sort((a, b) => progress[a.id] - progress[b.id]).slice(0, 3);
  const latest = [...activity].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
  const latestTopic = topics.find(topic => topic.id === latest?.topicId) || weakTopics[0] || topics[0];
  const latestCourse = latestTopic && courseForTopic(latestTopic.id);
  const repeatCards = weakTopics.reduce((sum, topic) => sum + topic.cards.length, 0);
  const content = (
    <>
      <section className="profile-today-card">
        <span className="eyebrow">Сегодня</span>
        <h2>Продолжите подготовку</h2>
        <div className="profile-today-stats">
          <div><strong>{repeatCards}</strong><span>карточек<br />к повторению</span></div>
          <div><strong>{weakTopics.length}</strong><span>слабые<br />темы</span></div>
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
              <strong>{progress[topic.id]}%</strong>
            </Link>
          ))}
        </div>
        <Link className="profile-sidebar-link" to="/progress">
          Все слабые темы <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="profile-last-card">
        <div className="profile-last-cover" aria-hidden="true">
          <span className="profile-last-title">{latestCourse?.title || 'Первый курс'}</span>
        </div>
        <div className="profile-last-content">
          <span className="eyebrow">Последняя активность</span>
          <div className="profile-last-topic">
            <div>
              <small>Тема</small>
              <strong>{latestTopic?.title}</strong>
            </div>
            <b>{progress[latestTopic?.id] || 0}%</b>
          </div>
          <div className="profile-last-progress" aria-hidden="true"><span /></div>
          <div className="profile-last-meta">
            <span>{latestTopic?.cards.length || 0} карточек</span>
            <span>{latest ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(latest.timestamp)) : 'нет активности'}</span>
          </div>
          <Link className="button secondary" to={`/training?topic=${latestTopic?.id}`}>
            Продолжить <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  );

  // Встроенный режим используется внутри другого правого сайдбара.
  if (embedded) {
    return <div className="profile-study-sidebar-content">{content}</div>;
  }

  return <aside className="profile-study-sidebar" aria-label="План обучения">{content}</aside>;
}
