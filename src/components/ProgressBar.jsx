import React from 'react';

/** Отображает доступный индикатор прогресса от 0 до 100 процентов. */
export function ProgressBar({ value, label = 'Освоено' }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
