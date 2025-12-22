// @flow
/**
 * Local Model Inference
 * Handles running AI inference on local models using transformers.js with WebGPU acceleration
 */

import { getModelPath, isModelDownloaded } from './LocalModelManager';
import {
  loadModel,
  generateText,
  unloadModel,
  isTransformersAvailable,
  isWebGPUAvailable,
  getMemoryUsage,
} from './TransformersInference';

export type InferenceOptions = {|
  modelId: string,
  prompt: string,
  temperature?: number,
  maxTokens?: number,
  onProgress?: (text: string) => void,
  onToken?: (token: string) => void,
|};

export type InferenceResult = {|
  success: boolean,
  text?: string,
  error?: string,
  tokensGenerated?: number,
  inferenceTime?: number,
|};

/**
 * Run inference on a local model with full transformers.js implementation
 */
export const runLocalInference = async (
  options: InferenceOptions
): Promise<InferenceResult> => {
  const { 
    modelId, 
    prompt, 
    temperature = 0.7, 
    maxTokens = 2000,
    onProgress,
    onToken,
  } = options;

  const startTime = Date.now();

  // Check if model is downloaded
  if (!isModelDownloaded(modelId)) {
    return {
      success: false,
      error: 'Model not downloaded. Please download the model first using the Local Models dialog.',
    };
  }

  const modelPath = getModelPath(modelId);
  if (!modelPath) {
    return {
      success: false,
      error: 'Model path not found.',
    };
  }

  // Check if transformers.js is available
  const transformersReady = await isTransformersAvailable();
  if (!transformersReady) {
    return {
      success: false,
      error: 'Transformers.js library not available. Please ensure you have an internet connection for the first load.',
    };
  }

  try {
    // Load model if not already loaded
    onProgress?.('Loading model...');
    const loaded = await loadModel(modelId, (progress) => {
      onProgress?.(`Loading model: ${Math.round(progress * 100)}%`);
    });

    if (!loaded) {
      return {
        success: false,
        error: 'Failed to load model. The model may be corrupted or incompatible.',
      };
    }

    // Check memory before generation
    const memBefore = getMemoryUsage();
    console.log(`Memory before inference: ${memBefore.used.toFixed(2)}GB / ${memBefore.total.toFixed(2)}GB`);

    // Generate text
    onProgress?.('Generating...');
    let tokenCount = 0;
    
    const generatedText = await generateText(modelId, prompt, {
      temperature,
      maxTokens,
      topP: 0.9,
      onToken: (token) => {
        tokenCount++;
        onToken?.(token);
      },
    });

    const inferenceTime = Date.now() - startTime;

    if (!generatedText) {
      return {
        success: false,
        error: 'Generation failed. The model may have encountered an error.',
      };
    }

    // Check memory after generation
    const memAfter = getMemoryUsage();
    console.log(`Memory after inference: ${memAfter.used.toFixed(2)}GB / ${memAfter.total.toFixed(2)}GB`);
    console.log(`Inference completed in ${inferenceTime}ms, generated ${tokenCount} tokens`);

    return {
      success: true,
      text: generatedText,
      tokensGenerated: tokenCount,
      inferenceTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Unknown error occurred during inference',
    };
  }
};

/**
 * Check if local inference is available
 */
export const isLocalInferenceAvailable = async (): Promise<boolean> => {
  return await isTransformersAvailable();
};

/**
 * Check if GPU acceleration is available
 */
export const isGPUAccelerationAvailable = async (): Promise<boolean> => {
  return await isWebGPUAvailable();
};

/**
 * Get supported model formats
 */
export const getSupportedFormats = (): Array<string> => {
  return [
    'safetensors', // Preferred format
    'onnx',        // ONNX Runtime support
    'pytorch',     // PyTorch models
    'tensorflow',  // TensorFlow models
  ];
};

/**
 * Estimate memory requirements for a model
 */
export const estimateMemoryRequirement = (modelId: string): number => {
  // Rough estimates in GB based on model size
  const estimates = {
    'apriel-1.5-15b-thinker': 30,
    'gpt-oss-20b': 40,
    'qwen3-vl-32b-instruct': 64,
  };
  
  return estimates[modelId] || 0;
};

/**
 * Unload model from memory to free resources
 */
export const unloadLocalModel = (modelId: string): void => {
  unloadModel(modelId);
};

/**
 * Get current memory usage
 */
export const getCurrentMemoryUsage = (): {| used: number, total: number |} => {
  return getMemoryUsage();
};
