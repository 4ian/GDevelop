// @noflow

import parseToml from '@iarna/toml/parse-string';
import stringifyToml from '@iarna/toml/stringify';
import { sha256 } from 'js-sha256';
import {
  compileIfDoToLegacyEventsJson,
  convertLegacyEventsJsonToIfDo,
  parseLegacyEventsJson,
} from '../../EventsSheet/IfDoEventsDsl';

export const MULTI_FILE_FORMAT_VERSION = 1;
export const MULTI_FILE_ENTRY_NAME = 'project.settings';
export const MULTI_FILE_ENTRY_URI = 'game://project.settings';

const PROJECT_SPLIT_FIELDS = new Set([
  'layouts',
  'externalEvents',
  'externalLayouts',
  'eventsFunctionsExtensions',
]);

export const SCENE_LAYOUT_FIELDS = Object.freeze([
  'r',
  'v',
  'b',
  'uiSettings',
  'objects',
  'objectsFolderStructure',
  'instances',
  'layers',
]);

const PREFAB_LAYOUT_FIELDS = Object.freeze([
  'areaMinX',
  'areaMinY',
  'areaMinZ',
  'areaMaxX',
  'areaMaxY',
  'areaMaxZ',
  'objects',
  'objectsFolderStructure',
  'objectsGroups',
  'layers',
  'instances',
  'editionSettings',
]);

const EXTERNAL_LAYOUT_FIELDS = Object.freeze(['instances', 'editionSettings']);
const WINDOWS_DEVICE_NAME = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i;
const SIMPLE_URI_SEGMENT = /^[A-Za-z0-9_.-]+$/;

export class MultiFileProjectError extends Error {
  code: string;
  fileUri: ?string;

  constructor(code: string, message: string, fileUri?: string) {
    super(fileUri ? `${message} (${fileUri})` : message);
    this.name = 'MultiFileProjectError';
    this.code = code;
    this.fileUri = fileUri || null;
  }
}

const fail = (code: string, message: string, fileUri?: string): empty => {
  throw new MultiFileProjectError(code, message, fileUri);
};

const clone = value => JSON.parse(JSON.stringify(value));

const asObject = (value, label, fileUri) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('MULTIFILE_INVALID_SCHEMA', `${label} must be a table.`, fileUri);
  }
  return value;
};

const asArray = (value, label, fileUri) => {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    fail('MULTIFILE_INVALID_SCHEMA', `${label} must be an array.`, fileUri);
  }
  return value;
};

const expectString = (value, label, fileUri) => {
  if (typeof value !== 'string') {
    fail('MULTIFILE_INVALID_SCHEMA', `${label} must be a string.`, fileUri);
  }
  return value;
};

const quotePointerToken = token =>
  String(token)
    .replace(/~/g, '~0')
    .replace(/\//g, '~1');

const unquotePointerToken = token =>
  token.replace(/~1/g, '/').replace(/~0/g, '~');

const canonicalJson = value => JSON.stringify(value);

const scalarKind = value =>
  value === null
    ? 'null'
    : Array.isArray(value)
    ? 'array'
    : typeof value === 'object'
    ? 'object'
    : typeof value;

const projectTomlPayload = payload => {
  const rawJson = {};

  const visit = (value, pointer) => {
    if (value === null) {
      rawJson[pointer] = canonicalJson(value);
      return undefined;
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        fail(
          'MULTIFILE_UNREPRESENTABLE_VALUE',
          `Non-finite number at ${pointer || '/'} cannot be stored.`
        );
      }
      return value;
    }
    if (typeof value === 'string' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) {
      const kinds = new Set(value.map(scalarKind));
      const compatible = !kinds.has('null') && kinds.size <= 1;
      if (!compatible) {
        rawJson[pointer] = canonicalJson(value);
        return undefined;
      }
      return value.map((item, index) =>
        visit(item, `${pointer}/${quotePointerToken(index)}`)
      );
    }
    if (value && typeof value === 'object') {
      if (value instanceof Date) {
        fail(
          'MULTIFILE_UNREPRESENTABLE_VALUE',
          `TOML dates are forbidden at ${pointer || '/'}.`
        );
      }
      const result = {};
      Object.keys(value).forEach(key => {
        const childPointer = `${pointer}/${quotePointerToken(key)}`;
        const child = visit(value[key], childPointer);
        if (child !== undefined) result[key] = child;
      });
      return result;
    }
    fail(
      'MULTIFILE_UNREPRESENTABLE_VALUE',
      `Unsupported value at ${pointer || '/'}.`
    );
  };

  const projected = visit(payload, '');
  if (Object.prototype.hasOwnProperty.call(projected, 'rawJson')) {
    fail(
      'MULTIFILE_RESERVED_FIELD',
      'The rawJson key is reserved by the multi-file projection.'
    );
  }
  if (Object.keys(rawJson).length) projected.rawJson = rawJson;
  return projected;
};

