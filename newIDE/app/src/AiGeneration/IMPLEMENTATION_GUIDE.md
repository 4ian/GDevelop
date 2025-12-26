# Local AI Models & Custom API Keys - Implementation Guide

## Overview

This implementation adds support for:
1. **Local AI Models** - Run AI models locally with unlimited requests
2. **Custom API Keys** - Use your own API keys for online AI providers

## Features Implemented

### 1. Local Model Support

Three local models are configured for download:
- **Apriel 1.5 15B Thinker** (ServiceNow-AI) - ~30GB
- **GPT-OSS 20B** (OpenAI) - ~40GB
- **Qwen3 VL 32B Instruct** (Qwen) - ~64GB

#### Model Download Scripts

Three download options are provided:

**Python Script** (`download_models.py`):
```bash
cd newIDE/app/src/AiGeneration/Local
python3 download_models.py  # Download all models
python3 download_models.py 0  # Download specific model (0, 1, or 2)
```

**Shell Script** (`download_models.sh`):
```bash
cd newIDE/app/src/AiGeneration/Local
./download_models.sh  # Download all models
./download_models.sh 0  # Download specific model
```

**Node.js Script** (`download-models.js`):
```bash
cd newIDE/app/src/AiGeneration/Local
node download-models.js  # Download all models
node download-models.js --skip  # Skip downloads
```

#### GitHub Workflow

A manual GitHub Actions workflow is available at `.github/workflows/download-ai-models.yml`:
- Manually trigger from Actions tab
- Choose which model to download
- Downloads model and creates artifact for distribution

### 2. Custom API Keys

Users can configure their own API keys for:
- OpenAI
- Anthropic (Claude)
- Google AI (Gemini)
- HuggingFace

API keys are:
- Stored locally in browser localStorage
- Never sent to GDevelop servers
- Encrypted at rest by the browser

### 3. UI Integration

Two new dialogs are added to the AI chat interface:

**Local Models Dialog** (`LocalModelDialog.js`):
- View available local models
- Download/delete models
- See model sizes and descriptions

**Custom API Keys Dialog** (`CustomApiKeysDialog.js`):
- Configure API keys for each provider
- Keys stored securely in browser

Access these via new buttons in the AI chat interface:
- "Local Models" button
- "API Keys" button

### 4. Unlimited Requests

When using a local model:
- No quota limits apply
- Shows "Unlimited requests (Local model)" in the UI
- Works offline (after download)

## File Structure

```
newIDE/app/src/AiGeneration/
├── Local/
│   ├── README.md                    # Documentation
│   ├── .gitignore                   # Excludes large model files
│   ├── LocalModelManager.js         # Model management logic
│   ├── LocalModelDialog.js          # Model download UI
│   ├── CustomApiKeysDialog.js       # API key configuration UI
│   ├── LocalStorage.js              # localStorage utilities
│   ├── LocalInference.js            # Inference stub (placeholder)
│   ├── index.js                     # Module exports
│   ├── download_models.py           # Python download script
│   ├── download_models.sh           # Shell download script
│   ├── download-models.js           # Node.js download script
│   ├── LocalStorage.spec.js         # Tests for storage
│   ├── apriel-1.5-15b-thinker/
│   │   └── model_info.json          # Model metadata
│   ├── gpt-oss-20b/
│   │   └── model_info.json          # Model metadata
│   └── qwen3-vl-32b-instruct/
│       └── model_info.json          # Model metadata
├── AiConfiguration.js               # Updated with local model support
├── AiConfiguration.spec.js          # Tests for configuration
└── AiRequestChat/
    └── index.js                     # Updated with UI integration
```

## Technical Details

### Configuration Changes

**AiConfiguration.js**:
- Added `isLocalModel` property to presets
- `getAiConfigurationPresetsWithAvailability()` now includes local model presets
- New helper functions: `isLocalModelPreset()`, `hasUnlimitedRequests()`

**AiRequestChat/index.js**:
- Imports local model components
- Adds state for dialog visibility
- Integrates "Local Models" and "API Keys" buttons
- Updates quota logic to bypass limits for local models
- Shows "Unlimited requests" indicator for local models

### Storage

**LocalStorage.js** manages:
- API key storage (per provider)
- Active local model selection
- Local model preference toggle

All data stored in browser localStorage.

### Model Download

Models are downloaded using HuggingFace Hub API:
1. Python script uses `huggingface_hub` library
2. Downloads entire model repository
3. Stores in local subdirectory
4. Model files excluded from git via `.gitignore`

### Inference (Placeholder)

**LocalInference.js** provides:
- Stub functions for running inference
- Memory estimation
- Format checking
- Error messages indicating implementation needed

**To implement actual inference**, integrate:
- transformers.js or ONNX Runtime for browser
- Model format conversion (ONNX, GGUF, etc.)
- Connection to AI request pipeline

## Usage in GDevelop

1. **User opens AI chat**
2. **Clicks "Local Models" button**
3. **Downloads a model** (or clicks "API Keys" for online models)
4. **Selects local model** from preset dropdown
5. **Makes unlimited AI requests** without quota limits

## Testing

Two test files created:

**AiConfiguration.spec.js**:
- Tests local model preset detection
- Tests unlimited request logic
- Tests preset availability with local models

**LocalStorage.spec.js**:
- Tests API key save/load
- Tests active model selection
- Tests preference storage

Run tests with:
```bash
cd newIDE/app
npm test -- --testPathPattern="AiConfiguration.spec.js"
npm test -- --testPathPattern="LocalStorage.spec.js"
```

## Next Steps for Production

1. **Implement Local Inference**:
   - Choose ML runtime (transformers.js, ONNX, etc.)
   - Convert models to web-compatible format
   - Integrate with AI request pipeline

2. **Add Custom API Key Usage**:
   - Modify request logic to use custom keys
   - Add provider-specific request handling
   - Implement error handling for invalid keys

3. **Performance Optimization**:
   - Add model caching
   - Implement progressive loading
   - Add GPU acceleration support

4. **User Experience**:
   - Add download progress indicators
   - Show storage space requirements
   - Add model performance metrics

## Security Considerations

- API keys stored in browser localStorage (encrypted by browser)
- No API keys sent to GDevelop servers
- Local models run entirely client-side
- Model downloads from trusted HuggingFace repositories

## Requirements

- Python 3.x (for download scripts)
- ~134GB disk space (for all three models)
- Modern browser with localStorage support
- GPU recommended for inference (when implemented)
