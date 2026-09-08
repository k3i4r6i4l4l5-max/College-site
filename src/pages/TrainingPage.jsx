import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { courseForTopic, courses, topics } from '../data';
import { ProgressBar } from '../components/ProgressBar';
import { StudyCard } from '../components/StudyCard';

function createDeck(params, progress) {
  let selected = topics;

  if (params.get('mode') === 'weak') {
    selected = topics
      .filter(topic => progress[topic.id] > 0 && progress[topic.id] < 50)
      .sort((a, b) => progress[a.id] - progress[b.id]);
  } else if (params.get('mode') === 'course-weak') {
    const course = courses.find(item => item.id === params.get('course'));
    selected = topics
      .filter(topic => course?.topics.includes(topic.id) && progress[topic.id] < 50)
      .sort((a, b) => progress[a.id] - progress[b.id]);
  } else if (params.has('topic')) {
    selected = topics.filter(topic => topic.id === params.get('topic'));
  } else if (params.has('course')) {
    const course = courses.find(item => item.id === params.get('course'));
    selected = topics.filter(topic => course?.topics.includes(topic.id));
  }

  const deck = selected.flatMap(topic => (
    topic.cards.map(([question, answer], cardIndex) => ({ topic, question, answer, cardIndex }))
  ));

  if (params.has('topic') && params.has('card')) {
    const requestedCard = Number(params.get('card'));
    return deck.filter(card => card.cardIndex === requestedCard);
  }

  return deck;
}

export function TrainingPage({ progress, onRate }) {
  const [params] = useSearchParams();
  const [deck] = useState(() => createDeck(params, progress));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState({ know: 0, partly: 0, forgot: 0 });
  const course = courses.find(item => item.id === params.get('course')) || courseForTopic(params.get('topic'));
  const back = course ? `/courses/${course.id}` : '/progress';

  function rate(value) {
    onRate(deck[index].topic.id, value, deck[index].cardIndex);
    setResults(current => ({ ...current, [value]: current[value] + 1 }));
    setRevealed(false);
    setIndex(current => current + 1);
  }

  function restart() {
    setIndex(0);
    setRevealed(false);
    setResults({ know: 0, partly: 0, forgot: 0 });
  }

  if (!deck.length) {
    return (
      <div className="empty">
        <h1>Нет карточек для тренировки</h1>
        <p>Выберите другую тему или откройте курс.</p>
        <Link className="button primary" to="/">К курсам</Link>
      </div>
    );
  }

  if (index === deck.length) {
    return (
      <div className="training-width">
        <div className="completed">
          <span className="completion-mark" aria-hidden="true">✓</span>
          <h1>Ещё один шаг вперёд</h1>
          <p>Тренировка завершена. Вы разобрали {deck.length} карточек.</p>
          <div className="result-grid">
            <div><strong>{results.know}</strong><span>Знаю</span></div>
            <div><strong>{results.partly}</strong><span>Не уверен</span></div>
            <div><strong>{results.forgot}</strong><span>Не знаю</span></div>
          </div>
          <Link className="button primary" to="/progress">Посмотреть прогресс</Link>
          <button className="text-button" onClick={restart}>Пройти ещё раз</button>
        </div>
      </div>
    );
  }

  const trainingProgress = Math.round(index / deck.length * 100);

  return (
    <div className="training-width">
      <div className="training-top">
        <Link className="text-link" to={back}>← Завершить тренировку</Link>
        <span className="muted">{params.get('mode') === 'weak' ? 'Повторение слабых тем' : 'Практика'}</span>
      </div>
      <div className="training-progress">
        <div className="progress-label">
          <span aria-live="polite">Карточка {index + 1} из {deck.length}</span>
          <span>{trainingProgress}%</span>
        </div>
        <ProgressBar value={trainingProgress} label="Тренировка" />
      </div>
      <StudyCard
        key={index}
        card={deck[index]}
        revealed={revealed}
        onReveal={() => setRevealed(true)}
        onRate={rate}
      />
      <p className="quiet-note">Честная оценка помогает понять, к чему стоит вернуться.</p>
    </div>
  );
}
