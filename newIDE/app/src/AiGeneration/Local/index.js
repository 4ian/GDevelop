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
} from './LocalModelManager';

export type {
  LocalModel,
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
} from './LocalStorage';

export type {
  ApiKeyConfig,
} from './LocalStorage';
export {
  runLocalInference,
  isLocalInferenceAvailable,
  isGPUAccelerationAvailable,
  getSupportedFormats,
  estimateMemoryRequirement,
  unloadLocalModel,
  getCurrentMemoryUsage,
} from './LocalInference';

export type {
  InferenceOptions,
  InferenceResult,
} from './LocalInference';
export {
  makeDirectApiCall,
  hasCustomApiKeys,
  getConfiguredProviders,
} from './DirectApiClient';

export type {
  DirectApiMessage,
  DirectApiResponse,
} from './DirectApiClient';
export {
  createAiRequestWithCustomKeys,
  addMessageToAiRequestWithCustomKeys,
  isUsingCustomApiKeys,
} from './AiRequestWrapper';
export {
  loadModel,
  generateText,
  unloadModel as unloadTransformersModel,
  isTransformersAvailable,
  isWebGPUAvailable,
  getMemoryUsage,
} from './TransformersInference';
