// Автообновление веб-части приложения (@capgo/capacitor-updater) из GitHub Releases.
// Работает только в Android-приложении; в браузере ничего не делает.
// Подключать только на страницах, где пользователь остаётся (не на редиректящем index.html):
// при переходе на другую страницу незавершённая загрузка теряется.
(async () => {
  const REPO = 'infabls/ThreadsBlocker';
  const cap = window.Capacitor;
  if (!cap || !(cap.isNativePlatform && cap.isNativePlatform())) return;
  const U = (cap.Plugins && cap.Plugins.CapacitorUpdater) || cap.registerPlugin('CapacitorUpdater');

  const num = (v) => String(v).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const newer = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };
  const note = (text, ms = 6000) => {
    const d = document.createElement('div');
    d.textContent = text;
    d.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;padding:10px 12px;border-radius:10px;background:#00e1ff;color:#000;font:14px system-ui;text-align:center;z-index:9';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), ms);
  };

  try { await U.notifyAppReady(); } catch (e) {} // подтверждаем, что эта версия запустилась (иначе откат)

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`);
    if (!res.ok) throw new Error('GitHub HTTP ' + res.status);
    const rel = await res.json();
    const latest = String(rel.tag_name || '').replace(/^v/, '');
    const asset = (rel.assets || []).find((a) => a.name === 'ThreadsBlocker-web.zip');
    if (!latest || !asset || !newer(latest, window.APP_VERSION || '0.0.0')) return;

    note(`Загружаю обновление ${latest}…`, 4000);
    const bundle = await U.download({ url: asset.browser_download_url, version: latest });
    if (window.__busy) {                       // идёт блокировка — применим при следующем запуске
      await U.next({ id: bundle.id });
      note(`Обновление ${latest} загружено — применится при следующем запуске`);
    } else {
      note(`Обновление ${latest} — перезапуск…`, 2000);
      await U.set({ id: bundle.id });          // перезагружает приложение уже с новой версией
    }
  } catch (e) {
    note('Не удалось обновиться: ' + (e && e.message ? e.message : e), 10000);
  }
})();
