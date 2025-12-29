// @flow
import {
  flattenIniObject,
  convertToProjectSettings,
  VALID_PREFERENCE_KEYS,
} from './ProjectSettingsReader';

describe('ProjectSettingsReader', () => {
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
