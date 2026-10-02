import React, { useEffect, useState } from 'react';
import { useBodyScrollLock } from '../../../shared/lib/useBodyScrollLock';

// Унифицированный переключатель логической настройки с ролью switch.
function Toggle({ checked, label, description, onChange }) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>
      <button
        className={`settings-toggle${checked ? ' active' : ''}`}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

/** Управляет настройками интерфейса, данными аккаунта и локальными действиями профиля. */
export function SettingsPanel({
  settings,
  user,
  onDeleteAccount,
  onChangePassword,
  onLogoutAll,
  onSettingsChange,
  onUpdate,
}) {
  const [accountDraft, setAccountDraft] = useState({ name: user.name, email: user.email });
  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' });
  const [accountMessage, setAccountMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Синхронизирует редактируемые поля после внешнего обновления пользователя.
  useEffect(() => {
    setAccountDraft({ name: user.name, email: user.email });
  }, [user]);

  useBodyScrollLock(deleteOpen, () => setDeleteOpen(false));

  // Обновляет одну настройку, сохраняя остальные значения объекта.
  function updateSetting(key, value) {
    onSettingsChange(current => ({ ...current, [key]: value }));
  }

  // Проверяет пустые значения и передаёт обновлённые имя и email родителю.
  async function saveAccount(event) {
    event.preventDefault();
    const nextUser = {
      name: accountDraft.name.trim() || user.name,
      email: accountDraft.email.trim() || user.email,
    };
    try {
      await onUpdate(nextUser);
      setAccountMessage('Данные аккаунта обновлены.');
    } catch (error) { setAccountMessage(error.message); }
  }

  // Выполняет локальную проверку длины и совпадения нового пароля.
  async function changePassword(event) {
    event.preventDefault();
    if (passwords.next.length < 6) {
      setPasswordMessage('Новый пароль должен содержать не менее 6 символов.');
      return;
    }
    if (passwords.next !== passwords.confirm) {
      setPasswordMessage('Новые пароли не совпадают.');
      return;
    }
    try {
      await onChangePassword({ currentPassword: passwords.current, newPassword: passwords.next });
      setPasswords({ current: '', next: '', confirm: '' });
      setPasswordMessage('Пароль успешно изменён.');
    } catch (error) { setPasswordMessage(error.message); }
  }

  return (
    <section className="settings-panel" id="settings" aria-labelledby="settings-title">
      <header className="settings-heading">
        <div>
          <span className="eyebrow">Персонализация</span>
          <h1 id="settings-title">Настройки</h1>
        </div>
        <p>Настройте интерфейс и данные своего профиля.</p>
      </header>

      <div className="settings-grid">
        <section className="settings-card" aria-labelledby="interface-settings-title">
          <div className="settings-card-heading">
            <span>01</span>
            <div>
              <h3 id="interface-settings-title">Интерфейс</h3>
              <p>Внешний вид и поведение приложения</p>
            </div>
          </div>

          <div className="theme-setting">
            <div>
              <strong>Тема</strong>
              <span>Цветовая схема приложения</span>
            </div>
            <div className="theme-switch" role="group" aria-label="Тема интерфейса">
              <button
                type="button"
                className={settings.theme === 'light' ? 'active' : ''}
                aria-pressed={settings.theme === 'light'}
                onClick={() => updateSetting('theme', 'light')}
              >
                Светлая
              </button>
              <button
                type="button"
                className={settings.theme === 'dark' ? 'active' : ''}
                aria-pressed={settings.theme === 'dark'}
                onClick={() => updateSetting('theme', 'dark')}
              >
                Тёмная
              </button>
            </div>
          </div>

          <Toggle
            checked={settings.reduceMotion}
            label="Уменьшение анимаций"
            description="Убирает переходы страниц, выдвижение панелей и движение индикаторов"
            onChange={value => updateSetting('reduceMotion', value)}
          />
          <label className="text-size-setting">
            <span><strong>Размер текста</strong><small>Масштаб текста и элементов интерфейса</small></span>
            <select value={settings.textSize} onChange={event => updateSetting('textSize', event.target.value)}>
              <option value="small">Мелкий</option>
              <option value="medium">Обычный</option>
              <option value="large">Крупный</option>
            </select>
          </label>
        </section>

        <section className="settings-card account-settings-card" aria-labelledby="account-settings-title">
          <div className="settings-card-heading">
            <span>02</span>
            <div>
              <h3 id="account-settings-title">Аккаунт</h3>
              <p>Личные данные и безопасность</p>
            </div>
          </div>

          <form className="settings-form" onSubmit={saveAccount}>
            <label>
              Никнейм
              <input
                value={accountDraft.name}
                onChange={event => setAccountDraft(current => ({ ...current, name: event.target.value }))}
                autoComplete="nickname"
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={accountDraft.email}
                onChange={event => setAccountDraft(current => ({ ...current, email: event.target.value }))}
                autoComplete="email"
                required
              />
            </label>
            <button className="button secondary" type="submit">Сохранить данные</button>
            {accountMessage && <p className="settings-message" role="status">{accountMessage}</p>}
          </form>

          <form className="settings-form password-form" onSubmit={changePassword}>
            <h4>Сменить пароль</h4>
            <label>
              Текущий пароль
              <input
                type="password"
                value={passwords.current}
                onChange={event => setPasswords(current => ({ ...current, current: event.target.value }))}
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              Новый пароль
              <input
                type="password"
                value={passwords.next}
                onChange={event => setPasswords(current => ({ ...current, next: event.target.value }))}
                autoComplete="new-password"
                minLength="6"
                required
              />
            </label>
            <label>
              Повторите новый пароль
              <input
                type="password"
                value={passwords.confirm}
                onChange={event => setPasswords(current => ({ ...current, confirm: event.target.value }))}
                autoComplete="new-password"
                minLength="6"
                required
              />
            </label>
            <button className="button secondary" type="submit">Изменить пароль</button>
            {passwordMessage && <p className="settings-message" role="status">{passwordMessage}</p>}
          </form>

          <div className="account-danger-actions">
            <button className="button secondary" type="button" onClick={onLogoutAll}>Выйти со всех устройств</button>
            <button className="delete-account-button" type="button" onClick={() => setDeleteOpen(true)}>Удалить аккаунт</button>
          </div>
        </section>
      </div>

      <div className={`delete-account-layer${deleteOpen ? ' open' : ''}`} aria-hidden={!deleteOpen}>
        <button className="delete-account-backdrop" type="button" aria-label="Отменить удаление" onClick={() => setDeleteOpen(false)} />
        <section className="delete-account-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
          <span className="eyebrow">Необратимое действие</span>
          <h2 id="delete-account-title">Удалить аккаунт?</h2>
          <p>Будут удалены локальный прогресс, история тренировок, план подготовки и настройки.</p>
          <div>
            <button className="button secondary" type="button" onClick={() => setDeleteOpen(false)}>Отмена</button>
            <button className="delete-account-confirm" type="button" onClick={onDeleteAccount}>Удалить аккаунт</button>
          </div>
        </section>
      </div>
    </section>
  );
}
