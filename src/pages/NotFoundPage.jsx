import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="empty">
      <h1>Страница не найдена</h1>
      <p>Выберите курс и продолжите подготовку.</p>
      <Link className="button primary" to="/">К курсам</Link>
    </div>
  );
}
