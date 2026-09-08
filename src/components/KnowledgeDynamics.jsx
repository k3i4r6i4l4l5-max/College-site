import React, { useEffect, useMemo, useState } from 'react';
import { topicById } from '../data';
import { getTopicProgressHistory } from '../utils/activity';

const chart = {
  width: 640,
  height: 220,
  left: 42,
  right: 18,
  top: 18,
  bottom: 38,
};

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(timestamp));
}

export function KnowledgeDynamics({ activity, course }) {
  const [topicId, setTopicId] = useState(course.topics[0]);

  useEffect(() => {
    setTopicId(course.topics[0]);
  }, [course]);

  const points = useMemo(
    () => getTopicProgressHistory(activity, topicId),
    [activity, topicId],
  );
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const coordinates = points.map((point, index) => ({
    ...point,
    x: points.length === 1
      ? chart.left + plotWidth / 2
      : chart.left + index / (points.length - 1) * plotWidth,
    y: chart.top + (100 - point.value) / 100 * plotHeight,
  }));

  return (
    <section className="progress-insight-card knowledge-dynamics" aria-labelledby="knowledge-dynamics-title">
      <header className="progress-insight-heading knowledge-dynamics-heading">
        <div>
          <span className="eyebrow">История тренировок</span>
          <h2 id="knowledge-dynamics-title">Динамика знаний</h2>
        </div>
        <label>
          <span>Тема</span>
          <select value={topicId} onChange={event => setTopicId(event.target.value)}>
            {course.topics.map(id => {
              const topic = topicById(id);
              return <option value={id} key={id}>{topic.title}</option>;
            })}
          </select>
        </label>
      </header>

      {coordinates.length ? (
        <div className="knowledge-chart-wrap">
          <svg
            className="knowledge-line-chart"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="img"
            aria-label="Изменение процента знания темы после тренировок"
          >
            {[0, 50, 100].map(value => {
              const y = chart.top + (100 - value) / 100 * plotHeight;
              return (
                <g key={value}>
                  <line x1={chart.left} x2={chart.width - chart.right} y1={y} y2={y} className="knowledge-grid-line" />
                  <text x={chart.left - 9} y={y + 3} textAnchor="end" className="knowledge-axis-label">{value}%</text>
                </g>
              );
            })}
            {coordinates.length > 1 && (
              <polyline
                className="knowledge-line"
                points={coordinates.map(point => `${point.x},${point.y}`).join(' ')}
              />
            )}
            {coordinates.map(point => (
              <g key={point.id}>
                <circle className="knowledge-point" cx={point.x} cy={point.y} r="5" />
                <text className="knowledge-point-value" x={point.x} y={point.y - 12} textAnchor="middle">{point.value}%</text>
                <text className="knowledge-date-label" x={point.x} y={chart.height - 12} textAnchor="middle">{formatDate(point.timestamp)}</text>
              </g>
            ))}
          </svg>
        </div>
      ) : (
        <p className="progress-insight-empty">Пройдите тренировку по этой теме, чтобы увидеть изменение знаний.</p>
      )}
    </section>
  );
}
