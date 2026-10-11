// Обёртка над @capacitor/preferences (в браузере — запасной вариант localStorage)
const Storage = (() => {
  const prefs = () => {
    const c = window.Capacitor;
    if (!c || !(c.isNativePlatform && c.isNativePlatform())) return null;
    return (c.Plugins && c.Plugins.Preferences) || c.registerPlugin('Preferences');
  };
  return {
    async get(key) {
      const p = prefs();
      if (p) return (await p.get({ key })).value;
      return localStorage.getItem(key);
    },
    async set(key, value) {
      const p = prefs();
      if (p) return p.set({ key, value: String(value) });
      localStorage.setItem(key, value);
    },
    async clear() {
      const p = prefs();
      if (p) return p.clear();
      localStorage.clear();
    },
  };
})();
