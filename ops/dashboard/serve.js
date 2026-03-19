const http = require('node:http');
const path = require('node:path');
const { ensureState, renderHtml, readJson, statePath } = require('./dashboard-lib');

const host = process.env.DASHBOARD_HOST || '127.0.0.1';
const port = Number(process.env.DASHBOARD_PORT || 4173);

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || host}`);
  const state = ensureState();

  if (url.pathname === '/api/state') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(state, null, 2));
  }

  if (url.pathname === '/api/state-path') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify({ path: statePath }, null, 2));
  }

  if (url.pathname === '/api/seed') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(readJson(path.join(__dirname, 'seed-state.json')), null, 2));
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    return res.end(renderHtml(state));
  }

  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, host, () => {
  process.stdout.write(`CardWise dashboard running at http://${host}:${port}\n`);
  process.stdout.write(`State file: ${statePath}\n`);
});
