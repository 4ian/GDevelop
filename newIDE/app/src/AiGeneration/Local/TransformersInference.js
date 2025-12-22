// @flow
/**
 * Transformers.js Integration for Local AI Inference
 * This provides a production-ready implementation using transformers.js for browser-based inference
 * 
 * Based on: https://github.com/xenova/transformers.js
 * Adapted for GDevelop's needs with WebGPU support
 */

import { getModelPath, isModelDownloaded } from './LocalModelManager';

// Dynamic import for transformers.js (loaded on demand)
let transformersModule = null;

/**
 * Initialize transformers.js library
 */
const initializeTransformers = async (): Promise<boolean> => {
  if (transformersModule) return true;

  try {
    // In production, transformers.js would be bundled or loaded via CDN
    // For now, we'll use a dynamic import approach
    console.log('Initializing transformers.js for local inference...');
    
    // Check if running in browser environment
    if (typeof window === 'undefined') {
      console.error('Transformers.js requires browser environment');
      return false;
    }

    // Load transformers.js from CDN (production approach)
    await loadTransformersFromCDN();
    
    transformersModule = window.transformers;
    
    if (!transformersModule) {
      console.error('Failed to load transformers.js module');
      return false;
    }

    console.log('Transformers.js initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing transformers.js:', error);
    return false;
  }
};

/**
 * Load transformers.js from CDN
 */
const loadTransformersFromCDN = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.transformers) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';
    script.type = 'module';
    script.async = true;
    
    script.onload = () => {
      console.log('Transformers.js loaded from CDN');
      resolve();
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load transformers.js from CDN'));
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Text Generation Pipeline for chat/completion
 */
class TextGenerationPipeline {
  model: any;
  tokenizer: any;
  modelId: string;
  
  constructor(modelId: string) {
    this.modelId = modelId;
    this.model = null;
    this.tokenizer = null;
  }

  async load(progressCallback?: (progress: number) => void): Promise<boolean> {
    try {
      if (!transformersModule) {
        const initialized = await initializeTransformers();
        if (!initialized) return false;
      }

      const modelPath = getModelPath(this.modelId);
      if (!modelPath) {
        console.error(`Model not found: ${this.modelId}`);
        return false;
      }

      console.log(`Loading model from: ${modelPath}`);
      
      // Initialize pipeline with WebGPU if available
      const device = await this.getBestDevice();
      
      progressCallback?.(0.1);
      
      // Load tokenizer
      this.tokenizer = await transformersModule.AutoTokenizer.from_pretrained(
        modelPath,
        { progress_callback: (progress) => progressCallback?.(0.1 + progress * 0.4) }
      );
      
      progressCallback?.(0.5);
      
      // Load model with appropriate device
      this.model = await transformersModule.AutoModelForCausalLM.from_pretrained(
        modelPath,
        { 
          device,
          dtype: 'fp16', // Use float16 for efficiency
          progress_callback: (progress) => progressCallback?.(0.5 + progress * 0.5)
        }
      );
      
      progressCallback?.(1.0);
      
      console.log(`Model loaded successfully on device: ${device}`);
      return true;
    } catch (error) {
      console.error('Error loading model:', error);
      return false;
    }
  }

  async getBestDevice(): Promise<string> {
    // Check for WebGPU support
    if (navigator.gpu) {
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          console.log('WebGPU available, using GPU acceleration');
          return 'webgpu';
        }
      } catch (e) {
        console.warn('WebGPU check failed:', e);
      }
    }

    // Fall back to WASM
    console.log('Using WASM backend (no GPU acceleration)');
    return 'wasm';
  }

  async generate(
    prompt: string,
    options: {|
      maxTokens?: number,
      temperature?: number,
      topP?: number,
      onToken?: (token: string) => void,
    |} = {}
  ): Promise<?string> {
    if (!this.model || !this.tokenizer) {
      console.error('Model not loaded');
      return null;
    }

    try {
      const {
        maxTokens = 2000,
        temperature = 0.7,
        topP = 0.9,
        onToken,
      } = options;

      // Tokenize input
      const inputs = await this.tokenizer(prompt, { return_tensors: 'pt' });
      
      // Generate with streaming if callback provided
      if (onToken) {
        return await this.generateWithStreaming(inputs, {
          maxTokens,
          temperature,
          topP,
          onToken,
        });
      }

      // Regular generation
      const outputs = await this.model.generate({
        ...inputs,
        max_new_tokens: maxTokens,
        temperature,
        top_p: topP,
        do_sample: temperature > 0,
      });

      // Decode output
      const generated = await this.tokenizer.decode(outputs[0], {
        skip_special_tokens: true,
      });

      // Remove the prompt from output
      return generated.substring(prompt.length);
    } catch (error) {
      console.error('Error during generation:', error);
      return null;
    }
  }

  async generateWithStreaming(
    inputs: any,
    options: {|
      maxTokens: number,
      temperature: number,
      topP: number,
      onToken: (token: string) => void,
    |}
  ): Promise<?string> {
    const { maxTokens, temperature, topP, onToken } = options;
    
    let fullText = '';
    
    try {
      // Use streamer for token-by-token generation
      const streamer = new transformersModule.TextStreamer(this.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
      });

      await this.model.generate({
        ...inputs,
        max_new_tokens: maxTokens,
        temperature,
        top_p: topP,
        do_sample: temperature > 0,
        streamer: (token) => {
          const text = streamer.decode(token);
          fullText += text;
          onToken(text);
        },
      });

      return fullText;
    } catch (error) {
      console.error('Error during streaming generation:', error);
      return fullText || null;
    }
  }

  unload() {
    this.model = null;
    this.tokenizer = null;
    console.log('Model unloaded from memory');
  }
}