const setJsonPointer = (root, pointer, value, fileUri) => {
  if (!pointer.startsWith('/')) {
    fail(
      'MULTIFILE_INVALID_RAW_POINTER',
      `Raw JSON pointer must start with /: ${pointer}`,
      fileUri
    );
  }
  const tokens = pointer
    .slice(1)
    .split('/')
    .map(unquotePointerToken);
  let current = root;
  tokens.slice(0, -1).forEach(token => {
    if (!current || typeof current !== 'object') {
      fail(
        'MULTIFILE_INVALID_RAW_POINTER',
        `Raw JSON pointer overlaps a scalar: ${pointer}`,
        fileUri
      );
    }
    if (current[token] === undefined) current[token] = {};
    current = current[token];
  });
  const finalToken = tokens[tokens.length - 1];
  if (Object.prototype.hasOwnProperty.call(current, finalToken)) {
    fail(
      'MULTIFILE_INVALID_RAW_POINTER',
      `Raw JSON pointer overlaps projected data: ${pointer}`,
      fileUri
    );
  }
  current[finalToken] = value;
};

const restoreTomlPayload = (namespace, fileUri) => {
  const payload = clone(namespace);
  const rawJson = payload.rawJson;
  delete payload.rawJson;
  if (rawJson !== undefined) {
    asObject(rawJson, 'rawJson', fileUri);
    const pointers = Object.keys(rawJson).sort(
      (left, right) => left.split('/').length - right.split('/').length
    );
    pointers.forEach((pointer, index) => {
      if (
        pointers
          .slice(0, index)
          .some(parent =>
            pointer.startsWith(parent.endsWith('/') ? parent : `${parent}/`)
          )
      ) {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Overlapping raw JSON pointer: ${pointer}`,
          fileUri
        );
      }
      const encoded = rawJson[pointer];
      if (typeof encoded !== 'string') {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Raw JSON value must be canonical JSON text: ${pointer}`,
          fileUri
        );
      }
      let value;
      try {
        value = JSON.parse(encoded);
      } catch (error) {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Invalid raw JSON at ${pointer}: ${error.message}`,
          fileUri
        );
      }
      if (canonicalJson(value) !== encoded) {
        fail(
          'MULTIFILE_INVALID_RAW_POINTER',
          `Raw JSON is not canonical at ${pointer}.`,
          fileUri
        );
      }
      setJsonPointer(payload, pointer, value, fileUri);
    });
  }
  return payload;
};

const normalizeLf = source =>
  source.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');

const stripTomlStructuralIndentation = source => {
  let inMultilineBasicString = false;
  return source
    .split('\n')
    .map(line => {
      const output = inMultilineBasicString
        ? line
        : line.replace(/^[ \t]+/, '');
      for (let index = 0; index <= output.length - 3; index++) {
        if (output.slice(index, index + 3) !== '"""') continue;
        let backslashCount = 0;
        for (let cursor = index - 1; output[cursor] === '\\'; cursor--)
          backslashCount++;
        if (backslashCount % 2 === 0) {
          inMultilineBasicString = !inMultilineBasicString;
          index += 2;
        }
      }
      return output;
    })
    .join('\n');
};

const serializeToml = object => {
  // TOML table nesting is already explicit in dotted headers. Keeping every
  // generated line at column zero avoids presentation-only whitespace churn.
  const output = stripTomlStructuralIndentation(
    normalizeLf(stringifyToml(object))
  ).trimEnd();
  return `${output}\n`;
};

export const parseTomlSource = (source, fileUri = '<memory>') => {
  if (typeof source !== 'string') {
    fail('MULTIFILE_INVALID_SOURCE', 'Source must be UTF-8 text.', fileUri);
  }
  if (source.charCodeAt(0) === 0xfeff) {
    fail('MULTIFILE_INVALID_SOURCE', 'UTF-8 BOM is forbidden.', fileUri);
  }
  if (source.includes('\r')) {
    fail(
      'MULTIFILE_INVALID_SOURCE',
      'Only LF line endings are allowed.',
      fileUri
    );
  }
  if (/^(?:<<<<<<<|=======|>>>>>>>)/m.test(source)) {
    fail(
      'MULTIFILE_MERGE_CONFLICT',
      'Git conflict markers are not valid.',
      fileUri
    );
  }
  try {
    const parsed = parseToml(source);
    const rejectDates = value => {
      if (value instanceof Date) {
        fail('MULTIFILE_INVALID_SOURCE', 'TOML dates are forbidden.', fileUri);
      }
      if (Array.isArray(value)) value.forEach(rejectDates);
      else if (value && typeof value === 'object')
        Object.keys(value).forEach(key => rejectDates(value[key]));
    };
    rejectDates(parsed);
    return parsed;
  } catch (error) {
    if (error instanceof MultiFileProjectError) throw error;
    fail('MULTIFILE_INVALID_TOML', error.message, fileUri);
  }
};

const encodeUtf8Byte = byte =>
  `%${byte
    .toString(16)
    .toUpperCase()
    .padStart(2, '0')}`;

export const encodeManagedName = displayName => {
  const normalized = String(displayName).normalize('NFC');
  let encoded = '';
  for (const character of normalized) {
    if (/^[A-Za-z0-9_.-]$/.test(character)) encoded += character;
    else {
      const bytes = unescape(encodeURIComponent(character))
        .split('')
        .map(item => item.charCodeAt(0));
      encoded += bytes.map(encodeUtf8Byte).join('');
    }
  }
  encoded = encoded.replace(/\.+$/g, dots => '%2E'.repeat(dots.length));
  if (
    encoded === '.' ||
    encoded === '..' ||
    WINDOWS_DEVICE_NAME.test(encoded)
  ) {
    const first = normalized.charCodeAt(0);
    encoded = `${encodeUtf8Byte(first)}${encoded.slice(1)}`;
  }
  return encoded || '_unnamed';
};

const stableHash8 = value => {
  return sha256(String(value)).slice(0, 8);
};

const uniqueManagedName = (displayName, used) => {
  let encoded = encodeManagedName(displayName);
  const collisionKey = decodeURIComponent(encoded)
    .normalize('NFC')
    .toLowerCase();
  if (used.has(collisionKey)) encoded += `~${stableHash8(String(displayName))}`;
  used.add(
    decodeURIComponent(encoded)
      .normalize('NFC')
      .toLowerCase()
  );
  return encoded;
};

const encodeUriPath = segments =>
  `game://${segments.map(segment => String(segment)).join('/')}`;

export const validateGameUri = uri => {
  if (typeof uri !== 'string' || !uri.startsWith('game://')) {
    fail('MULTIFILE_INVALID_URI', `Managed reference must use game://: ${uri}`);
  }
  const relative = uri.slice('game://'.length);
  if (
    !relative ||
    relative.includes('\\') ||
    relative.includes('?') ||
    relative.includes('#') ||
    /^[A-Za-z]:/.test(relative) ||
    relative.startsWith('/')
  ) {
    fail('MULTIFILE_INVALID_URI', `Invalid game URI: ${uri}`);
  }
  const segments = relative.split('/');
  if (
    segments.some(segment => !segment || segment === '.' || segment === '..')
  ) {
    fail('MULTIFILE_INVALID_URI', `Invalid game URI segment: ${uri}`);
  }
  segments.forEach(segment => {
    if (/%(?![0-9A-F]{2})/.test(segment)) {
      fail('MULTIFILE_INVALID_URI', `Invalid percent encoding: ${uri}`);
    }
    let decoded;
    try {
      decoded = decodeURIComponent(segment);
    } catch (error) {
      fail('MULTIFILE_INVALID_URI', `Invalid UTF-8 path encoding: ${uri}`);
    }
    if (
      decoded.normalize('NFC') !== decoded ||
      decoded === '.' ||
      decoded === '..'
    ) {
      fail('MULTIFILE_INVALID_URI', `Non-canonical game URI: ${uri}`);
    }
    if (
      SIMPLE_URI_SEGMENT.test(decoded) &&
      segment !== decoded &&
      !WINDOWS_DEVICE_NAME.test(decoded) &&
      !decoded.endsWith('.')
    ) {
      fail('MULTIFILE_INVALID_URI', `Unnecessary percent encoding: ${uri}`);
    }
  });
  return segments.map(segment => decodeURIComponent(segment)).join('/');
};

const takeFields = (source, fields) => {
  const output = {};
  fields.forEach(field => {
    if (source[field] !== undefined) output[field] = clone(source[field]);
  });
  return output;
};

const omitFields = (source, fields) => {
  const output = {};
  Object.keys(source).forEach(key => {
    if (!fields.has(key)) output[key] = clone(source[key]);
  });
  return output;
};

const projectSettingsNamespace = document => {
  const output = clone(document);
  let found = false;
  const visit = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return;
    if (typeof value.kind === 'string' && value.settingsFormatVersion === 1) {
      if (found) {
        fail(
          'MULTIFILE_INVALID_SCHEMA',
          'A settings fragment must own exactly one component namespace.'
        );
      }
      found = true;
      const projected = projectTomlPayload(value);
      Object.keys(value).forEach(key => delete value[key]);
      Object.assign(value, projected);
      return;
    }
    Object.keys(value).forEach(key => visit(value[key]));
  };
  visit(output);
  if (!found) {
    fail(
      'MULTIFILE_INVALID_SCHEMA',
      'A settings fragment is missing its owned component namespace.'
    );
  }
  return output;
};

const putSettingsFile = (files, uri, namespace) => {
  validateGameUri(uri);
  files[uri] = serializeToml(projectSettingsNamespace(namespace));
};

const putLayoutFile = (files, uri, format, layout) => {
  validateGameUri(uri);
  files[uri] = serializeToml({
    format,
    formatVersion: MULTI_FILE_FORMAT_VERSION,
    layout: projectTomlPayload(layout),
  });
};

const putEventsFile = (files, uri, events, eventsDslOptions) => {
  validateGameUri(uri);
  files[uri] = convertLegacyEventsJsonToIfDo(
    JSON.stringify(events || []),
    eventsDslOptions || {}
  );
};

const functionSettingsPayload = (extensionName, functionObject, eventsUri) => ({
  kind: 'function',
  settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
  ...omitFields(functionObject, new Set(['events'])),
  extension: extensionName,
  events: eventsUri,
});

const splitOwnerFunctions = ({
  functions,
  baseSegments,
  files,
  eventsDslOptions,
}) => {
  const functionNames = new Set();
  return (functions || []).map(functionObject => {
    const functionName = String(functionObject.name || '');
    const functionFileName = uniqueManagedName(functionName, functionNames);
    const eventsUri = encodeUriPath([
      ...baseSegments,
      `${functionFileName}.events`,
    ]);
    putEventsFile(
      files,
      eventsUri,
      functionObject.events || [],
      eventsDslOptions
    );
    return {
      ...omitFields(functionObject, new Set(['events'])),
      events: eventsUri,
    };
  });
};

const splitPrefab = ({
  extensionName,
  prefab,
  baseSegments,
  files,
  eventsDslOptions,
}) => {
  const prefabName = String(prefab.name || '');
  const layoutUri = encodeUriPath([
    ...baseSegments,
    `${baseSegments[baseSegments.length - 1]}.layout`,
  ]);
  putLayoutFile(
    files,
    layoutUri,
    'gdevelop-prefab-layout',
    takeFields(prefab, PREFAB_LAYOUT_FIELDS)
  );
  const functions = splitOwnerFunctions({
    functions: prefab.eventsFunctions,
    baseSegments,
    files,
    eventsDslOptions,
  });
  const variantNames = new Set();
  const variants = (prefab.variants || []).map(variant => {
    const variantName = String(variant.name || '');
    const variantFileName = uniqueManagedName(variantName, variantNames);
    const variantLayoutUri = encodeUriPath([
      ...baseSegments,
      'variants',
      `${variantFileName}.layout`,
    ]);
    putLayoutFile(
      files,
      variantLayoutUri,
      'gdevelop-prefab-variant-layout',
      takeFields(variant, PREFAB_LAYOUT_FIELDS)
    );
    return {
      ...omitFields(variant, new Set(PREFAB_LAYOUT_FIELDS)),
      layout: variantLayoutUri,
    };
  });
  const metadata = omitFields(
    prefab,
    new Set([...PREFAB_LAYOUT_FIELDS, 'eventsFunctions', 'variants'])
  );
  return {
    kind: 'prefab',
    settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
    ...metadata,
    name: prefabName,
    layout: layoutUri,
    functions,
    variants,
  };
};

const splitBehavior = ({
  behavior,
  baseSegments,
  files,
  eventsDslOptions,
}) => ({
  kind: 'behavior',
  settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
  ...omitFields(behavior, new Set(['eventsFunctions'])),
  functions: splitOwnerFunctions({
    functions: behavior.eventsFunctions,
    baseSegments,
    files,
    eventsDslOptions,
  }),
});

export const decomposeLegacyProjectToFiles = (legacyProject, options = {}) => {
  const project = clone(asObject(legacyProject, 'Project'));
  const files = {};
  const projectPayload = omitFields(project, PROJECT_SPLIT_FIELDS);
  const sceneFiles = [];
  const extensionFiles = [];
  const sceneNames = new Set();
  const extensionNames = new Set();

  (project.layouts || []).forEach(layout => {
    const name = String(layout.name || '');
    const folderName = uniqueManagedName(name, sceneNames);
    const settingsUri = encodeUriPath(['scenes', folderName, 'scene.settings']);
    const layoutUri = encodeUriPath([
      'scenes',
      folderName,
      `${folderName}.layout`,
    ]);
    const eventsUri = encodeUriPath([
      'scenes',
      folderName,
      `${folderName}.events`,
    ]);
    sceneFiles.push({
      name,
      settings: settingsUri,
      layout: layoutUri,
      events: eventsUri,
    });
    const settingsPayload = omitFields(
      layout,
      new Set([...SCENE_LAYOUT_FIELDS, 'events'])
    );
    putSettingsFile(files, settingsUri, {
      scenes: {
        [name]: {
          kind: 'scene',
          settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
          ...settingsPayload,
        },
      },
    });
    putLayoutFile(
      files,
      layoutUri,
      'gdevelop-scene-layout',
      takeFields(layout, SCENE_LAYOUT_FIELDS)
    );
    putEventsFile(
      files,
      eventsUri,
      layout.events || [],
      options.eventsDslOptions
    );
  });

  (project.eventsFunctionsExtensions || []).forEach(extension => {
    const extensionName = String(extension.name || '');
    const extensionFolder = uniqueManagedName(extensionName, extensionNames);
    const extensionBase = ['extensions', extensionFolder];
    const settingsUri = encodeUriPath([...extensionBase, 'extension.settings']);
    const functionFiles = [];
    const prefabFiles = [];
    const behaviorFiles = [];
    const functionNames = new Set();
    const prefabNames = new Set();
    const behaviorNames = new Set();

    (extension.eventsFunctions || []).forEach(functionObject => {
      const name = String(functionObject.name || '');
      const folder = uniqueManagedName(name, functionNames);
      const base = [...extensionBase, 'functions', folder];
      const functionSettingsUri = encodeUriPath([...base, 'function.settings']);
      const eventsUri = encodeUriPath([...base, `${folder}.events`]);
      functionFiles.push({ name, settings: functionSettingsUri });
      putSettingsFile(files, functionSettingsUri, {
        extensions: {
          [extensionName]: {
            functions: {
              [name]: functionSettingsPayload(
                extensionName,
                functionObject,
                eventsUri
              ),
            },
          },
        },
      });
      putEventsFile(
        files,
        eventsUri,
        functionObject.events || [],
        options.eventsDslOptions
      );
    });

    (extension.eventsBasedObjects || []).forEach(prefab => {
      const name = String(prefab.name || '');
      const folder = uniqueManagedName(name, prefabNames);
      const base = [...extensionBase, 'prefabs', folder];
      const prefabSettingsUri = encodeUriPath([...base, 'prefab.settings']);
      prefabFiles.push({ name, settings: prefabSettingsUri });
      putSettingsFile(files, prefabSettingsUri, {
        extensions: {
          [extensionName]: {
            prefabs: {
              [name]: splitPrefab({
                extensionName,
                prefab,
                baseSegments: base,
                files,
                eventsDslOptions: options.eventsDslOptions,
              }),
            },
          },
        },
      });
    });

    (extension.eventsBasedBehaviors || []).forEach(behavior => {
      const name = String(behavior.name || '');
      const folder = uniqueManagedName(name, behaviorNames);
      const base = [...extensionBase, 'behaviors', folder];
      const behaviorSettingsUri = encodeUriPath([...base, 'behavior.settings']);
      behaviorFiles.push({ name, settings: behaviorSettingsUri });
      putSettingsFile(files, behaviorSettingsUri, {
        extensions: {
          [extensionName]: {
            behaviors: {
              [name]: splitBehavior({
                behavior,
                baseSegments: base,
                files,
                eventsDslOptions: options.eventsDslOptions,
              }),
            },
          },
        },
      });
    });

    const extensionMetadata = omitFields(
      extension,
      new Set(['eventsFunctions', 'eventsBasedObjects', 'eventsBasedBehaviors'])
    );
    putSettingsFile(files, settingsUri, {
      extensions: {
        [extensionName]: {
          kind: 'extension',
          settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
          ...extensionMetadata,
          functionFiles,
          prefabFiles,
          behaviorFiles,
        },
      },
    });
    extensionFiles.push({ name: extensionName, settings: settingsUri });
  });

  let externalSettings;
  if (
    (project.externalEvents || []).length ||
    (project.externalLayouts || []).length
  ) {
    externalSettings = 'game://externals/external.settings';
    const eventFiles = [];
    const layoutFiles = [];
    const eventNames = new Set();
    const layoutNames = new Set();
    (project.externalEvents || []).forEach(external => {
      const name = String(external.name || '');
      const fileName = uniqueManagedName(name, eventNames);
      const eventsUri = encodeUriPath(['externals', `${fileName}.events`]);
      eventFiles.push({
        ...omitFields(
          external,
          new Set(['name', 'associatedLayout', 'events'])
        ),
        name,
        linkedScene: String(external.associatedLayout || ''),
        events: eventsUri,
      });
      putEventsFile(
        files,
        eventsUri,
        external.events || [],
        options.eventsDslOptions
      );
    });
    (project.externalLayouts || []).forEach(external => {
      const name = String(external.name || '');
      const fileName = uniqueManagedName(name, layoutNames);
      const layoutUri = encodeUriPath(['externals', `${fileName}.layout`]);
      layoutFiles.push({
        ...omitFields(
          external,
          new Set(['name', 'associatedLayout', ...EXTERNAL_LAYOUT_FIELDS])
        ),
        name,
        linkedScene: String(external.associatedLayout || ''),
        layout: layoutUri,
      });
      putLayoutFile(
        files,
        layoutUri,
        'gdevelop-external-layout',
        takeFields(external, EXTERNAL_LAYOUT_FIELDS)
      );
    });
    putSettingsFile(files, externalSettings, {
      externals: {
        kind: 'externals',
        settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
        eventFiles,
        layoutFiles,
      },
    });
  }

  const projectNamespace = {
    kind: 'project',
    settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
    ...projectPayload,
    sceneFiles,
    extensionFiles,
    ...(externalSettings ? { externalSettings } : {}),
    ...(options.migration ? { migration: clone(options.migration) } : {}),
  };
  putSettingsFile(files, MULTI_FILE_ENTRY_URI, {
    gdevelop: {
      combinedSettingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
      eventsDslVersion: '1.3',
      entry: MULTI_FILE_ENTRY_URI,
    },
    project: projectNamespace,
  });

  return files;
};

const parseSettings = (files, uri) => {
  const source = files[uri];
  if (source === undefined) {
    fail('MULTIFILE_MISSING_FILE', 'Referenced settings file is missing.', uri);
  }
  return parseTomlSource(source, uri);
};

const readLayout = (files, uri, expectedFormat) => {
  const document = parseSettings(files, uri);
  if (document.format !== expectedFormat || document.formatVersion !== 1) {
    fail(
      'MULTIFILE_INVALID_LAYOUT',
      `Expected ${expectedFormat} version 1.`,
      uri
    );
  }
  const layout = restoreTomlPayload(
    asObject(document.layout, 'layout', uri),
    uri
  );
  if (Object.prototype.hasOwnProperty.call(layout, 'events')) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Layout files cannot contain events.',
      uri
    );
  }
  return layout;
};

const compileEvents = (files, uri, options) => {
  validateGameUri(uri);
  const source = files[uri];
  if (source === undefined) {
    fail('MULTIFILE_MISSING_FILE', 'Referenced events file is missing.', uri);
  }
  if (/^\s*(?:\[|\{|format\s*=)/.test(source)) {
    fail(
      'MULTIFILE_OWNERSHIP_CONFLICT',
      'Events files must contain IfDo DSL only.',
      uri
    );
  }
  return JSON.parse(
    compileIfDoToLegacyEventsJson(source, options.compileOptions || {})
  );
};

const requireNamespace = (root, path, uri) => {
  let current = root;
  path.forEach(segment => {
    current = asObject(current[segment], path.join('.'), uri);
  });
  return current;
};

const removeFormatFields = payload => {
  const result = clone(payload);
  delete result.kind;
  delete result.settingsFormatVersion;
  return result;
};

const validateManifestIdentity = (entry, payload, uri) => {
  if (
    payload.name !== undefined &&
    String(payload.name) !== String(entry.name)
  ) {
    fail(
      'MULTIFILE_IDENTITY_MISMATCH',
      `Manifest name ${entry.name} does not match content name ${
        payload.name
      }.`,
      uri
    );
  }
};

const assertUniqueManifestNames = (entries, label, uri) => {
  const names = new Set();
  entries.forEach(entry => {
    const name = expectString(entry.name, `${label}.name`, uri);
    if (names.has(name)) {
      fail(
        'MULTIFILE_DUPLICATE_IDENTITY',
        `${label} contains duplicate name ${JSON.stringify(name)}.`,
        uri
      );
    }
    names.add(name);
  });
};

const validateSceneManifestPaths = entry => {
  const settingsPath = validateGameUri(entry.settings);
  const layoutPath = validateGameUri(entry.layout);
  const eventsPath = validateGameUri(entry.events);
  const settingsSegments = settingsPath.split('/');
  const folder = settingsSegments[1];
  if (
    settingsSegments.length !== 3 ||
    settingsSegments[0] !== 'scenes' ||
    settingsSegments[2] !== 'scene.settings' ||
    layoutPath !== `scenes/${folder}/${folder}.layout` ||
    eventsPath !== `scenes/${folder}/${folder}.events`
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Scene ${
        entry.name
      } must reference one settings/layout/events trio in its scene folder.`
    );
  }
};

const validateExtensionSettingsPath = entry => {
  const segments = validateGameUri(entry.settings).split('/');
  if (
    segments.length !== 3 ||
    segments[0] !== 'extensions' ||
    segments[2] !== 'extension.settings'
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Extension ${entry.name} has an invalid settings path.`
    );
  }
};

const validateChildSettingsPath = (ownerUri, childUri, childKind) => {
  const ownerSegments = validateGameUri(ownerUri).split('/');
  const childSegments = validateGameUri(childUri).split('/');
  const expectedFolder =
    childKind === 'functionFiles'
      ? 'functions'
      : childKind === 'prefabFiles'
      ? 'prefabs'
      : 'behaviors';
  const expectedSettings =
    childKind === 'functionFiles'
      ? 'function.settings'
      : childKind === 'prefabFiles'
      ? 'prefab.settings'
      : 'behavior.settings';
  if (
    childSegments.length !== 5 ||
    childSegments[0] !== 'extensions' ||
    childSegments[1] !== ownerSegments[1] ||
    childSegments[2] !== expectedFolder ||
    childSegments[4] !== expectedSettings
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `Child settings must be stored below the owning extension ${expectedFolder} folder.`,
      childUri
    );
  }
};

const validateExternalSourceUri = (uri, extension) => {
  const segments = validateGameUri(uri).split('/');
  if (
    segments.length !== 2 ||
    segments[0] !== 'externals' ||
    !segments[1].endsWith(extension)
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      `External ${extension} source must be stored directly in externals/.`,
      uri
    );
  }
};

