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
