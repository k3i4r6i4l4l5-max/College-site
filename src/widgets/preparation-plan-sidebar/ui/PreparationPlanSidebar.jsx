import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../../entities/catalog';
import { preparationPlanToday } from '../../../entities/preparation-plan';
import { CreatePreparationPlanForm } from '../../../features/create-preparation-plan';
import { CompletePlanItemButton } from '../../../features/complete-plan-item';

// Подбирает правильную форму слова «карточка» для числового значения.
function cardWord(value) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'карточек';
  if (last === 1) return 'карточка';
  if (last >= 2 && last <= 4) return 'карточки';
  return 'карточек';
}

// Объединяет повторения одной темы в день и суммирует назначенные карточки.
function groupTopics(topicIds, topicById) {
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

/**
 * Создаёт план подготовки и показывает ближайшие семь дней активного плана
 * в постоянном правом сайдбаре.
 */
export function PreparationPlanSidebar({ collapsed = false, onToggle, selectedCourseId, progress, plan, onSavePlan, onDeletePlan, children }) {
  const { courses, topicById } = useCatalog();
  const [editing, setEditing] = useState(false);
  const courseId = selectedCourseId || plan?.courseId;
  const course = courses.find(item => item.id === courseId);
  const courseHasProgress = course?.topics.some(topicId => progress[topicId] > 0);
  const activePlan = plan?.courseId === courseId ? plan : null;

  // Определяет текущий день плана по дате его создания.
  const today = useMemo(
    () => activePlan ? preparationPlanToday(activePlan) : null,
    [activePlan],
  );

  // Подготавливает текущий и следующие дни, но ограничивает превью семью днями.
  const upcomingDays = useMemo(() => {
    if (!activePlan || !today) return [];

    return activePlan.schedule
      .slice(today.dayIndex, today.dayIndex + 7)
      .map(day => ({
        ...day,
        topics: groupTopics(day.topicIds, topicById),
      }));
  }, [activePlan, today, topicById]);

  const todayTopics = upcomingDays[0]?.topics || [];

  const totalPlanItems = activePlan?.schedule.reduce((sum, day) => sum + day.topicIds.length, 0) || 0;
  const completedPlanItems = activePlan?.schedule.reduce((sum, day) => sum + (day.completedTopicIds?.length || 0), 0) || 0;
  const completion = totalPlanItems ? Math.round(completedPlanItems / totalPlanItems * 100) : 0;

  return (
    <aside className={`preparation-plan-sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="План подготовки">
      <button
        type="button"
        className="sidebar-toggle"
        aria-label={collapsed ? 'Развернуть правую панель' : 'Свернуть правую панель'}
        aria-expanded={!collapsed}
        onClick={onToggle}
      >
        <span aria-hidden="true">{collapsed ? '‹' : '›'}</span>
      </button>
      {!collapsed && <>
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

      {course && courseHasProgress && (!activePlan || editing) && (
        <CreatePreparationPlanForm
          key={course.id + (editing ? ':edit' : ':new')}
          course={course}
          progress={progress}
          topicById={topicById}
          editing={editing}
          initialDays={editing ? activePlan.days : 7}
          initialMinutes={editing ? activePlan.minutesPerDay : 30}
          onSavePlan={onSavePlan}
          onDone={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      )}

      {course && activePlan && today && !editing && (
        <div className="preparation-plan-summary">
          <div className="preparation-plan-course">
            <span className="eyebrow">Активный курс</span>
            <h3>{course.title}</h3>
          </div>
          <div className="preparation-plan-metrics">
            <div><strong>{today.daysRemaining}</strong><span>дней осталось</span></div>
            <div><strong>{activePlan.minutesPerDay}</strong><span>минут в день</span></div>
          </div>
          <div className="plan-completion"><span>Выполнено</span><strong>{completion}%</strong><progress max="100" value={completion}>{completion}%</progress></div>
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
                    <div key={topic.id} className={(day.completedTopicIds || []).includes(topic.id) ? 'is-complete' : ''}>
                      <span>{topic.title}</span>
                      <small>{topic.cards} {cardWord(topic.cards)}</small>
                      <CompletePlanItemButton plan={activePlan} dayNumber={day.day} topicId={topic.id} completed={(day.completedTopicIds || []).includes(topic.id)} onSavePlan={onSavePlan} />
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
          <div className="plan-manage-actions"><button className="text-button" type="button" onClick={() => setEditing(true)}>Изменить</button><button className="text-button danger" type="button" onClick={onDeletePlan}>Отменить план</button></div>
        </div>
      )}

      {children}
      </>}
    </aside>
  );
}
