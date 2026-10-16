const fs = require('node:fs');
const path = require('node:path');
const { collectAssets } = require('./asset-graph.cjs');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
const files = collectAssets(root);
fs.rmSync(output, { recursive: true, force: true });
let bytes = 0;
for (const relative of files) {
  const source = path.join(root, relative);
  const target = path.join(output, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  bytes += fs.statSync(source).size;
}
console.log(`Built ${files.length} runtime files (${bytes} bytes) into dist/.`);
