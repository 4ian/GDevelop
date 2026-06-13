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
- Add the `local/gpt-sora` model (`Local GPT Sora`) as a local Codex video
  model. It accepts local workbench asset URLs directly, shells out to a real
  local Sora/GPT video executable when configured, and stores completed jobs under
  `storage/jobs/local-sora-*` before copying the video back into the character
  folder.
- Configure the local video executable with `LOCAL_GPT_SORA_BIN`. By default
  the server calls:
  `LOCAL_GPT_SORA_BIN --prompt-file <prompt.txt> --output <output.mp4> --duration <seconds> --resolution <resolution> --image <path>...`
  If the local generator uses different flags, set `LOCAL_GPT_SORA_ARGS` to a
  JSON string array. Supported placeholders are `{prompt}`, `{promptFile}`,
  `{output}`, `{duration}`, `{resolution}`, `{images}`, `{imageArgs}`, and
  `{image0}`, `{image1}`, etc.
- The old experimental Codex prompt fallback is disabled by default because
  Codex does not always expose a video-generation tool. Enable it only in an
  environment with a real Codex/Sora video tool by setting
  `LOCAL_GPT_SORA_USE_CODEX=1`.
- `/api/provider-models` hides `local/gpt-sora` unless `LOCAL_GPT_SORA_BIN`,
  `LOCAL_SORA_BIN`, or `LOCAL_GPT_SORA_USE_CODEX=1` is configured. This keeps
  the video dropdown from showing a local model that cannot run.
- In `apps/server/src/routes/generation.ts`, upload those local APIMart images
  to `POST {APIMart baseUrl}/uploads/images` before calling the video
  generation endpoint, then pass the returned URL.
- In `apps/web/src/components/SpriteAnimator.tsx`, replace the public-HTTPS-only
  video input guard with a model-aware guard: HTTPS is accepted for every
  provider, and local workbench asset URLs are accepted for `apimart/*` and
  `local/gpt-sora` models.
- Local GPT Sora video polling uses `local-sora-*` job ids and must not require
  provider API credentials; the status route should resolve these jobs before
  hosted provider validation.

The module 01 export page is GDevelop-specific:

- Replace the Godot export route/UI with `/api/export/gdevelop-extension`.
- The route generates `gdevelop-extension.json`, `manifest.json`, and
  `gdevelop-extension-package.zip`.
- The extension JSON contains one events-based object named `Character`; its
  default variant is serialized in the events-based object's root children and
  contains a child Sprite object with named animations like `idle_down`,
  `walk_left`, `run_right`, `attack1_up`, and `jump_down`.
- The events-based object must also include one initial instance named `Sprite`
  in its root `instances[]` array, sized to the export frame. Without this,
  GDevelop imports the child Sprite definition but the custom object's editor
  layout appears empty.
- Animation FPS must come from the character preview settings in the workbench.
  The web export request sends the current preview FPS values, and the server
  falls back to `presets/module01/workflow.json` before using the built-in
  defaults.
- Do not serialize the default variant as a `variants[]` entry named `""`;
  this GDevelop build resolves the default variant from root object fields.
- Generated image resources use project-relative paths under
  `assets/ai-game-workbench/...`; the integration must not create an
  `ai-game-workbench` folder at the project root.
- Direct import is handled by the GDevelop Electron bridge. The workbench sends
  the generated extension JSON and local PNG asset paths to the current
  GDevelop project window, which copies the PNGs into the saved project's
  `assets` folder, registers image resources, and inserts or replaces the
  extension.

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

For export-route verification, create a temporary character folder with at least
one transparent idle/walk PNG for each direction and inject:

```powershell
$env:STAGING = $staging
node --input-type=module -e "import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path'; import { pathToFileURL } from 'node:url'; const staging = process.env.STAGING; const sharp = (await import(pathToFileURL(path.join(staging, 'node_modules', 'sharp', 'lib', 'index.js')).href)).default; const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ai-gdevelop-staged-')); const storageDir = path.join(root, 'storage'); const exportDir = path.join(root, 'exports'); const characterId = 'Hero'; const png = await sharp({ create: { width: 4, height: 4, channels: 4, background: { r: 0, g: 255, b: 0, alpha: 1 } } }).png().toBuffer(); const characterRoot = path.join(storageDir, 'characters', characterId); for (const dir of ['down', 'up', 'left', 'right']) { const idleDir = path.join(characterRoot, 'base-character', 'loop-export', 'idle', 'transparent'); fs.mkdirSync(idleDir, { recursive: true }); fs.writeFileSync(path.join(idleDir, dir + '.png'), png); const walkDir = path.join(characterRoot, 'base-character', 'loop-export', 'transparent', dir); fs.mkdirSync(walkDir, { recursive: true }); fs.writeFileSync(path.join(walkDir, '000.png'), png); } const mod = await import(pathToFileURL(path.join(staging, 'server', 'app.js')).href); const app = mod.createApp({ storageDir, presetsDir: path.join(staging, 'server', 'presets'), ffmpegPath: path.join(staging, 'bin', 'ffmpeg.exe'), module01CharacterExportDir: exportDir, port: 0 }); await app.ready(); const res = await app.inject({ method: 'POST', url: '/api/export/gdevelop-extension', payload: { characterId, exportSize: 256, characterPreviewSettings: { idleFps: 4, walkFps: 7, runFps: 8, attackFps: 10, jumpFps: 12 } } }); const body = res.json(); const ebo = body.extension?.eventsBasedObjects?.[0]; const walk = ebo?.objects?.[0]?.animations?.find(animation => animation.name === 'walk_down'); const usesPreviewFps = Math.abs((walk?.directions?.[0]?.timeBetweenFrames ?? 0) - 1 / 7) < 0.000001; console.log(res.statusCode, body.extensionName, body.animationCount, body.assetCount, Boolean(ebo?.objects?.[0]?.animations?.length), ebo?.instances?.[0]?.name === 'Sprite', usesPreviewFps, ebo?.variants?.length === 0, body.assetFiles.every(file => file.relativePath.startsWith('assets/ai-game-workbench/'))); await app.close();"
Remove-Item Env:\STAGING -ErrorAction SilentlyContinue
```

Expected output shape: `200 AICharacter_Hero 8 8 true true true true true`.

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
node -c newIDE\electron-app\app\AiGameWorkbenchPreload.js
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
