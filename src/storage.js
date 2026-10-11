// Обёртка над @capacitor/preferences (в браузере — запасной вариант localStorage)
const Storage = (() => {
  const prefs = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences;
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
