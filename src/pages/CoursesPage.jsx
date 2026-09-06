import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { average, courses, topicById, topics } from '../data';
import { ContinueModal } from '../components/ContinueModal';
import { CourseCard } from '../components/CourseCard';
import { CourseDrawer } from '../components/CourseDrawer';
import { ProgressBar } from '../components/ProgressBar';

export function CoursesPage({ progress }) {
  const [drawerCourse, setDrawerCourse] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [continueOpen, setContinueOpen] = useState(false);
  const weak = topics.filter(topic => progress[topic.id] > 0 && progress[topic.id] < 50);
  const totalTopics = courses.reduce((sum, course) => sum + course.topics.length, 0);
  const overall = average(topics.map(topic => progress[topic.id]));
  const weakCards = weak.reduce((sum, topic) => sum + topic.cards.length, 0);
  const weakNames = weak.slice(0, 2).map(topic => topic.title);
  const activeCourse = courses.find(course => course.topics.some(id => progress[id] > 0));
  const continueTopic = activeCourse && activeCourse.topics
    .map(topicById)
    .filter(topic => progress[topic.id] > 0)
    .sort((a, b) => progress[a.id] - progress[b.id])[0];
  const continueTotal = continueTopic?.cards.length || 0;
  const continueCompleted = continueTopic
    ? Math.min(continueTotal, Math.floor(continueTotal * progress[continueTopic.id] / 100))
    : 0;
  const continueRemaining = Math.max(0, continueTotal - continueCompleted);
  const continueSessionProgress = continueTotal
    ? Math.round(continueCompleted / continueTotal * 100)
    : 0;

  function openCourse(course) {
    setDrawerCourse(course);
    setDrawerOpen(false);
    requestAnimationFrame(() => requestAnimationFrame(() => setDrawerOpen(true)));
  }

  return (
    <>
      <section className="home-hero">
        <div className="eyebrow">В своём темпе, шаг за шагом</div>
        <h1>Подготовка</h1>
        <p>Разбирайтесь в темах, проверяйте себя и повторяйте то, что важно.</p>
        <div className="personal-stats" aria-label="Ваша учебная статистика">
          <span>{courses.length} курса</span>
          <span>{totalTopics} тем</span>
          <span>{overall}% общего прогресса</span>
        </div>
      </section>

      <div className="section-title home-section-title">
        <h2>Ваши курсы <span className="count">{courses.length}</span></h2>
        <span className="muted">Нажмите на курс, чтобы увидеть подробности</span>
      </div>
      <div className="course-grid">
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            progress={progress}
            onOpen={openCourse}
            selected={drawerOpen && drawerCourse?.id === course.id}
          />
        ))}
      </div>
      <CourseDrawer
        course={drawerCourse}
        progress={progress}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <aside className={`repeat-banner ${weak.length ? '' : 'repeat-empty'}`}>
        <span className="recommendation-icon" aria-hidden="true">↺</span>
        <div className="recommendation-copy">
          <span className="eyebrow">Персональная рекомендация</span>
          <h3>{weak.length ? 'Повторите слабые темы' : 'Слабых тем пока нет'}</h3>
          <p>
            {weak.length
              ? `${weakNames.join(' и ')} требуют внимания.`
              : 'Продолжайте заниматься, чтобы рекомендации стали точнее.'}
          </p>
          <span className="recommendation-meta">
            {weak.length
              ? `${weakCards} карточек рекомендуется пройти сегодня`
              : 'Новая рекомендация появится после тренировки'}
          </span>
        </div>
        {weak.length ? (
          <Link className="button primary recommendation-action" to="/training?mode=weak">
            Повторить слабые темы <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <Link className="button secondary recommendation-action" to="/courses/java">
            Выбрать тему <span aria-hidden="true">→</span>
          </Link>
        )}
      </aside>

      <section className="continue-section">
        <div className="section-title">
          <h2>Продолжить с места остановки</h2>
          <span className="muted">Последняя активность: сегодня</span>
        </div>
        {activeCourse && continueTopic ? (
          <div className="continue-card">
            <div className="continue-copy">
              <span className="eyebrow">{activeCourse.title}</span>
              <h3>{continueTopic.title}</h3>
              <p>Вернитесь к карточкам темы и закрепите материал короткой тренировкой.</p>
              <div className="continue-meta">
                <span>Осталось {continueRemaining} {continueRemaining === 1 ? 'карточка' : 'карточки'}</span>
                <span>Последняя тренировка: сегодня, 18:40</span>
              </div>
            </div>
            <div className="continue-progress">
              <span>Сессия: {continueCompleted} из {continueTotal}</span>
              <ProgressBar value={continueSessionProgress} label="Прогресс текущей сессии" />
              <small>Освоено темы: {progress[continueTopic.id]}%</small>
            </div>
            <button className="button secondary" type="button" onClick={() => setContinueOpen(true)}>
              Продолжить <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <div className="continue-card continue-empty">
            <div>
              <h3>Здесь появится последняя активность</h3>
              <p>Начните любой курс, и мы сохраним место, на котором вы остановились.</p>
            </div>
            <Link className="button secondary" to="/">Выбрать курс</Link>
          </div>
        )}
      </section>

      <ContinueModal
        course={activeCourse}
        topic={continueTopic}
        progress={continueTopic ? progress[continueTopic.id] : 0}
        open={continueOpen}
        onClose={() => setContinueOpen(false)}
      />
    </>
  );
}
