import React from 'react';
import { Link } from 'react-router-dom';
import { useBodyScrollLock } from '../../../shared/lib/useBodyScrollLock';
import { ProgressBar } from '../../../shared/ui/ProgressBar';

/**
 * Показывает точку продолжения выбранной темы и переводит пользователя
 * к незавершённой тренировке.
 */
export function ContinueModal({ course, topic, session, open, onClose }) {
  // Блокирует прокрутку страницы и позволяет закрыть окно клавишей Escape.
  useBodyScrollLock(open, onClose);
  if (!course || !topic) return null;

  const total = session?.deck.length || topic.cards.length;
  const completed = session?.index || 0;
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
        <p>{session ? `Тема «${topic.title}». Начните с карточки, на которой остановились.` : `Тема «${topic.title}» сейчас лучше всего подходит для повторения.`}</p>
        <div className="continue-modal-stats">
          <div><strong>{remaining}</strong><span>осталось</span></div>
          <div><strong>{total}</strong><span>всего</span></div>
          <div><strong>{session ? 'Сохранено' : 'Совет'}</strong><span>{session ? new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(session.updatedAt)) : 'по прогрессу'}</span></div>
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
          <Link className="button primary" to={session ? `/training?session=${session.id}` : `/training?topic=${topic.id}`}>{session ? 'Продолжить' : 'Начать'} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
