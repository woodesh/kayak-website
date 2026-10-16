# Kayak website

Standalone static product website with a four-view Kayak desktop demonstration. The repository contains the current homepage, styles, fonts, illustrations and silent hero video. It does not require the desktop repository, Electron, a desktop runtime, an account backend or installer files.

## Develop and build

Use Node.js 20 or newer. There are no third-party npm dependencies.

```sh
npm ci
npm run dev
```

Open http://localhost:3333/. To use another port, run `PORT=3334 npm run dev`. The server binds to `127.0.0.1` by default; set `HOST` explicitly when another binding is needed.

```sh
npm run build
npm test
npm run preview
```

`npm run build` assembles the preview from the committed markup and local styles, validates local resource references, and copies only runtime dependencies to `dist/`. It does not fetch desktop files or external assets. `npm run preview` and `npm start` serve that build on the same default port. Edit source files and refresh the browser when using the development server.

For a static host, use `npm run build` as the build command and `dist` as the output directory. Publishing, domain binding and DNS changes are separate operations; these commands only build or serve locally. Installer links point to the existing external release service and are configured in `js/main.js`; no DMG or EXE is stored here.

## Website and demo sources

- `index.html`, `css/` and `js/` preserve the current homepage design and local interactions.
- `assets/` contains the resources used by that homepage. Brand, feature-image and stylesheet provenance records are retained beside the relevant assets.
- `app-preview/` contains complete captured native markup, original stylesheet copies, fonts and local interaction code. The task, new-task, scheduled-task and extension views demonstrate the UI; sending, model selection, installation and other product actions are disabled. There is no desktop bootstrap, React runtime, Electron bridge, RPC transport, login or backend request.
- `scripts/` contains dependency-free assembly, build and preview utilities; `tests/` checks the actual runtime resource graph and local HTTP responses.

The homepage adapts HTML and compiled CSS originally captured from Linear on 2026-10-15. The hero video is a silent 15-second montage of supplied film footage, with its existing grayscale treatment, fades and edge mask. Reference assets remain subject to their respective owners' terms and licenses. Source records are retained in `assets/linear/source-manifest.json`, `assets/fonts/guide-provenance.json` and the other provenance manifests.

Old design snapshots, downloaded reference HTML, QA screenshots and unused imagery are not part of this standalone repository. The extraction retained an external recoverable archive; see `docs/extraction.md` for the source snapshot context.

## Optional desktop preview refresh

Normal builds use `app-preview/styles/` and do not read a desktop checkout. To deliberately refresh the native stylesheet capture, supply an explicit source directory:

```sh
npm run sync:preview -- --desktop-assets /absolute/path/to/desktop/webview/assets
npm run build
```

The expected stylesheet names come from `app-preview/templates/provenance.json`. Changing the desktop UI still requires fresh demonstration markup and comparison with the app; this command does not invent or recapture UI. See `app-preview/README.md`.
