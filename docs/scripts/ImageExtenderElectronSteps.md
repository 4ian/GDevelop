# Image Extender Electron Bundle Steps

This documents how to refresh `ThirdParties/image-extender` and rebuild the
Electron-bundled executable artifact used by the Resource Working Desk.

The integration must keep runtime source out of GDevelop's Electron app:

- Keep the upstream source checkout only in the `ThirdParties/image-extender`
  git submodule.
- Do not start a localhost server or reserve any TCP port.
- Ship only the compiled ASAR artifact:
  `newIDE/electron-app/app/external/image-extender.asar`.
- The `Local GPT Image` model is implemented inside the compiled API routes. It
  shells out to the local Codex image generator with `--image` inputs and does
  not require a Gemini API key.

## Preferred Build Script

Run the cross-platform Python builder from the GDevelop repository root:

```bash
python scripts/build-third-party-asars.py --target image-extender
```

Use `--pull` to update the submodule first. The manual commands below are kept
as implementation notes for debugging the build process.

## 1. Refresh Upstream

Run from the GDevelop repository root in PowerShell:

```powershell
git submodule update --init --recursive ThirdParties/image-extender
$upstream = (Resolve-Path "ThirdParties\image-extender").Path
git -C $upstream pull --ff-only
git -C $upstream log -1 --oneline
```

## 2. Build A Standalone Next Bundle

The Electron integration reads prerendered HTML/static chunks and invokes the
compiled API route modules directly through a custom Electron protocol. Next must
emit a standalone build so traced runtime dependencies are available for ASAR
packing.

Patch only the submodule checkout:

```powershell
Push-Location $upstream
node -e "const fs=require('fs'); const p='next.config.js'; let s=fs.readFileSync(p,'utf8'); if (!s.includes(\"output: 'standalone'\")) { s=s.replace('reactStrictMode: true,', \"reactStrictMode: true,\n  output: 'standalone',\"); fs.writeFileSync(p,s); }"
npm install
npm run build
Pop-Location
```

## 3. Stage Compiled Runtime Files

Create a temporary staging folder with only built output and runtime files:

```powershell
$staging = Join-Path $env:TEMP "image-extender-electron"
if (Test-Path -LiteralPath $staging) {
  Remove-Item -LiteralPath $staging -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $staging | Out-Null

Copy-Item -LiteralPath "$upstream\.next\standalone\package.json" -Destination $staging -Force
Copy-Item -LiteralPath "$upstream\.next\standalone\node_modules" -Destination $staging -Recurse -Force
Copy-Item -LiteralPath "$upstream\.next\standalone\.next" -Destination $staging -Recurse -Force
Copy-Item -LiteralPath "$upstream\.next\static" -Destination "$staging\.next" -Recurse -Force
Copy-Item -LiteralPath "$upstream\LICENSE" -Destination "$staging\LICENSE" -Force
Copy-Item -LiteralPath "$upstream\README.md" -Destination "$staging\README.md" -Force

Remove-Item -LiteralPath "$staging\server.js" -Force -ErrorAction SilentlyContinue
```

## 4. Pack The ASAR

Make sure Electron dependencies are installed once:

```powershell
cd newIDE\electron-app
npm install
cd ..\..
```

Pack the staged runtime:

```powershell
$asarPath = "newIDE\electron-app\app\external\image-extender.asar"
New-Item -ItemType Directory -Force -Path (Split-Path $asarPath) | Out-Null
if (Test-Path -LiteralPath $asarPath) {
  Remove-Item -LiteralPath $asarPath -Force
}
.\newIDE\electron-app\node_modules\.bin\asar.cmd pack $staging $asarPath
```

If Windows reports that `image-extender.asar` is in use, close any open Image
Extender window and rerun the pack command. The app can hold the ASAR open while
the custom protocol is serving files.

Do not commit `$staging` or an expanded
`newIDE/electron-app/app/external/image-extender/` folder. Commit the
`ThirdParties/image-extender` submodule pointer only after the upstream changes
are committed in that submodule.

## 5. Verify

Run these checks from the GDevelop repository root:

```powershell
node -c newIDE\electron-app\app\ImageExtenderWindow.js
node -c newIDE\electron-app\app\main.js

$env:ELECTRON_RUN_AS_NODE='1'
.\newIDE\electron-app\node_modules\.bin\electron.cmd -e "const path = require('path'); const route = require(path.resolve('newIDE/electron-app/app/external/image-extender.asar/.next/server/app/api/extend/route.js')); console.log(typeof route.routeModule.userland.POST);"
Remove-Item Env:\ELECTRON_RUN_AS_NODE

cd newIDE\app
$env:CI='true'
npm test -- --runInBand --watchAll=false src/ResourcesEditor/ToolsPanel.spec.js
Remove-Item Env:\CI
cd ..\..
```

Expected results:

- The Electron-as-Node smoke check prints `function`.
- The focused `ToolsPanel.spec.js` suite passes.
- `git status --short` shows the ASAR file, not upstream source files.
