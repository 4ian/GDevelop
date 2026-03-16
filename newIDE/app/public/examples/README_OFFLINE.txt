Offline Examples Guide
======================

Place each example template in its own folder under:
  newIDE/app/public/examples/<template-folder>

Each folder must include:
  - game.json (preferred) or any single .json project file at the folder root
  - preview.jpg, preview.png, thumbnail.jpg, or thumbnail.png (optional, but recommended)

To rebuild the examples index (examples.json), run:
  node newIDE/app/scripts/build-local-examples-index.js

Notes:
- The example id/slug is always the folder name.
- Templates with slug "3d-first-person" or "first-person" are excluded.
