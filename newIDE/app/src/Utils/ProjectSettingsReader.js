// @flow
import optionalRequire from './OptionalRequire';
import YAML from 'yaml';
import { SafeExtractor } from './SafeExtractor';

const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');

export type ParsedProjectSettings = {
  preferences: { [string]: boolean | string | number },
};

const SETTINGS_FILE_NAME = 'gdevelop-settings.yaml';

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

    const rawPreferences = SafeExtractor.extractObjectProperty(
      YAML.parse(content),
      'preferences'
    );
    if (!rawPreferences) {
      console.info(
        `[ProjectSettingsReader] Loaded settings from: ${settingsFilePath} (no preferences section)`
      );
      return null;
    }

    // Filter to only include primitive types (boolean, string, number)
    const preferences: { [string]: boolean | string | number } = {};
    for (const key of Object.keys(rawPreferences)) {
      const value = SafeExtractor.extractNumberOrStringOrBooleanProperty(
        rawPreferences,
        key
      );
      if (value !== null) {
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
      `[ProjectSettingsReader] Error reading gdevelop-settings.yaml: ${
        error.message
      }`
    );
    return null;
  }
};
