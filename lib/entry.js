// Точка входа для бандла: оборачивает threads-api в простой объект window.TB
import axios from 'axios';
import { ThreadsAPI } from 'threads-api';

const IG = 'https://i.instagram.com';
const native = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

// В браузере прямые запросы к Instagram запрещены CORS — идём через прокси server.js (/ig/*).
// В Android-приложении CapacitorHttp перехватывает XHR и шлёт запросы нативно.
if (!native) {
  axios.interceptors.request.use((cfg) => {
    if (cfg.url && cfg.url.startsWith(IG)) cfg.url = '/ig' + cfg.url.slice(IG.length);
    return cfg;
  });
}

// В Android делаем запросы такими же, как в работающей браузерной версии (там их шлёт прокси):
// без cookie (нативный слой иначе сам отправляет cookie из ответа на вход вместе с Bearer-токеном —
// Instagram на такое отвечает 400) и с тем же User-Agent.
if (native) {
  const cap = window.Capacitor;
  const Cookies = (cap.Plugins && cap.Plugins.CapacitorCookies) || cap.registerPlugin('CapacitorCookies');
  axios.interceptors.request.use(async (cfg) => {
    try { await Cookies.clearAllCookies(); } catch (e) { /* не критично */ }
    cfg.headers.set('User-Agent', 'Barcelona 289.0.0.77.109 Android');
    return cfg;
  });

  // GET-запросы подмена XHR в Capacitor НЕ отправляет нативно, а пускает через WebView
  // (с Origin: https://localhost и Chrome-User-Agent) — Instagram отвечает 400. Поэтому GET шлём
  // напрямую через нативный CapacitorHttp. POST оставляем на штатном пути (он работает).
  const Http = (cap.Plugins && cap.Plugins.CapacitorHttp) || cap.registerPlugin('CapacitorHttp');
  const xhrAdapter = axios.getAdapter(axios.defaults.adapter);
  axios.defaults.adapter = async (config) => {
    if ((config.method || 'get').toLowerCase() !== 'get') return xhrAdapter(config);
    const headers = {};
    const raw = config.headers && config.headers.toJSON ? config.headers.toJSON() : config.headers || {};
    for (const [k, v] of Object.entries(raw)) {
      if (v != null && typeof v !== 'object' && k.toLowerCase() !== 'content-type') headers[k] = String(v);
    }
    const r = await Http.request({ url: axios.getUri(config), method: 'GET', headers, responseType: 'json' });
    const resHeaders = {};
    for (const [k, v] of Object.entries(r.headers || {})) resHeaders[k.toLowerCase()] = v;
    const response = { data: r.data, status: r.status, statusText: String(r.status), headers: resHeaders, config, request: {} };
    const ok = config.validateStatus ? config.validateStatus(r.status) : r.status >= 200 && r.status < 300;
    if (ok) return response;
    throw new axios.AxiosError('Request failed with status code ' + r.status,
      r.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, response.request, response);
  };
}

export class AuthError extends Error {}

// Библиотека вырезает userID из ответа входа по фиксированной длине и ошибается на коротких id.
// Надёжный источник — сам токен: base64(JSON) с полем ds_user_id.
const userIdFromToken = (token) => {
  try {
    const j = JSON.parse(atob(token.replace(/-/g, '+').replace(/_/g, '/')));
    return j.ds_user_id ? String(j.ds_user_id) : '';
  } catch { return ''; }
};

const client = (s) =>
  new ThreadsAPI({ ...s, userID: userIdFromToken(s.token) || s.userID, noUpdateToken: true, noUpdateLSD: true, maxRetries: 1 });

const isAuthFail = (e) => e && e.response && (e.response.status === 401 || e.response.status === 403);

window.TB = {
  AuthError,

  // -> { token, userID, deviceID }
  async login(username, password) {
    const deviceID = 'android-' + Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => b.toString(16).padStart(2, '0')).join('');
    const api = client({ username, password, deviceID });
    let res;
    try {
      res = await api.login();
    } catch (e) {
      const msg = e && e.response && e.response.data && e.response.data.message;
      // показываем реальную причину, чтобы можно было разобраться (пароль в ответе не возвращается)
      const st = e && e.response && e.response.status;
      let body = e && e.response && e.response.data;
      if (body && typeof body !== 'string') body = JSON.stringify(body);
      const detail = [st && 'HTTP ' + st, e && e.message, body && String(body).slice(0, 200)].filter(Boolean).join(' | ');
      throw new Error((msg || 'Не удалось войти: неверный логин или пароль, либо Instagram требует подтвердить вход') + (detail ? ' [' + detail + ']' : ''));
    }
    if (!res || !res.token) throw new Error('Не удалось войти');
    return { token: res.token, userID: userIdFromToken(res.token) || res.userID || '', deviceID };
  },

  // -> userID строкой или null, если аккаунт не найден
  async findUserId(username, session) {
    try {
      const r = await client(session).searchUsers(username);
      const u = (r.users || []).find((x) => (x.username || '').toLowerCase() === username.toLowerCase());
      return u ? String(u.pk || u.pk_id || u.id) : null;
    } catch (e) {
      if (isAuthFail(e)) throw new AuthError();
      throw e;
    }
  },

  // Список аккаунтов, заблокированных у пользователя (в библиотеке такого метода нет) -> ['username', ...]
  async blockedList(session, onPage) {
    const api = client(session);
    const out = [];
    let maxId = '';
    for (let page = 0; page < 200; page++) {
      const url = IG + '/api/v1/users/blocked_list/' + (maxId ? '?max_id=' + encodeURIComponent(maxId) : '');
      let r;
      try {
        r = (await api._fetchAuthGetRequest(url)).data;
      } catch (e) {
        if (isAuthFail(e)) throw new AuthError();
        const body = e && e.response && e.response.data;
        throw new Error('Не удалось получить список' + (body ? ': ' + JSON.stringify(body).slice(0, 200) : ': ' + (e && e.message)));
      }
      const list = (r && (r.blocked_list || r.users)) || [];
      for (const u of list) if (u && u.username) out.push(u.username);
      if (onPage) onPage(out.length);
      maxId = (r && r.next_max_id) || '';
      if (!maxId || !list.length) break;
    }
    return out;
  },

  // -> true, если заблокирован
  async block(userId, session) {
    try {
      const r = await client(session).block(userId);
      return !!(r && (r === true || (r.friendship_status && r.friendship_status.blocking)));
    } catch (e) {
      if (isAuthFail(e)) throw new AuthError();
      throw e;
    }
  },
};
