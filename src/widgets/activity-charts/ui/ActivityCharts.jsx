import React, { useMemo, useState } from 'react';
import { useCatalog } from '../../../entities/catalog';
import { getCourseActivity } from '../../../entities/activity';

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Преобразует число изученных карточек в уровень интенсивности ячейки календаря.
function activityLevel(value) {
  if (value === 0) return 0;
  if (value <= 4) return 1;
  if (value <= 8) return 2;
  if (value <= 12) return 3;
  return 4;
}

const ratingColumns = [
  { id: 'know', label: 'Знаю', className: 'is-know' },
  { id: 'partly', label: 'Не уверен', className: 'is-partly' },
  { id: 'forgot', label: 'Не знаю', className: 'is-forgot' },
];

const periods = [1, 3, 7];

/**
 * Показывает статистику активности: ответы по выбранному курсу,
 * недельные столбцы и календарь занятий за месяц.
 */
export function ActivityCharts({ activity }) {
  const { courses, courseForTopic } = useCatalog();
  const [courseId, setCourseId] = useState(courses[0].id);
  const [period, setPeriod] = useState(7);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const weeklyActivity = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const nextDate = new Date(date); nextDate.setDate(nextDate.getDate() + 1);
    const cards = activity.filter(entry => {
      const time = Date.parse(entry.timestamp);
      return time >= date.getTime() && time < nextDate.getTime();
    }).length;
    return { day: new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date), date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date), cards };
  }), [activity]);
  const monthDate = new Date(`${month}-01T00:00:00`);
  const monthLength = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const monthlyActivity = useMemo(() => Array.from({ length: monthLength }, (_, index) => activity.filter(entry => {
    const date = new Date(entry.timestamp);
    return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth() && date.getDate() === index + 1;
  }).length), [activity, month, monthLength]);
  const maximum = Math.max(...weeklyActivity.map(item => item.cards));
  const monthTotal = monthlyActivity.reduce((sum, value) => sum + value, 0);
  const activeDays = monthlyActivity.filter(Boolean).length;
  const selectedCourse = courses.find(course => course.id === courseId) || courses[0];
  // Пересчитывает распределение ответов только при смене данных, курса или периода.
  const ratingCounts = useMemo(() => getCourseActivity(activity, selectedCourse, period, courseForTopic), [activity, selectedCourse, period, courseForTopic]);
  const ratingMaximum = Math.max(1, ...Object.values(ratingCounts));
  const ratingTotal = Object.values(ratingCounts).reduce((sum, value) => sum + value, 0);

  return (
    <section className="profile-analytics" aria-labelledby="profile-analytics-title">
      <div className="profile-section-heading">
        <div>
          <span className="eyebrow">Учебный ритм</span>
          <h2 id="profile-analytics-title">Активность</h2>
        </div>
        <span>{monthTotal} карточек за месяц</span>
      </div>

      <div className="profile-chart-grid">
        <article className="activity-chart-card course-activity-card">
          <header className="course-activity-header">
            <div>
              <h3>Ответы по курсу</h3>
              <p>Распределение изученных карточек по вашей оценке</p>
            </div>
            <strong>{ratingTotal}<small> карточек</small></strong>
          </header>

          <div className="course-activity-controls">
            <label>
              <span>Курс</span>
              <select value={courseId} onChange={event => setCourseId(event.target.value)}>
                {courses.map(course => (
                  <option value={course.id} key={course.id}>{course.title}</option>
                ))}
              </select>
            </label>
            <div className="activity-period-switch" role="group" aria-label="Период активности">
              {periods.map(days => (
                <button
                  className={period === days ? 'active' : ''}
                  type="button"
                  aria-pressed={period === days}
                  onClick={() => setPeriod(days)}
                  key={days}
                >
                  {days} д
                </button>
              ))}
            </div>
          </div>

          <div className="rating-activity-chart" aria-label={`Ответы по курсу ${selectedCourse.title} за ${period} дней`}>
            {ratingColumns.map(column => {
              const value = ratingCounts[column.id];
              return (
                <div className="rating-activity-column" key={column.id}>
                  <strong>{value}</strong>
                  <span className="rating-activity-track">
                    <span
                      className={column.className}
                      style={{ height: value ? `${Math.max(10, value / ratingMaximum * 100)}%` : '0%' }}
                    />
                  </span>
                  <small>{column.label}</small>
                </div>
              );
            })}
          </div>
        </article>

        <article className="activity-chart-card">
          <header>
            <div>
              <h3>Последние 7 дней</h3>
              <p>Количество изученных карточек за день</p>
            </div>
            <strong>{weeklyActivity.reduce((sum, item) => sum + item.cards, 0)}</strong>
          </header>
          <div className="activity-bars" aria-label="Столбцовый график активности за последние семь дней">
            {weeklyActivity.map(item => (
              <div className="activity-bar-column" key={item.date} title={`${item.date}: ${item.cards} карточек`}>
                <span className="activity-bar-value">{item.cards}</span>
                <span className="activity-bar-track">
                  <span style={{ height: `${Math.max(8, item.cards / maximum * 100)}%` }} />
                </span>
                <small>{item.day}</small>
              </div>
            ))}
          </div>
        </article>

        <article className="activity-chart-card monthly-chart-card">
          <header>
            <div>
              <h3>{new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(monthDate)}</h3>
              <p>Ежедневная активность в течение месяца</p>
            </div>
            <label className="activity-month-picker"><span className="sr-only">Месяц</span><input type="month" value={month} onChange={event => setMonth(event.target.value)} /></label>
          </header>
          <div className="month-weekdays" aria-hidden="true">
            {weekDays.map(day => <span key={day}>{day}</span>)}
          </div>
          <div className="month-activity-grid" aria-label="Календарь активности за сентябрь">
            {Array.from({ length: (monthDate.getDay() + 6) % 7 }, (_, index) => <span className="month-offset" aria-hidden="true" key={`offset-${index}`} />)}
            {monthlyActivity.map((value, index) => (
              <span
                className={`activity-day level-${activityLevel(value)}`}
                key={index}
                title={`${index + 1}: ${value} карточек`}
                aria-label={`${index + 1}: ${value} карточек`}
              >
                <small>{index + 1}</small>
              </span>
            ))}
          </div>
          <div className="activity-legend">
            <span>Меньше</span>
            {[0, 1, 2, 3, 4].map(level => <i className={`level-${level}`} key={level} />)}
            <span>Больше</span>
          </div>
        </article>
      </div>
    </section>
  );
}
