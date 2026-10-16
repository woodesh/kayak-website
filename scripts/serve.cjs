const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf'
};

function createServer(root) {
  root = fs.realpathSync(root);
  return http.createServer((req, res) => {
    const fail = (code, message) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(message); };
    if (!['GET', 'HEAD'].includes(req.method)) return fail(405, 'Method Not Allowed');
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { return fail(400, 'Bad Request'); }
    if (pathname.includes('\0') || pathname.includes('\\')) return fail(400, 'Bad Request');
    if (pathname.split('/').some(part => part.startsWith('.'))) return fail(403, 'Forbidden');
    const relative = pathname.replace(/^\/+/, '');
    // Serve only website entries and assets, never repository/config files.
    if (relative && relative !== 'index.html' && !/^(?:assets|css|js|app-preview)(?:\/|$)/.test(relative)) return fail(404, 'Not Found');
    let file = path.resolve(root, relative || 'index.html');
    if (!file.startsWith(root + path.sep)) return fail(403, 'Forbidden');
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.statSync(file).isFile() || !fs.realpathSync(file).startsWith(root + path.sep)) return fail(404, 'Not Found');
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      if (req.method === 'HEAD') return res.end();
      fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
    } catch { fail(404, 'Not Found'); }
  });
}

if (require.main === module) {
  const flag = process.argv.indexOf('--dir');
  const root = path.resolve(__dirname, '..', flag === -1 ? '.' : process.argv[flag + 1] || 'dist');
  if (!fs.existsSync(path.join(root, 'index.html'))) throw Error('No website build found. Run npm run build first.');
  const port = Number(process.env.PORT || 3333);
  const host = process.env.HOST || '127.0.0.1';
  const server = createServer(root);
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, host, () => console.log(`Kayak website: http://${host}:${port}/ (${root})`));
}
module.exports = { createServer };
