import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { courses, topics, topicById, courseForTopic, average } from './data';
import './styles.css';

const storageKey = 'practice-progress-v1';
const authStorageKey = 'practice-auth-v1';
const userStorageKey = 'practice-user-v1';
const defaultUser = { name: 'Ульяна Соколова', email: 'ulyana.sokolova@example.ru' };
function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return Object.fromEntries(topics.map(t => [t.id, Number.isFinite(saved?.[t.id]) ? Math.max(0, Math.min(100, saved[t.id])) : t.progress]));
  } catch { return Object.fromEntries(topics.map(t => [t.id, t.progress])); }
}
function ProgressBar({ value, label = 'Освоено' }) {
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${value}%` }}/></div>;
}
const coursePopularity = { java: '1 240 учеников', web: '980 учеников', math: '760 учеников' };
const sidebarFilters = [
  { id: 'popular', label: 'Популярные курсы', courses: ['java', 'web', 'math'] },
  { id: 'recent', label: 'Ваше последнее', courses: ['java'] },
  { id: 'recommended', label: 'Наши рекомендации', courses: ['web', 'math'] },
];
function PopularCoursesSidebar() {
  const [filterId, setFilterId] = useState('popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRoot = useRef(null);
  const activeFilter = sidebarFilters.find(filter => filter.id === filterId) || sidebarFilters[0];
  const visibleCourses = activeFilter.courses.map(id => courses.find(course => course.id === id)).filter(Boolean);
  useEffect(() => {
    function closeOutside(event) { if (!filterRoot.current?.contains(event.target)) setFilterOpen(false); }
    function closeOnEscape(event) { if (event.key === 'Escape') setFilterOpen(false); }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  function chooseFilter(id) {
    setFilterId(id);
    setFilterOpen(false);
    requestAnimationFrame(() => filterRoot.current?.querySelector('.popular-filter-trigger')?.focus());
  }
  return <aside className="popular-sidebar" aria-labelledby="popular-courses-title"><div className="popular-sidebar-heading"><span className="eyebrow">Подборка курсов</span><h2 id="popular-courses-title">{activeFilter.label}</h2></div><nav aria-label={activeFilter.label}>{visibleCourses.map((course, index) => <Link className="popular-course-card" to={`/courses/${course.id}`} key={course.id}><span className="popular-course-rank" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><span className="popular-course-thumb" style={{ '--popular-image': `url("${course.image}")` }} aria-hidden="true"/><span className="popular-course-copy"><small>{course.category}</small><strong>{course.title}</strong><small>{coursePopularity[course.id]}</small></span><span className="popular-course-arrow" aria-hidden="true">→</span></Link>)}</nav><div className={`popular-filter ${filterOpen ? 'open' : ''}`} ref={filterRoot}>{filterOpen && <ul className="popular-filter-menu" role="listbox" aria-label="Фильтр курсов">{sidebarFilters.map(filter => <li key={filter.id}><button type="button" role="option" aria-selected={filter.id === filterId} className={filter.id === filterId ? 'selected' : ''} onClick={() => chooseFilter(filter.id)}><span>{filter.label}</span>{filter.id === filterId && <span className="popular-filter-check" aria-hidden="true">✓</span>}</button></li>)}</ul>}<button type="button" className="popular-filter-trigger" aria-haspopup="listbox" aria-expanded={filterOpen} onClick={() => setFilterOpen(open => !open)}><span>{activeFilter.label}</span><span className="popular-filter-chevron" aria-hidden="true"/></button></div></aside>;
}
function AuthIntro({ position }) {
  return <section className={`auth-intro auth-intro-${position}`} aria-hidden={position === 'right'}><span className="eyebrow">Адаптивная подготовка</span><h1>Знания становятся уверенностью</h1><p>Изучайте темы, отвечайте на карточки и возвращайтесь к тому, что требует внимания.</p><div className="auth-points"><span>Курсы для экзаменов и собеседований</span><span>Прогресс по каждой теме</span><span>Персональное повторение</span></div></section>;
}
function AuthPage({ user, onAuthenticate }) {
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
    onAuthenticate(defaultUser);
    navigate('/');
  }
  function submit(event) {
    event.preventDefault();
    setError('');
    if (password.length < 6) { setError('Пароль должен содержать не менее 6 символов.'); return; }
    if (mode === 'register' && password !== repeatPassword) { setError('Пароли не совпадают.'); return; }
    if (mode === 'register' && nickname.trim().length < 2) { setError('Укажите никнейм длиной не менее 2 символов.'); return; }
    const fallbackName = email.split('@')[0] || 'Пользователь';
    const loginName = user.email === email.trim() ? user.name : fallbackName;
    onAuthenticate({ name: mode === 'register' ? nickname.trim() : loginName, email: email.trim() });
    navigate('/');
  }
return <main className="auth-shell"><div className="auth-brand"><span className="brand-mark" aria-hidden="true">п.</span><span>практика</span></div><div className={`auth-layout ${mode === 'register' ? 'auth-register' : ''}`}><AuthIntro position="left"/><AuthIntro position="right"/><section className="auth-card" aria-labelledby="auth-title"><div className={`auth-tabs ${mode === 'register' ? 'show-register' : 'show-login'}`} role="group" aria-label="Способ входа"><button type="button" className={mode === 'login' ? 'active' : ''} aria-pressed={mode === 'login'} onClick={() => changeMode('login')}>Войти</button><button type="button" className={mode === 'register' ? 'active' : ''} aria-pressed={mode === 'register'} onClick={() => changeMode('register')}>Зарегистрироваться</button></div><div className="auth-heading"><h2 id="auth-title">{mode === 'login' ? 'С возвращением' : 'Создайте аккаунт'}</h2><p>{mode === 'login' ? 'Продолжите подготовку с места, на котором остановились.' : 'Начните подготовку и сохраняйте свой прогресс.'}</p></div><form className="auth-form" onSubmit={submit}><label>Почта<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.ru" autoComplete="email" required/></label><label>Пароль<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Не менее 6 символов" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required/></label>{mode === 'register' && <><label>Повторите пароль<input type="password" value={repeatPassword} onChange={event => setRepeatPassword(event.target.value)} placeholder="Введите пароль ещё раз" autoComplete="new-password" minLength={6} required/></label><label>Никнейм<input value={nickname} onChange={event => setNickname(event.target.value)} placeholder="Как к вам обращаться" autoComplete="nickname" minLength={2} required/></label></>}{error && <p className="auth-error" role="alert">{error}</p>}<button className="button primary auth-submit" type="submit">{mode === 'login' ? 'Войти' : 'Зарегистрироваться'} <span aria-hidden="true">→</span></button></form><button type="button" className="button secondary auth-test-login" onClick={testLogin}>Тестовый вход <span aria-hidden="true">→</span></button><p className="auth-caption">Демо-режим: вход и профиль сбрасываются после обновления.</p></section></div></main>;
}
function Navbar({ user, onLogout, progress }) {
  const [profile, setProfile] = useState(false);
  const location = useLocation();
  const initial = user.name.trim().charAt(0).toUpperCase() || 'У';
  const overall = average(topics.map(topic => progress[topic.id]));
  const activeTopics = topics.filter(topic => progress[topic.id] > 0).length;
  useEffect(() => setProfile(false), [location.pathname, location.search]);
  useEffect(() => {
    if (!profile) return undefined;
    const previousOverflow = document.body.style.overflow;
    const close = event => { if (event.key === 'Escape') setProfile(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', close);
    };
  }, [profile]);
return <><header className="navbar"><div className="nav-inner"><Link to="/" className="brand"><span className="brand-mark" aria-hidden="true">п.</span>практика</Link><nav className={`nav-switch ${location.pathname === '/progress' ? 'show-progress' : location.pathname === '/profile' ? 'profile-page-active' : 'show-courses'}`} aria-label="Основная навигация"><NavLink to="/" className={({ isActive }) => isActive || location.pathname.startsWith('/courses') || location.pathname.startsWith('/topics') || location.pathname.startsWith('/training') ? 'active' : ''}>Курсы</NavLink><NavLink to="/progress">Прогресс</NavLink></nav><div className="profile-wrap"><div className="profile-launch"><Link className="profile-account-link" to="/profile"><span className="profile-avatar" aria-hidden="true">{initial}</span><span className="profile-label">Личный кабинет</span></Link><button type="button" className="profile-arrow-button" aria-label="Открыть информацию профиля" aria-expanded={profile} aria-haspopup="dialog" onClick={() => setProfile(true)}><span aria-hidden="true">→</span></button></div></div></div></header><div className={`profile-drawer-layer ${profile ? 'open' : ''}`} aria-hidden={!profile}><button type="button" className="profile-drawer-backdrop" aria-label="Закрыть информацию профиля" onClick={() => setProfile(false)}/><aside className="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="profile-drawer-title"><header className="profile-drawer-header"><span className="eyebrow">Учебный профиль</span><button type="button" className="drawer-close" onClick={() => setProfile(false)} aria-label="Закрыть">×</button></header><div className="profile-drawer-identity"><span className="profile-drawer-avatar" aria-hidden="true">{initial}</span><div><h2 id="profile-drawer-title">{user.name}</h2><p>{user.email}</p></div></div><div className="profile-drawer-stats"><div><strong>{courses.length}</strong><span>курса</span></div><div><strong>{activeTopics}</strong><span>тем начато</span></div><div><strong>{overall}%</strong><span>прогресс</span></div></div><section className="profile-drawer-activity"><span className="eyebrow">Последняя активность</span><h3>Multithreading</h3><p>Java Junior Interview · {progress.threads}% освоено</p></section><nav className="profile-drawer-nav" aria-label="Навигация личного кабинета"><Link to="/profile">Профиль <span aria-hidden="true">→</span></Link><Link to="/progress">Мой прогресс <span aria-hidden="true">→</span></Link><Link to="/profile#settings">Настройки <span aria-hidden="true">→</span></Link></nav><button className="profile-drawer-logout" type="button" onClick={() => { setProfile(false); onLogout(); }}>Выйти</button></aside></div></>;
}
function CourseCard({ course, progress, onOpen, selected }) {
  const value = average(course.topics.map(id => progress[id]));
  return <article className={`course-tile ${selected ? 'selected' : ''}`}><button type="button" className={`course-card course-card-${course.id}`} style={{ '--course-image': `url("${course.image}")` }} onClick={() => onOpen(course)} aria-haspopup="dialog" aria-label={`Открыть информацию о курсе «${course.title}»`}><span className="course-card-title">{course.title}</span></button><div className="course-card-progress"><div className="progress-label"><span>Прогресс курса</span><strong>{value}%</strong></div><ProgressBar value={value} label={course.title}/></div></article>;
}
function CourseDrawer({ course, progress, open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);
  if (!course) return null;
  const courseTopics = course.topics.map(topicById);
  const value = average(courseTopics.map(topic => progress[topic.id]));
  const completed = courseTopics.filter(topic => progress[topic.id] >= 70).length;
  const totalCards = courseTopics.reduce((sum, topic) => sum + topic.cards.length, 0);
  const knowledge = topic => progress[topic.id] === 0 ? 'Не начато' : progress[topic.id] >= 75 ? 'Уверенно' : progress[topic.id] >= 50 ? 'Закрепляется' : 'Стоит повторить';
  return <div className={`course-drawer-layer ${open ? 'open' : ''}`} aria-hidden={!open}><button type="button" className="course-drawer-backdrop" aria-label="Закрыть информацию о курсе" onClick={onClose}/><aside className="course-drawer" role="dialog" aria-modal="true" aria-labelledby="course-drawer-title"><header className="course-drawer-header"><span className="eyebrow">{course.category}</span><button type="button" className="drawer-close" onClick={onClose} aria-label="Закрыть">×</button></header><h2 id="course-drawer-title">{course.title}</h2><p className="course-drawer-description">{course.description}</p><div className="drawer-overall"><div className="progress-label"><span>Общий прогресс</span><strong>{value}%</strong></div><ProgressBar value={value} label={`Прогресс курса ${course.title}`}/></div><div className="drawer-stats"><div><strong>{courseTopics.length}</strong><span>тем</span></div><div><strong>{completed}</strong><span>освоено</span></div><div><strong>{totalCards}</strong><span>карточек</span></div></div><div className="drawer-section-title"><h3>Темы курса</h3><span>{completed} из {courseTopics.length} пройдено</span></div><div className="drawer-topic-list">{courseTopics.map(topic => <Link key={topic.id} className="drawer-topic" to={`/topics/${topic.id}`}><div className="drawer-topic-heading"><strong>{topic.title}</strong><span className={progress[topic.id] > 0 && progress[topic.id] < 50 ? 'weak' : ''}>{knowledge(topic)}</span></div><p>{topic.description}</p><div className="drawer-topic-progress"><ProgressBar value={progress[topic.id]} label={topic.title}/><strong>{progress[topic.id]}%</strong></div></Link>)}</div><div className="drawer-actions"><Link className="button primary" to={`/courses/${course.id}`}>Открыть курс <span aria-hidden="true">→</span></Link><Link className="text-link" to={`/training?course=${course.id}`}>Начать тренировку</Link></div></aside></div>;
}
function ContinueModal({ course, topic, progress, open, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);
  if (!course || !topic) return null;
  const total = topic.cards.length;
  const completed = Math.min(total, Math.floor(total * progress / 100));
  const remaining = Math.max(0, total - completed);
  const sessionProgress = Math.round(completed / total * 100);
  return <div className={`continue-modal-layer ${open ? 'open' : ''}`} aria-hidden={!open}><button type="button" className="continue-modal-backdrop" aria-label="Закрыть информацию о тренировке" onClick={onClose}/><section className="continue-modal" role="dialog" aria-modal="true" aria-labelledby="continue-modal-title"><header><span className="eyebrow">{course.title}</span><button type="button" className="drawer-close" onClick={onClose} aria-label="Закрыть">×</button></header><h2 id="continue-modal-title">Продолжить тренировку</h2><p>Тема «{topic.title}». Начните с карточки, на которой остановились.</p><div className="continue-modal-stats"><div><strong>{remaining}</strong><span>осталось</span></div><div><strong>{total}</strong><span>всего</span></div><div><strong>Сегодня</strong><span>18:40</span></div></div><div className="continue-modal-progress"><div className="progress-label"><span>Прогресс текущей сессии</span><strong>{completed} из {total}</strong></div><ProgressBar value={sessionProgress} label="Прогресс текущей сессии"/></div><div className="continue-modal-actions"><button type="button" className="button secondary" onClick={onClose}>Позже</button><Link className="button primary" to={`/training?topic=${topic.id}`}>Продолжить <span aria-hidden="true">→</span></Link></div></section></div>;
}
function CoursesPage({ progress }) {
  const [drawerCourse, setDrawerCourse] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [continueOpen, setContinueOpen] = useState(false);
  const weak = topics.filter(t => progress[t.id] > 0 && progress[t.id] < 50);
  const totalTopics = courses.reduce((sum, course) => sum + course.topics.length, 0);
  const overall = average(topics.map(topic => progress[topic.id]));
  const weakCards = weak.reduce((sum, topic) => sum + topic.cards.length, 0);
  const weakNames = weak.slice(0, 2).map(topic => topic.title);
  const activeCourse = courses.find(course => course.topics.some(id => progress[id] > 0));
  const continueTopic = activeCourse && activeCourse.topics.map(topicById).filter(topic => progress[topic.id] > 0).sort((a, b) => progress[a.id] - progress[b.id])[0];
  const continueTotal = continueTopic?.cards.length || 0;
  const continueCompleted = continueTopic ? Math.min(continueTotal, Math.floor(continueTotal * progress[continueTopic.id] / 100)) : 0;
  const continueRemaining = Math.max(0, continueTotal - continueCompleted);
  const continueSessionProgress = continueTotal ? Math.round(continueCompleted / continueTotal * 100) : 0;
  function openCourse(course) {
    setDrawerCourse(course);
    setDrawerOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)));
  }
  function closeDrawer() { setDrawerOpen(false); }
  function closeContinue() { setContinueOpen(false); }
return <><section className="home-hero"><div className="eyebrow">В своём темпе, шаг за шагом</div><h1>Подготовка</h1><p>Разбирайтесь в темах, проверяйте себя и повторяйте то, что важно.</p><div className="personal-stats" aria-label="Ваша учебная статистика"><span>{courses.length} курса</span><span>{totalTopics} тем</span><span>{overall}% общего прогресса</span></div></section><div className="section-title home-section-title"><h2>Ваши курсы <span className="count">{courses.length}</span></h2><span className="muted">Нажмите на курс, чтобы увидеть подробности</span></div><div className="course-grid">{courses.map(course => <CourseCard key={course.id} course={course} progress={progress} onOpen={openCourse} selected={drawerOpen && drawerCourse?.id === course.id}/>)}</div><CourseDrawer course={drawerCourse} progress={progress} open={drawerOpen} onClose={closeDrawer}/><aside className={`repeat-banner ${weak.length ? '' : 'repeat-empty'}`}><span className="recommendation-icon" aria-hidden="true">↺</span><div className="recommendation-copy"><span className="eyebrow">Персональная рекомендация</span><h3>{weak.length ? 'Повторите слабые темы' : 'Слабых тем пока нет'}</h3><p>{weak.length ? `${weakNames.join(' и ')} требуют внимания.` : 'Продолжайте заниматься, чтобы рекомендации стали точнее.'}</p><span className="recommendation-meta">{weak.length ? `${weakCards} карточек рекомендуется пройти сегодня` : 'Новая рекомендация появится после тренировки'}</span></div>{weak.length ? <Link className="button primary recommendation-action" to="/training?mode=weak">Повторить слабые темы <span aria-hidden="true">→</span></Link> : <Link className="button secondary recommendation-action" to="/courses/java">Выбрать тему <span aria-hidden="true">→</span></Link>}</aside><section className="continue-section"><div className="section-title"><h2>Продолжить с места остановки</h2><span className="muted">Последняя активность: сегодня</span></div>{activeCourse && continueTopic ? <div className="continue-card"><div className="continue-copy"><span className="eyebrow">{activeCourse.title}</span><h3>{continueTopic.title}</h3><p>Вернитесь к карточкам темы и закрепите материал короткой тренировкой.</p><div className="continue-meta"><span>Осталось {continueRemaining} {continueRemaining === 1 ? 'карточка' : 'карточки'}</span><span>Последняя тренировка: сегодня, 18:40</span></div></div><div className="continue-progress"><span>Сессия: {continueCompleted} из {continueTotal}</span><ProgressBar value={continueSessionProgress} label="Прогресс текущей сессии"/><small>Освоено темы: {progress[continueTopic.id]}%</small></div><button className="button secondary" type="button" onClick={() => setContinueOpen(true)}>Продолжить <span aria-hidden="true">→</span></button></div> : <div className="continue-card continue-empty"><div><h3>Здесь появится последняя активность</h3><p>Начните любой курс, и мы сохраним место, на котором вы остановились.</p></div><Link className="button secondary" to="/">Выбрать курс</Link></div>}</section><ContinueModal course={activeCourse} topic={continueTopic} progress={continueTopic ? progress[continueTopic.id] : 0} open={continueOpen} onClose={closeContinue}/></>;
}
function Breadcrumb({ course, current }) { return <nav className="breadcrumb" aria-label="Хлебные крошки"><Link to="/">Курсы</Link>{course && <><span>/</span><Link to={`/courses/${course.id}`}>{course.title}</Link></>}{current && <><span>/</span><span aria-current="page">{current}</span></>}</nav>; }
function TopicCard({ topic, value }) { return <Link className="topic-row" to={`/topics/${topic.id}`}><div><h3>{topic.title} {value < 50 && value > 0 && <span className="tag">Стоит повторить</span>}</h3><p>{topic.description}</p></div><div className="topic-progress"><strong>{value}%</strong><ProgressBar value={value} label={topic.title}/></div><span className="row-arrow" aria-hidden="true">→</span></Link>; }
function NotFound() { return <div className="empty"><h1>Страница не найдена</h1><p>Выберите курс и продолжите подготовку.</p><Link className="button primary" to="/">К курсам</Link></div>; }
function CoursePage({ progress }) {
  const { id } = useParams(); const course = courses.find(c => c.id === id);
  if (!course) return <NotFound/>;
  const value = average(course.topics.map(id => progress[id]));
  return <><Breadcrumb current={course.title}/><div className="page-heading"><span className="eyebrow">{course.category}</span><h1>{course.title}</h1><p>{course.description}</p></div><div className="course-summary"><div><span className="muted">Общий прогресс</span><div className="large-value">{value}<span>%</span></div></div><div className="summary-bar"><ProgressBar value={value}/><p>Тем: {course.topics.length} · {course.topics.reduce((n, id) => n + topicById(id).cards.length, 0)} карточек</p></div><Link className="button primary" to={`/training?course=${id}`}>Начать тренировку <span aria-hidden="true">→</span></Link></div><div className="section-title"><h2>Темы курса</h2><span className="muted">Выберите тему для изучения</span></div><div className="topic-list">{course.topics.map(id => <TopicCard key={id} topic={topicById(id)} value={progress[id]}/>)}</div></>;
}
function TopicPage({ progress }) {
  const { id } = useParams(); const topic = topicById(id);
  if (!topic) return <NotFound/>;
  return <div className="reading-width"><Breadcrumb course={courseForTopic(id)} current={topic.title}/><div className="page-heading"><h1>{topic.title}</h1><p>{topic.description}</p></div><div className="reading-meta"><span>Краткий конспект</span><span>Освоено {progress[id]}%</span></div><article className="notes">{topic.notes.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}<aside className="note-tip">Попробуйте объяснить материал своими словами, а затем проверьте себя на карточках.</aside></article><div className="reading-actions"><span className="muted">{topic.cards.length} карточки · без ограничения времени</span><Link className="button primary" to={`/training?topic=${id}`}>Начать тренировку <span aria-hidden="true">→</span></Link></div></div>;
}
function StudyCard({ card, revealed, onReveal, onRate }) {
  return (
    <article className="study-card">
      <span className="eyebrow">{card.topic.title}</span>
      <h1>{card.question}</h1>
      {revealed ? (
        <div className="answer" aria-live="polite">
          <span className="eyebrow">Ответ</span>
          <p>{card.answer}</p>
        </div>
      ) : (
        <div className="reveal">
          <p>Попробуйте ответить самостоятельно или посмотрите ответ.</p>
          <button className="button secondary" onClick={onReveal}>Показать ответ</button>
        </div>
      )}
      <div className="rating">
        <p>Насколько уверенно вы знаете ответ?</p>
        <div className="rating-buttons">
          <button className="button primary" onClick={() => onRate('know')}>Знаю</button>
          <button className="button neutral" onClick={() => onRate('partly')}>Не уверен</button>
          <button className="button secondary" onClick={() => onRate('forgot')}>Не знаю</button>
        </div>
      </div>
    </article>
  );
}
function TrainingPage({ progress, onRate }) {
  const [params] = useSearchParams();
  const [deck] = useState(() => {
    let selected = topics;
    if (params.get('mode') === 'weak') selected = topics.filter(t => progress[t.id] > 0 && progress[t.id] < 50).sort((a, b) => progress[a.id] - progress[b.id]);
    else if (params.get('mode') === 'course-weak') selected = topics.filter(t => courses.find(c => c.id === params.get('course'))?.topics.includes(t.id) && progress[t.id] < 50).sort((a, b) => progress[a.id] - progress[b.id]);
    else if (params.has('topic')) selected = topics.filter(t => t.id === params.get('topic'));
    else if (params.has('course')) selected = topics.filter(t => courses.find(c => c.id === params.get('course'))?.topics.includes(t.id));
    return selected.flatMap(topic => topic.cards.map(([question, answer]) => ({ topic, question, answer })));
  });
  const [index, setIndex] = useState(0); const [revealed, setRevealed] = useState(false); const [results, setResults] = useState({ know: 0, partly: 0, forgot: 0 });
  const course = courses.find(c => c.id === params.get('course')) || courseForTopic(params.get('topic'));
  const back = course ? `/courses/${course.id}` : '/progress';
  function rate(value) { onRate(deck[index].topic.id, value); setResults(r => ({ ...r, [value]: r[value] + 1 })); setRevealed(false); setIndex(i => i + 1); }
  if (!deck.length) return <div className="empty"><h1>Нет карточек для тренировки</h1><p>Выберите другую тему или откройте курс.</p><Link className="button primary" to="/">К курсам</Link></div>;
  if (index === deck.length) return <div className="training-width"><div className="completed"><span className="completion-mark" aria-hidden="true">✓</span><h1>Ещё один шаг вперёд</h1><p>Тренировка завершена. Вы разобрали {deck.length} карточек.</p><div className="result-grid"><div><strong>{results.know}</strong><span>Знаю</span></div><div><strong>{results.partly}</strong><span>Не уверен</span></div><div><strong>{results.forgot}</strong><span>Не знаю</span></div></div><Link className="button primary" to="/progress">Посмотреть прогресс</Link><button className="text-button" onClick={() => { setIndex(0); setRevealed(false); setResults({ know: 0, partly: 0, forgot: 0 }); }}>Пройти ещё раз</button></div></div>;
  return <div className="training-width"><div className="training-top"><Link className="text-link" to={back}>← Завершить тренировку</Link><span className="muted">{params.get('mode') === 'weak' ? 'Повторение слабых тем' : 'Практика'}</span></div><div className="training-progress"><div className="progress-label"><span aria-live="polite">Карточка {index + 1} из {deck.length}</span><span>{Math.round(index / deck.length * 100)}%</span></div><ProgressBar value={Math.round(index / deck.length * 100)} label="Тренировка"/></div><StudyCard key={index} card={deck[index]} revealed={revealed} onReveal={() => setRevealed(true)} onRate={rate}/><p className="quiet-note">Честная оценка помогает понять, к чему стоит вернуться.</p></div>;
}
function CourseDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const current = courses.find(course => course.id === value) || courses[0];
  useEffect(() => {
    function closeOutside(event) { if (!root.current?.contains(event.target)) setOpen(false); }
    function closeOnEscape(event) { if (event.key === 'Escape') setOpen(false); }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);
  function selectCourse(id) {
    onChange(id);
    setOpen(false);
    requestAnimationFrame(() => root.current?.querySelector('.course-dropdown-trigger')?.focus());
  }
  return <div className="course-select"><span id="course-select-label">Курс</span><div className={`course-dropdown ${open ? 'open' : ''}`} ref={root}><button type="button" className="course-dropdown-trigger" aria-labelledby="course-select-label course-select-value" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)}><span id="course-select-value">{current.title}</span><span className="course-dropdown-chevron" aria-hidden="true"/></button>{open && <ul className="course-dropdown-menu" role="listbox" aria-labelledby="course-select-label">{courses.map(course => <li key={course.id}><button type="button" role="option" aria-selected={course.id === value} className={course.id === value ? 'selected' : ''} onClick={() => selectCourse(course.id)}><span>{course.title}</span>{course.id === value && <span className="course-dropdown-check" aria-hidden="true">✓</span>}</button></li>)}</ul>}</div></div>;
}
function ProgressPage({ progress }) {
  const [courseId, setCourseId] = useState('java'); const course = courses.find(c => c.id === courseId); const selected = course.topics.map(topicById); const weak = selected.filter(t => progress[t.id] < 50); const recommended = [...selected].sort((a, b) => progress[a.id] - progress[b.id]).slice(0, 2);
  const overall = average(selected.map(t => progress[t.id]));
  return <><div className="page-heading"><span className="eyebrow">Каждая тренировка имеет значение</span><h1>Ваш прогресс</h1><p>Посмотрите, что уже получается, а чему стоит уделить внимание.</p></div><CourseDropdown value={courseId} onChange={setCourseId}/><div className="progress-layout"><section><div className="readiness"><span className="muted">Общая готовность</span><div className="large-value">{overall}<span>%</span></div><ProgressBar value={overall}/><p>На основе ваших оценок карточек в этом курсе.</p></div><div className="section-title"><h2>Знание по темам</h2></div><div className="topic-list">{selected.map(t => <TopicCard key={t.id} topic={t} value={progress[t.id]}/>)}</div></section><aside className="progress-aside"><section className="weak-panel"><h2>Слабые темы</h2><p>Начните с того, что требует внимания.</p>{weak.length ? <><div className="weak-list">{weak.map(t => <Link key={t.id} to={`/topics/${t.id}`}><span>{t.title}</span><strong>{progress[t.id]}%</strong></Link>)}</div><Link className="button primary full" to={`/training?course=${courseId}&mode=course-weak`}>Тренировать слабые темы</Link></> : <p>Все темы освоены как минимум на 50%. Продолжайте закреплять знания.</p>}</section><section className="recommended"><h2>Рекомендуется повторить</h2>{recommended.map(t => <Link key={t.id} to={`/topics/${t.id}`}><div><h3>{t.title}</h3><span className="muted">Конспект и {t.cards.length} карточки</span></div><span aria-hidden="true">→</span></Link>)}</section></aside></div></>;
}
function ProfilePage({ progress, user, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user);
  const [message, setMessage] = useState('');
  const overall = average(topics.map(topic => progress[topic.id]));
  const activeTopics = topics.filter(topic => progress[topic.id] > 0).length;
  function submit(event) {
    event.preventDefault();
    const next = { name: draft.name.trim() || user.name, email: draft.email.trim() || user.email };
    onUpdate(next);
    setDraft(next);
    setEditing(false);
    setMessage('Данные профиля обновлены.');
  }
  function cancelEdit() { setDraft(user); setEditing(false); setMessage(''); }
  return <div className="profile-page"><Breadcrumb current="Личный кабинет"/><div className="page-heading profile-heading"><span className="eyebrow">Учебный профиль</span><h1>Личный кабинет</h1><p>Ваши данные, общая статистика и последнее занятие в одном месте.</p></div><section className="profile-card"><div className="profile-identity"><span className="profile-large-avatar" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase() || 'У'}</span>{editing ? <form className="profile-form" onSubmit={submit}><label>Имя<input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} autoComplete="name"/></label><label>Email<input type="email" value={draft.email} onChange={event => setDraft({ ...draft, email: event.target.value })} autoComplete="email"/></label><div className="profile-form-actions"><button className="button primary" type="submit">Сохранить</button><button className="button secondary" type="button" onClick={cancelEdit}>Отмена</button></div></form> : <div className="profile-person"><h2>{user.name}</h2><p>{user.email}</p><span>Самостоятельное обучение</span></div>} {!editing && <button className="button secondary profile-edit" onClick={() => { setEditing(true); setMessage(''); }}>Редактировать профиль</button>}</div>{message && <p className="profile-message" role="status">{message}</p>}<div className="profile-stats" aria-label="Общая статистика"><div><span>Курсы</span><strong>{courses.length}</strong><small>доступно</small></div><div><span>Темы</span><strong>{topics.length}</strong><small>{activeTopics} начато</small></div><div><span>Общий прогресс</span><strong>{overall}%</strong><small>по всем темам</small></div></div></section><section className="profile-activity"><div><span className="eyebrow">Последняя активность</span><h2>Java Junior Interview</h2><p>Тема Multithreading · {progress.threads}% освоено</p></div><div className="activity-date"><span>Сегодня</span><small>Короткая тренировка</small></div><Link className="button primary" to="/training?topic=threads">Продолжить <span aria-hidden="true">→</span></Link></section><section className="profile-settings" id="settings"><div><h2>Настройки</h2><p>Здесь можно будет управлять уведомлениями и синхронизацией данных.</p></div><button className="button secondary" onClick={() => setMessage('Настройки пока работают в демонстрационном режиме.')}>Настроить</button></section></div>;
}
function App() {
  const [progress, setProgress] = useState(readProgress); const location = useLocation();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(defaultUser);
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch { /* Session state remains usable when browser storage is unavailable. */ } }, [progress]);
  useEffect(() => { try { localStorage.removeItem(authStorageKey); localStorage.removeItem(userStorageKey); } catch { /* Legacy sign-in data can remain only when browser storage is unavailable. */ } }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname, location.search]);
  const onRate = (id, value) => setProgress(p => ({ ...p, [id]: Math.max(0, Math.min(100, p[id] + ({ know: 5, partly: -2, forgot: -7 })[value])) }));
  function updateUser(nextUser) {
    setUser(nextUser);
  }
  function authenticate(nextUser) {
    updateUser(nextUser);
    setAuthenticated(true);
  }
  function logout() {
    setAuthenticated(false);
    setUser(defaultUser);
  }
  if (!authenticated) return <AuthPage user={user} onAuthenticate={authenticate}/>;
  return <><a className="skip-link" href="#main">К содержимому</a><Navbar user={user} onLogout={logout} progress={progress}/><div className="app-shell"><PopularCoursesSidebar/><main id="main" className="container"><Routes><Route path="/" element={<CoursesPage progress={progress}/>}/><Route path="/courses/:id" element={<CoursePage progress={progress}/>}/><Route path="/topics/:id" element={<TopicPage progress={progress}/>}/><Route path="/training" element={<TrainingPage key={location.search + location.key} progress={progress} onRate={onRate}/>}/><Route path="/progress" element={<ProgressPage progress={progress}/>}/><Route path="/profile" element={<ProfilePage progress={progress} user={user} onUpdate={updateUser}/>}/><Route path="*" element={<NotFound/>}/></Routes></main></div><footer className="footer"><span>практика</span><span>Учиться. Вспоминать. Понимать.</span></footer></>;
}
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);

