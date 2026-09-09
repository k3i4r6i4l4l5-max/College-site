import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useCatalog } from '../context/CatalogContext';
import { COURSE_POPULARITY, SIDEBAR_FILTERS } from '../constants';

/** Показывает фильтруемый список популярных курсов в постоянном левом сайдбаре. */
export function PopularCoursesSidebar({ onCourseNavigate, userCourses = [] }) {
  const { courses } = useCatalog();
  const location = useLocation();
  const [filterId, setFilterId] = useState('popular');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRoot = useRef(null);
  const activeFilter = SIDEBAR_FILTERS.find(filter => filter.id === filterId) || SIDEBAR_FILTERS[0];
  const filterCourseIds = filterId === 'recent' && userCourses.length
    ? userCourses.filter(item => item.status === 'active').map(item => item.courseId)
    : activeFilter.courses;
  const visibleCourses = filterCourseIds
    .map(id => courses.find(course => course.id === id))
    .filter(Boolean);

  // Закрывает меню фильтров при клике снаружи или нажатии Escape.
  useEffect(() => {
    function closeOutside(event) {
      if (!filterRoot.current?.contains(event.target)) setFilterOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setFilterOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  // Применяет фильтр и возвращает клавиатурный фокус на кнопку dropdown.
  function chooseFilter(id) {
    setFilterId(id);
    setFilterOpen(false);
    requestAnimationFrame(() => filterRoot.current?.querySelector('.popular-filter-trigger')?.focus());
  }

  // Выбирает направление перехода по положению текущего и нового курса в списке.
  function markCourseTransition(event, courseId) {
    const modifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const targetPath = `/courses/${courseId}`;
    if (modifiedClick || location.pathname === targetPath) return;

    const currentCourseId = location.pathname.match(/^\/courses\/([^/]+)$/)?.[1];
    const currentIndex = visibleCourses.findIndex(course => course.id === currentCourseId);
    const targetIndex = visibleCourses.findIndex(course => course.id === courseId);
    const direction = currentIndex >= 0 && targetIndex < currentIndex ? 'up' : 'down';
    onCourseNavigate?.(direction);
  }

  return (
    <aside className="popular-sidebar" aria-labelledby="popular-courses-title">
      <div className="popular-sidebar-heading">
        <span className="eyebrow">Подборка курсов</span>
        <h2 id="popular-courses-title">{activeFilter.label}</h2>
      </div>
      <nav aria-label={activeFilter.label}>
        {visibleCourses.map((course, index) => (
          <NavLink
            className={({ isActive }) => `popular-course-card${isActive ? ' active' : ''}`}
            to={`/courses/${course.id}`}
            key={course.id}
            onClick={event => markCourseTransition(event, course.id)}
          >
            <span className="popular-course-rank" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span
              className="popular-course-thumb"
              style={{ '--popular-image': `url("${course.image}")` }}
              aria-hidden="true"
            />
            <span className="popular-course-copy">
              <small>{course.category}</small>
              <strong>{course.title}</strong>
              <small>{COURSE_POPULARITY[course.id]}</small>
            </span>
            <span className="popular-course-arrow" aria-hidden="true">→</span>
          </NavLink>
        ))}
      </nav>
      <div className={`popular-filter ${filterOpen ? 'open' : ''}`} ref={filterRoot}>
        {filterOpen && (
          <ul className="popular-filter-menu" role="listbox" aria-label="Фильтр курсов">
            {SIDEBAR_FILTERS.map(filter => (
              <li key={filter.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={filter.id === filterId}
                  className={filter.id === filterId ? 'selected' : ''}
                  onClick={() => chooseFilter(filter.id)}
                >
                  <span>{filter.label}</span>
                  {filter.id === filterId && <span className="popular-filter-check" aria-hidden="true">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="popular-filter-trigger"
          aria-haspopup="listbox"
          aria-expanded={filterOpen}
          onClick={() => setFilterOpen(open => !open)}
        >
          <span>{activeFilter.label}</span>
          <span className="popular-filter-chevron" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
