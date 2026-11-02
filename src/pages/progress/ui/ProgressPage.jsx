import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { average } from '../../../shared/lib/numbers';
import { useCatalog } from '../../../entities/catalog';
import { CourseDropdown } from './CourseDropdown';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { TopicCard } from '../../../entities/catalog';
import { ProblemCards } from '../../../widgets/problem-cards';
import { KnowledgeDynamics } from '../../../widgets/knowledge-dynamics';
import { SectionErrorBoundary } from '../../../shared/ui/SectionErrorBoundary';

export function ProgressPage({ activity, progress }) {
  const { courses, topicById } = useCatalog();
  const [courseId, setCourseId] = useState('java');
  const course = courses.find(item => item.id === courseId);
  const selectedTopics = course.topics.map(topicById);
  const weakTopics = selectedTopics.filter(topic => activity.some(entry => entry.topicId === topic.id) && progress[topic.id] < 50);
  const recommendedTopics = [...selectedTopics]
    .sort((a, b) => progress[a.id] - progress[b.id])
    .slice(0, 2);
  const overall = average(selectedTopics.map(topic => progress[topic.id]));

  return (
    <>
      <div className="page-heading">
        <span className="eyebrow">Каждая тренировка имеет значение</span>
        <h1>Ваш прогресс</h1>
        <p>Посмотрите, что уже получается, а чему стоит уделить внимание.</p>
      </div>
      <CourseDropdown value={courseId} onChange={setCourseId} />
      <div className="progress-layout">
        <section>
          <div className="readiness">
            <span className="muted">Общая готовность</span>
            <div className="large-value">{overall}<span>%</span></div>
            <ProgressBar value={overall} />
            <p>На основе ваших оценок карточек в этом курсе.</p>
          </div>
          <div className="section-title"><h2>Знание по темам</h2></div>
          <div className="topic-list">
            {selectedTopics.map(topic => (
              <TopicCard key={topic.id} topic={topic} value={progress[topic.id]} />
            ))}
          </div>
        </section>
        <aside className="progress-aside">
          <section className="weak-panel">
            <h2>Слабые темы</h2>
            <p>Начните с того, что требует внимания.</p>
            {weakTopics.length ? (
              <>
                <div className="weak-list">
                  {weakTopics.map(topic => (
                    <Link key={topic.id} to={`/topics/${topic.id}`}>
                      <span>{topic.title}</span>
                      <strong>{progress[topic.id]}%</strong>
                    </Link>
                  ))}
                </div>
                <Link className="button primary full" to={`/training?course=${courseId}&mode=course-weak`}>
                  Тренировать слабые темы
                </Link>
              </>
            ) : (
              <p>Тем со слабыми результатами пока нет. Занимайтесь, чтобы получить рекомендации.</p>
            )}
          </section>
          <section className="recommended">
            <h2>Рекомендуется повторить</h2>
            {recommendedTopics.map(topic => (
              <Link key={topic.id} to={`/topics/${topic.id}`}>
                <div>
                  <h3>{topic.title}</h3>
                  <span className="muted">Конспект и {topic.cards.length} карточки</span>
                </div>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </section>
        </aside>
      </div>
      <div className="progress-insights">
        <SectionErrorBoundary><ProblemCards activity={activity} course={course} progress={progress} /></SectionErrorBoundary>
        <SectionErrorBoundary><KnowledgeDynamics activity={activity} course={course} /></SectionErrorBoundary>
      </div>
    </>
  );
}
