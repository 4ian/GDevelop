// @flow
import {
  setLastUsedPresetId,
  cleanupLocalRequestTracking,
} from './AiGenerationRouter';
import { isLocalAiPreset } from './AiConfiguration';

describe('AiGenerationRouter', () => {
  describe('isLocalAiPreset (integration)', () => {
    test('correctly identifies local presets', () => {
      expect(isLocalAiPreset('local-claude-agent')).toBe(true);
      expect(isLocalAiPreset('local-claude-chat')).toBe(true);
    });

    test('correctly identifies cloud presets', () => {
      expect(isLocalAiPreset('gpt-4')).toBe(false);
      expect(isLocalAiPreset('claude-sonnet')).toBe(false);
    });
  });

  describe('setLastUsedPresetId', () => {
    test('does not throw when called', () => {
      expect(() => setLastUsedPresetId('local-claude-agent')).not.toThrow();
      expect(() => setLastUsedPresetId('cloud-preset')).not.toThrow();
    });
  });

  describe('cleanupLocalRequestTracking', () => {
    test('does not throw when cleaning up non-existent request', () => {
      expect(() => cleanupLocalRequestTracking('non-existent-id')).not.toThrow();
    });
  });
});
