The preview uses complete markup rendered by the actual Kayak 0.19.1 desktop components, plus their original CSS, theme tokens, SVG glyphs and plugin images. It contains task, new task, scheduled-task and extension views. The source bundles and capture hashes are recorded in `templates/provenance.json` and `source-manifest.json`.

The public plugin catalog retains only Tencent Docs, WeCom, Feishu, Jimeng, Remotion and HyperFrames by HeyGen. Their original card markup is preserved; all other cards and their unused icon assets are removed. Neutral, static placeholder rows represent additional extensions and reuse the native catalog grid, icon size, typography and action dimensions.

`window-chrome.css` sets the native `--codex-window-zoom` token to `1.4`, enlarging text, icons and spacing together in every view. The window decoration and sidebar drag calculations use the same scale.

The sidebar reuses native project and conversation rows for fictional office examples. Only the first two conversations, 准备产品发布 and 调研市场与竞品, open content. Other project and recent rows are display-only. The product-release conversation retains its checklist and includes a second native conversation turn with a generated workshop poster; its original scroll container allows reviewing both turns. Captured animation heights are cleared when adding rows or turns so content cannot overlap. The poster and its built-in image-generation prompt are recorded in `image-generation.json`.

Only the main left-sidebar navigation changes views. Its original divider also supports width resizing (native limits: 240–520px). The composer accepts local text. Sending, model selection, installations and other page actions are disabled. No React runtime, desktop bootstrap, Electron bridge, RPC transport, login, profile access or backend request is shipped. All four views are embedded in the HTML, so there is no loading screen or route fetch.

Rebuild the public HTML using the captured local styles with:

```sh
npm run sync:preview
```

The templates are captures of the real components with the catalog curation described above. When the desktop UI changes, regenerate the affected view from the desktop renderer with demonstration data, apply the catalog allowlist, compare it with the real app, and replace that template before rebuilding. Keep the complete SVG attributes and stylesheet order. Added visual elements are the neutral catalog placeholders and macOS traffic-light decoration, which normally belongs to the native window rather than React.

The standalone build reads the stylesheet copies already in `styles/`. Refreshing from a desktop checkout is optional: run `npm run sync:preview -- --desktop-assets /absolute/path/to/desktop/webview/assets`. That refresh is not needed to develop, build or serve this website.
