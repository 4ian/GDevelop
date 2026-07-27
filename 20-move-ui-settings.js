// @ts-check
/**
 * 20-move-ui-settings.js
 *
 * Migration script: Move UI settings out of the main project data into a
 * separate user-specific store so that:
 *   1. UI settings are not exported with the game (reducing export size).
 *   2. UI settings can be git-ignored, preventing merge conflicts.
 *
 * This script:
 *   - Reads the current project JSON file.
 *   - Extracts any UI-related settings (layout, panel states, editor prefs).
 *   - Writes those settings to a separate `.ui-settings.json` file alongside
 *     the project file (which should be added to `.gitignore`).
 *   - Removes the UI settings from the main project JSON.
 *   - Creates or updates `.gitignore` to exclude the UI settings file.
 *   - Supports dry-run mode to preview changes without writing.
 *   - Creates a backup of the project file before modifying it.
 *
 * Usage:
 *   node 20-move-ui-settings.js <projectFile> [--dry-run] [--no-backup]
 *
 * Example:
 *   node 20-move-ui-settings.js ./game/game.json
 *   node 20-move-ui-settings.js ./game/game.json --dry-run
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Keys that are considered UI / user-specific settings and should be moved
 * out of the main project data. These are the keys commonly found in
 * GDevelop project JSON that relate to editor state rather than game data.
 *
 * @type {string[]}
 */
const UI_SETTINGS_KEYS = [
  // Layout / window related
  'uiConfig',
  'uiSettings',
  'layout',
  'windowSettings',
  'editorState',
  'editorSettings',
  // Panel / toolbar preferences
  'panelLayout',
  'toolbarSettings',
  'openPanels',
  'panelSizes',
  // Recently used / history (user-specific)
  'recentlyUsed',
  'lastOpenedScene',
  'lastModifiedResources',
  // Selection / zoom (editor-specific)
  'selectionSettings',
  'zoomFactor',
  'scrollPosition',
  // Any custom UI-related nested objects
  'userPreferences',
  'workspaceState',
];

/**
 * The suffix used for the separate UI settings file.
 * The resulting file will be `<projectName>.ui-settings.json`.
 *
 * @type {string}
 */
const UI_SETTINGS_SUFFIX = '.ui-settings.json';

/**
 * The name of the gitignore file to create/update.
 *
 * @type {string}
 */
const GITIGNORE_FILE = '.gitignore';

/**
 * The pattern to add to .gitignore to exclude UI settings files.
 *
 * @type {string}
 */
const GITIGNORE_PATTERN = '*.ui-settings.json';

/**
 * Recursively extracts UI-related keys from an object, returning a new object
 * containing only the UI settings and a cleaned version of the original
 * object with those keys removed.
 *
 * This function walks through nested objects and arrays to find and remove
 * UI settings at any depth, while preserving the rest of the structure.
 *
 * @param {any} obj - The object to process.
 * @param {string[]} [keysToRemove] - The keys to treat as UI settings.
 * @returns {{ uiSettings: Object|null, cleanedData: any }} - An object with
 *   `uiSettings` (the extracted settings or null if none found) and
 *   `cleanedData` (the original data with UI settings removed).
 */
function extractUiSettings(obj, keysToRemove) {
  const keys = keysToRemove || UI_SETTINGS_KEYS;

  if (obj === null || typeof obj !== 'object') {
    return { uiSettings: null, cleanedData: obj };
  }

  if (Array.isArray(obj)) {
    // Process each array element; collect any UI settings found
    const uiSettingsCollection = [];
    const cleanedArray = obj.map((item) => {
      const result = extractUiSettings(item, keys);
      if (result.uiSettings && Object.keys(result.uiSettings).length > 0) {
        uiSettingsCollection.push(result.uiSettings);
      }
      return result.cleanedData;
    });

    const mergedSettings =
      uiSettingsCollection.length > 0
        ? uiSettingsCollection.reduce((acc, curr) => {
            Object.assign(acc, curr);
            return acc;
          }, {})
        : null;

    return { uiSettings: mergedSettings, cleanedData: cleanedArray };
  }

  // It's a plain object
  const uiSettings = {};
  const cleanedData = {};

  for (const key of Object.keys(obj)) {
    if (keys.includes(key)) {
      // This key is a UI setting; extract it
      uiSettings[key] = obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // Recurse into nested objects/arrays
      const result = extractUiSettings(obj[key], keys);
      if (result.uiSettings && Object.keys(result.uiSettings).length > 0) {
        // Merge nested UI settings under a namespaced key for traceability
        uiSettings[key] = result.uiSettings;
      }
      cleanedData[key] = result.cleanedData;
    } else {
      // Primitive value, keep as-is
      cleanedData[key] = obj[key];
    }
  }

  return {
    uiSettings: Object.keys(uiSettings).length > 0 ? uiSettings : null,
    cleanedData: cleanedData,
  };
}

