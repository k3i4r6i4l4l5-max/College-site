# Структура проекта

```text
College-site/
├── .github/workflows/
│   └── deploy-pages.yml
├── docs/
├── public/
│   ├── guide-assets/
│   ├── images/
│   └── guide.html
├── scripts/
│   ├── e2e/
│   └── smoke.cjs
├── src/
│   ├── api/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   ├── constants.js
│   ├── data.js
│   ├── main.jsx
│   └── styles.css
├── tests/
├── .env.example
├── index.html
├── package.json
└── README.md
```

## Каталоги

| Каталог | Ответственность |
| --- | --- |
| `.github/workflows` | Автоматическая сборка и публикация GitHub Pages. |
| `docs` | Расширенная техническая документация. |
| `public` | Статические изображения и onboarding-презентация. |
| `scripts/e2e` | Независимые браузерные сценарии. |
| `src/api` | HTTP-клиент, сервисы и mock-backend. |
| `src/components` | Переиспользуемые элементы интерфейса. |
| `src/context` | Контекст каталога. |
| `src/hooks` | Пользовательские React hooks. |
| `src/pages` | Компоненты маршрутов. |
| `src/styles` | База, макет, компоненты и стили страниц. |
| `src/utils` | Чистые функции расчётов и настройки. |
| `tests` | Unit-тесты бизнес-расчётов frontend. |

## Основные файлы

| Файл | Назначение |
| --- | --- |
| `src/main.jsx` | Точка входа и маршрутизатор. |
| `src/App.jsx` | Корневое состояние и компоновка приложения. |
| `src/data.js` | Демонстрационные курсы, темы и карточки. |
| `src/constants.js` | Ключи хранилища и общие константы. |
| `src/styles.css` | Единая точка импорта CSS. |
| `public/guide.html` | Гайд первого тестового входа. |
