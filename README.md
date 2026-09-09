# Практика

Frontend учебного сервиса для подготовки к экзаменам, собеседованиям и проверкам знаний.

## Запуск

Требуется Node.js 20 или новее.

```sh
npm install
npm run dev
```

После запуска приложение доступно по адресу [http://127.0.0.1:5173](http://127.0.0.1:5173).

Production-сборка:

```sh
npm run build
npm run preview
```

## Mock-авторизация

Для быстрого входа нажмите **«Тестовый вход»**. При первом тестовом входе откроется краткий интерактивный гайд.

Для ручного входа в mock-режиме можно использовать:

```text
Email: user@example.ru
Пароль: user123
```

Mock-режим предназначен только для локальной разработки. Роли администратора в текущей frontend-версии нет.

## Документация

- [Возможности и маршруты](docs/features.md)
- [Архитектура frontend](docs/architecture.md)
- [Структура проекта](docs/project-structure.md)
- [Данные, mock-backend и API](docs/data-and-api.md)
- [Стили и доступность](docs/styles-and-accessibility.md)
- [Тестирование](docs/testing.md)
- [Публикация на GitHub Pages](docs/deployment.md)
- [Техническое задание Backend](docs/backend-specification.md)
