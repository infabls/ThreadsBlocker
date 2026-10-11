<p align="center">
  <img src="assets/banner.webp" alt="ThreadsBlocker" width="100%">
</p>

# ThreadsBlocker

Массовая блокировка аккаунтов Threads по списку юзернеймов. Логин и пароль не уходят на сторонние серверы — запросы идут с вашего устройства напрямую в Instagram.

## Компьютер (браузерная версия)

Нужен только [Node.js](https://nodejs.org) (устанавливать пакеты не нужно):

```bash
git clone <URL-репозитория>
cd <папка>
node server.js
```

Откроется страница: войдите, вставьте юзернеймы (по одному на строку) или загрузите `.txt`, нажмите «Заблокировать всех».

## Телефон (Android-приложение)

<p align="center">
  <a href="https://github.com/infabls/ThreadsBlocker/releases/latest/download/ThreadsBlocker.apk">
    <img src="https://img.shields.io/badge/%E2%AC%87%20%D0%A1%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C%20APK-00E1FF?style=for-the-badge&logo=android&logoColor=black" alt="Скачать APK">
  </a>
</p>

Автономное приложение, ничего больше не нужно: нажмите кнопку выше, откройте скачанный файл (включите «Установка из неизвестных источников») и установите. Все версии — в [Releases](https://github.com/infabls/ThreadsBlocker/releases).

Приложение обновляется само: при запуске проверяет последний релиз, скачивает новую веб-часть (`ThreadsBlocker-web.zip`, плагин [@capgo/capacitor-updater](https://github.com/Cap-go/capacitor-updater)) и применяет её при следующем запуске. Переустанавливать APK нужно только если изменилась нативная часть (новые плагины/разрешения).

Новый релиз собирается автоматически при создании тега: `git tag v1.0.3 && git push --tags`.

Сборка APK самому:

```bash
pnpm install        # или npm install
pnpm build          # собирает src/bundle.js (библиотека threads-api для браузера/webview)
pnpm exec cap sync
pnpm exec cap open android   # собрать APK в Android Studio
```

## Как устроено

- Вход и блокировка — через [threads-api](https://github.com/junhoyeo/threads-api); для браузера/webview она собирается в `src/bundle.js` (исходник — `lib/entry.js`).
- Браузер: `server.js` раздаёт `src/` и проксирует запросы на i.instagram.com (из страницы напрямую нельзя из-за CORS).
- Android: Capacitor, запросы идут нативно (`CapacitorHttp`), сессия хранится в `@capacitor/preferences`.
- Пауза между блокировками 500 мс; для списков больше 100 имён возможен временный rate-limit.
- Другой порт: `PORT=9000 node server.js`.

## Лицензия, конфиденциальность, ответственность

- **Лицензия:** [PolyForm Noncommercial 1.0.0](LICENSE). Исходный код открыт для чтения, использования и изменения **в некоммерческих целях**. Продавать приложение, распространять его платно или зарабатывать на нём без письменного разрешения автора нельзя. Бесплатное распространение допускается с сохранением [LICENSE](LICENSE). Это *source-available*, а не «open source» в смысле OSI. Коммерческая лицензия — по запросу через [Issues](https://github.com/infabls/ThreadsBlocker/issues).
- **Конфиденциальность:** автор не собирает никаких данных (ни паролей, ни аналитики); приложение работает напрямую с Instagram и не связано ни с каким сервером автора. Подробности — [PRIVACY.md](PRIVACY.md).
- **Без гарантий:** приложение предоставляется «как есть», неофициальное, использование на ваш страх и риск. Блокировка аккаунта или удаление не тех комментариев — ваша ответственность. Подробности — [DISCLAIMER.md](DISCLAIMER.md).
- Сторонние библиотеки и их лицензии — [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

*English: source-available under the PolyForm Noncommercial License 1.0.0 (no commercial use or paid distribution by others); no data collected; provided "as is" with no warranty — use at your own risk.*