const composeOwnerFunctions = (files, entries, options, ownerUri) => {
  const functionEntries = asArray(entries, 'functions', ownerUri);
  assertUniqueManifestNames(functionEntries, 'functions', ownerUri);
  return functionEntries.map(entry => {
    const metadata = omitFields(entry, new Set(['events']));
    return {
      ...metadata,
      events: compileEvents(
        files,
        expectString(entry.events, 'function.events'),
        options
      ),
    };
  });
};

const composePrefab = (files, namespace, options, uri) => {
  const payload = restoreTomlPayload(namespace, uri);
  const layoutUri = expectString(payload.layout, 'prefab.layout', uri);
  const layout = readLayout(files, layoutUri, 'gdevelop-prefab-layout');
  const functions = composeOwnerFunctions(
    files,
    payload.functions || [],
    options,
    uri
  );
  const variants = asArray(payload.variants, 'prefab.variants', uri).map(
    entry => {
      const variantLayout = readLayout(
        files,
        expectString(entry.layout, 'variant.layout', uri),
        'gdevelop-prefab-variant-layout'
      );
      return { ...omitFields(entry, new Set(['layout'])), ...variantLayout };
    }
  );
  const metadata = omitFields(
    removeFormatFields(payload),
    new Set(['layout', 'functions', 'variants'])
  );
  return { ...metadata, ...layout, eventsFunctions: functions, variants };
};

