import React, { useEffect, useRef, useState } from 'react';
import { courses } from '../data';

export function CourseDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const current = courses.find(course => course.id === value) || courses[0];

  useEffect(() => {
    function closeOutside(event) {
      if (!root.current?.contains(event.target)) setOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  function selectCourse(id) {
    onChange(id);
    setOpen(false);
    requestAnimationFrame(() => root.current?.querySelector('.course-dropdown-trigger')?.focus());
  }

  return (
    <div className="course-select">
      <span id="course-select-label">Курс</span>
      <div className={`course-dropdown ${open ? 'open' : ''}`} ref={root}>
        <button
          type="button"
          className="course-dropdown-trigger"
          aria-labelledby="course-select-label course-select-value"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
        >
          <span id="course-select-value">{current.title}</span>
          <span className="course-dropdown-chevron" aria-hidden="true" />
        </button>
        {open && (
          <ul className="course-dropdown-menu" role="listbox" aria-labelledby="course-select-label">
            {courses.map(course => (
              <li key={course.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={course.id === value}
                  className={course.id === value ? 'selected' : ''}
                  onClick={() => selectCourse(course.id)}
                >
                  <span>{course.title}</span>
                  {course.id === value && <span className="course-dropdown-check" aria-hidden="true">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
