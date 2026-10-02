import { DEFAULT_USER } from './defaults';
import { STORAGE_KEYS } from '../../../shared/config/storageKeys';

function isStoredUser(value) {
  return value
    && typeof value === 'object'
    && typeof value.name === 'string'
    && typeof value.email === 'string';
}

export function readSession() {
  try {
    const authenticated = localStorage.getItem(STORAGE_KEYS.auth) === 'true';
    const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');

    return {
      authenticated,
      user: isStoredUser(savedUser) ? savedUser : DEFAULT_USER,
    };
  } catch {
    return { authenticated: false, user: DEFAULT_USER };
  }
}

export function saveSession(user) {
  try {
    localStorage.setItem(STORAGE_KEYS.auth, 'true');
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } catch {
    // Сессия продолжает работать до обновления страницы.
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.auth);
    localStorage.removeItem(STORAGE_KEYS.user);
  } catch {
    // Текущее состояние React всё равно завершает сессию.
  }
}
