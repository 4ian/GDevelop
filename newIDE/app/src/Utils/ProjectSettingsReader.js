// @flow
import optionalRequire from './OptionalRequire';
import YAML from 'yaml';
import { SafeExtractor } from './SafeExtractor';
import { type ToolbarButtonConfig } from '../MainFrame/CustomToolbarButton';

const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');

export type ParsedProjectSettings = {
  preferences?: { [string]: boolean | string | number },
  toolbarButtons?: Array<ToolbarButtonConfig>,
};

const SETTINGS_FILE_NAME = 'gdevelop-settings.yaml';

// Only allow safe characters in npm script names to prevent command injection
const SAFE_SCRIPT_NAME_PATTERN = /^[a-zA-Z0-9_:-]+$/;

export const getProjectDirectory = (projectFilePath: string): string | null => {
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

    const parsed = YAML.parse(content);

    // Parse preferences section
    const rawPreferences = SafeExtractor.extractObjectProperty(
      parsed,
      'preferences'
    );
    const preferences: { [string]: boolean | string | number } = {};
    if (rawPreferences) {
      for (const key of Object.keys(rawPreferences)) {
        const value = SafeExtractor.extractNumberOrStringOrBooleanProperty(
          rawPreferences,
          key
        );
        if (value !== null) {
          preferences[key] = value;
        }
      }
    }

    // Parse toolbarButtons section - requires package.json to exist
    const rawToolbarButtons = SafeExtractor.extractArrayProperty(
      parsed,
      'toolbarButtons'
    );
    let toolbarButtons: Array<ToolbarButtonConfig> = [];

    if (rawToolbarButtons && rawToolbarButtons.length > 0) {
      const packageJsonPath = path.join(projectDirectory, 'package.json');
      let availableScripts: { [string]: string } = {};

      try {
        const packageJsonContent = await fsPromises.readFile(packageJsonPath, {
          encoding: 'utf8',
        });
        const packageJson = JSON.parse(packageJsonContent);
        availableScripts = packageJson.scripts || {};
      } catch {
        console.info(
          '[ProjectSettingsReader] No package.json found - toolbar buttons disabled'
        );
      }

      // Only process buttons if we have a valid package.json with scripts
      if (Object.keys(availableScripts).length > 0) {
        for (const rawButton of rawToolbarButtons) {
          const name = SafeExtractor.extractStringProperty(rawButton, 'name');
          const icon = SafeExtractor.extractStringProperty(rawButton, 'icon');
          const npmScript = SafeExtractor.extractStringProperty(
            rawButton,
            'npmScript'
          );
          if (name && icon && npmScript) {
            if (!SAFE_SCRIPT_NAME_PATTERN.test(npmScript)) {
              console.warn(
                `[ProjectSettingsReader] Skipping button "${name}": invalid script name "${npmScript}"`
              );
              continue;
            }
            if (!availableScripts[npmScript]) {
              console.warn(
                `[ProjectSettingsReader] Skipping button "${name}": script "${npmScript}" not found in package.json`
              );
              continue;
            }
            toolbarButtons.push({ name, icon, npmScript });
          }
        }
      }
    }

    console.info(
      `[ProjectSettingsReader] Loaded: ${
        Object.keys(preferences).length
      } preferences, ${toolbarButtons.length} buttons`
    );

    const result: ParsedProjectSettings = {};
    if (Object.keys(preferences).length > 0) {
      result.preferences = preferences;
    }
    if (toolbarButtons.length > 0) {
      result.toolbarButtons = toolbarButtons;
    }
    return result;
  } catch (error) {
    console.error(
      `[ProjectSettingsReader] Error reading gdevelop-settings.yaml: ${
        error.message
      }`
    );
    return null;
  }
};
