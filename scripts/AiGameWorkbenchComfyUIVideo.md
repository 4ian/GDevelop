# AI Game Workbench ComfyUI Video Workflow

This documents the local ComfyUI video backend for AI Game Workbench.

## Current Machine

- ComfyUI Desktop is running at `http://127.0.0.1:8000`.
- GPU: NVIDIA GeForce RTX 5060 Ti with about 16 GB VRAM.
- Current local model inventory includes `z_image_turbo_bf16.safetensors`, which
  is image-only.
- No local LTXV, Wan, Hunyuan, CogVideo, or AnimateDiff video weights were found
  under `D:\comfyui_data\models`.

Because of this, AI Game Workbench does not hard-code a fake local video model.
It exposes a ComfyUI workflow video option only when a ComfyUI API-format
workflow is configured.

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

## Configure

Set these user environment variables, then close and reopen GDevelop/Electron:

```powershell
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_URL", "http://127.0.0.1:8000", "User")
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_VIDEO_WORKFLOW", "D:\comfyui_data\user\default\workflows\ai-game-workbench-ltxv-i2v-api.json", "User")
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_VIDEO_FPS", "12", "User")
[Environment]::SetEnvironmentVariable("LOCAL_COMFYUI_VIDEO_NEGATIVE_PROMPT", "worst quality, inconsistent motion, blurry, jittery, distorted, deformed, extra limbs, text, watermark", "User")
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

- LTXV image-to-video at 512px, short duration, low steps.
- Wan 1.3B/low-VRAM or GGUF/FP8 image-to-video at 480p/512px.
- AnimateDiff only if you already have a compatible SD checkpoint and motion
  model installed.

Avoid HunyuanVideo, Mochi, or large Wan 14B workflows on 16 GB unless you have a
known low-VRAM/quantized setup.

The workflow must save a video through `SaveVideo` or an equivalent node that
returns an output file with `.mp4`, `.webm`, or `.mov`.
