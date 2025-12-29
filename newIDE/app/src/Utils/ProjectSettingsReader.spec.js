// @flow
import {
  flattenIniObject,
  convertToProjectSettings,
  VALID_PREFERENCE_KEYS,
} from './ProjectSettingsReader';
import ini from 'ini';

describe('ProjectSettingsReader', () => {
  describe('ini library parsing', () => {
    test('parses true/false as native booleans', () => {
      const content = `
key1 = true
key2 = false
`;
      const parsed = ini.parse(content);
      expect(parsed.key1).toBe(true);
      expect(parsed.key2).toBe(false);
      expect(typeof parsed.key1).toBe('boolean');
      expect(typeof parsed.key2).toBe('boolean');
    });

    test('parses yes/no as strings', () => {
      const content = `
key1 = yes
key2 = no
`;
      const parsed = ini.parse(content);
      expect(parsed.key1).toBe('yes');
      expect(parsed.key2).toBe('no');
      expect(typeof parsed.key1).toBe('string');
      expect(typeof parsed.key2).toBe('string');
    });

    test('parses 1/0 as strings', () => {
      const content = `
key1 = 1
key2 = 0
`;
      const parsed = ini.parse(content);
      expect(parsed.key1).toBe('1');
      expect(parsed.key2).toBe('0');
      expect(typeof parsed.key1).toBe('string');
      expect(typeof parsed.key2).toBe('string');
    });

    test('parses sections correctly', () => {
      const content = `
[Section1]
key1 = true

[Section2]
key2 = false
`;
      const parsed = ini.parse(content);
      expect(parsed.Section1.key1).toBe(true);
      expect(parsed.Section2.key2).toBe(false);
    });
  });

  describe('flattenIniObject', () => {
    test('returns empty object for empty input', () => {
      expect(flattenIniObject({})).toEqual({});
    });

    test('handles flat key-value pairs', () => {
      const parsed = {
        autosaveOnPreview: true,
        use3DEditor: false,
      };
      expect(flattenIniObject(parsed)).toEqual({
        autosaveOnPreview: true,
        use3DEditor: false,
      });
    });

    test('flattens sectioned INI object', () => {
      const parsed = {
        Previews: {
          autosaveOnPreview: true,
          takeScreenshotOnPreview: false,
        },
        SceneEditor: {
          use3DEditor: true,
        },
      };
      expect(flattenIniObject(parsed)).toEqual({
        autosaveOnPreview: true,
        takeScreenshotOnPreview: false,
        use3DEditor: true,
      });
    });

    test('handles mixed flat and sectioned values', () => {
      const parsed = {
        autosaveOnPreview: true,
        Previews: {
          takeScreenshotOnPreview: false,
        },
      };
      expect(flattenIniObject(parsed)).toEqual({
        autosaveOnPreview: true,
        takeScreenshotOnPreview: false,
      });
    });

    test('handles string values', () => {
      const parsed = {
        someKey: 'someValue',
      };
      expect(flattenIniObject(parsed)).toEqual({
        someKey: 'someValue',
      });
    });

    test('handles number values', () => {
      const parsed = {
        someNumber: 42,
      };
      expect(flattenIniObject(parsed)).toEqual({
        someNumber: 42,
      });
    });

    test('warns on duplicate keys across sections', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const parsed = {
        Section1: {
          duplicateKey: true,
        },
        Section2: {
          duplicateKey: false,
        },
      };
      const result = flattenIniObject(parsed);

      expect(result).toEqual({ duplicateKey: false });
      expect(warnSpy).toHaveBeenCalledWith(
        '[ProjectSettingsReader] Duplicate key "duplicateKey" found, overwriting previous value'
      );

      warnSpy.mockRestore();
    });

    test('warns on duplicate keys between root and section', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const parsed = {
        myKey: true,
        Section: {
          myKey: false,
        },
      };
      const result = flattenIniObject(parsed);

      expect(result).toEqual({ myKey: false });
      expect(warnSpy).toHaveBeenCalledWith(
        '[ProjectSettingsReader] Duplicate key "myKey" found, overwriting previous value'
      );

      warnSpy.mockRestore();
    });
  });

  describe('convertToProjectSettings', () => {
    test('returns empty object for empty input', () => {
      expect(convertToProjectSettings({})).toEqual({});
    });

    test('converts valid boolean settings', () => {
      const rawSettings = {
        autosaveOnPreview: true,
        use3DEditor: false,
        showDeprecatedInstructionWarning: true,
      };
      expect(convertToProjectSettings(rawSettings)).toEqual({
        autosaveOnPreview: true,
        use3DEditor: false,
        showDeprecatedInstructionWarning: true,
      });
    });

    test('ignores unknown keys and logs warning', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const rawSettings = {
        autosaveOnPreview: true,
        unknownKey: true,
        anotherUnknown: false,
      };
      const result = convertToProjectSettings(rawSettings);

      expect(result).toEqual({
        autosaveOnPreview: true,
      });
      expect(warnSpy).toHaveBeenCalledTimes(2);
      expect(warnSpy).toHaveBeenCalledWith(
        '[ProjectSettingsReader] Unknown setting key: unknownKey'
      );
      expect(warnSpy).toHaveBeenCalledWith(
        '[ProjectSettingsReader] Unknown setting key: anotherUnknown'
      );

      warnSpy.mockRestore();
    });

    test('ignores non-boolean values', () => {
      const rawSettings = {
        autosaveOnPreview: 'true',
        use3DEditor: 42,
        showDeprecatedInstructionWarning: null,
      };
      expect(convertToProjectSettings(rawSettings)).toEqual({});
    });

    test('handles all valid preference keys', () => {
      const rawSettings: { [string]: boolean } = {};
      VALID_PREFERENCE_KEYS.forEach(key => {
        rawSettings[key] = true;
      });

      const result = convertToProjectSettings(rawSettings);

      VALID_PREFERENCE_KEYS.forEach(key => {
        expect(result[key]).toBe(true);
      });
    });
  });

  describe('VALID_PREFERENCE_KEYS', () => {
    test('contains expected keys', () => {
      expect(VALID_PREFERENCE_KEYS.has('autosaveOnPreview')).toBe(true);
      expect(VALID_PREFERENCE_KEYS.has('use3DEditor')).toBe(true);
      expect(
        VALID_PREFERENCE_KEYS.has('showDeprecatedInstructionWarning')
      ).toBe(true);
      expect(VALID_PREFERENCE_KEYS.has('useGDJSDevelopmentWatcher')).toBe(true);
    });

    test('does not contain invalid keys', () => {
      expect(VALID_PREFERENCE_KEYS.has('invalidKey')).toBe(false);
      expect(VALID_PREFERENCE_KEYS.has('')).toBe(false);
    });
  });
});
