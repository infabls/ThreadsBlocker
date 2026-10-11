<p align="center">
  <a href="https://github.com/infabls/ThreadsBlocker/releases/latest/download/ThreadsBlocker.apk">
    <img src="https://img.shields.io/badge/%E2%AC%87%20%D0%A1%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C%20APK-00E1FF?style=for-the-badge&logo=android&logoColor=black" alt="Скачать APK" height="56">
  </a>
</p>

<p align="center">
  <img src="assets/banner.webp" alt="ThreadsBlocker" width="100%">
</p>

# ThreadsBlocker

Приложение для Threads: массовая блокировка ботов и спамеров по списку юзернеймов, список заблокированных и удаление ваших комментариев на чужих постах.

## Что умеет

- **Массовая блокировка:** вставьте юзернеймы (по одному на строку) или загрузите `.txt` — приложение заблокирует всех по очереди и покажет результат по каждому.
- **Список заблокированных:** все аккаунты, которые вы заблокировали, одним списком, который можно скопировать.
- **Удаление ваших комментариев на чужих постах:** сначала поиск и просмотр списка, потом удаление выбранных. Ответы в ветках, где корневой пост ваш, не затрагиваются.
- **Вход запоминается:** не нужно вводить пароль заново. Приложение обновляется само.

## Установка на Android

1. Нажмите **«Скачать APK»** вверху страницы.
2. Откройте скачанный файл. При запросе разрешите установку из неизвестных источников.
3. Запустите приложение и войдите в свой аккаунт.

Новые версии приложение подтягивает само при запуске. Все версии — в [Releases](https://github.com/infabls/ThreadsBlocker/releases).

## Версия для компьютера

Нужен [Node.js](https://nodejs.org):

```bash
git clone https://github.com/infabls/ThreadsBlocker.git
cd ThreadsBlocker
node server.js
```

Откроется страница в браузере с теми же функциями.

## Лицензия, конфиденциальность, ответственность

- **Конфиденциальность:** автор не собирает никаких данных — ни паролей, ни аналитики. Приложение работает напрямую с Instagram и не связано ни с каким сервером автора. Подробнее — [PRIVACY.md](PRIVACY.md).
- **Без гарантий:** приложение неофициальное и предоставляется «как есть»; вы используете его на свой страх и риск. Если аккаунт ограничат или будут удалены не те комментарии — это ваша ответственность. Подробнее — [DISCLAIMER.md](DISCLAIMER.md).
- **Лицензия:** [PolyForm Noncommercial 1.0.0](LICENSE) — использовать и изменять можно в некоммерческих целях; продавать и распространять платно без разрешения автора нельзя. Сторонние компоненты — [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

*English: unofficial Threads helper app for Android. Source-available under the PolyForm Noncommercial License 1.0.0 (no commercial use or paid distribution by others). No data is collected; provided "as is" with no warranty — use at your own risk.*
