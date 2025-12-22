# Local AI Models

This directory contains local AI models that can be used for offline AI generation with unlimited requests.

## Available Models

The following models can be downloaded and used locally:

1. **Apriel-1.5-15b-Thinker** - ServiceNow-AI's advanced reasoning model (~30GB)
   - Source: https://huggingface.co/ServiceNow-AI/Apriel-1.5-15b-Thinker
   
2. **GPT-OSS-20B** - OpenAI's open source model (~40GB)
   - Source: https://huggingface.co/openai/gpt-oss-20b
   
3. **Qwen3-VL-32B-Instruct** - Qwen's vision-language instruction model (~64GB)
   - Source: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct

## Downloading Models

### Option 1: Using the Shell Script (Linux/Mac)

```bash
cd newIDE/app/src/AiGeneration/Local
./download_models.sh
```

To download a specific model:
```bash
./download_models.sh 0  # Downloads Apriel-1.5-15b-Thinker
./download_models.sh 1  # Downloads GPT-OSS-20B
./download_models.sh 2  # Downloads Qwen3-VL-32B-Instruct
```

### Option 2: Using Python Directly

```bash
cd newIDE/app/src/AiGeneration/Local
python3 download_models.py
```

### Option 3: Using Node.js (Build Integration)

```bash
cd newIDE/app/src/AiGeneration/Local
node download-models.js
```

To skip downloads during build:
```bash
node download-models.js --skip
```

## Model Storage

Models are downloaded to subdirectories within this folder:
- `apriel-1.5-15b-thinker/` - Apriel model files
- `gpt-oss-20b/` - GPT-OSS model files  
- `qwen3-vl-32b-instruct/` - Qwen3 model files

Each directory contains a `model_info.json` file with metadata. The actual model files are not committed to git due to their large size.

## Integration with Build Workflow

To integrate model downloading into the build process, add to `package.json`:

```json
{
  "scripts": {
    "download-ai-models": "node src/AiGeneration/Local/download-models.js",
    "download-ai-models-optional": "node src/AiGeneration/Local/download-models.js --skip"
  }
}
```

## Requirements

- Python 3.x
- pip (Python package manager)
- huggingface_hub Python package (auto-installed by scripts)
- Sufficient disk space (~134GB for all three models)

## Usage in GDevelop

When a local model is active, AI requests will:
- Not count against usage quotas
- Work offline (after initial download)
- Have unlimited requests
- Run entirely on your local machine

## Notes

- Model files are large and downloading may take significant time
- Models require compatible hardware (GPU recommended for best performance)
- Downloaded models are excluded from git via `.gitignore`
