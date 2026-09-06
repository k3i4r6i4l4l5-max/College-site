import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_USER } from '../constants';

function AuthIntro({ position }) {
  return (
    <section className={`auth-intro auth-intro-${position}`} aria-hidden={position === 'right'}>
      <span className="eyebrow">Адаптивная подготовка</span>
      <h1>Знания становятся уверенностью</h1>
      <p>Изучайте темы, отвечайте на карточки и возвращайтесь к тому, что требует внимания.</p>
      <div className="auth-points">
        <span>Курсы для экзаменов и собеседований</span>
        <span>Прогресс по каждой теме</span>
        <span>Персональное повторение</span>
      </div>
    </section>
  );
}

export function AuthPage({ user, onAuthenticate }) {
  const [mode, setMode] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
    setRepeatPassword('');
    setError('');
  }

  function testLogin() {
    onAuthenticate(DEFAULT_USER);
    navigate('/');
  }

  function submit(event) {
    event.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.');
      return;
    }
    if (mode === 'register' && password !== repeatPassword) {
      setError('Пароли не совпадают.');
      return;
    }
    if (mode === 'register' && nickname.trim().length < 2) {
      setError('Укажите никнейм длиной не менее 2 символов.');
      return;
    }

    const fallbackName = email.split('@')[0] || 'Пользователь';
    const loginName = user.email === email.trim() ? user.name : fallbackName;
    onAuthenticate({
      name: mode === 'register' ? nickname.trim() : loginName,
      email: email.trim(),
    });
    navigate('/');
  }

  return (
    <main className="auth-shell">
      <div className="auth-brand">
        <span className="brand-mark" aria-hidden="true">п.</span>
        <span>практика</span>
      </div>
      <div className={`auth-layout ${mode === 'register' ? 'auth-register' : ''}`}>
        <AuthIntro position="left" />
        <AuthIntro position="right" />
        <section className="auth-card" aria-labelledby="auth-title">
          <div
            className={`auth-tabs ${mode === 'register' ? 'show-register' : 'show-login'}`}
            role="group"
            aria-label="Способ входа"
          >
            <button
              type="button"
              className={mode === 'login' ? 'active' : ''}
              aria-pressed={mode === 'login'}
              onClick={() => changeMode('login')}
            >
              Войти
            </button>
            <button
              type="button"
              className={mode === 'register' ? 'active' : ''}
              aria-pressed={mode === 'register'}
              onClick={() => changeMode('register')}
            >
              Зарегистрироваться
            </button>
          </div>

          <div className="auth-heading">
            <h2 id="auth-title">{mode === 'login' ? 'С возвращением' : 'Создайте аккаунт'}</h2>
            <p>
              {mode === 'login'
                ? 'Продолжите подготовку с места, на котором остановились.'
                : 'Начните подготовку и сохраняйте свой прогресс.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label>
              Почта
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="name@example.ru"
                autoComplete="email"
                required
              />
            </label>
            <label>
              Пароль
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Не менее 6 символов"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
                required
              />
            </label>
            {mode === 'register' && (
              <>
                <label>
                  Повторите пароль
                  <input
                    type="password"
                    value={repeatPassword}
                    onChange={event => setRepeatPassword(event.target.value)}
                    placeholder="Введите пароль ещё раз"
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </label>
                <label>
                  Никнейм
                  <input
                    value={nickname}
                    onChange={event => setNickname(event.target.value)}
                    placeholder="Как к вам обращаться"
                    autoComplete="nickname"
                    minLength={2}
                    required
                  />
                </label>
              </>
            )}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="button primary auth-submit" type="submit">
              {mode === 'login' ? 'Войти' : 'Зарегистрироваться'} <span aria-hidden="true">→</span>
            </button>
          </form>
          <button type="button" className="button secondary auth-test-login" onClick={testLogin}>
            Тестовый вход <span aria-hidden="true">→</span>
          </button>
          <p className="auth-caption">Демо-режим: вход и профиль сбрасываются после обновления.</p>
        </section>
      </div>
    </main>
  );
}
