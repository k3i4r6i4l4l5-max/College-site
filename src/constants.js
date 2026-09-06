export const STORAGE_KEYS = {
  progress: 'practice-progress-v1',
  legacyAuth: 'practice-auth-v1',
  legacyUser: 'practice-user-v1',
};

export const DEFAULT_USER = {
  name: 'Ульяна Соколова',
  email: 'ulyana.sokolova@example.ru',
};

export const RATING_DELTAS = {
  know: 5,
  partly: -2,
  forgot: -7,
};

export const COURSE_POPULARITY = {
  java: '1 240 учеников',
  web: '980 учеников',
  math: '760 учеников',
};

export const SIDEBAR_FILTERS = [
  { id: 'popular', label: 'Популярные курсы', courses: ['java', 'web', 'math'] },
  { id: 'recent', label: 'Ваше последнее', courses: ['java'] },
  { id: 'recommended', label: 'Наши рекомендации', courses: ['web', 'math'] },
];
