import React from 'react';

export function StudyCard({ card, revealed, onReveal, onRate }) {
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
          <button className="button secondary" onClick={onReveal}>Показать ответ</button>
        </div>
      )}
      <div className="rating">
        <p>Насколько уверенно вы знаете ответ?</p>
        <div className="rating-buttons">
          <button className="button primary" onClick={() => onRate('know')}>Знаю</button>
          <button className="button neutral" onClick={() => onRate('partly')}>Не уверен</button>
          <button className="button secondary" onClick={() => onRate('forgot')}>Не знаю</button>
        </div>
      </div>
    </article>
  );
}
