// @flow
/**
 * Storage for custom API keys and local model configuration
 * Uses localStorage to persist user preferences
 */

import { type ApiKeyConfig } from './CustomApiKeysDialog';

const API_KEYS_STORAGE_KEY = 'gdevelop_custom_api_keys';
const ACTIVE_LOCAL_MODEL_KEY = 'gdevelop_active_local_model';
const USE_LOCAL_MODEL_KEY = 'gdevelop_use_local_model';

/**
 * Save custom API keys to localStorage
 */
export const saveApiKeys = (apiKeys: Array<ApiKeyConfig>): void => {
  try {
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
  } catch (error) {
    console.error('Failed to save API keys:', error);
  }
};

/**
 * Load custom API keys from localStorage
 */
export const loadApiKeys = (): Array<ApiKeyConfig> => {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  }
  return [];
};

/**
 * Get API key for a specific provider
 */
export const getApiKeyForProvider = (provider: string): string | null => {
  const apiKeys = loadApiKeys();
  const config = apiKeys.find(k => k.provider === provider);
  return config ? config.apiKey : null;
};

/**
 * Clear all saved API keys
 */
export const clearApiKeys = (): void => {
  try {
    localStorage.removeItem(API_KEYS_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear API keys:', error);
  }
};

/**
 * Set the active local model
 */
export const setActiveLocalModel = (modelId: string | null): void => {
  try {
    if (modelId) {
      localStorage.setItem(ACTIVE_LOCAL_MODEL_KEY, modelId);
    } else {
      localStorage.removeItem(ACTIVE_LOCAL_MODEL_KEY);
    }
  } catch (error) {
    console.error('Failed to set active local model:', error);
  }
};

/**
 * Get the active local model
 */
export const getActiveLocalModel = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_LOCAL_MODEL_KEY);
  } catch (error) {
    console.error('Failed to get active local model:', error);
    return null;
  }
};

/**
 * Set whether to use local models
 */
export const setUseLocalModel = (useLocal: boolean): void => {
  try {
    localStorage.setItem(USE_LOCAL_MODEL_KEY, useLocal ? 'true' : 'false');
  } catch (error) {
    console.error('Failed to set use local model preference:', error);
  }
};

/**
 * Check if local models should be used
 */
export const shouldUseLocalModel = (): boolean => {
  try {
    return localStorage.getItem(USE_LOCAL_MODEL_KEY) === 'true';
  } catch (error) {
    console.error('Failed to get use local model preference:', error);
    return false;
  }
};
