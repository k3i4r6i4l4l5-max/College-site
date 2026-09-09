import React from 'react';
import { Link } from 'react-router-dom';

/** Строит навигационную цепочку для списка курсов, курса и текущего раздела. */
export function Breadcrumb({ course, current }) {
  return (
    <nav className="breadcrumb" aria-label="Хлебные крошки">
      <Link to="/">Курсы</Link>
      {course && (
        <>
          <span>/</span>
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </>
      )}
      {current && (
        <>
          <span>/</span>
          <span aria-current="page">{current}</span>
        </>
      )}
    </nav>
  );
}