const composeBehavior = (files, namespace, options, uri) => {
  const payload = restoreTomlPayload(namespace, uri);
  const metadata = omitFields(
    removeFormatFields(payload),
    new Set(['functions'])
  );
  return {
    ...metadata,
    eventsFunctions: composeOwnerFunctions(
      files,
      payload.functions || [],
      options,
      uri
    ),
  };
};

export const composeLegacyProjectFromFiles = (filesInput, options = {}) => {
  const files = { ...filesInput };
  const seenUris = new Set();
  const seenResolvedUris = new Set();
  const registerUri = uri => {
    const resolvedKey = validateGameUri(uri)
      .normalize('NFC')
      .toLowerCase();
    if (seenUris.has(uri)) {
      fail('MULTIFILE_DUPLICATE_PATH', 'Managed URI is referenced twice.', uri);
    }
    if (seenResolvedUris.has(resolvedKey)) {
      fail(
        'MULTIFILE_DUPLICATE_PATH',
        'Managed URIs collide after case/Unicode normalization.',
        uri
      );
    }
    seenUris.add(uri);
    seenResolvedUris.add(resolvedKey);
    return uri;
  };
  const entryDocument = parseSettings(files, MULTI_FILE_ENTRY_URI);
  const gdevelop = asObject(
    entryDocument.gdevelop,
    'gdevelop',
    MULTI_FILE_ENTRY_URI
  );
  if (
    gdevelop.combinedSettingsFormatVersion !== MULTI_FILE_FORMAT_VERSION ||
    gdevelop.entry !== MULTI_FILE_ENTRY_URI
  ) {
    fail(
      'MULTIFILE_UNSUPPORTED_VERSION',
      'Unsupported project.settings format marker.',
      MULTI_FILE_ENTRY_URI
    );
  }
  const projectNamespace = restoreTomlPayload(
    asObject(entryDocument.project, 'project', MULTI_FILE_ENTRY_URI),
    MULTI_FILE_ENTRY_URI
  );
  if (
    projectNamespace.kind !== 'project' ||
    projectNamespace.settingsFormatVersion !== 1
  ) {
    fail(
      'MULTIFILE_UNSUPPORTED_VERSION',
      'Invalid project namespace marker.',
      MULTI_FILE_ENTRY_URI
    );
  }

  const settingsUris = [MULTI_FILE_ENTRY_URI];
  let externalDocument = null;
  if (projectNamespace.externalSettings) {
    if (
      projectNamespace.externalSettings !== 'game://externals/external.settings'
    ) {
      fail(
        'MULTIFILE_INVALID_MANIFEST_PATH',
        'externalSettings must be game://externals/external.settings.'
      );
    }
    const uri = registerUri(projectNamespace.externalSettings);
    settingsUris.push(uri);
    externalDocument = parseSettings(files, uri);
  }
  const sceneEntries = asArray(
    projectNamespace.sceneFiles,
    'project.sceneFiles'
  );
  assertUniqueManifestNames(
    sceneEntries,
    'project.sceneFiles',
    MULTI_FILE_ENTRY_URI
  );
  const sceneDocuments = sceneEntries.map(entry => {
    validateSceneManifestPaths(entry);
    const uri = registerUri(expectString(entry.settings, 'scene.settings'));
    settingsUris.push(uri);
    return { entry, uri, document: parseSettings(files, uri) };
  });
  const extensionEntries = asArray(
    projectNamespace.extensionFiles,
    'project.extensionFiles'
  );
  assertUniqueManifestNames(
    extensionEntries,
    'project.extensionFiles',
    MULTI_FILE_ENTRY_URI
  );
  const extensionDocuments = extensionEntries.map(entry => {
    validateExtensionSettingsPath(entry);
    const uri = registerUri(expectString(entry.settings, 'extension.settings'));
    settingsUris.push(uri);
    const document = parseSettings(files, uri);
    const namespace = requireNamespace(
      document,
      ['extensions', entry.name],
      uri
    );
    const childDocuments = [];
    ['functionFiles', 'prefabFiles', 'behaviorFiles'].forEach(manifestName => {
      const childEntries = asArray(namespace[manifestName], manifestName, uri);
      assertUniqueManifestNames(childEntries, manifestName, uri);
      childEntries.forEach(childEntry => {
        const childUri = registerUri(
          expectString(childEntry.settings, `${manifestName}.settings`)
        );
        validateChildSettingsPath(uri, childUri, manifestName);
        settingsUris.push(childUri);
        childDocuments.push({
          manifestName,
          entry: childEntry,
          uri: childUri,
          document: parseSettings(files, childUri),
        });
      });
    });
    return { entry, uri, document, namespace, childDocuments };
  });

  // The append-only contract is checked independently from bootstrap parsing.
  parseTomlSource(
    settingsUris.map(uri => files[uri].trimEnd()).join('\n\n') + '\n',
    '<CombinedProjectSettings>'
  );

  const project = omitFields(
    removeFormatFields(projectNamespace),
    new Set(['sceneFiles', 'extensionFiles', 'externalSettings', 'migration'])
  );
  project.layouts = sceneDocuments.map(({ entry, uri, document }) => {
    const namespace = restoreTomlPayload(
      requireNamespace(document, ['scenes', entry.name], uri),
      uri
    );
    validateManifestIdentity(entry, namespace, uri);
    const settings = removeFormatFields(namespace);
    const layoutUri = registerUri(
      expectString(entry.layout, 'scene.layout', uri)
    );
    const eventsUri = registerUri(
      expectString(entry.events, 'scene.events', uri)
    );
    const layout = readLayout(files, layoutUri, 'gdevelop-scene-layout');
    SCENE_LAYOUT_FIELDS.forEach(field => {
      if (settings[field] !== undefined) {
        fail(
          'MULTIFILE_OWNERSHIP_CONFLICT',
          `Scene settings duplicate layout field ${field}.`,
          uri
        );
      }
    });
    if (settings.events !== undefined) {
      fail(
        'MULTIFILE_OWNERSHIP_CONFLICT',
        'Scene settings cannot contain events.',
        uri
      );
    }
    return {
      ...settings,
      ...layout,
      events: compileEvents(files, eventsUri, options),
    };
  });

  project.externalEvents = [];
  project.externalLayouts = [];
  if (externalDocument) {
    const uri = projectNamespace.externalSettings;
    const namespace = restoreTomlPayload(
      asObject(externalDocument.externals, 'externals', uri),
      uri
    );
    if (
      namespace.kind !== 'externals' ||
      namespace.settingsFormatVersion !== 1
    ) {
      fail('MULTIFILE_UNSUPPORTED_VERSION', 'Invalid externals marker.', uri);
    }
    project.externalEvents = asArray(
      namespace.eventFiles,
      'externals.eventFiles',
      uri
    );
    assertUniqueManifestNames(
      project.externalEvents,
      'externals.eventFiles',
      uri
    );
    project.externalEvents = project.externalEvents.map(entry => {
      validateExternalSourceUri(entry.events, '.events');
      return {
        ...omitFields(entry, new Set(['linkedScene', 'events'])),
        name: expectString(entry.name, 'external event name', uri),
        associatedLayout: String(entry.linkedScene || ''),
        events: compileEvents(
          files,
          registerUri(expectString(entry.events, 'external events URI', uri)),
          options
        ),
      };
    });
    project.externalLayouts = asArray(
      namespace.layoutFiles,
      'externals.layoutFiles',
      uri
    );
    assertUniqueManifestNames(
      project.externalLayouts,
      'externals.layoutFiles',
      uri
    );
    project.externalLayouts = project.externalLayouts.map(entry => {
      validateExternalSourceUri(entry.layout, '.layout');
      return {
        ...omitFields(entry, new Set(['linkedScene', 'layout'])),
        name: expectString(entry.name, 'external layout name', uri),
        associatedLayout: String(entry.linkedScene || ''),
        ...readLayout(
          files,
          registerUri(expectString(entry.layout, 'external layout URI', uri)),
          'gdevelop-external-layout'
        ),
      };
    });
  }

  project.eventsFunctionsExtensions = extensionDocuments.map(extensionInfo => {
    const { entry, uri, namespace, childDocuments } = extensionInfo;
    const extensionPayload = restoreTomlPayload(namespace, uri);
    validateManifestIdentity(entry, extensionPayload, uri);
    const extension = omitFields(
      removeFormatFields(extensionPayload),
      new Set(['functionFiles', 'prefabFiles', 'behaviorFiles'])
    );
    extension.eventsFunctions = [];
    extension.eventsBasedObjects = [];
    extension.eventsBasedBehaviors = [];
    childDocuments.forEach(child => {
      const childName = child.entry.name;
      if (child.manifestName === 'functionFiles') {
        const payload = restoreTomlPayload(
          requireNamespace(
            child.document,
            ['extensions', entry.name, 'functions', childName],
            child.uri
          ),
          child.uri
        );
        validateManifestIdentity(child.entry, payload, child.uri);
        if (payload.extension !== entry.name) {
          fail(
            'MULTIFILE_IDENTITY_MISMATCH',
            'Function extension owner mismatch.',
            child.uri
          );
        }
        const metadata = omitFields(
          removeFormatFields(payload),
          new Set(['extension', 'events'])
        );
        extension.eventsFunctions.push({
          ...metadata,
          events: compileEvents(
            files,
            registerUri(
              expectString(payload.events, 'function events URI', child.uri)
            ),
            options
          ),
        });
      } else if (child.manifestName === 'prefabFiles') {
        const payload = requireNamespace(
          child.document,
          ['extensions', entry.name, 'prefabs', childName],
          child.uri
        );
        extension.eventsBasedObjects.push(
          composePrefab(files, payload, options, child.uri)
        );
      } else {
        const payload = requireNamespace(
          child.document,
          ['extensions', entry.name, 'behaviors', childName],
          child.uri
        );
        extension.eventsBasedBehaviors.push(
          composeBehavior(files, payload, options, child.uri)
        );
      }
    });
    return extension;
  });
  return project;
};

