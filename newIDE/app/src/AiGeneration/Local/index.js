// @flow
/**
 * Local AI Models Module
 * Entry point for local model functionality
 */

export { default as LocalModelDialog } from './LocalModelDialog';
export { default as CustomApiKeysDialog } from './CustomApiKeysDialog';
export {
  AVAILABLE_LOCAL_MODELS,
  isModelDownloaded,
  downloadModel,
  deleteModel,
  getModelPath,
  hasEnoughSpace,
  type LocalModel,
} from './LocalModelManager';
export {
  saveApiKeys,
  loadApiKeys,
  getApiKeyForProvider,
  clearApiKeys,
  setActiveLocalModel,
  getActiveLocalModel,
  setUseLocalModel,
  shouldUseLocalModel,
  type ApiKeyConfig,
} from './LocalStorage';
export {
  runLocalInference,
  isLocalInferenceAvailable,
  getSupportedFormats,
  estimateMemoryRequirement,
  type InferenceOptions,
  type InferenceResult,
} from './LocalInference';
