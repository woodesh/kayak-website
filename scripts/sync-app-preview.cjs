/* Assemble the website from complete, captured native-component markup.
 * No desktop bootstrap, React runtime, RPC transport or host services ship.
 */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const out=path.join(root,'app-preview');
const assetsOption=process.argv.indexOf('--desktop-assets');
if(assetsOption!==-1&&!process.argv[assetsOption+1])throw Error('--desktop-assets requires a directory');
const source=assetsOption===-1?null:path.resolve(process.argv[assetsOption+1]);
const provenance=JSON.parse(fs.readFileSync(path.join(out,'templates/provenance.json')));
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const esc=text=>text.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const styles=path.join(out,'styles');
fs.mkdirSync(styles,{recursive:true});
const manifest={appVersion:provenance.appVersion,method:provenance.method,viewport:provenance.viewport,
  behavior:'Left sidebar navigation and width resizing; composer accepts text; sending and other page actions are disabled.',
  runtime:'No desktop boot, RPC, Electron bridge, React or backend requests.',
  sources:provenance.sources,adaptations:provenance.adaptations,styles:[],templates:[]};
for(const file of provenance.styles){
  const bytes=fs.readFileSync(path.join(source??styles,file));
  if(source)fs.writeFileSync(path.join(styles,file),bytes);
  manifest.styles.push({file,sha256:sha(bytes),bytes:bytes.length});
  // Preserve assets used by the original stylesheet at its original relative URL.
  for(const match of bytes.toString().matchAll(/url\(["']?(?:\.\/)?([^"')]+)["']?\)/g)){
    const name=match[1];if(source&&path.basename(name)===name&&fs.existsSync(path.join(source,name)))fs.copyFileSync(path.join(source,name),path.join(styles,name));
  }
}
const pages=['task','schedule','extensions','new-task'];
const markup=Object.fromEntries(pages.map(page=>{
  const html=fs.readFileSync(path.join(out,'templates',page+'.html'),'utf8');
  if(/startup-loader|Kayak 遇到了问题|\[Truncated\]/.test(html))throw Error('Captured page was not ready or complete: '+page);
  manifest.templates.push({page,sha256:sha(html),bytes:Buffer.byteLength(html)});return [page,html];
}));
const attrs=provenance.rootAttrs.filter(([name])=>name!=='data-build').map(([name,value])=>`${name}="${esc(value)}"`).join(' ');
const links=provenance.styles.map(file=>`<link rel="stylesheet" href="styles/${file}">`).join('\n');
const nativeInline=provenance.inlineStyles.join('\n');
const html=`<!doctype html>\n<html ${attrs}>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Kayak 桌面应用预览</title>\n<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'none';">\n<style>@layer theme,base,components,utilities;html,body,#root{margin:0;width:100%;height:100%;background:#181818}${nativeInline}</style>\n${links}\n<link rel="stylesheet" href="window-chrome.css">\n<script defer src="preview.js"></script>\n</head>\n<body><div id="root">${markup.task}</div>\n<script type="application/json" id="preview-pages">${JSON.stringify(markup).replaceAll('<','\\u003c')}</script>\n</body>\n</html>\n`;
fs.writeFileSync(path.join(out,'index.html'),html);
fs.writeFileSync(path.join(out,'source-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(`Assembled ${pages.length} native views; ${manifest.styles.length} original stylesheets; zero desktop runtime.`);
