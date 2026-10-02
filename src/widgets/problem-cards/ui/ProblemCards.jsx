import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getProblemCards } from '../../../entities/activity';
import { useCatalog } from '../../../entities/catalog';

// Подбирает правильную форму слова «ответ» для переданного количества.
function answerWord(value) {
  const lastTwo = value % 100;
  const last = value % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return 'ответов';
  if (last === 1) return 'ответ';
  if (last >= 2 && last <= 4) return 'ответа';
  return 'ответов';
}

/** Выводит до пяти карточек курса с наибольшим числом сложных ответов. */
export function ProblemCards({ activity, course, progress }) {
  const { topicById } = useCatalog();
  // Повторно ранжирует карточки только после изменения активности или курса.
  const cards = useMemo(() => getProblemCards(activity, course, topicById), [activity, course, topicById]);

  return (
    <section className="progress-insight-card problem-cards" aria-labelledby="problem-cards-title">
      <header className="progress-insight-heading">
        <div>
          <span className="eyebrow">Требуют внимания</span>
          <h2 id="problem-cards-title">Проблемные карточки</h2>
        </div>
        <span>До 5 карточек</span>
      </header>

      {cards.length ? (
        <div className="problem-card-list">
          {cards.map(card => {
            const total = card.partly + card.forgot;
            return (
              <article className="problem-card-row" key={`${card.topic.id}-${card.cardIndex}`}>
                <div className="problem-card-copy">
                  <span>{card.topic.title}</span>
                  <h3>{card.question}</h3>
                  <p>
                    {total} {answerWord(total)} · Не уверен: {card.partly} · Не знаю: {card.forgot}
                  </p>
                </div>
                <div className="problem-card-progress">
                  <span>Знание темы</span>
                  <strong>{progress[card.topic.id]}%</strong>
                </div>
                <Link
                  className="button secondary problem-card-repeat"
                  to={`/training?topic=${card.topic.id}&card=${card.cardIndex}`}
                >
                  Повторить
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="progress-insight-empty">В этом курсе пока нет карточек со сложными ответами.</p>
      )}
    </section>
  );
}
