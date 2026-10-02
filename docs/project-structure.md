# Структура проекта

`src` организован по FSD:

```text
src/
├── app/                 # точка входа, App, mockBackend, общие стили
├── pages/               # срез на каждый маршрут; ui/ и index.js
├── widgets/             # самостоятельные блоки интерфейса
├── features/            # авторизация, оценка карточки и действия с планом
├── entities/            # catalog, user, training, progress, activity, preparation-plan
└── shared/              # api, ui, lib, config
```

В срезах используются сегменты `ui`, `model` и `api` по необходимости. `index.js` — публичная точка входа среза. Общие стили подключает `src/app/styles.css`; стили страниц лежат рядом с их компонентами.

| Путь | Назначение |
| --- | --- |
| `src/app/main.jsx` | Настройки до рендера, React root и HashRouter. |
| `src/app/App.jsx` | Сессия, загрузка рабочего пространства и маршруты. |
| `src/app/mockBackend.js` | Локальный источник данных для разработки. |
| `src/entities/catalog/model/mockData.js` | Демонстрационные курсы, темы и карточки. |
| `src/shared/api` | HTTP-клиент и переключение источника. |
| `scripts/check-fsd.cjs` | Проверка направления импортов и публичных API. |

`public` содержит изображения и гайд, `tests` — unit-тесты, `scripts/e2e` — браузерные сценарии, `docs` — техническую документацию.
