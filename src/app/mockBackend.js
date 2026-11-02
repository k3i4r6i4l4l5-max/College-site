import { courses, topics } from '../entities/catalog';
import { DEFAULT_SETTINGS, DEFAULT_USER } from '../entities/user';
import { RATING_DELTAS } from '../entities/training';
import { STORAGE_KEYS } from '../shared/config/storageKeys';

const clone = value => JSON.parse(JSON.stringify(value));
// Learning records belong to the signed-in account, not to the browser.
const learningKeys = [STORAGE_KEYS.progress, STORAGE_KEYS.activity, STORAGE_KEYS.userCourses, STORAGE_KEYS.activeTraining, STORAGE_KEYS.preparationPlan];
const accountKey = (key, email) => `${key}:account:${encodeURIComponent(email.trim().toLowerCase())}`;
const storageKey = key => {
  if (!learningKeys.includes(key)) return key;
  const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
  return user?.email ? accountKey(key, user.email) : key;
};
const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(storageKey(key)) || 'null') ?? fallback; } catch { return fallback; }
};
const write = (key, value) => localStorage.setItem(storageKey(key), JSON.stringify(value));
const wait = () => new Promise(resolve => setTimeout(resolve, 70));
const clamp = value => Math.max(0, Math.min(100, value));

function initialProgress() {
  const saved = read(STORAGE_KEYS.progress, {});
  return Object.fromEntries(topics.map(topic => [topic.id, Number.isFinite(saved[topic.id]) ? clamp(saved[topic.id]) : 0]));
}

// Migrate only the previous owner's records. Rebuild progress from answers,
// removing the demo baseline that older versions added to every topic.
function migrateLearning(user) {
  const previous = read(STORAGE_KEYS.user, null);
  if (previous?.email?.toLowerCase() !== user.email.toLowerCase()) return;
  const target = accountKey(STORAGE_KEYS.activity, user.email);
  if (localStorage.getItem(target) !== null) return;
  const progress = Object.fromEntries(topics.map(topic => [topic.id, 0]));
  let legacy;
  try { legacy = JSON.parse(localStorage.getItem(STORAGE_KEYS.activity) || '[]'); } catch { legacy = []; }
  const activity = (Array.isArray(legacy) ? legacy : [])
    .filter(entry => !String(entry.id).startsWith('demo-') && entry.topicId in progress && entry.rating in RATING_DELTAS && Number.isFinite(Date.parse(entry.timestamp)))
    .sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))
    .map(entry => {
      progress[entry.topicId] = clamp(progress[entry.topicId] + RATING_DELTAS[entry.rating]);
      return { ...entry, progressAfter: progress[entry.topicId] };
    });
  for (const key of learningKeys) {
    const value = localStorage.getItem(key);
    if (value !== null) localStorage.setItem(accountKey(key, user.email), value);
  }
  localStorage.setItem(target, JSON.stringify(activity));
  localStorage.setItem(accountKey(STORAGE_KEYS.progress, user.email), JSON.stringify(progress));
  learningKeys.forEach(key => localStorage.removeItem(key));
}

function currentUser() {
  if (localStorage.getItem(STORAGE_KEYS.auth) !== 'true') return null;
  return read(STORAGE_KEYS.user, DEFAULT_USER);
}

function requireUser() {
  const user = currentUser();
  if (!user) throw Object.assign(new Error('Необходимо войти в аккаунт.'), { status: 401, code: 'UNAUTHORIZED' });
  return user;
}

function catalog() {
  return {
    courses: courses.map(course => ({ ...course, createdAt: course.id === 'java' ? '2026-08-01' : course.id === 'web' ? '2026-08-15' : '2026-09-01' })),
    topics,
  };
}

function buildDeck(params, progress) {
  let selected = topics;
  const activity = read(STORAGE_KEYS.activity, []);
  if (params.mode === 'weak') selected = topics.filter(topic => activity.some(entry => entry.topicId === topic.id) && progress[topic.id] < 50).sort((a, b) => progress[a.id] - progress[b.id]);
  else if (params.mode === 'course-weak') {
    const course = courses.find(item => item.id === params.courseId);
    selected = topics.filter(topic => course?.topics.includes(topic.id) && activity.some(entry => entry.topicId === topic.id) && progress[topic.id] < 50).sort((a, b) => progress[a.id] - progress[b.id]);
  } else if (params.topicId) selected = topics.filter(topic => topic.id === params.topicId);
  else if (params.courseId) selected = topics.filter(topic => courses.find(item => item.id === params.courseId)?.topics.includes(topic.id));
  let deck = selected.flatMap(topic => topic.cards.map(([question, answer], cardIndex) => ({
    id: `${topic.id}:${cardIndex}`, topicId: topic.id, cardIndex, question, answer,
  })));
  if (params.cardIndex !== undefined) deck = deck.filter(card => card.cardIndex === Number(params.cardIndex));
  return deck;
}

