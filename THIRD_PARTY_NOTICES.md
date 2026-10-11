# Сторонние компоненты / Third-party notices

ThreadsBlocker использует сторонние библиотеки под их собственными лицензиями. Лицензия [LICENSE](LICENSE) (PolyForm Noncommercial) относится только к коду этого репозитория, но не к перечисленным ниже библиотекам.

*ThreadsBlocker uses third-party libraries under their own licenses. The [LICENSE](LICENSE) (PolyForm Noncommercial) covers only this repository's own code, not the libraries below.*

| Пакет / Package | Лицензия / License | Назначение / Purpose |
|---|---|---|
| [threads-api](https://github.com/junhoyeo/threads-api) | MIT | вход и запросы к Threads / login and Threads requests |
| [axios](https://github.com/axios/axios) | MIT | HTTP-клиент / HTTP client |
| [@capacitor/core, @capacitor/android, @capacitor/preferences](https://github.com/ionic-team/capacitor) | MIT | Android-оболочка и хранилище / Android shell and storage |
| [@capgo/capacitor-updater](https://github.com/Cap-go/capacitor-updater) | MPL-2.0 | автообновление веб-части / web-layer auto-update (используется без изменений / used unmodified) |
| uuid, mrmime, follow-redirects, form-data, debug, ms и др. | MIT | транзитивные зависимости / transitive dependencies |
| tslib | 0BSD | транзитивная зависимость / transitive dependency |

При сборке `src/bundle.js` дополнительно включаются полифиллы Node.js для браузера (например, `crypto-browserify` и связанные пакеты) под лицензиями MIT/BSD/ISC; полный список и тексты лицензий — в `pnpm-lock.yaml` и в репозиториях пакетов.

*The `src/bundle.js` build also embeds browser polyfills for Node.js builtins (e.g. `crypto-browserify` and related packages) under MIT/BSD/ISC licenses; see `pnpm-lock.yaml` and the packages' repositories for the full list and license texts.*

Тексты лицензий: MIT — <https://opensource.org/license/mit>, MPL-2.0 — <https://www.mozilla.org/MPL/2.0/>. Исходный код `@capgo/capacitor-updater` (MPL-2.0) доступен по ссылке выше.
