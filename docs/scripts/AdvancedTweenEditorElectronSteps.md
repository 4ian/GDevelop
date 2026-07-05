# AdvancedTween Editor Electron Bundle Steps

This documents how to refresh `ThirdParties/AdvancedTweenEditor` and rebuild the
Electron ASAR artifact used by the Resources editor Animation tools tab.

## Refresh Upstream

```powershell
git submodule update --init --recursive ThirdParties/AdvancedTweenEditor
git -C ThirdParties/AdvancedTweenEditor pull --ff-only
```

## Rebuild ASAR

```powershell
python scripts/build-third-party-asars.py --target advanced-tween-editor
```

The packaged artifact is:

```text
newIDE/electron-app/app/external/advanced-tween-editor.asar
```

The Electron wrapper serves the static bundle from the ASAR and bridges JSON
and `.atproj` animation files to the current project's
`assets/animations` folder.
