import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { average } from '../utils/numbers';
import { useCatalog } from '../context/CatalogContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { ActivityCharts } from '../components/ActivityCharts';
import { ProfileCourses } from '../components/ProfileCourses';
import { SectionErrorBoundary } from '../components/SectionErrorBoundary';

export function ProfilePage({ activity, progress, user, userCourses, onUpdate }) {
  const { topics } = useCatalog();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user);
  const [message, setMessage] = useState('');
  const overall = average(topics.map(topic => progress[topic.id]));
  const activeTopics = topics.filter(topic => progress[topic.id] > 0).length;

  function submit(event) {
    event.preventDefault();
    const next = {
      name: draft.name.trim() || user.name,
      email: draft.email.trim() || user.email,
    };
    onUpdate(next);
    setDraft(next);
    setEditing(false);
    setMessage('Данные профиля обновлены.');
  }

  function cancelEdit() {
    setDraft(user);
    setEditing(false);
    setMessage('');
  }

  return (
    <div className="profile-page">
      <Breadcrumb current="Личный кабинет" />
      <div className="page-heading profile-heading">
        <span className="eyebrow">Учебный профиль</span>
        <h1>Личный кабинет</h1>
        <p>Ваши данные, общая статистика и последнее занятие в одном месте.</p>
      </div>
      <section className="profile-card">
        <div className="profile-identity">
          <span className="profile-large-avatar" aria-hidden="true">
            {user.name.trim().charAt(0).toUpperCase() || 'У'}
          </span>
          {editing ? (
            <form className="profile-form" onSubmit={submit}>
              <label>
                Имя
                <input
                  value={draft.name}
                  onChange={event => setDraft({ ...draft, name: event.target.value })}
                  autoComplete="name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={draft.email}
                  onChange={event => setDraft({ ...draft, email: event.target.value })}
                  autoComplete="email"
                />
              </label>
              <div className="profile-form-actions">
                <button className="button primary" type="submit">Сохранить</button>
                <button className="button secondary" type="button" onClick={cancelEdit}>Отмена</button>
              </div>
            </form>
          ) : (
            <div className="profile-person">
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span>Самостоятельное обучение</span>
            </div>
          )}
          {!editing && (
            <div className="profile-actions">
              <button
                className="button secondary profile-edit"
                onClick={() => {
                  setEditing(true);
                  setMessage('');
                }}
              >
                Редактировать профиль
              </button>
              <Link className="button secondary" to="/settings">Настройки</Link>
            </div>
          )}
        </div>
        {message && <p className="profile-message" role="status">{message}</p>}
        <div className="profile-stats" aria-label="Общая статистика">
          <div><span>Курсы</span><strong>{userCourses.filter(item => item.status === 'active').length}</strong><small>активно</small></div>
          <div><span>Темы</span><strong>{topics.length}</strong><small>{activeTopics} начато</small></div>
          <div><span>Общий прогресс</span><strong>{overall}%</strong><small>по всем темам</small></div>
        </div>
      </section>
      <SectionErrorBoundary><ProfileCourses progress={progress} userCourses={userCourses} /></SectionErrorBoundary>
      <SectionErrorBoundary><ActivityCharts activity={activity} /></SectionErrorBoundary>
    </div>
  );
}
