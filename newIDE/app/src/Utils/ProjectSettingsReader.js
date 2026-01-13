// @flow
import optionalRequire from './OptionalRequire';
import YAML from 'yaml';

const fs = optionalRequire('node:fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('node:path');

export type RawProjectSettings = {
  preferences?: { [string]: mixed },
};

export type ParsedProjectSettings = {
  preferences: { [string]: boolean | string | number },
};

const SETTINGS_FILE_NAME = 'gdevelop-settings.yaml';

/**
 * Gets the directory path from a project file path.
 */
const getProjectDirectory = (projectFilePath: string): string | null => {
  if (!path) return null;
  return path.dirname(projectFilePath);
};

/**
 * Reads and parses the gdevelop-settings.yaml file from a project's root directory.
 * Returns null if:
 * - The file doesn't exist
 * - The file system is not available (running in browser)
 * - The project path is not a local file path
 *
 * @param projectFilePath - The full path to the project's main JSON file
 * @returns Parsed project settings or null
 */
export const readProjectSettings = async (
  projectFilePath: string
): Promise<ParsedProjectSettings | null> => {
  if (!fsPromises || !path) {
    return null;
  }

  const projectDirectory = getProjectDirectory(projectFilePath);
  if (!projectDirectory) {
    return null;
  }

  const settingsFilePath = path.join(projectDirectory, SETTINGS_FILE_NAME);

  try {
    await fsPromises.access(settingsFilePath);
  } catch {
    return null;
  }

  try {
    const content = await fsPromises.readFile(settingsFilePath, {
      encoding: 'utf8',
    });
    const raw: RawProjectSettings = YAML.parse(content) || {};

    const rawPreferences = raw.preferences;
    if (!rawPreferences || typeof rawPreferences !== 'object') {
      console.info(
        `[ProjectSettingsReader] Loaded settings from: ${settingsFilePath} (no preferences section)`
      );
      return null;
    }

    // Filter to only include primitive types (boolean, string, number)
    const preferences: { [string]: boolean | string | number } = {};
    for (const [key, value] of Object.entries(rawPreferences)) {
      if (
        typeof value === 'boolean' ||
        typeof value === 'string' ||
        typeof value === 'number'
      ) {
        preferences[key] = value;
      }
    }

    const preferencesEntries = Object.entries(preferences)
      .map(([key, value]) => `  ${key}: ${String(value)}`)
      .join('\n');
    console.info(
      `[ProjectSettingsReader] Loaded settings from: ${settingsFilePath}\n${preferencesEntries}`
    );

    return { preferences };
  } catch (error) {
    console.error(
      `[ProjectSettingsReader] Error reading gdevelop-settings.yaml: ${error.message}`
    );
    return null;
  }
};
