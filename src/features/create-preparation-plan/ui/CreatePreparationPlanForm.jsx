import React, { useState } from 'react';
import { createPreparationPlan } from '../../../entities/preparation-plan';

export function CreatePreparationPlanForm({ course, progress, topicById, editing, initialDays = 7, initialMinutes = 30, onSavePlan, onDone, onCancel }) {
  const [days, setDays] = useState(initialDays);
  const [minutes, setMinutes] = useState(initialMinutes);

  async function submit(event) {
    event.preventDefault();
    await onSavePlan(createPreparationPlan(course, progress, days, minutes, topicById));
    onDone();
  }

  return (
    <form className="preparation-plan-form" onSubmit={submit}>
      <div>
        <span className="eyebrow">Выбранный курс</span>
        <h3>{editing ? 'Изменить план' : course.title}</h3>
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
        {editing ? 'Пересоздать план' : 'Создать план'} <span aria-hidden="true">→</span>
      </button>
      {editing && <button className="button secondary" type="button" onClick={onCancel}>Отмена</button>}
    </form>
  );
}
