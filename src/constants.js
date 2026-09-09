export const STORAGE_KEYS = {
  progress: 'practice-progress-v1',
  activity: 'practice-activity-v2',
  settings: 'practice-settings-v1',
  preparationPlan: 'practice-preparation-plan-v1',
  auth: 'practice-auth-v1',
  user: 'practice-user-v1',
  activeTraining: 'practice-active-training-v1',
  userCourses: 'practice-user-courses-v1',
  mockAccounts: 'practice-mock-accounts-v1',
  onboardingSeen: 'practice-onboarding-seen-v1',
};

export const DEFAULT_USER = {
  name: 'Ульяна Соколова',
  email: 'ulyana.sokolova@example.ru',
};

export const DEFAULT_SETTINGS = {
  theme: 'light',
  reduceMotion: false,
  textSize: 'medium',
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
