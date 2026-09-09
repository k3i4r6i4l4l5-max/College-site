import React from 'react';

/** Показывает учебную карточку, открывает ответ и передаёт выбранную оценку знания. */
export function StudyCard({ card, revealed, pending = false, onReveal, onRate }) {
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
          <button className="button secondary" disabled={pending} onClick={onReveal}>Показать ответ</button>
        </div>
      )}
      <div className="rating">
        <p>Насколько уверенно вы знаете ответ?</p>
        <div className="rating-buttons">
          <button className="button primary" disabled={pending} onClick={() => onRate('know')}>Знаю</button>
          <button className="button neutral" disabled={pending} onClick={() => onRate('partly')}>Не уверен</button>
          <button className="button secondary" disabled={pending} onClick={() => onRate('forgot')}>Не знаю</button>
        </div>
      </div>
    </article>
  );
}