export async function mockRequest(resource, action, payload = {}) {
  await wait();
  if (import.meta.env.VITE_MOCK_FAILURE === resource) throw Object.assign(new Error('Тестовая ошибка загрузки.'), { code: 'MOCK_FAILURE' });

  if (resource === 'auth') {
    if (action === 'session') { const user = currentUser(); if (user) migrateLearning(user); return { authenticated: Boolean(user), user: user || DEFAULT_USER }; }
    if (action === 'login') {
      const accounts = read(STORAGE_KEYS.mockAccounts, []);
      const account = accounts.find(item => item.email.toLowerCase() === payload.email.toLowerCase());
      if (account && account.password !== payload.password) throw Object.assign(new Error('Неверная почта или пароль.'), { status: 401, code: 'INVALID_CREDENTIALS' });
      const user = account ? { name: account.name, email: account.email } : { name: payload.email.split('@')[0], email: payload.email };
      migrateLearning(user);
      if (localStorage.getItem(accountKey(STORAGE_KEYS.activity, user.email)) === null) localStorage.setItem(accountKey(STORAGE_KEYS.activity, user.email), '[]');
      localStorage.setItem(STORAGE_KEYS.auth, 'true'); write(STORAGE_KEYS.user, user); return user;
    }
    if (action === 'register') {
      const accounts = read(STORAGE_KEYS.mockAccounts, []);
      if (accounts.some(item => item.email.toLowerCase() === payload.email.toLowerCase())) throw Object.assign(new Error('Пользователь с такой почтой уже существует.'), { status: 409, code: 'EMAIL_TAKEN' });
      const user = { name: payload.name, email: payload.email };
      write(STORAGE_KEYS.mockAccounts, [...accounts, { ...user, password: payload.password }]);
      if (localStorage.getItem(accountKey(STORAGE_KEYS.activity, user.email)) === null) localStorage.setItem(accountKey(STORAGE_KEYS.activity, user.email), '[]');
      localStorage.setItem(STORAGE_KEYS.auth, 'true'); write(STORAGE_KEYS.user, user); return user;
    }
    if (action === 'logout' || action === 'logoutAll') { localStorage.removeItem(STORAGE_KEYS.auth); localStorage.removeItem(STORAGE_KEYS.user); return null; }
  }

  requireUser();
  if (resource === 'catalog') return clone(catalog());
  if (resource === 'profile' && action === 'get') return clone(currentUser());
  if (resource === 'profile' && action === 'update') {
    const previous = currentUser();
    const accounts = read(STORAGE_KEYS.mockAccounts, []);
    write(STORAGE_KEYS.mockAccounts, accounts.map(account => account.email.toLowerCase() === previous.email.toLowerCase() ? { ...account, ...payload } : account));
    for (const key of learningKeys) {
      const value = localStorage.getItem(accountKey(key, previous.email));
      if (value !== null) localStorage.setItem(accountKey(key, payload.email), value);
      if (previous.email.toLowerCase() !== payload.email.toLowerCase()) localStorage.removeItem(accountKey(key, previous.email));
    }
    write(STORAGE_KEYS.user, payload); return clone(payload);
  }
  if (resource === 'profile' && action === 'password') {
    const user = currentUser();
    const accounts = read(STORAGE_KEYS.mockAccounts, []);
    const account = accounts.find(item => item.email.toLowerCase() === user.email.toLowerCase());
    if (account && account.password !== payload.currentPassword) throw Object.assign(new Error('Текущий пароль указан неверно.'), { status: 422, code: 'INVALID_CURRENT_PASSWORD' });
    write(STORAGE_KEYS.mockAccounts, accounts.map(item => item === account ? { ...item, password: payload.newPassword } : item));
    return { success: true };
  }
  if (resource === 'profile' && action === 'delete') {
    const user = currentUser();
    learningKeys.forEach(key => localStorage.removeItem(storageKey(key)));
    write(STORAGE_KEYS.mockAccounts, read(STORAGE_KEYS.mockAccounts, []).filter(account => account.email.toLowerCase() !== user.email.toLowerCase()));
    localStorage.removeItem(STORAGE_KEYS.auth); localStorage.removeItem(STORAGE_KEYS.user); return null;
  }
  if (resource === 'settings' && action === 'get') return read(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  if (resource === 'settings' && action === 'update') { write(STORAGE_KEYS.settings, payload); return clone(payload); }
  if (resource === 'progress' && action === 'get') return initialProgress();
  if (resource === 'activity' && action === 'get') return read(STORAGE_KEYS.activity, []);
  if (resource === 'userCourses' && action === 'get') {
    return read(STORAGE_KEYS.userCourses, []);
  }
  if (resource === 'userCourses' && action === 'update') {
    const items = read(STORAGE_KEYS.userCourses, []);
    const next = items.some(item => item.courseId === payload.courseId)
      ? items.map(item => item.courseId === payload.courseId ? { ...item, ...payload.changes } : item)
      : [...items, { courseId: payload.courseId, status: 'active', favorite: false, ...payload.changes }];
    write(STORAGE_KEYS.userCourses, next); return next;
  }
  if (resource === 'training' && action === 'active') return read(STORAGE_KEYS.activeTraining, null);
  if (resource === 'training' && action === 'start') {
    const existing = read(STORAGE_KEYS.activeTraining, null);
    const sameRequest = existing?.status === 'active'
      && existing.topicId === payload.topicId
      && existing.courseId === payload.courseId
      && existing.mode === payload.mode
      && existing.cardIndex === payload.cardIndex;
    if (sameRequest) return clone(existing);
    const deck = buildDeck(payload, initialProgress());
    const session = { id: crypto.randomUUID(), ...payload, deck, index: 0, results: { know: 0, partly: 0, forgot: 0 }, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'active' };
    write(STORAGE_KEYS.activeTraining, session); return clone(session);
  }
  if (resource === 'training' && action === 'answer') {
    const session = read(STORAGE_KEYS.activeTraining, null);
    if (!session || session.id !== payload.sessionId) throw Object.assign(new Error('Тренировка не найдена.'), { status: 404, code: 'SESSION_NOT_FOUND' });
    const card = session.deck[session.index];
    if (!card || card.id !== payload.cardId) throw Object.assign(new Error('Эта карточка уже обработана.'), { status: 409, code: 'ANSWER_CONFLICT' });
    const progress = initialProgress();
    const progressAfter = clamp((progress[card.topicId] || 0) + RATING_DELTAS[payload.rating]);
    const nextProgress = { ...progress, [card.topicId]: progressAfter }; write(STORAGE_KEYS.progress, nextProgress);
    const activity = read(STORAGE_KEYS.activity, []);
    const entry = { id: crypto.randomUUID(), topicId: card.topicId, cardIndex: card.cardIndex, rating: payload.rating, progressAfter, timestamp: new Date().toISOString() };
    write(STORAGE_KEYS.activity, [...activity, entry]);
    const nextSession = { ...session, index: session.index + 1, updatedAt: entry.timestamp, results: { ...session.results, [payload.rating]: session.results[payload.rating] + 1 } };
    write(STORAGE_KEYS.activeTraining, nextSession);
    return { session: clone(nextSession), progress: nextProgress, activity: [...activity, entry] };
  }
  if (resource === 'training' && action === 'complete') {
    const session = read(STORAGE_KEYS.activeTraining, null);
    if (session?.id === payload.sessionId) localStorage.removeItem(storageKey(STORAGE_KEYS.activeTraining));
    return null;
  }
  if (resource === 'plans' && action === 'get') return read(STORAGE_KEYS.preparationPlan, null);
  if (resource === 'plans' && action === 'save') { write(STORAGE_KEYS.preparationPlan, payload); return clone(payload); }
  if (resource === 'plans' && action === 'delete') { localStorage.removeItem(storageKey(STORAGE_KEYS.preparationPlan)); return null; }
  throw Object.assign(new Error('Mock endpoint не реализован.'), { status: 404, code: 'MOCK_NOT_FOUND' });
}
