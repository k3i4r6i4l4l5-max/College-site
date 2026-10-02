import React from 'react';

export function LoadingState({ label = 'Загружаем данные', rows = 3, compact = false }) {
  return (
    <section className={`async-state loading-state${compact ? ' compact' : ''}`} aria-busy="true" aria-label={label}>
      <span className="skeleton skeleton-title" />
      {Array.from({ length: rows }, (_, index) => <span className="skeleton skeleton-row" key={index} />)}
      <span className="sr-only">{label}</span>
    </section>
  );
}

export function ErrorState({ title = 'Не удалось загрузить данные', message, onRetry, compact = false }) {
  return (
    <section className={`async-state error-state${compact ? ' compact' : ''}`} role="alert">
      <span className="async-state-mark" aria-hidden="true">!</span>
      <div><h2>{title}</h2><p>{message || 'Проверьте соединение и попробуйте ещё раз.'}</p></div>
      {onRetry && <button className="button secondary" type="button" onClick={onRetry}>Повторить</button>}
    </section>
  );
}

export function EmptyState({ title, message, action }) {
  return <section className="async-state empty-state"><div><h2>{title}</h2><p>{message}</p></div>{action}</section>;
}
