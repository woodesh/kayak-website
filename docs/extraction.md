# Standalone extraction

The current working-tree website was extracted from CodexDesktop-Rebuild at base commit `1d8e5b038e4da1703d308ca6101e64ca14c80e07` on 2026-10-16, including the website's uncommitted design changes. This is a static frontend; no desktop binaries, installers, runtime, credentials or account backend are included.

The homepage, its local dependencies, and the complete four-view demo captures are preserved. Old design snapshots, QA screenshots, downloaded source HTML and unused generated imagery were excluded from this repository. Their original bytes remain in the source checkout and a separate full website archive outside both repositories.

The existing source-provenance manifests describe where captured markup, original styles, brand assets and the hero montage came from. They are records, not build dependencies. See `README.md` for standalone build and optional desktop-style refresh instructions.
