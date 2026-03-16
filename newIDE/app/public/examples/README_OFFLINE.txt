Offline Examples Guide
======================

Place each example template in its own folder under:
  newIDE/app/public/examples/<template-folder>

Each folder must include:
  - game.json
  - preview.jpg or preview.png (optional, but recommended)

To rebuild the examples index (examples.json), run:
  node newIDE/app/scripts/build-local-examples-index.js

Notes:
- The template slug is taken from game.json "properties.templateSlug" if present,
  otherwise the folder name is used.
- Templates with slug "3d-first-person" or "first-person" are excluded.
