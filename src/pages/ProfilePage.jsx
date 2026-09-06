import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { average, courses, topics } from '../data';
import { Breadcrumb } from '../components/Breadcrumb';

export function ProfilePage({ progress, user, onUpdate }) {
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
            <button
              className="button secondary profile-edit"
              onClick={() => {
                setEditing(true);
                setMessage('');
              }}
            >
              Редактировать профиль
            </button>
          )}
        </div>
        {message && <p className="profile-message" role="status">{message}</p>}
        <div className="profile-stats" aria-label="Общая статистика">
          <div><span>Курсы</span><strong>{courses.length}</strong><small>доступно</small></div>
          <div><span>Темы</span><strong>{topics.length}</strong><small>{activeTopics} начато</small></div>
          <div><span>Общий прогресс</span><strong>{overall}%</strong><small>по всем темам</small></div>
        </div>
      </section>
      <section className="profile-activity">
        <div>
          <span className="eyebrow">Последняя активность</span>
          <h2>Java Junior Interview</h2>
          <p>Тема Multithreading · {progress.threads}% освоено</p>
        </div>
        <div className="activity-date">
          <span>Сегодня</span>
          <small>Короткая тренировка</small>
        </div>
        <Link className="button primary" to="/training?topic=threads">
          Продолжить <span aria-hidden="true">→</span>
        </Link>
      </section>
      <section className="profile-settings" id="settings">
        <div>
          <h2>Настройки</h2>
          <p>Здесь можно будет управлять уведомлениями и синхронизацией данных.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => setMessage('Настройки пока работают в демонстрационном режиме.')}
        >
          Настроить
        </button>
      </section>
    </div>
  );
}
