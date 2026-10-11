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

// В Android не полагаемся на подмену XHR в Capacitor: отдаём axios свой адаптер, который
// вызывает нативный CapacitorHttp напрямую и сам решает, какие заголовки и тело уходят.
if (native) {
  const Http = window.Capacitor.Plugins.CapacitorHttp || window.Capacitor.registerPlugin('CapacitorHttp');
  axios.defaults.adapter = async (config) => {
    const url = axios.getUri(config);
    const method = (config.method || 'get').toUpperCase();
    const headers = {};
    const raw = config.headers && config.headers.toJSON ? config.headers.toJSON() : config.headers || {};
    for (const [k, v] of Object.entries(raw)) if (v != null && typeof v !== 'object') headers[k] = String(v);
    const hasBody = config.data != null && method !== 'GET' && method !== 'HEAD';
    if (!hasBody) for (const k of Object.keys(headers)) if (k.toLowerCase() === 'content-type') delete headers[k];
    // нативный слой для form-urlencoded ждёт объект, а не готовую строку (иначе тело уходит пустым)
    const isForm = Object.entries(headers).some(([k, v]) => k.toLowerCase() === 'content-type' && /x-www-form-urlencoded/i.test(v));
    let data;
    if (hasBody) data = isForm ? Object.fromEntries(new URLSearchParams(String(config.data))) : String(config.data);
    const r = await Http.request({
      url, method, headers, data,
      responseType: config.responseType === 'text' ? 'text' : 'json',
      readTimeout: 30000, connectTimeout: 30000,
    });
    const resHeaders = {};
    for (const [k, v] of Object.entries(r.headers || {})) resHeaders[k.toLowerCase()] = v;
    const response = { data: r.data, status: r.status, statusText: String(r.status), headers: resHeaders, config, request: {} };
    const ok = config.validateStatus ? config.validateStatus(r.status) : r.status >= 200 && r.status < 300;
    if (ok) return response;
    throw new axios.AxiosError('Request failed with status code ' + r.status, r.status >= 500 ? 'ERR_BAD_RESPONSE' : 'ERR_BAD_REQUEST', config, response.request, response);
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
      throw new Error(msg || 'Не удалось войти: неверный логин или пароль, либо Instagram требует подтвердить вход (проверьте уведомления в приложении Instagram/Threads)');
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
