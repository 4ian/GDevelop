param(
  [string]$ComfyBase = "D:\comfyui_data"
)

$ErrorActionPreference = "Stop"

@'
import huggingface_hub  # noqa: F401
'@ | python - 2>$null

if ($LASTEXITCODE -ne 0) {
  python -m pip install --user --upgrade "huggingface_hub[hf_xet]"
}

python -m pip install --user --upgrade hf_transfer

$env:HF_HUB_DISABLE_XET = "1"
$env:HF_HUB_ENABLE_HF_TRANSFER = "1"

$script = @'
from huggingface_hub import hf_hub_download
from pathlib import Path
import os
import shutil
import sys

comfy_base = Path(sys.argv[1])
cache_dir = comfy_base / "hf_cache"
items = [
    {
        "repo": "Comfy-Org/Wan_2.2_ComfyUI_Repackaged",
        "filename": "split_files/diffusion_models/wan2.2_ti2v_5B_fp16.safetensors",
        "dest": comfy_base / "models" / "diffusion_models" / "wan2.2_ti2v_5B_fp16.safetensors",
        "size": 9999658848,
    },
    {
        "repo": "Comfy-Org/Wan_2.2_ComfyUI_Repackaged",
        "filename": "split_files/vae/wan2.2_vae.safetensors",
        "dest": comfy_base / "models" / "vae" / "wan2.2_vae.safetensors",
        "size": 1409400960,
    },
    {
        "repo": "Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        "filename": "split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        "dest": comfy_base / "models" / "text_encoders" / "umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        "size": 6735906897,
    },
]

for item in items:
    dest = item["dest"]
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size == item["size"]:
        print(f"already complete: {dest}")
        continue

    print(f"downloading: {item['repo']} / {item['filename']}", flush=True)
    cached = Path(hf_hub_download(
        repo_id=item["repo"],
        filename=item["filename"],
        cache_dir=cache_dir,
        local_files_only=False,
    ))
    if cached.stat().st_size != item["size"]:
        raise RuntimeError(f"Unexpected size for {cached}: {cached.stat().st_size} != {item['size']}")

    tmp = dest.with_name(dest.name + ".tmp")
    if tmp.exists():
        tmp.unlink()
    try:
        os.link(cached, tmp)
    except OSError:
        shutil.copy2(cached, tmp)
    os.replace(tmp, dest)
    print(f"installed: {dest}", flush=True)
'@

$script | python - $ComfyBase
