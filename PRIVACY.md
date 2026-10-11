# Политика конфиденциальности / Privacy Policy

*Последнее обновление: 11 октября 2026 · Last updated: 11 October 2026*

## Кратко (RU)

**Автор не собирает никаких данных.** Ни паролей, ни логинов, ни токенов, ни списков аккаунтов, ни аналитики, ни статистики использования, ни отчётов об ошибках. У приложения нет серверов автора, регистрации и рекламы, и оно не обращается ни к каким серверам автора.

Приложение работает **напрямую между вашим устройством и Instagram/Threads** (Meta). Автор в этом обмене никак не участвует и не видит его.

### Что хранится на вашем устройстве

Только локально, в приватном хранилище приложения (на телефоне) или в `localStorage` браузера (в браузерной версии). Никуда не отправляется автору:

- токен сессии, идентификатор вашего аккаунта и случайный идентификатор устройства, созданный при входе;
- логин и пароль — **только если** на экране входа оставлена галочка «Запомнить на этом устройстве». Они нужны, чтобы приложение само входило заново, когда Instagram сбрасывает сессию. Они хранятся **в открытом виде** (не зашифрованы) в хранилище приложения. Снимите галочку, если не хотите их хранить.

Кнопка «Выйти из аккаунта» стирает всё перечисленное. Удаление приложения тоже. Списки юзернеймов, которые вы вставляете, нигде не сохраняются.

### Куда приложение обращается по сети

1. **Instagram / Threads (`i.instagram.com`, Meta)** — вход, поиск, блокировка, список заблокированных, удаление комментариев. Ваши логин и пароль уходят именно туда и только туда. Дальше действуют правила и политика конфиденциальности Meta.
2. **GitHub (`api.github.com` и `github.com`)** — только в Android-приложении, при запуске: проверка, вышла ли новая версия, и скачивание её файлов. GitHub, как любой сервер, видит IP-адрес и стандартные данные запроса (см. политику конфиденциальности GitHub). Никакие данные вашего аккаунта при этом не передаются.
3. В браузерной версии запросы к Instagram идут через маленький локальный сервер (`node server.js`) на вашем же компьютере (`localhost`). Он не отправляет данные никуда, кроме Instagram.

### Версии до 1.0.16

В Android-версиях **1.0.4–1.0.15** библиотека автообновления (`@capgo/capacitor-updater`) по умолчанию отправляла на серверы своего разработчика (Capgo, `plugin.capgo.app`) технические данные: случайный идентификатор устройства, идентификатор приложения, версию Android и сборки, признак эмулятора, источник установки и названия событий обновления. Логины, пароли, токены и данные аккаунта в них не входили. Начиная с версии **1.0.16** эта отправка отключена. Рекомендуется обновиться, установив новый APK.

### Дети, продажа данных, cookie

Автор не собирает данных, поэтому нечего ни продавать, ни передавать третьим лицам. Приложение не использует рекламные и аналитические cookie, трекеры и SDK.

### Изменения и связь

Если что-то изменится, это будет указано здесь. Вопросы — через [Issues](https://github.com/infabls/ThreadsBlocker/issues) репозитория.

---

## Summary (EN)

**The author collects no data.** No passwords, usernames, tokens, account lists, analytics, usage statistics or crash reports. There are no author-operated servers, no sign-up, no ads, and the app never contacts any server of the author.

The app talks **directly between your device and Instagram/Threads** (Meta). The author is not part of that traffic and cannot see it.

**Stored locally only** (app-private storage on Android, `localStorage` in the browser build): a session token, your account id and a random device id; and — only if "Remember on this device" is ticked — your username and password, stored **unencrypted** so the app can sign in again when Instagram expires the session. "Log out" erases all of it, as does uninstalling. Username lists you paste are never saved.

**Network:** (1) Instagram/Threads (`i.instagram.com`) — your credentials go there and only there; Meta's terms and privacy policy apply. (2) GitHub (`api.github.com`, `github.com`) — Android app only, on launch, to check for and download new versions; GitHub sees your IP address and standard request metadata, no account data is sent. (3) The browser build uses a local server on your own computer (`localhost`) that forwards requests only to Instagram.

**Versions before 1.0.16:** Android builds 1.0.4–1.0.15 included an update library that, by default, sent technical data (random device id, app id, Android/app version, emulator flag, install source, update event names) to its developer's servers (Capgo). It contained no credentials, tokens or account data. This is disabled from version **1.0.16**; please update by installing the new APK.

No data is sold or shared because none is collected. Questions: [GitHub Issues](https://github.com/infabls/ThreadsBlocker/issues).
