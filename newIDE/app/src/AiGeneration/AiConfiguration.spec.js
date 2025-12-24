// @flow
/**
 * Tests for Local AI Model Configuration
 */

import {
  isLocalModelPreset,
  hasUnlimitedRequests,
  getAiConfigurationPresetsWithAvailability,
} from './AiConfiguration';

describe('AiConfiguration - Local Models', () => {
  describe('isLocalModelPreset', () => {
    it('should return true for local model preset IDs', () => {
      expect(isLocalModelPreset('local-apriel-1.5-15b-thinker')).toBe(true);
      expect(isLocalModelPreset('local-gpt-oss-20b')).toBe(true);
      expect(isLocalModelPreset('local-qwen3-vl-32b-instruct')).toBe(true);
    });

    it('should return false for non-local preset IDs', () => {
      expect(isLocalModelPreset('default')).toBe(false);
      expect(isLocalModelPreset('gpt-4')).toBe(false);
      expect(isLocalModelPreset('claude-3')).toBe(false);
    });
  });

  describe('hasUnlimitedRequests', () => {
    it('should return true for local model presets', () => {
      expect(hasUnlimitedRequests('local-apriel-1.5-15b-thinker')).toBe(true);
      expect(hasUnlimitedRequests('local-gpt-oss-20b')).toBe(true);
    });

    it('should return false for non-local presets', () => {
      expect(hasUnlimitedRequests('default')).toBe(false);
      expect(hasUnlimitedRequests('gpt-4')).toBe(false);
    });
  });

  describe('getAiConfigurationPresetsWithAvailability', () => {
    it('should include local model presets', () => {
      const mockGetAiSettings = () => ({
        aiRequest: {
          presets: [
            {
              mode: 'chat',
              id: 'default',
              nameByLocale: { en: 'Default' },
              disabled: false,
              isDefault: true,
            },
          ],
        },
      });

      const mockLimits: any = {
        capabilities: {
          ai: {
            availablePresets: [
              {
                mode: 'chat',
                name: 'Default',
                id: 'default',
                disabled: false,
              },
            ],
          },
          versionHistory: {},
        },
        quotas: {},
        credits: {
          userBalance: { amount: 0 },
          prices: {},
          purchasableQuantities: {},
        },
        message: undefined,
      };

      const presets = getAiConfigurationPresetsWithAvailability({
        getAiSettings: mockGetAiSettings,
        limits: mockLimits,
      });

      // Should have online presets + 3 local model presets
      expect(presets.length).toBeGreaterThanOrEqual(4);

      const localPresets = presets.filter(p => p.isLocalModel);
      expect(localPresets.length).toBe(3);

      // Check that local presets have correct properties
      const aprielPreset = localPresets.find(p => p.id.includes('apriel'));
      expect(aprielPreset).toBeDefined();
      expect(aprielPreset?.disabled).toBe(false);
      expect(aprielPreset?.isLocalModel).toBe(true);
    });
  });
});
