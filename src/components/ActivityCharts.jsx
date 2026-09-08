import React, { useMemo, useState } from 'react';
import { courses } from '../data';
import { getCourseActivity } from '../utils/activity';

const weeklyActivity = [
  { day: 'Пн', date: '31 авг', cards: 4 },
  { day: 'Вт', date: '1 сен', cards: 9 },
  { day: 'Ср', date: '2 сен', cards: 6 },
  { day: 'Чт', date: '3 сен', cards: 13 },
  { day: 'Пт', date: '4 сен', cards: 8 },
  { day: 'Сб', date: '5 сен', cards: 17 },
  { day: 'Вс', date: '6 сен', cards: 11 },
];

const monthlyActivity = [0, 3, 7, 0, 4, 9, 12, 6, 0, 2, 5, 11, 8, 0, 0, 6, 14, 10, 3, 7, 0, 5, 8, 16, 12, 4, 0, 9, 13, 6];
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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

export function ActivityCharts({ activity }) {
  const [courseId, setCourseId] = useState(courses[0].id);
  const [period, setPeriod] = useState(7);
  const maximum = Math.max(...weeklyActivity.map(item => item.cards));
  const monthTotal = monthlyActivity.reduce((sum, value) => sum + value, 0);
  const activeDays = monthlyActivity.filter(Boolean).length;
  const selectedCourse = courses.find(course => course.id === courseId) || courses[0];
  const ratingCounts = useMemo(
    () => getCourseActivity(activity, selectedCourse, period),
    [activity, selectedCourse, period],
  );
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
              <h3>Сентябрь</h3>
              <p>Ежедневная активность в течение месяца</p>
            </div>
            <strong>{activeDays}<small> дней</small></strong>
          </header>
          <div className="month-weekdays" aria-hidden="true">
            {weekDays.map(day => <span key={day}>{day}</span>)}
          </div>
          <div className="month-activity-grid" aria-label="Календарь активности за сентябрь">
            <span className="month-offset" aria-hidden="true" />
            {monthlyActivity.map((value, index) => (
              <span
                className={`activity-day level-${activityLevel(value)}`}
                key={index}
                title={`${index + 1} сентября: ${value} карточек`}
                aria-label={`${index + 1} сентября: ${value} карточек`}
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
