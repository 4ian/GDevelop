#!/usr/bin/env python3
"""
Download AI models from HuggingFace for local inference
This script should be run during the build process or by the user when they want to download models.
"""

import os
import sys
from pathlib import Path

try:
    from huggingface_hub import snapshot_download, model_info
except ImportError:
    print("Error: huggingface_hub is not installed.")
    print("Please install it with: pip install huggingface_hub")
    sys.exit(1)

# Define models to download
MODELS = [
    {
        "id": "ServiceNow-AI/Apriel-1.5-15b-Thinker",
        "local_dir": "apriel-1.5-15b-thinker",
        "description": "ServiceNow AI advanced reasoning model"
    },
    {
        "id": "openai/gpt-oss-20b", 
        "local_dir": "gpt-oss-20b",
        "description": "OpenAI open source model"
    },
    {
        "id": "Qwen/Qwen3-VL-32B-Instruct",
        "local_dir": "qwen3-vl-32b-instruct",
        "description": "Qwen vision-language instruction model"
    }
]

def download_model(model_id, local_dir, description):
    """Download a model from HuggingFace"""
    print(f"\nDownloading {description}...")
    print(f"Model ID: {model_id}")
    
    base_dir = Path(__file__).parent
    target_dir = base_dir / local_dir
    
    try:
        # Check if model exists
        info = model_info(model_id)
        print(f"Model found on HuggingFace: {info.modelId}")
        
        # Download the model
        print(f"Downloading to: {target_dir}")
        snapshot_download(
            repo_id=model_id,
            local_dir=str(target_dir),
            local_dir_use_symlinks=False,
            resume_download=True
        )
        print(f"✓ Successfully downloaded {model_id}")
        return True
        
    except Exception as e:
        print(f"✗ Failed to download {model_id}")
        print(f"Error: {str(e)}")
        return False

def main():
    print("AI Model Downloader for GDevelop")
    print("=" * 50)
    
    if len(sys.argv) > 1:
        # Download specific model by index
        try:
            index = int(sys.argv[1])
            if 0 <= index < len(MODELS):
                model = MODELS[index]
                download_model(model["id"], model["local_dir"], model["description"])
            else:
                print(f"Invalid model index. Choose 0-{len(MODELS)-1}")
        except ValueError:
            print("Usage: python download_models.py [model_index]")
    else:
        # Download all models
        print("Downloading all models...")
        success_count = 0
        for i, model in enumerate(MODELS):
            print(f"\n[{i+1}/{len(MODELS)}]")
            if download_model(model["id"], model["local_dir"], model["description"]):
                success_count += 1
        
        print(f"\n{'=' * 50}")
        print(f"Downloaded {success_count}/{len(MODELS)} models successfully")

if __name__ == "__main__":
    main()
