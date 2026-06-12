# AI Game Workbench Electron Bundle Steps

This documents how to refresh `zhouzhipeng/ai_game_workbench` and rebuild the
Electron-bundled executable artifact used by the Resource Working Desk.

The integration must stay source-free in GDevelop:

- Do not copy the upstream source tree into this repository.
- Do not start a localhost server or reserve any TCP port.
- Ship the compiled ASAR artifact and native runtime sidecar:
  `newIDE/electron-app/app/external/ai-game-workbench.asar`
  `newIDE/electron-app/app/external/ai-game-workbench.asar.unpacked`

## 1. Refresh Upstream

Run from the GDevelop repository root in PowerShell:

```powershell
$upstream = Join-Path $env:TEMP "ai-game-workbench-src"
if (Test-Path -LiteralPath $upstream) {
  git -C $upstream pull --ff-only
} else {
  git clone https://github.com/zhouzhipeng/ai_game_workbench.git $upstream
}
git -C $upstream log -1 --oneline
```

## 2. Apply Electron Compatibility Patch

The Electron integration serves the web UI and API from the same custom
protocol, so the web build must not hard-code `127.0.0.1`. The server bundle
also receives a direct Electron-packaged `ffmpeg.exe` path, so it must not
import `ffmpeg-static`.

Video generation also needs one Electron-specific compatibility change:

- Keep OpenRouter video inputs on public HTTPS URLs.
- For APIMart video inputs, allow local workbench asset URLs such as
  `/characters/...`, `/assets/...`, and `/jobs/...`.
- In `apps/server/src/routes/generation.ts`, upload those local APIMart images
  to `POST {APIMart baseUrl}/uploads/images` before calling the video
  generation endpoint, then pass the returned URL.
- In `apps/web/src/components/SpriteAnimator.tsx`, replace the public-HTTPS-only
  video input guard with a model-aware guard: HTTPS is accepted for every
  provider, and local workbench asset URLs are accepted for `apimart/*` models.

Patch only the temporary upstream checkout:

```powershell
Push-Location $upstream
(Get-Content apps\web\src\api\client.ts -Raw).Replace(
  'export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8787";',
  'export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";'
) | Set-Content apps\web\src\api\client.ts -Encoding utf8
(Get-Content apps\server\src\config.ts -Raw).Replace(
  'import ffmpegStaticPath from "ffmpeg-static";',
  ''
).Replace(
  'return ffmpegStaticPath ?? "ffmpeg";',
  'return "ffmpeg";'
) | Set-Content apps\server\src\config.ts -Encoding utf8
Pop-Location
```

## 3. Build Upstream

```powershell
Push-Location $upstream
npm install
npm run build
Pop-Location
```

## 4. Stage Compiled Runtime Files

The server TypeScript output is bundled into a single executable JS entry so
Electron can load it directly from the ASAR. Runtime npm dependencies are
bundled where possible; only `sharp` and native executable files are left as
external runtime files. Upstream app source files are not copied.

```powershell
$staging = Join-Path $env:TEMP "ai-game-workbench-electron"
if (Test-Path -LiteralPath $staging) {
  Remove-Item -LiteralPath $staging -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $staging | Out-Null
New-Item -ItemType Directory -Force -Path "$staging\server" | Out-Null
New-Item -ItemType Directory -Force -Path "$staging\web" | Out-Null
New-Item -ItemType Directory -Force -Path "$staging\bin" | Out-Null

Copy-Item -Path "$upstream\apps\web\dist\*" -Destination "$staging\web" -Recurse -Force
Copy-Item -LiteralPath "$upstream\presets" -Destination "$staging\server\presets" -Recurse -Force
Copy-Item -LiteralPath "$upstream\LICENSE" -Destination "$staging\LICENSE" -Force
Copy-Item -LiteralPath "$upstream\README.md" -Destination "$staging\README.md" -Force
Copy-Item -LiteralPath "$upstream\node_modules\ffmpeg-static\ffmpeg.exe" -Destination "$staging\bin\ffmpeg.exe" -Force

Push-Location $upstream
.\node_modules\.bin\esbuild.cmd apps\server\src\app.ts `
  --bundle `
  --platform=node `
  --format=esm `
  --target=node20 `
  --tsconfig=tsconfig.base.json `
  --outfile="$staging\server\app.js" `
  --external:sharp `
  --banner:js="import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
Pop-Location

Push-Location $staging
npm init -y | Out-Null
npm pkg set type=module private=true dependencies.sharp=^0.34.5 | Out-Null
npm install --omit=dev --no-audit --no-fund
Remove-Item -LiteralPath "$staging\package-lock.json" -Force -ErrorAction SilentlyContinue
Pop-Location
```

