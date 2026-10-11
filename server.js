// node server.js -> открывает ThreadsBlocker в браузере.
// Раздаёт src/ и проксирует /ig/* на i.instagram.com (из браузера напрямую нельзя: CORS, User-Agent).
// Только стандартная библиотека Node, устанавливать ничего не нужно. Всё работает локально.
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = Number(process.env.PORT) || 8080;
const SRC = path.join(__dirname, 'src');
const UPSTREAM = 'https://i.instagram.com';
const UA = 'Barcelona 289.0.0.77.109 Android';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const SKIP = new Set(['host', 'connection', 'content-length', 'origin', 'referer', 'accept-encoding', 'cookie',
  'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'sec-fetch-user', 'sec-ch-ua', 'sec-ch-ua-mobile', 'sec-ch-ua-platform']);

async function proxy(req, res) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;
  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) if (!SKIP.has(k)) headers[k] = v;
  headers['user-agent'] = UA; // браузер свой User-Agent подменить не может
  // браузер не даёт JS ставить Sec-Fetch-Site, а Instagram его проверяет (только для qe/sync)
  if (req.url.includes('/qe/sync/')) headers['sec-fetch-site'] = 'same-origin';
  // https.request (а не fetch): fetch сам добавляет Sec-Fetch-Mode, и Instagram отвечает "SecFetch Policy violation"
  const up = https.request(UPSTREAM + req.url.slice('/ig'.length), { method: req.method, headers }, (r) => {
    // заголовки ответа нужны библиотеке (ключ шифрования пароля приходит в ig-set-password-encryption-*)
    const out = {};
    for (const [k, v] of Object.entries(r.headers)) {
      if (!['content-length', 'content-encoding', 'transfer-encoding', 'connection', 'set-cookie'].includes(k)) out[k] = v;
    }
    res.writeHead(r.statusCode, out);
    r.pipe(res);
  });
  up.on('error', (e) => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ message: 'Нет связи с Instagram: ' + e.message }));
  });
  up.end(body);
}

http.createServer((req, res) => {
  if (req.url.startsWith('/ig/')) return proxy(req, res);
  const name = req.url.split('?')[0] === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(SRC, path.normalize(name));
  if (!file.startsWith(SRC) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); return res.end('Not found');
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log(`ThreadsBlocker запущен: ${url}  (Ctrl+C — остановить)`);
  const open = process.platform === 'win32' ? `start "" ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
  exec(open, () => {});
});
