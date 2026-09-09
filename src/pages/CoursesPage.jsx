import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { average } from '../utils/numbers';
import { ContinueModal } from '../components/ContinueModal';
import { CourseCard } from '../components/CourseCard';
import { CourseDrawer } from '../components/CourseDrawer';
import { EmptyState } from '../components/AsyncState';
import { ProgressBar } from '../components/ProgressBar';

function cardWord(value) {
  if (value % 100 >= 11 && value % 100 <= 14) return 'карточек';
  if (value % 10 === 1) return 'карточка';
  if (value % 10 >= 2 && value % 10 <= 4) return 'карточки';
  return 'карточек';
}

export function CoursesPage({ progress, activity, activeTraining, userCourses }) {
  const { courses, topics, topicById, courseForTopic } = useCatalog();
  const [params, setParams] = useSearchParams();
  const [drawerCourse, setDrawerCourse] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [continueOpen, setContinueOpen] = useState(false);
  const query = params.get('q') || '';
  const category = params.get('category') || 'all';
  const status = params.get('status') || 'active';
  const sort = params.get('sort') || 'popular';
  const userCourseMap = new Map(userCourses.map(item => [item.courseId, item]));
  const categories = [...new Set(courses.map(course => course.category))];

  const visibleCourses = useMemo(() => courses
    .filter(course => `${course.title} ${course.description}`.toLowerCase().includes(query.toLowerCase()))
    .filter(course => category === 'all' || course.category === category)
    .filter(course => status === 'all' || (userCourseMap.get(course.id)?.status || 'available') === status)
    .sort((left, right) => {
      if (sort === 'progress') return average(right.topics.map(id => progress[id] || 0)) - average(left.topics.map(id => progress[id] || 0));
      if (sort === 'newest') return Date.parse(right.createdAt || 0) - Date.parse(left.createdAt || 0);
      return courses.indexOf(left) - courses.indexOf(right);
    }), [courses, query, category, status, sort, progress, userCourses]);

  const weak = topics.filter(topic => progress[topic.id] > 0 && progress[topic.id] < 50);
  const overall = average(topics.map(topic => progress[topic.id] || 0));
  const latestActivity = [...activity].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))[0];
  const activeCard = activeTraining?.deck?.[activeTraining.index];
  const continueTopic = topicById(activeCard?.topicId || latestActivity?.topicId)
    || [...topics].filter(topic => progress[topic.id] > 0).sort((a, b) => progress[a.id] - progress[b.id])[0]
    || topics[0];
  const activeCourse = continueTopic ? courseForTopic(continueTopic.id) : null;
  const hasSession = activeTraining?.status === 'active' && activeTraining.index < activeTraining.deck.length;
  const total = hasSession ? activeTraining.deck.length : continueTopic?.cards.length || 0;
  const completed = hasSession ? activeTraining.index : 0;
  const remaining = Math.max(0, total - completed);
  const lastTime = hasSession ? activeTraining.updatedAt : latestActivity?.timestamp;

  function updateParam(name, value) {
    const next = new URLSearchParams(params);
    const isDefault = value === '' || value === 'all' || (name === 'status' && value === 'active') || (name === 'sort' && value === 'popular');
    if (isDefault) next.delete(name); else next.set(name, value);
    setParams(next, { replace: true });
  }

  function openCourse(course) {
    setDrawerCourse(course); setDrawerOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)));
  }

  return (
    <>
      <section className="home-hero">
        <div className="eyebrow">В своём темпе, шаг за шагом</div><h1>Подготовка</h1>
        <p>Разбирайтесь в темах, проверяйте себя и повторяйте то, что важно.</p>
        <div className="personal-stats" aria-label="Ваша учебная статистика"><span>{userCourses.filter(item => item.status === 'active').length} курса</span><span>{topics.length} тем</span><span>{overall}% общего прогресса</span></div>
      </section>

      <section className="catalog-controls" aria-label="Фильтры каталога">
        <label className="catalog-search"><span>Поиск</span><input type="search" value={query} placeholder="Название или описание" onChange={event => updateParam('q', event.target.value)} /></label>
        <label><span>Категория</span><select value={category} onChange={event => updateParam('category', event.target.value)}><option value="all">Все категории</option>{categories.map(item => <option value={item} key={item}>{item}</option>)}</select></label>
        <label><span>Состояние</span><select value={status} onChange={event => updateParam('status', event.target.value)}><option value="all">Все курсы</option><option value="active">Активные</option><option value="archived">Архивные</option><option value="available">Не добавлены</option></select></label>
        <label><span>Сортировка</span><select value={sort} onChange={event => updateParam('sort', event.target.value)}><option value="popular">По популярности</option><option value="progress">По прогрессу</option><option value="newest">Сначала новые</option></select></label>
        {(query || category !== 'all' || status !== 'active' || sort !== 'popular') && <button className="text-button" type="button" onClick={() => setParams({})}>Сбросить</button>}
      </section>

      <div className="section-title home-section-title"><h2>Курсы <span className="count">{visibleCourses.length}</span></h2><span className="muted">Нажмите на курс, чтобы увидеть подробности</span></div>
      {visibleCourses.length ? <div className="course-grid">{visibleCourses.map(course => <CourseCard key={course.id} course={course} progress={progress} onOpen={openCourse} selected={drawerOpen && drawerCourse?.id === course.id} />)}</div>
        : <EmptyState title="Курсы не найдены" message="Измените параметры поиска или сбросьте фильтры." action={<button className="button secondary" onClick={() => setParams({})}>Сбросить фильтры</button>} />}
      <CourseDrawer course={drawerCourse} progress={progress} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <aside className={`repeat-banner ${weak.length ? '' : 'repeat-empty'}`}><span className="recommendation-icon" aria-hidden="true">↺</span><div className="recommendation-copy"><span className="eyebrow">Персональная рекомендация</span><h3>{weak.length ? 'Повторите слабые темы' : 'Слабых тем пока нет'}</h3><p>{weak.length ? `${weak.slice(0, 2).map(topic => topic.title).join(' и ')} требуют внимания.` : 'Продолжайте заниматься, чтобы рекомендации стали точнее.'}</p><span className="recommendation-meta">{weak.length ? `${weak.reduce((sum, topic) => sum + topic.cards.length, 0)} карточек рекомендуется пройти сегодня` : 'Новая рекомендация появится после тренировки'}</span></div><Link className={`button ${weak.length ? 'primary' : 'secondary'} recommendation-action`} to={weak.length ? '/training?mode=weak' : `/topics/${continueTopic?.id}`}>{weak.length ? 'Повторить слабые темы' : 'Выбрать тему'} <span aria-hidden="true">→</span></Link></aside>

      <section className="continue-section">
        <div className="section-title"><h2>{hasSession ? 'Продолжить с места остановки' : 'Рекомендуем продолжить'}</h2><span className="muted">{lastTime ? `Последняя активность: ${new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(lastTime))}` : 'Начните первую тренировку'}</span></div>
        {activeCourse && continueTopic && <div className="continue-card"><div className="continue-copy"><span className="eyebrow">{activeCourse.title}</span><h3>{continueTopic.title}</h3><p>{hasSession ? 'Тренировка сохранена. Продолжите с карточки, на которой остановились.' : 'Эта тема лучше всего подходит для следующего повторения.'}</p><div className="continue-meta"><span>{hasSession ? `Осталось ${remaining} ${cardWord(remaining)}` : `${continueTopic.cards.length} ${cardWord(continueTopic.cards.length)} в теме`}</span></div></div><div className="continue-progress"><span>{hasSession ? `Сессия: ${completed} из ${total}` : `Освоено темы: ${progress[continueTopic.id] || 0}%`}</span><ProgressBar value={hasSession && total ? Math.round(completed / total * 100) : progress[continueTopic.id] || 0} label="Прогресс продолжения" /></div><button className="button secondary" type="button" onClick={() => setContinueOpen(true)}>{hasSession ? 'Продолжить' : 'Открыть рекомендацию'} <span aria-hidden="true">→</span></button></div>}
      </section>
      <ContinueModal course={activeCourse} topic={continueTopic} session={hasSession ? activeTraining : null} open={continueOpen} onClose={() => setContinueOpen(false)} />
    </>
  );
}
