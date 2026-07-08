import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const DIST_DIR = process.env.STATIC_DIR || './frontend/dist';
const PORT = process.env.STATIC_PORT || 9080;
const BACKEND_PORT = process.env.PORT || 8090;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// The built frontend calls relative /api/* URLs, which land on this same
// port (9080). Proxy those through to the backend's Express server running
// on BACKEND_PORT inside the same container, instead of falling through to
// the static-file/index.html handling below.
function proxyToBackend(req, res) {
  const proxyReq = http.request(
    {
      hostname: 'localhost',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: req.headers,
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    }
  );
  proxyReq.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend unavailable' }));
  });
  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    proxyToBackend(req, res);
    return;
  }

  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = join(DIST_DIR, urlPath);

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(DIST_DIR, 'index.html');
  }

  const ext = extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`MediDash frontend listening on port ${PORT}`);
});
