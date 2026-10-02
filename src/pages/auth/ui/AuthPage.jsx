import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_USER } from '../../../entities/user';
import { STORAGE_KEYS } from '../../../shared/config/storageKeys';

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
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  function changeMode(nextMode) {
    setMode(nextMode);
    setPassword('');
    setRepeatPassword('');
    setError('');
  }

  async function testLogin() {
    setPending(true);
    setError('');
    try {
      await onAuthenticate('login', { email: DEFAULT_USER.email, password: 'demo-password' });
      if (localStorage.getItem(STORAGE_KEYS.onboardingSeen) !== 'true') {
        window.location.assign(`${import.meta.env.BASE_URL}guide.html`);
        return;
      }
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
  }

  async function submit(event) {
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

    setPending(true);
    try {
      await onAuthenticate(mode, {
        name: mode === 'register' ? nickname.trim() : undefined,
        email: email.trim(),
        password,
      });
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPending(false);
    }
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
            <button className="button primary auth-submit" type="submit" disabled={pending}>
              {pending ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'} {!pending && <span aria-hidden="true">→</span>}
            </button>
          </form>
          <button type="button" className="button secondary auth-test-login" onClick={testLogin} disabled={pending}>
            Тестовый вход <span aria-hidden="true">→</span>
          </button>
          <p className="auth-caption">Сессия синхронизируется через единый слой данных.</p>
        </section>
      </div>
    </main>
  );
}
