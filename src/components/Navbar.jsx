import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { average, courses, topics } from '../data';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export function Navbar({ user, onLogout, progress }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const initial = user.name.trim().charAt(0).toUpperCase() || 'У';
  const overall = average(topics.map(topic => progress[topic.id]));
  const activeTopics = topics.filter(topic => progress[topic.id] > 0).length;

  useEffect(() => setProfileOpen(false), [location.pathname, location.search]);
  useBodyScrollLock(profileOpen, () => setProfileOpen(false));

  const switchState = location.pathname === '/progress'
    ? 'show-progress'
    : location.pathname === '/profile'
      ? 'profile-page-active'
      : 'show-courses';

  return (
    <>
      <header className="navbar">
        <div className="nav-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">п.</span>
            практика
          </Link>
          <nav className={`nav-switch ${switchState}`} aria-label="Основная навигация">
            <NavLink
              to="/"
              className={({ isActive }) => (
                isActive
                || location.pathname.startsWith('/courses')
                || location.pathname.startsWith('/topics')
                || location.pathname.startsWith('/training')
                  ? 'active'
                  : ''
              )}
            >
              Курсы
            </NavLink>
            <NavLink to="/progress">Прогресс</NavLink>
          </nav>
          <div className="profile-wrap">
            <div className="profile-launch">
              <Link className="profile-account-link" to="/profile">
                <span className="profile-avatar" aria-hidden="true">{initial}</span>
                <span className="profile-label">Личный кабинет</span>
              </Link>
              <button
                type="button"
                className="profile-arrow-button"
                aria-label="Открыть информацию профиля"
                aria-expanded={profileOpen}
                aria-haspopup="dialog"
                onClick={() => setProfileOpen(true)}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`profile-drawer-layer ${profileOpen ? 'open' : ''}`} aria-hidden={!profileOpen}>
        <button
          type="button"
          className="profile-drawer-backdrop"
          aria-label="Закрыть информацию профиля"
          onClick={() => setProfileOpen(false)}
        />
        <aside className="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="profile-drawer-title">
          <header className="profile-drawer-header">
            <span className="eyebrow">Учебный профиль</span>
            <button type="button" className="drawer-close" onClick={() => setProfileOpen(false)} aria-label="Закрыть">×</button>
          </header>
          <div className="profile-drawer-identity">
            <span className="profile-drawer-avatar" aria-hidden="true">{initial}</span>
            <div>
              <h2 id="profile-drawer-title">{user.name}</h2>
              <p>{user.email}</p>
            </div>
          </div>
          <div className="profile-drawer-stats">
            <div><strong>{courses.length}</strong><span>курса</span></div>
            <div><strong>{activeTopics}</strong><span>тем начато</span></div>
            <div><strong>{overall}%</strong><span>прогресс</span></div>
          </div>
          <section className="profile-drawer-activity">
            <span className="eyebrow">Последняя активность</span>
            <h3>Multithreading</h3>
            <p>Java Junior Interview · {progress.threads}% освоено</p>
          </section>
          <nav className="profile-drawer-nav" aria-label="Навигация личного кабинета">
            <Link to="/profile">Профиль <span aria-hidden="true">→</span></Link>
            <Link to="/progress">Мой прогресс <span aria-hidden="true">→</span></Link>
            <Link to="/profile#settings">Настройки <span aria-hidden="true">→</span></Link>
          </nav>
          <button
            className="profile-drawer-logout"
            type="button"
            onClick={() => {
              setProfileOpen(false);
              onLogout();
            }}
          >
            Выйти
          </button>
        </aside>
      </div>
    </>
  );
}
