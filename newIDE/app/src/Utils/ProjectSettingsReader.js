// @flow
import optionalRequire from './OptionalRequire';

const fs = optionalRequire('node:fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('node:path');
const ini = optionalRequire('ini');

/**
 * Represents the parsed settings from a project's settings.ini file.
 * Keys correspond to preferences that can be overridden per-project.
 */
export type ProjectSettings = {|
  // At launch
  showCreateSectionByDefault?: boolean,
  autoOpenMostRecentProject?: boolean,

  // Previews
  autosaveOnPreview?: boolean,
  fetchPlayerTokenForPreviewAutomatically?: boolean,
  openDiagnosticReportAutomatically?: boolean,
  sendCrashReports?: boolean,
  takeScreenshotOnPreview?: boolean,
  isMenuBarHiddenInPreview?: boolean,
  isAlwaysOnTopInPreview?: boolean,
  useShortcutToClosePreviewWindow?: boolean,

  // Scene editor
  showBasicProfilingCounters?: boolean,
  use3DEditor?: boolean,

  // Other
  showAiAskButtonInTitleBar?: boolean,
  automaticallyUseCreditsForAiRequests?: boolean,
  displaySaveReminder?: boolean,
  showExperimentalExtensions?: boolean,
  showDeprecatedInstructionWarning?: boolean,
  watchProjectFolderFilesForLocalProjects?: boolean,

  // Contributor options
  showInAppTutorialDeveloperMode?: boolean,

  // Developer options
  useGDJSDevelopmentWatcher?: boolean,
|};

const SETTINGS_FILE_NAME = 'settings.ini';

/**
 * Flattens a parsed INI object (which may have sections) into a flat key-value object.
 * Section keys are ignored, only the values within sections are extracted.
 */
export const flattenIniObject = (parsed: {
  [string]: mixed,
}): { [string]: mixed } => {
  const result: { [string]: mixed } = {};

  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === 'object' && value !== null) {
      // This is a section - extract its values
      for (const [subKey, subValue] of Object.entries(value)) {
        result[subKey] = subValue;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
};

/** Valid preference keys that can be set in settings.ini */
export const VALID_PREFERENCE_KEYS: Set<string> = new Set([
  // At launch
  'showCreateSectionByDefault',
  'autoOpenMostRecentProject',
  // Previews
  'autosaveOnPreview',
  'fetchPlayerTokenForPreviewAutomatically',
  'openDiagnosticReportAutomatically',
  'sendCrashReports',
  'takeScreenshotOnPreview',
  'isMenuBarHiddenInPreview',
  'isAlwaysOnTopInPreview',
  'useShortcutToClosePreviewWindow',
  // Scene editor
  'showBasicProfilingCounters',
  'use3DEditor',
  // Other
  'showAiAskButtonInTitleBar',
  'automaticallyUseCreditsForAiRequests',
  'displaySaveReminder',
  'showExperimentalExtensions',
  'showDeprecatedInstructionWarning',
  'watchProjectFolderFilesForLocalProjects',
  // Contributor options
  'showInAppTutorialDeveloperMode',
  // Developer options
  'useGDJSDevelopmentWatcher',
]);

/**
 * Converts raw INI key-value pairs to typed ProjectSettings.
 */
export const convertToProjectSettings = (rawSettings: {
  [string]: mixed,
}): ProjectSettings => {
  const settings: ProjectSettings = {};

  for (const [key, value] of Object.entries(rawSettings)) {
    if (!VALID_PREFERENCE_KEYS.has(key)) {
      console.warn(`[ProjectSettingsReader] Unknown setting key: ${key}`);
      continue;
    }

    if (typeof value === 'boolean') {
      // $FlowFixMe - Dynamic property assignment
      settings[key] = value;
    }
  }

  return settings;
};

/**
 * Gets the directory path from a project file path.
 */
const getProjectDirectory = (projectFilePath: string): string | null => {
  if (!path) return null;
  return path.dirname(projectFilePath);
};

/**
 * Reads and parses the settings.ini file from a project's root directory.
 * Returns null if:
 * - The file doesn't exist
 * - The file system is not available (running in browser)
 * - The ini library is not available
 * - The project path is not a local file path
 *
 * @param projectFilePath - The full path to the project's main JSON file
 * @returns Parsed project settings or null
 */
export const readProjectSettings = async (
  projectFilePath: string
): Promise<ProjectSettings | null> => {
  if (!fsPromises || !path || !ini) {
    // File system or ini library not available (likely running in browser)
    return null;
  }

  const projectDirectory = getProjectDirectory(projectFilePath);
  if (!projectDirectory) {
    return null;
  }

  const settingsFilePath = path.join(projectDirectory, SETTINGS_FILE_NAME);

  try {
    // Check if the file exists
    await fsPromises.access(settingsFilePath);
  } catch {
    // File doesn't exist - this is normal, not an error
    return null;
  }

  try {
    const content = await fsPromises.readFile(settingsFilePath, {
      encoding: 'utf8',
    });
    const parsed = ini.parse(content);
    const rawSettings = flattenIniObject(parsed);
    const projectSettings = convertToProjectSettings(rawSettings);

    const settingsEntries = Object.entries(projectSettings)
      .map(([key, value]) => `  ${key}: ${String(value)}`)
      .join('\n');
    console.info(
      `[ProjectSettingsReader] Loaded project settings from: ${settingsFilePath}\n${settingsEntries}`
    );

    return projectSettings;
  } catch (error) {
    console.error(
      `[ProjectSettingsReader] Error reading settings.ini: ${error.message}`
    );
    return null;
  }
};
