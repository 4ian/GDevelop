// @flow
import optionalRequire from './OptionalRequire';
import YAML from 'yaml';
import { SafeExtractor } from './SafeExtractor';
import { type ToolbarButtonConfig } from '../MainFrame/CustomToolbarButton';
import type { ToolbarButtonHooksNames } from '../MainFrame/CustomToolbarButton';

const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');

export type ResourcePropertyType =
  | 'enum'
  | 'string'
  | 'boolean'
  | 'number'
  | 'dictionary';

export type ResourcePropertyChoice = {|
  value: string,
  label: string,
|};

export type ResourcePropertyConfig = {|
  name: string,
  label: string,
  type: ResourcePropertyType,
  description?: string,
  resourceKinds?: Array<string>,
  default?: string | number | boolean,
  choices?: Array<ResourcePropertyChoice>,
  // For "dictionary" properties: the list of allowed keys (an enum). When
  // omitted, keys can be entered freely.
  keys?: Array<ResourcePropertyChoice>,
|};

export type ParsedProjectSettings = {
  preferences?: { [string]: boolean | string | number },
  toolbarButtons?: Array<ToolbarButtonConfig>,
  shortcuts?: { [string]: string },
  resourceProperties?: Array<ResourcePropertyConfig>,
};

const ALLOWED_RESOURCE_PROPERTY_TYPES: Array<ResourcePropertyType> = [
  'enum',
  'string',
  'boolean',
  'number',
  'dictionary',
];

// Only allow safe characters in property names so they stay clean keys in the
// resource metadata JSON consumed by the packer.
const SAFE_PROPERTY_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

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
      const keepTerminalOpen = SafeExtractor.extractBooleanProperty(
        rawButton,
        'keepTerminalOpen'
      );
      if (keepTerminalOpen === true) {
        toolbarButtonConfig.keepTerminalOpen = true;
      }
      toolbarButtons.push(toolbarButtonConfig);
    }
  }

  return toolbarButtons;
};

/**
 * Parses a YAML list of `{ value, label }` entries (used by both the enum
 * `choices` and the dictionary `keys` of a resource property). Entries without
 * a value are skipped; when `validateValueAsKey` is set, values must be safe
 * keys (they end up as keys in the resource metadata JSON).
 */
const parseValueLabelList = (
  rawList: ?Array<mixed>,
  {
    validateValueAsKey,
    ownerName,
  }: {| validateValueAsKey: boolean, ownerName: string |}
): Array<ResourcePropertyChoice> => {
  const result: Array<ResourcePropertyChoice> = [];
  if (!rawList) return result;
  for (const rawEntry of rawList) {
    const value = SafeExtractor.extractStringProperty(rawEntry, 'value');
    if (value === null) continue;
    if (validateValueAsKey && !SAFE_PROPERTY_NAME_PATTERN.test(value)) {
      console.warn(
        `[ProjectSettingsReader] Skipping dictionary key "${value}" of resource property "${ownerName}": key must match ${SAFE_PROPERTY_NAME_PATTERN.toString()}.`
      );
      continue;
    }
    const label =
      SafeExtractor.extractStringProperty(rawEntry, 'label') || value;
    result.push({ value, label });
  }
  return result;
};

/**
 * Parses raw `resourceProperties` entries from YAML into validated
 * ResourcePropertyConfig objects. Invalid entries are skipped with a warning.
 * Exported for unit testing; file system is not needed.
 */
export const parseResourceProperties = (
  rawResourceProperties: Array<mixed>
): Array<ResourcePropertyConfig> => {
  const resourceProperties: Array<ResourcePropertyConfig> = [];
  const seenNames: Set<string> = new Set();

  for (const rawProperty of rawResourceProperties) {
    const name = SafeExtractor.extractStringProperty(rawProperty, 'name');
    const type = SafeExtractor.extractStringProperty(rawProperty, 'type');

    if (!name) {
      console.warn(
        '[ProjectSettingsReader] Skipping resource property without a name.'
      );
      continue;
    }
    if (!SAFE_PROPERTY_NAME_PATTERN.test(name)) {
      console.warn(
        `[ProjectSettingsReader] Skipping resource property "${name}": name must match ${SAFE_PROPERTY_NAME_PATTERN.toString()}.`
      );
      continue;
    }
    if (!type || !ALLOWED_RESOURCE_PROPERTY_TYPES.includes((type: any))) {
      console.warn(
        `[ProjectSettingsReader] Skipping resource property "${name}": invalid type "${type ||
          ''}".`
      );
      continue;
    }
    // $FlowFixMe[incompatible-type] - type is checked against the allowed list above.
    const propertyType: ResourcePropertyType = type;

    const label =
      SafeExtractor.extractStringProperty(rawProperty, 'label') || name;
    const description =
      SafeExtractor.extractStringProperty(rawProperty, 'description') ||
      undefined;

    const config: ResourcePropertyConfig = {
      name,
      label,
      type: propertyType,
    };
    if (description) config.description = description;

    const rawResourceKinds = SafeExtractor.extractArrayProperty(
      rawProperty,
      'resourceKinds'
    );
    if (rawResourceKinds) {
      const resourceKinds = rawResourceKinds
        .map(rawKind => (typeof rawKind === 'string' ? rawKind : null))
        .filter(Boolean);
      if (resourceKinds.length > 0) config.resourceKinds = resourceKinds;
    }

    const defaultValue = SafeExtractor.extractNumberOrStringOrBooleanProperty(
      rawProperty,
      'default'
    );
    if (defaultValue !== null) config.default = defaultValue;

    if (propertyType === 'enum') {
      const choices = parseValueLabelList(
        SafeExtractor.extractArrayProperty(rawProperty, 'choices'),
        { validateValueAsKey: false, ownerName: name }
      );
      if (choices.length === 0) {
        console.warn(
          `[ProjectSettingsReader] Skipping resource property "${name}": enum type requires at least one choice.`
        );
        continue;
      }
      config.choices = choices;
    }

    if (propertyType === 'dictionary') {
      // The dictionary starts empty on each resource; `keys` only defines the
      // allowed keys the user can pick from when adding entries.
      const keys = parseValueLabelList(
        SafeExtractor.extractArrayProperty(rawProperty, 'keys'),
        { validateValueAsKey: true, ownerName: name }
      );
      if (keys.length > 0) config.keys = keys;
    }

    if (seenNames.has(name)) {
      console.warn(
        `[ProjectSettingsReader] Duplicate resource property "${name}": the last definition wins.`
      );
      const existingIndex = resourceProperties.findIndex(
        property => property.name === name
      );
      if (existingIndex !== -1) resourceProperties.splice(existingIndex, 1);
    }
    seenNames.add(name);
    resourceProperties.push(config);
  }

  return resourceProperties;
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

    // Parse resourceProperties section
    const rawResourceProperties = SafeExtractor.extractArrayProperty(
      parsed,
      'resourceProperties'
    );
    const resourceProperties = rawResourceProperties
      ? parseResourceProperties(rawResourceProperties)
      : [];

    console.info(
      `[ProjectSettingsReader] Loaded: ${
        Object.keys(preferences).length
      } preferences, ${toolbarButtons.length} buttons, ${
        Object.keys(shortcuts).length
      } shortcuts, ${resourceProperties.length} resource properties`
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
    if (resourceProperties.length > 0) {
      result.resourceProperties = resourceProperties;
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