/**
 * Reads and parses a JSON file safely.
 *
 * @param {string} filePath - The path to the JSON file.
 * @returns {Object} The parsed JSON object.
 * @throws {Error} If the file cannot be read or parsed.
 */
function readJsonFile(filePath) {
  try {
    const rawContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawContent);
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in file ${filePath}: ${err.message}`);
    }
    throw new Error(`Failed to read file ${filePath}: ${err.message}`);
  }
}

/**
 * Writes a JSON object to a file with pretty-printing.
 *
 * @param {string} filePath - The path to write to.
 * @param {Object} data - The data to serialize and write.
 * @throws {Error} If the file cannot be written.
 */
function writeJsonFile(filePath, data) {
  try {
    const content = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (err) {
    throw new Error(`Failed to write file ${filePath}: ${err.message}`);
  }
}

/**
 * Creates a backup of a file by copying it to `<originalPath>.bak`.
 *
 * @param {string} filePath - The path of the file to back up.
 * @throws {Error} If the backup cannot be created.
 */
function createBackup(filePath) {
  try {
    const backupPath = filePath + '.bak';
    fs.copyFileSync(filePath, backupPath);
    console.log(`Backup created: ${backupPath}`);
  } catch (err) {
    throw new Error(`Failed to create backup of ${filePath}: ${err.message}`);
  }
}

/**
 * Generates the path for the UI settings file based on the project file path.
 *
 * For example, if the project file is `/game/mygame.json`, the UI settings
 * file will be `/game/mygame.ui-settings.json`.
 *
 * @param {string} projectFilePath - The path to the project JSON file.
 * @returns {string} The path for the UI settings file.
 */
function getUiSettingsFilePath(projectFilePath) {
  const dir = path.dirname(projectFilePath);
  const ext = path.extname(projectFilePath);
  const baseName = path.basename(projectFilePath, ext);
  return path.join(dir, baseName + UI_SETTINGS_SUFFIX);
}

/**
 * Updates or creates a `.gitignore` file to include the UI settings pattern.
 * This ensures the separate UI settings file won't be tracked by git.
 *
 * @param {string} projectDir - The directory containing the project file.
 * @throws {Error} If the .gitignore file cannot be read or written.
 */
function updateGitignore(projectDir) {
  const gitignorePath = path.join(projectDir, GITIGNORE_FILE);
  let existingContent = '';

  try {
    if (fs.existsSync(gitignorePath)) {
      existingContent = fs.readFileSync(gitignorePath, 'utf8');
    }
  } catch (err) {
    throw new Error(`Failed to read ${gitignorePath}: ${err.message}`);
  }

  // Check if the pattern is already present
  if (existingContent.includes(GITIGNORE_PATTERN)) {
    console.log(`.gitignore already contains pattern: ${GITIGNORE_PATTERN}`);
    return;
  }

  // Append the pattern
  const newContent =
    existingContent.length > 0
      ? existingContent.trimEnd() + '\n' + GITIGNORE_PATTERN + '\n'
      : GITIGNORE_PATTERN + '\n';

  try {
    fs.writeFileSync(gitignorePath, newContent, 'utf8');
    console.log(`Added "${GITIGNORE_PATTERN}" to ${gitignorePath}`);
  } catch (err) {
    throw new Error(`Failed to update ${gitignorePath}: ${err.message}`);
  }
}

/**
 * Checks