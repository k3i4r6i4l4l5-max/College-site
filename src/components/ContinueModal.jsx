import React from 'react';
import { Link } from 'react-router-dom';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ProgressBar } from './ProgressBar';

export function ContinueModal({ course, topic, progress, open, onClose }) {
  useBodyScrollLock(open, onClose);
  if (!course || !topic) return null;

  const total = topic.cards.length;
  const completed = Math.min(total, Math.floor(total * progress / 100));
  const remaining = Math.max(0, total - completed);
  const sessionProgress = Math.round(completed / total * 100);

  return (
    <div className={`continue-modal-layer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <button
        type="button"
        className="continue-modal-backdrop"
        aria-label="Закрыть информацию о тренировке"
        onClick={onClose}
      />
      <section className="continue-modal" role="dialog" aria-modal="true" aria-labelledby="continue-modal-title">
        <header>
          <span className="eyebrow">{course.title}</span>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Закрыть">×</button>
        </header>
        <h2 id="continue-modal-title">Продолжить тренировку</h2>
        <p>Тема «{topic.title}». Начните с карточки, на которой остановились.</p>
        <div className="continue-modal-stats">
          <div><strong>{remaining}</strong><span>осталось</span></div>
          <div><strong>{total}</strong><span>всего</span></div>
          <div><strong>Сегодня</strong><span>18:40</span></div>
        </div>
        <div className="continue-modal-progress">
          <div className="progress-label">
            <span>Прогресс текущей сессии</span>
            <strong>{completed} из {total}</strong>
          </div>
          <ProgressBar value={sessionProgress} label="Прогресс текущей сессии" />
        </div>
        <div className="continue-modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>Позже</button>
          <Link className="button primary" to={`/training?topic=${topic.id}`}>Продолжить <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
