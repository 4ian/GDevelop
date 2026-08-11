# Third-party Submodules

This repository tracks external tool source checkouts as git submodules under
`ThirdParties/`.

Current submodules:

- `ThirdParties/ai_game_workbench`:
  `https://github.com/zhouzhipeng/ai_game_workbench.git`
- `ThirdParties/image-extender`:
  `https://github.com/zhouzhipeng/image-extender.git`
- `ThirdParties/gorest-2d-animation-spritesheet-generator`:
  `https://github.com/zhouzhipeng/gorest-2d-animation-spritesheet-generator.git`
- `ThirdParties/AdvancedTweenEditor`:
  `https://github.com/zhouzhipeng/AdvancedTweenEditor.git`

## Initialize

After cloning GDevelop, run from the repository root:

```powershell
git submodule update --init --recursive
```

## Refresh

To pull the latest upstream commits into the local submodule checkouts:

```powershell
git -C ThirdParties/ai_game_workbench pull --ff-only
git -C ThirdParties/image-extender pull --ff-only
git -C ThirdParties/gorest-2d-animation-spritesheet-generator pull --ff-only
git -C ThirdParties/AdvancedTweenEditor pull --ff-only
git status --short
```

Commit the changed submodule gitlink entries in the GDevelop repository when
the updated upstream revisions should be used by everyone.

## Modify

Make source changes inside the submodule repository, commit and push them there,
then stage the updated submodule pointer in GDevelop:

```powershell
git -C ThirdParties/ai_game_workbench status --short
git -C ThirdParties/ai_game_workbench add .
git -C ThirdParties/ai_game_workbench commit -m "Update workbench integration"
git -C ThirdParties/ai_game_workbench push

git add ThirdParties/ai_game_workbench
git status --short
```

Use the same flow for `ThirdParties/image-extender`,
`ThirdParties/gorest-2d-animation-spritesheet-generator`, and
`ThirdParties/AdvancedTweenEditor`.

## Packaging

The Electron app still ships compiled runtime artifacts from
`newIDE/electron-app/app/external/`. Do not point Electron at the submodule
source tree at runtime, and do not commit generated staging folders,
`node_modules`, or expanded ASAR folders.
