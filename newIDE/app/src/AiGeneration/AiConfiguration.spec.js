// @flow
import {
  getAiConfigurationPresetsWithAvailability,
  isLocalAiPreset,
  getDefaultAiConfigurationPresetId,
} from './AiConfiguration';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window.localStorage
Object.defineProperty(global, 'window', {
  value: {
    localStorage: mockLocalStorage,
  },
  writable: true,
});

describe('AiConfiguration', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('isLocalAiPreset', () => {
    test('returns true for local presets', () => {
      expect(isLocalAiPreset('local-claude-agent')).toBe(true);
      expect(isLocalAiPreset('local-claude-chat')).toBe(true);
      expect(isLocalAiPreset('local-anything')).toBe(true);
    });

    test('returns false for cloud presets', () => {
      expect(isLocalAiPreset('gpt-4')).toBe(false);
      expect(isLocalAiPreset('claude-3')).toBe(false);
      expect(isLocalAiPreset('default')).toBe(false);
    });
  });

  describe('getAiConfigurationPresetsWithAvailability', () => {
    const mockCloudSettings = {
      aiRequest: {
        presets: [
          {
            mode: 'agent',
            id: 'cloud-agent',
            nameByLocale: { en: 'Cloud Agent' },
            disabled: false,
            isDefault: true,
          },
          {
            mode: 'chat',
            id: 'cloud-chat',
            nameByLocale: { en: 'Cloud Chat' },
            disabled: false,
            isDefault: false,
          },
        ],
      },
    };

    test('returns empty array when no settings and local AI disabled', () => {
      mockLocalStorage.setItem('useLocalAi', 'false');
      const result = getAiConfigurationPresetsWithAvailability({
        getAiSettings: () => null,
        limits: null,
      });
      expect(result).toEqual([]);
    });

    test('returns local presets when local AI enabled and no cloud settings', () => {
      mockLocalStorage.setItem('useLocalAi', 'true');
      const result = getAiConfigurationPresetsWithAvailability({
        getAiSettings: () => null,
        limits: null,
      });
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('local-claude-agent');
      expect(result[0].isLocal).toBe(true);
      expect(result[1].id).toBe('local-claude-chat');
      expect(result[1].isLocal).toBe(true);
    });

    test('returns cloud presets when local AI disabled', () => {
      mockLocalStorage.setItem('useLocalAi', 'false');
      const result = getAiConfigurationPresetsWithAvailability({
        getAiSettings: () => mockCloudSettings,
        limits: null,
      });
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('cloud-agent');
      expect(result[0].isLocal).toBe(false);
    });

    test('returns local + cloud presets when local AI enabled', () => {
      mockLocalStorage.setItem('useLocalAi', 'true');
      const result = getAiConfigurationPresetsWithAvailability({
        getAiSettings: () => mockCloudSettings,
        limits: null,
      });
      // 2 local + 2 cloud = 4
      expect(result.length).toBe(4);
      expect(result[0].id).toBe('local-claude-agent');
      expect(result[0].isLocal).toBe(true);
      expect(result[2].id).toBe('cloud-agent');
      expect(result[2].isLocal).toBe(false);
    });
  });

  describe('getDefaultAiConfigurationPresetId', () => {
    test('returns default preset id for agent mode', () => {
      const presets = [
        {
          mode: 'agent',
          id: 'agent-1',
          nameByLocale: { en: 'Agent 1' },
          disabled: false,
          isDefault: true,
          enableWith: null,
        },
        {
          mode: 'chat',
          id: 'chat-1',
          nameByLocale: { en: 'Chat 1' },
          disabled: false,
          isDefault: false,
          enableWith: null,
        },
      ];
      expect(getDefaultAiConfigurationPresetId('agent', presets)).toBe(
        'agent-1'
      );
    });

    test('returns "default" when no matching preset found', () => {
      const presets = [
        {
          mode: 'chat',
          id: 'chat-1',
          nameByLocale: { en: 'Chat 1' },
          disabled: false,
          isDefault: true,
          enableWith: null,
        },
      ];
      expect(getDefaultAiConfigurationPresetId('agent', presets)).toBe(
        'default'
      );
    });
  });
});
