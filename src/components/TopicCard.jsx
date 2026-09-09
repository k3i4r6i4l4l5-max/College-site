import React from 'react';
import { Link } from 'react-router-dom';
import { ProgressBar } from './ProgressBar';

/** Показывает тему курса, её прогресс и ссылку на подробную страницу. */
export function TopicCard({ topic, value }) {
  return (
    <Link className="topic-row" to={`/topics/${topic.id}`}>
      <div>
        <h3>
          {topic.title}{' '}
          {value < 50 && value > 0 && <span className="tag">Стоит повторить</span>}
        </h3>
        <p>{topic.description}</p>
      </div>
      <div className="topic-progress">
        <strong>{value}%</strong>
        <ProgressBar value={value} label={topic.title} />
      </div>
      <span className="row-arrow" aria-hidden="true">→</span>
    </Link>
  );
}
