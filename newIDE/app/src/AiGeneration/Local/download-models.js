/**
 * Download AI models from HuggingFace for local inference
 * This can be integrated into the GDevelop build process
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MODELS = [
  {
    id: 'ServiceNow-AI/Apriel-1.5-15b-Thinker',
    localDir: 'apriel-1.5-15b-thinker',
    description: 'ServiceNow AI advanced reasoning model',
  },
  {
    id: 'openai/gpt-oss-20b',
    localDir: 'gpt-oss-20b',
    description: 'OpenAI open source model',
  },
  {
    id: 'Qwen/Qwen3-VL-32B-Instruct',
    localDir: 'qwen3-vl-32b-instruct',
    description: 'Qwen vision-language instruction model',
  },
];

function checkPythonInstalled() {
  try {
    execSync('python3 --version', { stdio: 'pipe' });
    return 'python3';
  } catch (e) {
    try {
      execSync('python --version', { stdio: 'pipe' });
      return 'python';
    } catch (e) {
      return null;
    }
  }
}

function installHuggingFaceHub(pythonCmd) {
  console.log('Installing huggingface_hub...');
  try {
    execSync(`${pythonCmd} -m pip install huggingface_hub --quiet`, {
      stdio: 'inherit',
    });
    return true;
  } catch (e) {
    console.error('Failed to install huggingface_hub:', e.message);
    return false;
  }
}

function downloadModel(pythonCmd, modelId, localDir, description) {
  console.log(`\nDownloading ${description}...`);
  console.log(`Model ID: ${modelId}`);

  const targetDir = path.join(__dirname, localDir);

  // Check if already downloaded
  if (fs.existsSync(targetDir)) {
    console.log(`✓ Model already exists at ${targetDir}`);
    return true;
  }

  const downloadScript = `
from huggingface_hub import snapshot_download, model_info
import sys

try:
    info = model_info("${modelId}")
    print(f"Downloading {info.modelId}...")
    snapshot_download(
        repo_id="${modelId}",
        local_dir="${targetDir}",
        local_dir_use_symlinks=False,
        resume_download=True
    )
    print("✓ Download complete")
except Exception as e:
    print(f"✗ Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
`;

  try {
    execSync(`${pythonCmd} -c ${JSON.stringify(downloadScript)}`, {
      stdio: 'inherit',
    });
    return true;
  } catch (e) {
    console.error(`✗ Failed to download ${modelId}`);
    return false;
  }
}

function main() {
  console.log('AI Model Downloader for GDevelop');
  console.log('='.repeat(50));

  const pythonCmd = checkPythonInstalled();
  if (!pythonCmd) {
    console.error(
      'Error: Python is required to download models but was not found.'
    );
    console.error('Please install Python 3 and try again.');
    process.exit(1);
  }

  console.log(`Using Python: ${pythonCmd}`);

  // Check if huggingface_hub is installed
  try {
    execSync(`${pythonCmd} -c "import huggingface_hub"`, { stdio: 'pipe' });
  } catch (e) {
    if (!installHuggingFaceHub(pythonCmd)) {
      console.error('Failed to install required dependencies.');
      process.exit(1);
    }
  }

  // Download models
  const args = process.argv.slice(2);
  if (args.length > 0 && args[0] === '--skip') {
    console.log('\nSkipping model downloads (--skip flag provided)');
    console.log(
      'Models can be downloaded later using the download_models.py script'
    );
    return;
  }

  if (args.length > 0) {
    const index = parseInt(args[0], 10);
    if (index >= 0 && index < MODELS.length) {
      const model = MODELS[index];
      downloadModel(pythonCmd, model.id, model.localDir, model.description);
    } else {
      console.error(`Invalid model index. Choose 0-${MODELS.length - 1}`);
      process.exit(1);
    }
  } else {
    console.log('\nNote: Model downloads are optional and can be skipped.');
    console.log('To skip, run with --skip flag');
    console.log('\nStarting downloads...\n');

    let successCount = 0;
    MODELS.forEach((model, i) => {
      console.log(`\n[${i + 1}/${MODELS.length}]`);
      if (downloadModel(pythonCmd, model.id, model.localDir, model.description)) {
        successCount++;
      }
    });

    console.log('\n' + '='.repeat(50));
    console.log(`Downloaded ${successCount}/${MODELS.length} models successfully`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { downloadModel, MODELS };