/**
 * Model cache for loaded models
 */
const modelCache: Map<string, TextGenerationPipeline> = new Map();

/**
 * Load and cache a model
 */
export const loadModel = async (
  modelId: string,
  progressCallback?: (progress: number) => void
): Promise<boolean> => {
  if (!isModelDownloaded(modelId)) {
    console.error(`Model not downloaded: ${modelId}`);
    return false;
  }

  if (modelCache.has(modelId)) {
    console.log(`Model already loaded: ${modelId}`);
    return true;
  }

  const pipeline = new TextGenerationPipeline(modelId);
  const loaded = await pipeline.load(progressCallback);
  
  if (loaded) {
    modelCache.set(modelId, pipeline);
  }
  
  return loaded;
};

/**
 * Generate text using a loaded model
 */
export const generateText = async (
  modelId: string,
  prompt: string,
  options: {|
    maxTokens?: number,
    temperature?: number,
    topP?: number,
    onToken?: (token: string) => void,
  |} = {}
): Promise<?string> => {
  const pipeline = modelCache.get(modelId);
  
  if (!pipeline) {
    console.error(`Model not loaded: ${modelId}`);
    return null;
  }

  return pipeline.generate(prompt, options);
};

/**
 * Unload a model from memory
 */
export const unloadModel = (modelId: string): void => {
  const pipeline = modelCache.get(modelId);
  
  if (pipeline) {
    pipeline.unload();
    modelCache.delete(modelId);
  }
};

/**
 * Check if transformers.js is available
 */
export const isTransformersAvailable = async (): Promise<boolean> => {
  return await initializeTransformers();
};

/**
 * Get memory usage estimate
 */
export const getMemoryUsage = (): {| used: number, total: number |} => {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize / (1024 * 1024 * 1024), // GB
      total: performance.memory.totalJSHeapSize / (1024 * 1024 * 1024), // GB
    };
  }
  
  return { used: 0, total: 0 };
};

/**
 * Check WebGPU availability
 */
export const isWebGPUAvailable = async (): Promise<boolean> => {
  if (!navigator.gpu) return false;
  
  try {
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch (e) {
    return false;
  }
};
