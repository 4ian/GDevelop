# Third-party Submodules

This repository tracks external tool source checkouts as git submodules under
`thirdParties/`.

Current submodules:

- `thirdParties/ai_game_workbench`:
  `https://github.com/zhouzhipeng/ai_game_workbench.git`
- `thirdParties/image-extender`:
  `https://github.com/zhouzhipeng/image-extender.git`
- `thirdParties/gorest-2d-animation-spritesheet-generator`:
  `https://github.com/zhouzhipeng/gorest-2d-animation-spritesheet-generator.git`

## Initialize

After cloning GDevelop, run from the repository root:

```powershell
git submodule update --init --recursive
```

## Refresh

To pull the latest upstream commits into the local submodule checkouts:

```powershell
git -C thirdParties/ai_game_workbench pull --ff-only
git -C thirdParties/image-extender pull --ff-only
git -C thirdParties/gorest-2d-animation-spritesheet-generator pull --ff-only
git status --short
```

Commit the changed submodule gitlink entries in the GDevelop repository when
the updated upstream revisions should be used by everyone.

## Modify

Make source changes inside the submodule repository, commit and push them there,
then stage the updated submodule pointer in GDevelop:

```powershell
git -C thirdParties/ai_game_workbench status --short
git -C thirdParties/ai_game_workbench add .
git -C thirdParties/ai_game_workbench commit -m "Update workbench integration"
git -C thirdParties/ai_game_workbench push

git add thirdParties/ai_game_workbench
git status --short
```

Use the same flow for `thirdParties/image-extender` and
`thirdParties/gorest-2d-animation-spritesheet-generator`.

## Packaging

The Electron app still ships compiled runtime artifacts from
`newIDE/electron-app/app/external/`. Do not point Electron at the submodule
source tree at runtime, and do not commit generated staging folders,
`node_modules`, or expanded ASAR folders.
