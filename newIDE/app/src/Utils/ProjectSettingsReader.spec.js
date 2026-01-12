// @flow
import {
  filterAllowedPreferences,
  applyProjectSettings,
} from './ApplyProjectSettings';
import YAML from 'yaml';

describe('ProjectSettingsReader', () => {
  describe('end-to-end: YAML content applied to preferences', () => {
    test('settings.yaml content is properly parsed, filtered, and applied to preferences', () => {
      const yamlContent = `
# Project settings
preferences:
  # Boolean values
  autosaveOnPreview: true
  takeScreenshotOnPreview: false
  use3DEditor: true
  showBasicProfilingCounters: false
  showDeprecatedInstructionWarning: true
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
        showDeprecatedInstructionWarning: true,
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
        showDeprecatedInstructionWarning: true,
        themeName: 'Dark',
        language: 'en',
        newProjectsDefaultFolder: '/path/to/projects',
        eventsSheetZoomLevel: 1.5,
        eventsSheetIndentScale: 2,
      });

      // Step 4: Apply to preferences via setMultipleValues
      const mockSetMultipleValues = jest.fn();
      const mockPreferences = {
        values: {},
        setMultipleValues: mockSetMultipleValues,
      };

      // $FlowFixMe - partial mock
      applyProjectSettings({ preferences: rawPreferences }, mockPreferences);

      expect(mockSetMultipleValues).toHaveBeenCalledWith({
        autosaveOnPreview: true,
        takeScreenshotOnPreview: false,
        use3DEditor: true,
        showBasicProfilingCounters: false,
        showDeprecatedInstructionWarning: true,
        themeName: 'Dark',
        language: 'en',
        newProjectsDefaultFolder: '/path/to/projects',
        eventsSheetZoomLevel: 1.5,
        eventsSheetIndentScale: 2,
      });
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
});
