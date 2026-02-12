// @flow
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

/** Normalize legacy boolean to enum for preferences that were changed from boolean to enum. */
const normalizeDeprecatedInstructionWarning = (
  value: boolean | string
): 'no' | 'icon' | 'icon-and-deprecated-warning-text' => {
  if (typeof value === 'boolean') {
    return value ? 'icon' : 'no';
  }
  if (
    value === 'no' ||
    value === 'icon' ||
    value === 'icon-and-deprecated-warning-text'
  ) {
    return value;
  }
  return 'no';
};

/**
 * Applies project-specific preferences from a gdevelop-settings.yaml file to the editor.
 */
export const applyProjectPreferences = (
  rawPreferences: ?{ [string]: boolean | string | number },
  preferences: Preferences
): void => {
  if (rawPreferences) {
    const filtered = filterAllowedPreferences(rawPreferences);
    if (
      Object.prototype.hasOwnProperty.call(
        filtered,
        'showDeprecatedInstructionWarning'
      )
    ) {
      filtered.showDeprecatedInstructionWarning = normalizeDeprecatedInstructionWarning(
        filtered.showDeprecatedInstructionWarning
      );
    }
    preferences.setMultipleValues(filtered);
  }
};
