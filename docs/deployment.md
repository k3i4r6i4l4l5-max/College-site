# Публикация на GitHub Pages

## Автоматический деплой

Workflow находится в `.github/workflows/deploy-pages.yml` и запускается:

- после каждого push в `main` или `master`;
- вручную через `Actions → Deploy to GitHub Pages → Run workflow`.

Workflow устанавливает зависимости, выполняет `npm run build`, загружает каталог `dist` и публикует его в GitHub Pages.

В настройках репозитория должен быть выбран источник:

```text
Settings → Pages → Build and deployment → Source → GitHub Actions
```

## Базовый путь

Команда сборки содержит:

```sh
vite build --base=/College-site/
```

Благодаря этому JS, CSS и изображения загружаются из подпапки репозитория. Если репозиторий будет переименован, значение `/College-site/` в `package.json` также нужно изменить.

## Маршрутизация

Приложение использует `HashRouter`, поэтому внутренние адреса имеют вид:

```text
https://username.github.io/College-site/#/courses/java
```

Такой формат не требует серверной переадресации неизвестных маршрутов на `index.html`.

## Onboarding

После публикации отдельная презентация доступна по адресу:

```text
https://username.github.io/College-site/guide.html
```

Обычно обновление сайта после успешного workflow занимает несколько минут. Если браузер показывает старую сборку, используется жёсткое обновление `Ctrl + Shift + R`.