const normalizeFunctionEvents = functions =>
  (functions || []).forEach(functionObject => {
    functionObject.events = parseLegacyEventsJson(
      JSON.stringify(functionObject.events || [])
    );
  });

export const normalizeLegacyProjectForMultiFile = legacyProject => {
  const project = clone(legacyProject);
  project.layouts = project.layouts || [];
  project.externalEvents = project.externalEvents || [];
  project.externalLayouts = project.externalLayouts || [];
  project.eventsFunctionsExtensions = project.eventsFunctionsExtensions || [];
  project.layouts.forEach(layout => {
    layout.events = parseLegacyEventsJson(JSON.stringify(layout.events || []));
  });
  project.externalEvents.forEach(external => {
    external.events = parseLegacyEventsJson(
      JSON.stringify(external.events || [])
    );
  });
  project.eventsFunctionsExtensions.forEach(extension => {
    extension.eventsFunctions = extension.eventsFunctions || [];
    extension.eventsBasedObjects = extension.eventsBasedObjects || [];
    extension.eventsBasedBehaviors = extension.eventsBasedBehaviors || [];
    normalizeFunctionEvents(extension.eventsFunctions);
    extension.eventsBasedObjects.forEach(prefab => {
      prefab.eventsFunctions = prefab.eventsFunctions || [];
      prefab.variants = prefab.variants || [];
      normalizeFunctionEvents(prefab.eventsFunctions);
    });
    extension.eventsBasedBehaviors.forEach(behavior => {
      behavior.eventsFunctions = behavior.eventsFunctions || [];
      normalizeFunctionEvents(behavior.eventsFunctions);
    });
  });
  return project;
};

const canonicalValue = value => {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = canonicalValue(value[key]);
        return result;
      }, {});
  }
  return value;
};

export const areLegacyProjectsEquivalent = (left, right) =>
  JSON.stringify(canonicalValue(normalizeLegacyProjectForMultiFile(left))) ===
  JSON.stringify(canonicalValue(normalizeLegacyProjectForMultiFile(right)));
