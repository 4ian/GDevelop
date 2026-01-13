// @flow
import { type ParsedProjectSettings } from './ProjectSettingsReader';
import {
  type Preferences,
  type ProjectSpecificPreferencesValues,
} from '../MainFrame/Preferences/PreferencesContext';

/** Allowlist of preference keys that can be overridden per-project. */
const allowedPreferenceKeys: $ReadOnlyArray<
  $Keys<ProjectSpecificPreferencesValues>
> = [
  'language',
  'autoDownloadUpdates',
  'themeName',
  'codeEditorThemeName',
  'autoDisplayChangelog',
  'lastLaunchedVersion',
  'eventsSheetShowObjectThumbnails',
  'autosaveOnPreview',
  'useGDJSDevelopmentWatcher',
  'eventsSheetUseAssignmentOperators',
  'eventsSheetIndentScale',
  'eventsSheetZoomLevel',
  'showEffectParameterNames',
  'autoOpenMostRecentProject',
  'hasProjectOpened',
  'newObjectDialogDefaultTab',
  'shareDialogDefaultTab',
  'isMenuBarHiddenInPreview',
  'isAlwaysOnTopInPreview',
  'backdropClickBehavior',
  'eventsSheetCancelInlineParameter',
  'showExperimentalExtensions',
  'showCreateSectionByDefault',
  'showInAppTutorialDeveloperMode',
  'showDeprecatedInstructionWarning',
  'openDiagnosticReportAutomatically',
  'use3DEditor',
  'showBasicProfilingCounters',
  'newProjectsDefaultFolder',
  'newProjectsDefaultStorageProviderName',
  'useShortcutToClosePreviewWindow',
  'watchProjectFolderFilesForLocalProjects',
  'fetchPlayerTokenForPreviewAutomatically',
  'previewCrashReportUploadLevel',
  'takeScreenshotOnPreview',
  'showAiAskButtonInTitleBar',
  'automaticallyUseCreditsForAiRequests',
  'hasSeenInGameEditorWarning',
];

const allowedPreferences: Set<string> = new Set(allowedPreferenceKeys);

/**
 * Filters parsed preferences to only include allowed keys.
 */
export const filterAllowedPreferences = (parsedPreferences: {
  [string]: boolean | string | number,
}): ProjectSpecificPreferencesValues => {
  const filtered: ProjectSpecificPreferencesValues = {};

  for (const [key, value] of Object.entries(parsedPreferences)) {
    if (allowedPreferences.has(key)) {
      filtered[key] = value;
    }
  }

  return filtered;
};

/**
 * Applies project-specific settings from a gdevelop-settings.yaml file to the editor.
 *
 * @param parsedSettings - The parsed settings read from settings.yaml
 * @param preferences - The preferences context
 */
export const applyProjectSettings = (
  parsedSettings: ParsedProjectSettings,
  preferences: Preferences
): void => {
  const filteredPreferences = filterAllowedPreferences(
    parsedSettings.preferences
  );
  preferences.setMultipleValues(filteredPreferences);
};
