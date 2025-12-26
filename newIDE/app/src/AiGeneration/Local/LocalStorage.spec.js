// @flow
/**
 * Tests for Local Storage utilities
 */

import {
  saveApiKeys,
  loadApiKeys,
  getApiKeyForProvider,
  clearApiKeys,
  setActiveLocalModel,
  getActiveLocalModel,
  setUseLocalModel,
  shouldUseLocalModel,
} from './LocalStorage';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock;

describe('LocalStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('API Keys', () => {
    it('should save and load API keys', () => {
      const apiKeys = [
        { provider: 'openai', apiKey: 'sk-test123' },
        { provider: 'anthropic', apiKey: 'sk-ant-test456' },
      ];

      saveApiKeys(apiKeys);
      const loaded = loadApiKeys();

      expect(loaded).toEqual(apiKeys);
    });

    it('should return empty array when no API keys are saved', () => {
      const loaded = loadApiKeys();
      expect(loaded).toEqual([]);
    });

    it('should get API key for specific provider', () => {
      const apiKeys = [
        { provider: 'openai', apiKey: 'sk-test123' },
        { provider: 'anthropic', apiKey: 'sk-ant-test456' },
      ];

      saveApiKeys(apiKeys);

      expect(getApiKeyForProvider('openai')).toBe('sk-test123');
      expect(getApiKeyForProvider('anthropic')).toBe('sk-ant-test456');
      expect(getApiKeyForProvider('google')).toBe(null);
    });

    it('should clear all API keys', () => {
      const apiKeys = [{ provider: 'openai', apiKey: 'sk-test123' }];

      saveApiKeys(apiKeys);
      expect(loadApiKeys()).toEqual(apiKeys);

      clearApiKeys();
      expect(loadApiKeys()).toEqual([]);
    });
  });

  describe('Active Local Model', () => {
    it('should save and load active local model', () => {
      setActiveLocalModel('apriel-1.5-15b-thinker');
      expect(getActiveLocalModel()).toBe('apriel-1.5-15b-thinker');
    });

    it('should return null when no active model is set', () => {
      expect(getActiveLocalModel()).toBe(null);
    });

    it('should clear active model when set to null', () => {
      setActiveLocalModel('gpt-oss-20b');
      expect(getActiveLocalModel()).toBe('gpt-oss-20b');

      setActiveLocalModel(null);
      expect(getActiveLocalModel()).toBe(null);
    });
  });

  describe('Use Local Model Preference', () => {
    it('should save and load use local model preference', () => {
      setUseLocalModel(true);
      expect(shouldUseLocalModel()).toBe(true);

      setUseLocalModel(false);
      expect(shouldUseLocalModel()).toBe(false);
    });

    it('should return false by default', () => {
      expect(shouldUseLocalModel()).toBe(false);
    });
  });
});
