import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { courseForTopic, topicById } from '../data';
import { Breadcrumb } from '../components/Breadcrumb';
import { NotFoundPage } from './NotFoundPage';

export function TopicPage({ progress }) {
  const { id } = useParams();
  const topic = topicById(id);
  if (!topic) return <NotFoundPage />;

  return (
    <div className="reading-width">
      <Breadcrumb course={courseForTopic(id)} current={topic.title} />
      <div className="page-heading">
        <h1>{topic.title}</h1>
        <p>{topic.description}</p>
      </div>
      <div className="reading-meta">
        <span>Краткий конспект</span>
        <span>Освоено {progress[id]}%</span>
      </div>
      <article className="notes">
        {topic.notes.map(([title, body]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{body}</p>
          </section>
        ))}
        <aside className="note-tip">
          Попробуйте объяснить материал своими словами, а затем проверьте себя на карточках.
        </aside>
      </article>
      <div className="reading-actions">
        <span className="muted">{topic.cards.length} карточки · без ограничения времени</span>
        <Link className="button primary" to={`/training?topic=${id}`}>
          Начать тренировку <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
