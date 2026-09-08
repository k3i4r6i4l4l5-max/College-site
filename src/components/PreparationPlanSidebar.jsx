import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { courses, topicById } from '../data';
import { createPreparationPlan, preparationPlanToday } from '../utils/preparationPlan';

function cardWord(value) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'карточек';
  if (last === 1) return 'карточка';
  if (last >= 2 && last <= 4) return 'карточки';
  return 'карточек';
}

function groupTopics(topicIds) {
  const grouped = new Map();
  topicIds.forEach(topicId => grouped.set(topicId, (grouped.get(topicId) || 0) + 1));

  return [...grouped].map(([topicId, repeats]) => {
    const topic = topicById(topicId);
    return {
      ...topic,
      cards: topic.cards.length * repeats,
    };
  });
}

export function PreparationPlanSidebar({ selectedCourseId, progress, plan, onCreatePlan, children }) {
  const [days, setDays] = useState(7);
  const [minutes, setMinutes] = useState(30);
  const courseId = selectedCourseId || plan?.courseId;
  const course = courses.find(item => item.id === courseId);
  const courseHasProgress = course?.topics.some(topicId => progress[topicId] > 0);
  const activePlan = plan?.courseId === courseId ? plan : null;

  useEffect(() => {
    if (!activePlan) {
      setDays(7);
      setMinutes(30);
    }
  }, [courseId, activePlan]);

  const today = useMemo(
    () => activePlan ? preparationPlanToday(activePlan) : null,
    [activePlan],
  );

  const upcomingDays = useMemo(() => {
    if (!activePlan || !today) return [];

    return activePlan.schedule
      .slice(today.dayIndex, today.dayIndex + 7)
      .map(day => ({
        ...day,
        topics: groupTopics(day.topicIds),
      }));
  }, [activePlan, today]);

  const todayTopics = upcomingDays[0]?.topics || [];

  function submitPlan(event) {
    event.preventDefault();
    onCreatePlan(createPreparationPlan(course, progress, days, minutes));
  }

  return (
    <aside className="preparation-plan-sidebar" aria-labelledby="preparation-plan-title">
      <header className="preparation-plan-heading">
        <span className="eyebrow">Персональный маршрут</span>
        <h2 id="preparation-plan-title">План подготовки</h2>
        {!course && <p>Чтобы составить желаемый план, выберите курс.</p>}
      </header>

      {course && !courseHasProgress && (
        <div className="preparation-plan-notice" role="status">
          <span className="eyebrow">{course.title}</span>
          <p>Чтобы составить план подготовки, сначала пройдите курс хотя бы один раз.</p>
        </div>
      )}

      {course && courseHasProgress && !activePlan && (
        <form className="preparation-plan-form" onSubmit={submitPlan}>
          <div>
            <span className="eyebrow">Выбранный курс</span>
            <h3>{course.title}</h3>
            <p>Слабые темы попадут в расписание раньше и будут повторяться чаще.</p>
          </div>
          <label>
            <span>Срок подготовки</span>
            <select value={days} onChange={event => setDays(Number(event.target.value))}>
              <option value="3">3 дня</option>
              <option value="7">7 дней</option>
              <option value="14">14 дней</option>
              <option value="30">30 дней</option>
            </select>
          </label>
          <label>
            <span>Время в день</span>
            <select value={minutes} onChange={event => setMinutes(Number(event.target.value))}>
              <option value="20">20 минут</option>
              <option value="30">30 минут</option>
              <option value="45">45 минут</option>
              <option value="60">60 минут</option>
            </select>
          </label>
          <button className="button primary" type="submit">
            Создать план <span aria-hidden="true">→</span>
          </button>
        </form>
      )}

      {course && activePlan && today && (
        <div className="preparation-plan-summary">
          <div className="preparation-plan-course">
            <span className="eyebrow">Активный курс</span>
            <h3>{course.title}</h3>
          </div>
          <div className="preparation-plan-metrics">
            <div><strong>{today.daysRemaining}</strong><span>дней осталось</span></div>
            <div><strong>{activePlan.minutesPerDay}</strong><span>минут в день</span></div>
          </div>
          <div className="preparation-plan-days" aria-label="Ближайшие дни плана">
            {upcomingDays.map((day, index) => (
              <section
                className={`preparation-plan-day${index === 0 ? ' is-today' : ''}`}
                key={day.day}
              >
                <header>
                  <span>{index === 0 ? 'Сегодня' : 'По плану'}</span>
                  <strong>День {day.day}</strong>
                </header>
                <div className="preparation-plan-topic-list">
                  {day.topics.map(topic => (
                    <div key={topic.id}>
                      <span>{topic.title}</span>
                      <small>{topic.cards} {cardWord(topic.cards)}</small>
                    </div>
                  ))}
                </div>
                <p>Примерное время: {activePlan.minutesPerDay} минут</p>
              </section>
            ))}
          </div>
          <Link
            className="button primary"
            to={`/training?topic=${todayTopics[0]?.id || course.topics[0]}&plan=${course.id}`}
          >
            Продолжить план <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      {children}
    </aside>
  );
}