## 5. Smoke Test The Staged Runtime

```powershell
$storage = Join-Path $env:TEMP "ai-game-workbench-electron-smoke-storage"
if (Test-Path -LiteralPath $storage) {
  Remove-Item -LiteralPath $storage -Recurse -Force
}
$env:STAGING = $staging
$env:STORAGE = $storage
node --input-type=module -e "import { pathToFileURL } from 'node:url'; import path from 'node:path'; const staging = process.env.STAGING; const mod = await import(pathToFileURL(path.join(staging, 'server', 'app.js')).href); const app = mod.createApp({ storageDir: process.env.STORAGE, presetsDir: path.join(staging, 'server', 'presets'), ffmpegPath: path.join(staging, 'bin', 'ffmpeg.exe'), module01CharacterExportDir: path.join(process.env.STORAGE, 'exports', 'Character_2D'), port: 0 }); await app.ready(); const res = await app.inject({ method: 'GET', url: '/api/health' }); console.log(res.statusCode, res.json().ok); await app.close();"
Remove-Item Env:\STAGING, Env:\STORAGE -ErrorAction SilentlyContinue
```

Expected output: `200 true`.

## 6. Pack The ASAR

Make sure Electron dependencies are installed once:

```powershell
cd newIDE\electron-app
npm install
cd ..\..
```

Pack the staged runtime. Native `.node` modules and `ffmpeg.exe` must be
unpacked so Electron can load or execute them.

```powershell
$asarPath = "newIDE\electron-app\app\external\ai-game-workbench.asar"
$unpackedPath = "$asarPath.unpacked"
New-Item -ItemType Directory -Force -Path (Split-Path $asarPath) | Out-Null
if (Test-Path -LiteralPath $asarPath) {
  Remove-Item -LiteralPath $asarPath -Force
}
if (Test-Path -LiteralPath $unpackedPath) {
  Remove-Item -LiteralPath $unpackedPath -Recurse -Force
}
.\newIDE\electron-app\node_modules\.bin\asar.cmd pack --unpack "**\*.{node,dll,exe}" $staging $asarPath
```

Do not commit `$upstream`, `$staging`, or an expanded
`newIDE/electron-app/app/external/ai-game-workbench/` folder.

## 7. Verify

Run these checks from the GDevelop repository root:

```powershell
node -c newIDE\electron-app\app\AiGameWorkbenchWindow.js
node -c newIDE\electron-app\app\main.js

$env:ELECTRON_RUN_AS_NODE='1'
.\newIDE\electron-app\node_modules\.bin\electron.cmd -e "const path = require('path'); const { pathToFileURL } = require('url'); (async () => { const bundle = path.resolve('newIDE/electron-app/app/external/ai-game-workbench.asar'); const mod = await import(pathToFileURL(path.join(bundle, 'server', 'app.js')).href); const storageDir = path.join(process.env.TEMP, 'ai-game-workbench-asar-smoke-storage'); const app = mod.createApp({ storageDir, presetsDir: path.join(bundle, 'server', 'presets'), ffmpegPath: path.resolve('newIDE/electron-app/app/external/ai-game-workbench.asar.unpacked/bin/ffmpeg.exe'), module01CharacterExportDir: path.join(storageDir, 'exports', 'Character_2D'), port: 0 }); await app.ready(); const res = await app.inject({ method: 'GET', url: '/api/health' }); console.log(res.statusCode, res.json().ok); await app.close(); })().catch(error => { console.error(error); process.exit(1); });"
Remove-Item Env:\ELECTRON_RUN_AS_NODE

cd newIDE\app
$env:CI='true'
npm test -- --runInBand --watchAll=false src/ResourcesEditor/ToolsPanel.spec.js
Remove-Item Env:\CI
cd ..\..
```

Expected results:

- The Electron-as-Node smoke check prints `200 true`.
- The focused `ToolsPanel.spec.js` suite passes.
- `git status --short` shows the ASAR artifacts, not upstream source files.
