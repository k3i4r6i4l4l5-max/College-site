import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

/** Показывает основную навигацию и отмечает активный раздел приложения. */
export function Navbar({ user }) {
  const location = useLocation();
  const initial = user.name.trim().charAt(0).toUpperCase() || 'У';

  // Класс состояния перемещает общий активный индикатор к текущему пункту меню.
  const switchState = location.pathname === '/progress'
    ? 'show-progress'
    : location.pathname === '/community'
      ? 'show-community'
    : location.pathname === '/profile' || location.pathname === '/settings'
      ? 'profile-page-active'
      : 'show-courses';

  return (
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
            <NavLink to="/community">Сообщество</NavLink>
          </nav>
          <div className="profile-wrap">
            <div className="profile-launch">
              <NavLink
                className={({ isActive }) => `profile-account-link${isActive || location.pathname === '/settings' ? ' active' : ''}`}
                to="/profile"
              >
                <span className="profile-avatar" aria-hidden="true">{initial}</span>
                <span className="profile-label">Личный кабинет</span>
              </NavLink>
            </div>
          </div>
      </div>
    </header>
  );
}
