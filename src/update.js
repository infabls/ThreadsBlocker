// Автообновление веб-части приложения (@capgo/capacitor-updater) из GitHub Releases.
// Работает только в Android-приложении; в браузере ничего не делает.
(async () => {
  const REPO = 'infabls/ThreadsBlocker';
  const U = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorUpdater;
  if (!U) return;
  try { if (sessionStorage.getItem('upd')) return; sessionStorage.setItem('upd', '1'); } catch (e) {} // один раз за запуск
  try { await U.notifyAppReady(); } catch (e) {} // подтверждаем, что эта версия запустилась (иначе откат)

  const num = (v) => String(v).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const newer = (a, b) => { const x = num(a), y = num(b); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };
  const note = (text) => {
    const d = document.createElement('div');
    d.textContent = text;
    d.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;padding:10px 12px;border-radius:10px;background:#00e1ff;color:#000;font:14px system-ui;text-align:center;z-index:9';
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 6000);
  };

  try {
    const rel = await (await fetch(`https://api.github.com/repos/${REPO}/releases/latest`)).json();
    const latest = String(rel.tag_name || '').replace(/^v/, '');
    const asset = (rel.assets || []).find((a) => a.name === 'ThreadsBlocker-web.zip');
    if (!latest || !asset || !newer(latest, window.APP_VERSION || '0.0.0')) return;
    const bundle = await U.download({ url: asset.browser_download_url, version: latest });
    await U.next({ id: bundle.id }); // применится при следующем запуске, текущую работу не прерываем
    note(`Обновление ${latest} загружено — применится при следующем запуске`);
  } catch (e) { /* нет сети или лимит GitHub — попробуем в следующий раз */ }
})();
