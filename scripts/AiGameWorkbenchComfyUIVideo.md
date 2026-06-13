# AI Game Workbench ComfyUI Video Workflow

This documents the local ComfyUI video backend for AI Game Workbench.

## Current Machine

- ComfyUI Desktop is running at `http://127.0.0.1:8000`.
- GPU: NVIDIA GeForce RTX 5060 Ti with about 16 GB VRAM.
- Current local model inventory includes `z_image_turbo_bf16.safetensors`, which
  is image-only.
- LTXV video weights are installed and remain available as a fallback.
- Wan2.2 5B TI2V weights are the preferred local video path for better
  sprite-sheet quality and prompt following.

AI Game Workbench does not hard-code a fake local video model. It exposes a
ComfyUI workflow video option only when a ComfyUI API-format workflow is
configured.

## Installed Wan2.2 Workflow

This machine is configured with the native ComfyUI Wan2.2 5B TI2V
image-to-video path:

- Diffusion model:
  `D:\comfyui_data\models\diffusion_models\wan2.2_ti2v_5B_fp16.safetensors`
- Text encoder:
  `D:\comfyui_data\models\text_encoders\umt5_xxl_fp8_e4m3fn_scaled.safetensors`
- VAE:
  `D:\comfyui_data\models\vae\wan2.2_vae.safetensors`
- Workbench API workflow:
  `D:\comfyui_data\user\default\workflows\ai-game-workbench-wan22-ti2v-api.json`

The workflow is adapted from the official ComfyUI Wan2.2 5B TI2V native graph:
`UNETLoader` -> `CLIPLoader` -> `Wan22ImageToVideoLatent` ->
`ModelSamplingSD3` -> `KSampler` -> `VAEDecode` -> `CreateVideo` ->
`SaveVideo`.

Workbench sprite-sheet defaults use `640x640`, 4 seconds, 12 FPS, and 30
sampling steps. The prompt wrapper explicitly preserves the 2x2 grid, green
background, fixed orthographic camera, and per-quadrant facing directions.

The bundled workbench auto-detects this workflow first. If it is missing, it
falls back to `ai-game-workbench-ltxv-i2v-api.json`.

Download helpers:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\code\GDevelop\scripts\download-wan22-comfyui-models.ps1
```

If Hugging Face/Xet stalls on this network, use the ranged fallback. It resumes
already downloaded chunks and removes temporary `.parts` folders after joining:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File D:\code\GDevelop\scripts\download-wan22-comfyui-models-ranged.ps1 -Parallel 96 -ChunkMB 16
```

## Installed LTXV Workflow

This machine is configured with the native ComfyUI LTXV image-to-video path:

- Checkpoint:
  `D:\comfyui_data\models\checkpoints\ltxv-2b-0.9.8-distilled-fp8.safetensors`
- Text encoder:
  `D:\comfyui_data\models\text_encoders\t5xxl_fp8_e4m3fn_scaled.safetensors`
- Workbench API workflow:
  `D:\comfyui_data\user\default\workflows\ai-game-workbench-ltxv-i2v-api.json`
- Test output:
  `D:\comfyui_data\output\ai_game_workbench_ltxv_demo\character_a_ltxv_provider_copy.mp4`

The checkpoint is Lightricks LTX-Video 2B 0.9.8 distilled FP8, chosen because
the model card identifies the 2B distilled line as the light-VRAM option and the
FP8 file is smaller than the full precision checkpoint. The workflow runs at
512x512, 12 FPS, and uses 8 sampler steps by default.

The bundled workbench also auto-detects this fallback workflow path, so the
ComfyUI video entry can appear even when GDevelop was launched without the
environment variable in its process environment.

## Electron ASAR selection

GDevelop loads the tracked Electron bundle at
`newIDE/electron-app/app/external/ai-game-workbench.wan22.asar` when present,
falling back to `ai-game-workbench.asar` for older local checkouts. Local test
bundles named `ai-game-workbench.local*.asar` are ignored unless one of these
environment variables is set before launching Electron:

```powershell
$env:AI_GAME_WORKBENCH_USE_LOCAL_ASAR = "1"
$env:AI_GAME_WORKBENCH_ASAR_PATH = "D:\path\to\ai-game-workbench.local.asar"
```

Use `AI_GAME_WORKBENCH_USE_LOCAL_ASAR=1` to let Electron pick the newest
`ai-game-workbench.local*.asar` in the external folder. Use
`AI_GAME_WORKBENCH_ASAR_PATH` to point at one exact ASAR file. Leave both unset
for normal runs so stale local bundles cannot hide newly bundled models such as
`ComfyUI workflow`.

## Configure

Set these user environment variables, then close and reopen GDevelop/Electron:

```powershell
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_URL", "http://127.0.0.1:8000", "User")
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_VIDEO_WORKFLOW", "D:\comfyui_data\user\default\workflows\ai-game-workbench-wan22-ti2v-api.json", "User")
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_VIDEO_FPS", "12", "User")
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_VIDEO_NEGATIVE_PROMPT", "worst quality, low quality, blurry, washed out, inconsistent motion, jittery, distorted, deformed, extra limbs, text, watermark, camera movement, zoom, rotation, background flicker", "User")
```

Alternatively, set `LOCAL_COMFYUI_VIDEO_WORKFLOW_JSON` to the workflow JSON
content directly.

The workflow must be ComfyUI API format, not the normal UI graph format. In
ComfyUI, enable developer mode and use `Save API Format`.

AI Game Workbench does not start a new server port. It calls the existing
ComfyUI HTTP API at `LOCAL_COMFYUI_URL`.

The video model appears as `ComfyUI workflow` only after a workflow is
configured. If no workflow is configured, `/api/provider-models` hides it so the
dropdown does not show a local option that cannot run.

## Placeholders

The workflow JSON can use these placeholders in node inputs:

- `{{prompt}}`
- `{{negativePrompt}}`
- `{{inputImage}}`
- `{{inputImage0}}`, `{{inputImage1}}`, etc.
- `{{duration}}`
- `{{resolution}}`
- `{{width}}`
- `{{height}}`
- `{{frames}}`
- `{{fps}}`
- `{{seed}}`
- `{{filenamePrefix}}`

For a 16 GB GPU, start with `512x512`, `4` seconds, `12` FPS. The workbench
normalizes frame count to `8n+1`, so 4 seconds at 12 FPS becomes 49 frames,
which is compatible with common LTXV/Wan-style video workflows.

`{{inputImage}}` and `{{inputImage0}}` both point to the first frame. Additional
first/last/reference images passed by the workbench are available as
`{{inputImage1}}`, `{{inputImage2}}`, and so on.

## Recommended Local Workflow Shape

For local 16 GB usage, prefer an image-to-video workflow using one of:

- Wan2.2 5B TI2V at 640px/768px, short duration, native ComfyUI offloading.
- LTXV image-to-video at 512px, short duration, low steps as a fallback.
- Wan 1.3B/low-VRAM or GGUF/FP8 image-to-video at 480p/512px when the native
  Wan2.2 5B path does not fit.
- AnimateDiff only if you already have a compatible SD checkpoint and motion
  model installed.

Avoid HunyuanVideo, Mochi, or large Wan 14B workflows on 16 GB unless you have a
known low-VRAM/quantized setup.

The workflow must save a video through `SaveVideo` or an equivalent node that
returns an output file with `.mp4`, `.webm`, or `.mov`.
