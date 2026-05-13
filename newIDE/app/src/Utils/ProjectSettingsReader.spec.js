// @flow
import {
  filterAllowedPreferences,
  applyProjectPreferences,
} from './ApplyProjectPreferences';
import { parseToolbarButtons } from './ProjectSettingsReader';
import YAML from 'yaml';
import { type Preferences } from '../MainFrame/Preferences/PreferencesContext';

describe('ProjectSettingsReader', () => {
  describe('end-to-end: YAML content applied to preferences', () => {
    test('gdevelop-settings.yaml content is properly parsed, filtered, and applied to preferences', () => {
      const yamlContent = `
# Project settings
preferences:
  # Boolean values
  autosaveOnPreview: true
  takeScreenshotOnPreview: false
  use3DEditor: true
  showBasicProfilingCounters: false
  showDeprecatedInstructionWarning: "icon"
  # String values
  themeName: "Dark"
  language: "en"
  newProjectsDefaultFolder: "/path/to/projects"
  # Number values
  eventsSheetZoomLevel: 1.5
  eventsSheetIndentScale: 2
  # Unknown preference (not in allowlist)
  unknownPreference: true
  # Unsupported types (should be ignored by readProjectSettings)
  arrayValue:
    - item1
    - item2
  objectValue:
    nested: true
  nullValue: null
`;
      // Step 1: Parse YAML
      const parsed = YAML.parse(yamlContent);
      expect(parsed).toHaveProperty('preferences');

      // Step 2: Extract preferences section - includes all types from YAML
      const rawPreferences = parsed.preferences;
      expect(rawPreferences).toEqual({
        autosaveOnPreview: true,
        takeScreenshotOnPreview: false,
        use3DEditor: true,
        showBasicProfilingCounters: false,
        showDeprecatedInstructionWarning: 'icon',
        themeName: 'Dark',
        language: 'en',
        newProjectsDefaultFolder: '/path/to/projects',
        eventsSheetZoomLevel: 1.5,
        eventsSheetIndentScale: 2,
        unknownPreference: true,
        arrayValue: ['item1', 'item2'],
        objectValue: { nested: true },
        nullValue: null,
      });

      // Step 3: Filter by allowlist (only allowed primitive types pass through)
      const filtered = filterAllowedPreferences(rawPreferences);
      expect(filtered).toEqual({
        autosaveOnPreview: true,
        takeScreenshotOnPreview: false,
        use3DEditor: true,
        showBasicProfilingCounters: false,
        showDeprecatedInstructionWarning: 'icon',
        themeName: 'Dark',
        language: 'en',
        newProjectsDefaultFolder: '/path/to/projects',
        eventsSheetZoomLevel: 1.5,
        eventsSheetIndentScale: 2,
      });

      // Step 4: Apply to preferences via setMultipleValues
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const mockSetMultipleValues = jest.fn();
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const mockSetShortcutForCommand = jest.fn();
      // $FlowFixMe[incompatible-type] - partial mock
      const mockPreferences: Preferences = {
        // $FlowFixMe[incompatible-type] - partial mock
        values: {},
        setMultipleValues: mockSetMultipleValues,
        setShortcutForCommand: mockSetShortcutForCommand,
      };

      applyProjectPreferences({ preferences: rawPreferences }, mockPreferences);

      expect(mockSetMultipleValues).toHaveBeenCalledWith({
        autosaveOnPreview: true,
        takeScreenshotOnPreview: false,
        use3DEditor: true,
        showBasicProfilingCounters: false,
        showDeprecatedInstructionWarning: 'icon',
        themeName: 'Dark',
        language: 'en',
        newProjectsDefaultFolder: '/path/to/projects',
        eventsSheetZoomLevel: 1.5,
        eventsSheetIndentScale: 2,
      });
    });

    test('shortcuts from gdevelop-settings.yaml are properly applied to preferences', () => {
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const mockSetMultipleValues = jest.fn();
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const mockSetShortcutForCommand = jest.fn();
      // $FlowFixMe[incompatible-type] - partial mock
      const mockPreferences: Preferences = {
        // $FlowFixMe[incompatible-type] - partial mock
        values: {},
        setMultipleValues: mockSetMultipleValues,
        setShortcutForCommand: mockSetShortcutForCommand,
      };

      applyProjectPreferences(
        {
          shortcuts: {
            RELOAD_PROJECT: 'CmdOrCtrl+Shift+R',
            OPEN_PROJECT_PROPERTIES: 'CmdOrCtrl+Shift+P',
          },
        },
        mockPreferences
      );

      expect(mockSetShortcutForCommand).toHaveBeenCalledTimes(2);
      expect(mockSetShortcutForCommand).toHaveBeenCalledWith(
        'RELOAD_PROJECT',
        'CmdOrCtrl+Shift+R'
      );
      expect(mockSetShortcutForCommand).toHaveBeenCalledWith(
        'OPEN_PROJECT_PROPERTIES',
        'CmdOrCtrl+Shift+P'
      );
      expect(mockSetMultipleValues).not.toHaveBeenCalled();
    });

    test('readProjectSettings would return null when preferences section is missing', () => {
      const yamlContent = `
# Project settings without preferences
someOtherSection:
  key: value
`;
      const parsed = YAML.parse(yamlContent);
      // readProjectSettings checks for preferences and returns null if missing
      expect(parsed.preferences).toBeUndefined();
    });

    test('readProjectSettings would return null when preferences section is empty', () => {
      const yamlContent = `
# Project settings with empty preferences
preferences:
`;
      const parsed = YAML.parse(yamlContent);
      // readProjectSettings checks for preferences and returns null if empty/null
      expect(parsed.preferences).toBeNull();
    });
  });

  describe('parseToolbarButtons', () => {
    const availableScripts = {
      lint: 'eslint src',
      build: 'webpack',
      test: 'jest',
    };

    test('parses a button without a hook (backward-compatible)', () => {
      // $FlowFixMe[incompatible-call] - test array is a subtype of Array<mixed>
      const raw = ([{ name: 'Lint', icon: '🔍', npmScript: 'lint' }]: any);
      const result = parseToolbarButtons(raw, availableScripts);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'Lint',
        icon: '🔍',
        npmScript: 'lint',
      });
      expect(result[0].hook).toBeUndefined();
    });

    test('parses a button with a valid hook', () => {
      // $FlowFixMe[incompatible-call]
      const raw = ([
        { name: 'Lint', icon: '🔍', npmScript: 'lint', hook: 'onPreviewStart' },
      ]: any);
      const result = parseToolbarButtons(raw, availableScripts);
      expect(result).toHaveLength(1);
      expect(result[0].hook).toBe('onPreviewStart');
    });

    test('parses all supported hook names', () => {
      // $FlowFixMe[incompatible-call]
      const raw = ([
        { name: 'A', icon: '1', npmScript: 'lint', hook: 'onEditorReady' },
        { name: 'B', icon: '2', npmScript: 'build', hook: 'onPreviewStart' },
        { name: 'C', icon: '3', npmScript: 'test', hook: 'onPreviewEnd' },
      ]: any);
      const result = parseToolbarButtons(raw, availableScripts);
      expect(result).toHaveLength(3);
      expect(result[0].hook).toBe('onEditorReady');
      expect(result[1].hook).toBe('onPreviewStart');
      expect(result[2].hook).toBe('onPreviewEnd');
    });

    test('ignores an invalid hook name (logs warning, no hook field set)', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // $FlowFixMe[incompatible-call]
      const raw = ([
        { name: 'Lint', icon: '🔍', npmScript: 'lint', hook: 'onInvalidHook' },
      ]: any);
      const result = parseToolbarButtons(raw, availableScripts);
      expect(result).toHaveLength(1);
      expect(result[0].hook).toBeUndefined();
      warnSpy.mockRestore();
    });

    test('skips a button whose npmScript is not in package.json', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // $FlowFixMe[incompatible-call]
      const raw = ([
        { name: 'Missing', icon: '❌', npmScript: 'nonexistent' },
      ]: any);
      const result = parseToolbarButtons(raw, availableScripts);
      expect(result).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'script "nonexistent" not found in package.json'
        )
      );
      warnSpy.mockRestore();
    });

    test('skips a button with an unsafe script name', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      // $FlowFixMe[incompatible-call]
      const raw = ([
        { name: 'Dangerous', icon: '⚠️', npmScript: 'rm -rf /' },
      ]: any);
      const result = parseToolbarButtons(raw, {});
      expect(result).toHaveLength(0);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('invalid script name "rm -rf /"')
      );
      warnSpy.mockRestore();
    });

    test('skips buttons with missing required fields', () => {
      // $FlowFixMe[incompatible-call]
      const raw = ([
        { icon: '🔍', npmScript: 'lint' },
        { name: 'No Icon', npmScript: 'lint' },
        { name: 'No Script', icon: '🔍' },
      ]: any);
      const result = parseToolbarButtons(raw, availableScripts);
      expect(result).toHaveLength(0);
    });

    test('returns empty array when no scripts available (no package.json)', () => {
      // $FlowFixMe[incompatible-call]
      const raw = ([{ name: 'Lint', icon: '🔍', npmScript: 'lint' }]: any);
      const result = parseToolbarButtons(raw, {});
      expect(result).toHaveLength(0);
    });
  });
});
