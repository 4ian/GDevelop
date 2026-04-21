// @flow
import optionalRequire from './OptionalRequire';
import YAML from 'yaml';
import { SafeExtractor } from './SafeExtractor';
import { type ToolbarButtonConfig } from '../MainFrame/CustomToolbarButton';
import type { ToolbarButtonHooksNames } from '../MainFrame/CustomToolbarButton';

const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');

export type ParsedProjectSettings = {
  preferences?: { [string]: boolean | string | number },
  toolbarButtons?: Array<ToolbarButtonConfig>,
  shortcuts?: { [string]: string },
};

const SETTINGS_FILE_NAME = 'gdevelop-settings.yaml';

// Only allow safe characters in npm script names to prevent command injection
const SAFE_SCRIPT_NAME_PATTERN = /^[a-zA-Z0-9_:-]+$/;

export const getProjectDirectory = (projectFilePath: string): string | null => {
  if (!path) return null;
  return path.dirname(projectFilePath);
};

/**
 * Parses raw toolbar button entries from YAML into validated ToolbarButtonConfig objects.
 * Exported for unit testing; file system is not needed.
 */
export const parseToolbarButtons = (
  rawToolbarButtons: Array<mixed>,
  availableScripts: { [string]: string }
): Array<ToolbarButtonConfig> => {
  const availableHooks: ToolbarButtonHooksNames[] = [
    'onEditorReady',
    'onPreviewStart',
    'onPreviewEnd',
  ];
  const toolbarButtons: Array<ToolbarButtonConfig> = [];

  for (const rawButton of rawToolbarButtons) {
    const name = SafeExtractor.extractStringProperty(rawButton, 'name');
    const icon = SafeExtractor.extractStringProperty(rawButton, 'icon');
    const npmScript = SafeExtractor.extractStringProperty(
      rawButton,
      'npmScript'
    );
    const hook = SafeExtractor.extractStringProperty(rawButton, 'hook');

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
      const toolbarButtonConfig: ToolbarButtonConfig = {
        name,
        icon,
        npmScript,
      };
      const matchedHook = hook && availableHooks.find(h => h === hook);
      if (matchedHook) {
        toolbarButtonConfig.hook = matchedHook;
      }
      toolbarButtons.push(toolbarButtonConfig);
    }
  }

  return toolbarButtons;
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
        toolbarButtons = parseToolbarButtons(
          rawToolbarButtons,
          availableScripts
        );
      }
    }

    // Parse shortcuts section
    const rawShortcuts = SafeExtractor.extractObjectProperty(
      parsed,
      'shortcuts'
    );
    const shortcuts: { [string]: string } = {};
    if (rawShortcuts) {
      for (const key of Object.keys(rawShortcuts)) {
        const value = SafeExtractor.extractStringProperty(rawShortcuts, key);
        if (value !== null) {
          shortcuts[key] = value;
        }
      }
    }

    console.info(
      `[ProjectSettingsReader] Loaded: ${
        Object.keys(preferences).length
      } preferences, ${toolbarButtons.length} buttons, ${
        Object.keys(shortcuts).length
      } shortcuts`
    );

    const result: ParsedProjectSettings = {};
    if (Object.keys(preferences).length > 0) {
      result.preferences = preferences;
    }
    if (toolbarButtons.length > 0) {
      result.toolbarButtons = toolbarButtons;
    }
    if (Object.keys(shortcuts).length > 0) {
      result.shortcuts = shortcuts;
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
