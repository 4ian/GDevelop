// @flow
/**
 * Local Model Manager
 * Handles downloading, storing, and managing local AI models
 */

export type LocalModel = {|
  id: string,
  name: string,
  source: string,
  description: string,
  size: string,
  downloaded: boolean,
  path?: string,
|};

export const AVAILABLE_LOCAL_MODELS: Array<LocalModel> = [
  {
    id: 'apriel-1.5-15b-thinker',
    name: 'Apriel 1.5 15B Thinker',
    source: 'https://huggingface.co/ServiceNow-AI/Apriel-1.5-15b-Thinker',
    description: 'ServiceNow AI advanced reasoning model',
    size: '~30GB',
    downloaded: false,
  },
  {
    id: 'gpt-oss-20b',
    name: 'GPT-OSS 20B',
    source: 'https://huggingface.co/openai/gpt-oss-20b',
    description: 'OpenAI open source model',
    size: '~40GB',
    downloaded: false,
  },
  {
    id: 'qwen3-vl-32b-instruct',
    name: 'Qwen3 VL 32B Instruct',
    source: 'https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct',
    description: 'Qwen vision-language instruction model',
    size: '~64GB',
    downloaded: false,
  },
];

const MODEL_BASE_PATH = process.env.NODE_ENV === 'production' 
  ? '/app/resources/AiGeneration/Local'
  : require('path').join(__dirname);

/**
 * Check if a model is downloaded locally by checking for model files
 */
export const isModelDownloaded = (modelId: string): boolean => {
  try {
    const fs = require('fs');
    const path = require('path');
    const modelPath = path.join(MODEL_BASE_PATH, modelId);
    
    // Check if the model directory exists and has files beyond model_info.json
    if (!fs.existsSync(modelPath)) {
      return false;
    }
    
    const files = fs.readdirSync(modelPath);
    // A downloaded model should have more than just model_info.json
    return files.length > 1 && files.some(f => f !== 'model_info.json');
  } catch (error) {
    console.error('Error checking model download status:', error);
    return false;
  }
};

/**
 * Download a local model from HuggingFace
 * This delegates to the download scripts (Python or Node.js)
 */
export const downloadModel = async (
  modelId: string,
  onProgress?: (progress: number) => void
): Promise<{| success: boolean, error?: string |}> => {
  try {
    const path = require('path');
    const downloadScript = path.join(__dirname, 'download_models.py');
    
    // Find the model index
    const modelIndex = AVAILABLE_LOCAL_MODELS.findIndex(m => m.id === modelId);
    
    if (modelIndex === -1) {
      return {
        success: false,
        error: 'Unknown model ID',
      };
    }

    // In a production app, this would spawn a child process to run the download script
    // For now, we return a message indicating the user should run the script manually
    return {
      success: false,
      error: `To download this model, please run:\n\ncd ${__dirname}\npython3 download_models.py ${modelIndex}\n\nOr use the shell script:\n./download_models.sh ${modelIndex}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};

/**
 * Delete a downloaded local model
 */
export const deleteModel = async (
  modelId: string
): Promise<{| success: boolean, error?: string |}> => {
  try {
    const fs = require('fs');
    const path = require('path');
    const modelPath = path.join(MODEL_BASE_PATH, modelId);
    
    if (!fs.existsSync(modelPath)) {
      return { success: true }; // Already deleted
    }
    
    // Remove the directory recursively (except model_info.json)
    const files = fs.readdirSync(modelPath);
    files.forEach(file => {
      if (file !== 'model_info.json') {
        const filePath = path.join(modelPath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          fs.rmSync(filePath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(filePath);
        }
      }
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete model',
    };
  }
};

/**
 * Get the path to a downloaded model
 */
export const getModelPath = (modelId: string): string | null => {
  const path = require('path');
  const modelPath = path.join(MODEL_BASE_PATH, modelId);
  
  if (isModelDownloaded(modelId)) {
    return modelPath;
  }
  
  return null;
};

/**
 * Check if the system has enough space for a model
 */
export const hasEnoughSpace = async (
  modelId: string
): Promise<boolean> => {
  // TODO: Implement actual space check using disk utilities
  // This would check available disk space vs model size
  return true;
};
