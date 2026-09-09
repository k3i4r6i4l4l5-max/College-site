import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { trainingService } from '../api/domainServices';
import { LoadingState, ErrorState, EmptyState } from '../components/AsyncState';
import { ProgressBar } from '../components/ProgressBar';
import { StudyCard } from '../components/StudyCard';

export function TrainingPage({ activeTraining, onTrainingChange, onLearningChange }) {
  const [params] = useSearchParams();
  const { topicById, courseById, courseForTopic } = useCatalog();
  const resumes = params.has('session') || params.has('resume');
  const [session, setSession] = useState(() => resumes ? activeTraining : null);
  const [state, setState] = useState({ loading: !session, error: null, submitting: false });
  const [revealed, setRevealed] = useState(false);
  const [lastRating, setLastRating] = useState(null);
  const started = useRef(false);

  async function start() {
    setState({ loading: true, error: null, submitting: false });
    try {
      const created = await trainingService.start({ topicId: params.get('topic') || undefined, courseId: params.get('course') || undefined, mode: params.get('mode') || undefined, cardIndex: params.has('card') ? Number(params.get('card')) : undefined, planId: params.get('plan') || undefined });
      setSession(created); onTrainingChange(created); setState({ loading: false, error: null, submitting: false });
    } catch (error) { setState({ loading: false, error, submitting: false }); }
  }

  useEffect(() => {
    if (!session && !started.current) { started.current = true; start(); }
  }, []);

  async function rate(rating) {
    const card = session.deck[session.index];
    setLastRating(rating); setState(current => ({ ...current, submitting: true, error: null }));
    try {
      const result = await trainingService.answer(session.id, card.id, rating);
      setSession(result.session); onTrainingChange(result.session); onLearningChange(result); setRevealed(false);
      if (result.session.index >= result.session.deck.length) { await trainingService.complete(result.session.id); onTrainingChange(null); }
      setState({ loading: false, error: null, submitting: false });
    } catch (error) { setState({ loading: false, error, submitting: false }); }
  }

  async function restart() { started.current = true; await start(); setRevealed(false); }

  if (state.loading) return <LoadingState label="Формируем тренировку" rows={4} />;
  if (state.error && !session) return <ErrorState title="Не удалось начать тренировку" message={state.error.message} onRetry={start} />;
  if (!session?.deck.length) return <EmptyState title="Нет карточек для тренировки" message="Выберите другую тему или курс." action={<Link className="button primary" to="/">К курсам</Link>} />;

  const index = session.index;
  const card = session.deck[index];
  const topic = card ? topicById(card.topicId) : topicById(session.deck[0]?.topicId);
  const course = courseById(session.courseId) || courseForTopic(topic?.id);
  const back = course ? `/courses/${course.id}` : '/progress';

  if (index >= session.deck.length) return <div className="training-width"><div className="completed"><span className="completion-mark" aria-hidden="true">✓</span><h1>Ещё один шаг вперёд</h1><p>Тренировка завершена. Вы разобрали {session.deck.length} карточек.</p><div className="result-grid"><div><strong>{session.results.know}</strong><span>Знаю</span></div><div><strong>{session.results.partly}</strong><span>Не уверен</span></div><div><strong>{session.results.forgot}</strong><span>Не знаю</span></div></div><Link className="button primary" to="/progress">Посмотреть прогресс</Link><button className="text-button" onClick={restart}>Пройти ещё раз</button></div></div>;

  const trainingProgress = Math.round(index / session.deck.length * 100);
  return <div className="training-width"><div className="training-top"><Link className="text-link" to={back}>← Завершить тренировку</Link><span className="muted">{session.mode === 'weak' ? 'Повторение слабых тем' : 'Практика'}</span></div><div className="training-progress"><div className="progress-label"><span aria-live="polite">Карточка {index + 1} из {session.deck.length}</span><span>{trainingProgress}%</span></div><ProgressBar value={trainingProgress} label="Тренировка" /></div>{state.error && <ErrorState compact title="Ответ не сохранён" message={state.error.message} onRetry={() => rate(lastRating)} />}<StudyCard card={{ ...card, topic }} revealed={revealed} pending={state.submitting} onReveal={() => setRevealed(true)} onRate={rate} /><p className="quiet-note">{state.submitting ? 'Сохраняем ответ…' : 'Честная оценка помогает понять, к чему стоит вернуться.'}</p></div>;
}
