import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../constants';

export function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.settings) || '{}');
    return {
      theme: saved.theme === 'dark' ? 'dark' : DEFAULT_SETTINGS.theme,
      reduceMotion: Boolean(saved.reduceMotion),
      textSize: ['small', 'medium', 'large'].includes(saved.textSize)
        ? saved.textSize
        : DEFAULT_SETTINGS.textSize,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch {
    // Настройки продолжают действовать до обновления страницы.
  }
}

export function applySettings(settings) {
  const root = document.documentElement;
  root.dataset.theme = settings.theme;
  root.dataset.reduceMotion = String(settings.reduceMotion);
  root.dataset.textSize = settings.textSize;
  root.style.colorScheme = settings.theme;
}
