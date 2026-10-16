const fs = require('node:fs');
const path = require('node:path');

function references(text) {
  const urls = [...text.matchAll(/(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  urls.push(...[...text.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/gi)].map(m => m[1]));
  const embedded = text.match(/<script\b(?=[^>]*\bid=["']preview-pages["'])[^>]*>([\s\S]*?)<\/script>/i);
  if (embedded) {
    for (const html of Object.values(JSON.parse(embedded[1]))) urls.push(...references(html));
  }
  return urls;
}

function collectAssets(root) {
  root = path.resolve(root);
  const files = new Set(['index.html']);
  const queue = ['index.html'];
  while (queue.length) {
    const relative = queue.pop();
    const file = path.join(root, relative);
    const text = fs.readFileSync(file, 'utf8');
    for (const raw of references(text)) {
      if (/^(?:[a-z][\w+.-]*:|\/\/|#)/i.test(raw) || decodeURIComponent(raw).startsWith('#')) continue;
      const parsed = new URL(raw, `https://local.invalid/${relative}`);
      const decoded = decodeURIComponent(parsed.pathname);
      // Captured SVG masks use encoded fragment-only references.
      if (/^\/#/.test(decoded)) continue;
      let candidate = path.resolve(root, '.' + decoded);
      if (!candidate.startsWith(root + path.sep) && candidate !== root) throw Error(`Asset leaves project: ${relative}`);
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) candidate = path.join(candidate, 'index.html');
      if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) throw Error(`Missing local asset in ${relative}: ${raw}`);
      if (!fs.realpathSync(candidate).startsWith(root + path.sep)) throw Error(`Asset symlink leaves project: ${raw}`);
      const child = path.relative(root, candidate).split(path.sep).join('/');
      if (files.has(child)) continue;
      files.add(child);
      if (/\.(?:html|css|js|svg)$/i.test(child)) queue.push(child);
    }
  }
  return [...files].sort();
}

module.exports = { collectAssets };
