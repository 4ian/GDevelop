# Gorest Spritesheet Electron steps

The Gorest 2D Animation Spritesheet Generator source is tracked as a git
submodule at `ThirdParties/gorest-2d-animation-spritesheet-generator`.
Electron loads the compiled runtime artifact from
`newIDE/electron-app/app/external/gorest-spritesheet.asar`.

## Refresh upstream

Run from the GDevelop repository root:

```powershell
git submodule update --init --recursive ThirdParties/gorest-2d-animation-spritesheet-generator
git -C ThirdParties/gorest-2d-animation-spritesheet-generator pull --ff-only
git status --short
```

Commit the updated submodule gitlink in the GDevelop repository when the new
upstream revision should be used by the app.

## Rebuild the ASAR

```powershell
python scripts/build-third-party-asars.py --target gorest-spritesheet
```

This builds the Vite web bundle, stages only the compiled runtime files, and
packs `newIDE/electron-app/app/external/gorest-spritesheet.asar`. It does not
start a localhost server.

## Open in the editor

In the Resource Working Desk, open **Tools > Image**, choose
**Gorest Spritesheet**, and click **Open Gorest Spritesheet**.

The Electron wrapper serves the app through the secure `gorest-spritesheet://`
custom protocol. Local library data is stored under the Electron user data
folder, not in the project root.
