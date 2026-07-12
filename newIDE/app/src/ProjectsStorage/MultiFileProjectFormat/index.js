// @noflow

import parseToml from '@iarna/toml/parse-string';
import stringifyToml from '@iarna/toml/stringify';
import { sha256 } from 'js-sha256';
import {
  IFDO_EVENTS_DSL_COVERAGE,
  compileIfDoToLegacyEventsJson,
  convertLegacyEventsJsonToIfDo,
  parseLegacyEventsJson,
} from '../../EventsSheet/IfDoEventsDsl';
import {
  LayoutDslError,
  compileLayoutDsl,
  decompileLayoutDsl,
} from '../LayoutDsl';

export const MULTI_FILE_FORMAT_VERSION = 1;
export const MULTI_FILE_ENTRY_NAME = 'project.settings';
export const MULTI_FILE_ENTRY_URI = 'game://project.settings';
export const MULTI_FILE_RESOURCES_URI = 'game://resources.settings';
export const MULTI_FILE_CONFIG_URI = 'game://config.settings';

const PROJECT_SPLIT_FIELDS = new Set([
  'resources',
  'globalConfig',
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
  'layers',
  'instances',
  'editionSettings',
]);

const EXTERNAL_LAYOUT_FIELDS = Object.freeze(['instances', 'editionSettings']);
const LAYOUT_DSL_KIND_BY_FORMAT = Object.freeze({
  'gdevelop-scene-layout': 'scene',
  'gdevelop-prefab-layout': 'prefab',
  'gdevelop-prefab-variant-layout': 'prefab-variant',
  'gdevelop-external-layout': 'external',
});
const WINDOWS_DEVICE_NAME = /^(?:CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i;
const SIMPLE_URI_SEGMENT = /^[A-Za-z0-9_.-]+$/;

export class MultiFileProjectError extends Error {
  code: string;
  fileUri: ?string;
  line: ?number;
  column: ?number;

  constructor(code: string, message: string, fileUri?: string) {
    super(fileUri ? `${message} (${fileUri})` : message);
    this.name = 'MultiFileProjectError';
    this.code = code;
    this.fileUri = fileUri || null;
    this.line = null;
    this.column = null;
  }
}

const fail = (code: string, message: string, fileUri?: string): empty => {
  throw new MultiFileProjectError(code, message, fileUri);
};

const rethrowLayoutDslError = (error, fileUri): empty => {
  const wrapped = new MultiFileProjectError(error.code, error.message);
  wrapped.fileUri = fileUri;
  wrapped.line = error.line;
  wrapped.column = error.column;
  throw wrapped;
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

const projectTomlProjection = payload => {
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
  return { projected, rawJson };
};

const projectTomlPayload = payload => {
  const { projected, rawJson } = projectTomlProjection(payload);
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

const restoreTomlProjection = (namespace, rawJson, fileUri) => {
  const payload = clone(namespace);
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

const restoreTomlPayload = (namespace, fileUri) => {
  const payload = clone(namespace);
  const rawJson = payload.rawJson;
  delete payload.rawJson;
  return restoreTomlProjection(payload, rawJson, fileUri);
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

const putLayoutFile = (files, uri, format, layout, semanticContext = {}) => {
  validateGameUri(uri);
  const kind = LAYOUT_DSL_KIND_BY_FORMAT[format];
  if (!kind)
    fail('MULTIFILE_INVALID_LAYOUT', `Unknown layout format ${format}.`, uri);
  try {
    files[uri] = decompileLayoutDsl(layout, {
      kind,
      fileUri: uri,
      ...semanticContext,
      usedInstanceUuids: new Set(),
    });
  } catch (error) {
    if (error instanceof LayoutDslError) {
      rethrowLayoutDslError(error, uri);
    }
    throw error;
  }
};

const putEventsFile = (files, uri, events, eventsDslOptions) => {
  validateGameUri(uri);
  files[uri] = convertLegacyEventsJsonToIfDo(
    JSON.stringify(events || []),
    eventsDslOptions || {}
  );
};

const functionSettingsPayload = (
  extensionName,
  functionObject,
  eventsUri,
  order
) => ({
  kind: 'function',
  settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
  order,
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
  order,
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
    takeFields(prefab, PREFAB_LAYOUT_FIELDS),
    layoutObjectContext(prefab.objects || [])
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
      takeFields(variant, PREFAB_LAYOUT_FIELDS),
      layoutObjectContext(
        variant.objects !== undefined ? variant.objects : prefab.objects || []
      )
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
    order,
    ...metadata,
    name: prefabName,
    layout: layoutUri,
    functions,
    variants,
  };
};

const splitBehavior = ({
  behavior,
  order,
  baseSegments,
  files,
  eventsDslOptions,
}) => ({
  kind: 'behavior',
  settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
  order,
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
  const sceneNames = new Set();
  const extensionNames = new Set();

  if (project.resources !== undefined) {
    putSettingsFile(files, MULTI_FILE_RESOURCES_URI, {
      project: {
        resources: {
          kind: 'resources',
          settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
          ...clone(project.resources),
        },
      },
    });
  }

  if (project.globalConfig !== undefined) {
    validateGameUri(MULTI_FILE_CONFIG_URI);
    const { projected, rawJson } = projectTomlProjection(
      asObject(project.globalConfig, 'Project globalConfig')
    );
    const metadataSource = serializeToml({
      gdevelopConfig: {
        settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
        ...(Object.keys(rawJson).length ? { rawJson } : {}),
      },
    });
    const configSource = Object.keys(projected).length
      ? serializeToml({ project: { globalConfig: projected } })
      : '[project.globalConfig]\n';
    files[
      MULTI_FILE_CONFIG_URI
    ] = `${metadataSource.trimEnd()}\n\n${configSource}`;
  }

  (project.layouts || []).forEach((layout, order) => {
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
    const settingsPayload = omitFields(
      layout,
      new Set([...SCENE_LAYOUT_FIELDS, 'events'])
    );
    putSettingsFile(files, settingsUri, {
      scenes: {
        [name]: {
          kind: 'scene',
          settingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
          order,
          layout: layoutUri,
          events: eventsUri,
          ...settingsPayload,
        },
      },
    });
    putLayoutFile(
      files,
      layoutUri,
      'gdevelop-scene-layout',
      takeFields(layout, SCENE_LAYOUT_FIELDS),
      layoutObjectContext(layout.objects || [], project.objects || [])
    );
    putEventsFile(
      files,
      eventsUri,
      layout.events || [],
      options.eventsDslOptions
    );
  });

  (project.eventsFunctionsExtensions || []).forEach((extension, order) => {
    const extensionName = String(extension.name || '');
    const extensionFolder = uniqueManagedName(extensionName, extensionNames);
    const extensionBase = ['extensions', extensionFolder];
    const settingsUri = encodeUriPath([...extensionBase, 'extension.settings']);
    const functionNames = new Set();
    const prefabNames = new Set();
    const behaviorNames = new Set();

    (extension.eventsFunctions || []).forEach((functionObject, order) => {
      const name = String(functionObject.name || '');
      const folder = uniqueManagedName(name, functionNames);
      const base = [...extensionBase, 'functions', folder];
      const functionSettingsUri = encodeUriPath([...base, 'function.settings']);
      const eventsUri = encodeUriPath([...base, `${folder}.events`]);
      putSettingsFile(files, functionSettingsUri, {
        extensions: {
          [extensionName]: {
            functions: {
              [name]: functionSettingsPayload(
                extensionName,
                functionObject,
                eventsUri,
                order
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

    (extension.eventsBasedObjects || []).forEach((prefab, order) => {
      const name = String(prefab.name || '');
      const folder = uniqueManagedName(name, prefabNames);
      const base = [...extensionBase, 'prefabs', folder];
      const prefabSettingsUri = encodeUriPath([...base, 'prefab.settings']);
      putSettingsFile(files, prefabSettingsUri, {
        extensions: {
          [extensionName]: {
            prefabs: {
              [name]: splitPrefab({
                extensionName,
                prefab,
                order,
                baseSegments: base,
                files,
                eventsDslOptions: options.eventsDslOptions,
              }),
            },
          },
        },
      });
    });

    (extension.eventsBasedBehaviors || []).forEach((behavior, order) => {
      const name = String(behavior.name || '');
      const folder = uniqueManagedName(name, behaviorNames);
      const base = [...extensionBase, 'behaviors', folder];
      const behaviorSettingsUri = encodeUriPath([...base, 'behavior.settings']);
      putSettingsFile(files, behaviorSettingsUri, {
        extensions: {
          [extensionName]: {
            behaviors: {
              [name]: splitBehavior({
                behavior,
                order,
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
          order,
          ...extensionMetadata,
        },
      },
    });
  });

  if (
    (project.externalEvents || []).length ||
    (project.externalLayouts || []).length
  ) {
    const externalSettings = 'game://externals/external.settings';
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
        takeFields(external, EXTERNAL_LAYOUT_FIELDS),
        (() => {
          const linkedScene = (project.layouts || []).find(
            layout =>
              String(layout.name || '') ===
              String(external.associatedLayout || '')
          );
          if (!linkedScene)
            fail(
              'LAYOUT_UNKNOWN_SCENE',
              `External layout ${name} references missing scene ${String(
                external.associatedLayout || ''
              )}.`,
              layoutUri
            );
          return {
            ...layoutObjectContext(
              linkedScene.objects || [],
              project.objects || []
            ),
            layerNames: (linkedScene.layers || []).map(layer =>
              String(layer.name || '')
            ),
          };
        })()
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
    ...(options.migration ? { migration: clone(options.migration) } : {}),
  };
  putSettingsFile(files, MULTI_FILE_ENTRY_URI, {
    gdevelop: {
      combinedSettingsFormatVersion: MULTI_FILE_FORMAT_VERSION,
      eventsDslVersion: IFDO_EVENTS_DSL_COVERAGE.formatVersion,
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

const readLayout = (files, uri, expectedFormat, semanticContext = {}) => {
  validateGameUri(uri);
  const source = files[uri];
  if (source === undefined)
    fail('MULTIFILE_MISSING_FILE', 'Referenced layout file is missing.', uri);
  const kind = LAYOUT_DSL_KIND_BY_FORMAT[expectedFormat];
  if (!kind)
    fail(
      'MULTIFILE_INVALID_LAYOUT',
      `Unknown layout format ${expectedFormat}.`,
      uri
    );
  try {
    return compileLayoutDsl(source, {
      kind,
      fileUri: uri,
      ...semanticContext,
      usedInstanceUuids: new Set(),
    });
  } catch (error) {
    if (error instanceof LayoutDslError) {
      rethrowLayoutDslError(error, uri);
    }
    throw error;
  }
};

const layoutObjectContext = (localObjects, fallbackObjects = []) => {
  const objectsByName = new Map();
  (fallbackObjects || []).forEach(object =>
    objectsByName.set(String(object.name || ''), object)
  );
  (localObjects || []).forEach(object =>
    objectsByName.set(String(object.name || ''), object)
  );
  const behaviorTypesByObject = {};
  objectsByName.forEach((object, objectName) => {
    behaviorTypesByObject[objectName] = (object.behaviors || []).reduce(
      (result, behavior) => {
        result[String(behavior.name || '')] = String(behavior.type || '');
        return result;
      },
      {}
    );
  });
  return {
    objectNames: Array.from(objectsByName.keys()),
    behaviorTypesByObject,
  };
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

const validateOwnedScenePaths = (settingsUri, entry) => {
  const settingsPath = validateGameUri(settingsUri);
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
      } must own one layout/events pair in its scene folder.`,
      settingsUri
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

const readSettingsOrder = (namespace, label, uri) => {
  if (!Number.isInteger(namespace.order) || Number(namespace.order) < 0) {
    fail(
      'MULTIFILE_INVALID_SCHEMA',
      `${label}.order must be a non-negative integer.`,
      uri
    );
  }
  return Number(namespace.order);
};

const assertContiguousSettingsOrder = (documents, label) => {
  documents.forEach(({ entry, uri }, expectedOrder) => {
    if (entry.order !== expectedOrder) {
      fail(
        'MULTIFILE_INVALID_SCHEMA',
        `${label} order must be contiguous from 0; expected ${expectedOrder}.`,
        uri
      );
    }
  });
};

const onlyNamespaceName = (namespace, label, uri) => {
  const names = Object.keys(asObject(namespace, label, uri));
  if (names.length !== 1) {
    fail(
      'MULTIFILE_INVALID_SCHEMA',
      `${label} must contain exactly one component namespace.`,
      uri
    );
  }
  return names[0];
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
  const objectContext = layoutObjectContext(payload.objects || []);
  const layout = readLayout(files, layoutUri, 'gdevelop-prefab-layout', {
    ...objectContext,
  });
  Object.keys(layout).forEach(field => {
    if (payload[field] !== undefined) {
      fail(
        'MULTIFILE_OWNERSHIP_CONFLICT',
        `Prefab settings duplicate layout field ${field}.`,
        uri
      );
    }
  });
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
        'gdevelop-prefab-variant-layout',
        {
          ...layoutObjectContext(
            entry.objects !== undefined ? entry.objects : payload.objects || []
          ),
        }
      );
      Object.keys(variantLayout).forEach(field => {
        if (entry[field] !== undefined) {
          fail(
            'MULTIFILE_OWNERSHIP_CONFLICT',
            `Prefab variant settings duplicate layout field ${field}.`,
            uri
          );
        }
      });
      return { ...omitFields(entry, new Set(['layout'])), ...variantLayout };
    }
  );
  const metadata = omitFields(
    removeFormatFields(payload),
    new Set(['order', 'layout', 'functions', 'variants'])
  );
  return { ...metadata, ...layout, eventsFunctions: functions, variants };
};

const composeBehavior = (files, namespace, options, uri) => {
  const payload = restoreTomlPayload(namespace, uri);
  const metadata = omitFields(
    removeFormatFields(payload),
    new Set(['order', 'functions'])
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
    gdevelop.eventsDslVersion !== IFDO_EVENTS_DSL_COVERAGE.formatVersion ||
    (gdevelop.entry !== undefined && gdevelop.entry !== MULTI_FILE_ENTRY_URI)
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
  let resourcesPayload = null;
  if (files[MULTI_FILE_RESOURCES_URI] !== undefined) {
    if (projectNamespace.resources !== undefined) {
      fail(
        'MULTIFILE_OWNERSHIP_CONFLICT',
        'Resources cannot be stored in both project.settings and resources.settings.',
        MULTI_FILE_RESOURCES_URI
      );
    }
    const uri = registerUri(MULTI_FILE_RESOURCES_URI);
    settingsUris.push(uri);
    resourcesPayload = restoreTomlPayload(
      requireNamespace(
        parseSettings(files, uri),
        ['project', 'resources'],
        uri
      ),
      uri
    );
    if (
      resourcesPayload.kind !== 'resources' ||
      resourcesPayload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
    ) {
      fail(
        'MULTIFILE_UNSUPPORTED_VERSION',
        'Invalid resources namespace marker.',
        uri
      );
    }
  }
  let globalConfigPayload = null;
  if (files[MULTI_FILE_CONFIG_URI] !== undefined) {
    if (projectNamespace.globalConfig !== undefined) {
      fail(
        'MULTIFILE_OWNERSHIP_CONFLICT',
        'Global config cannot be stored in both project.settings and config.settings.',
        MULTI_FILE_CONFIG_URI
      );
    }
    const uri = registerUri(MULTI_FILE_CONFIG_URI);
    settingsUris.push(uri);
    const configDocument = parseSettings(files, uri);
    const configMetadata = asObject(
      configDocument.gdevelopConfig,
      'gdevelopConfig',
      uri
    );
    Object.keys(configMetadata).forEach(key => {
      if (!['settingsFormatVersion', 'rawJson'].includes(key)) {
        fail(
          'MULTIFILE_INVALID_SCHEMA',
          `Unknown gdevelopConfig field ${key}.`,
          uri
        );
      }
    });
    if (configMetadata.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION) {
      fail(
        'MULTIFILE_UNSUPPORTED_VERSION',
        'Invalid global config namespace marker.',
        uri
      );
    }
    globalConfigPayload = restoreTomlProjection(
      requireNamespace(configDocument, ['project', 'globalConfig'], uri),
      configMetadata.rawJson,
      uri
    );
  }
  let externalDocument = null;
  const externalSettingsUri = 'game://externals/external.settings';
  if (
    projectNamespace.externalSettings !== undefined &&
    projectNamespace.externalSettings !== externalSettingsUri
  ) {
    fail(
      'MULTIFILE_INVALID_MANIFEST_PATH',
      'externalSettings must be game://externals/external.settings.'
    );
  }
  if (files[externalSettingsUri] !== undefined) {
    const uri = registerUri(externalSettingsUri);
    settingsUris.push(uri);
    externalDocument = parseSettings(files, uri);
  } else if (projectNamespace.externalSettings !== undefined) {
    parseSettings(files, externalSettingsUri);
  }
  const legacySceneEntries = asArray(
    projectNamespace.sceneFiles,
    'project.sceneFiles'
  );
  let sceneDocuments;
  if (legacySceneEntries.length) {
    assertUniqueManifestNames(
      legacySceneEntries,
      'project.sceneFiles',
      MULTI_FILE_ENTRY_URI
    );
    sceneDocuments = legacySceneEntries.map((entry, order) => {
      validateSceneManifestPaths(entry);
      const uri = registerUri(expectString(entry.settings, 'scene.settings'));
      settingsUris.push(uri);
      return {
        entry: { ...entry, order },
        uri,
        document: parseSettings(files, uri),
      };
    });
  } else {
    sceneDocuments = Object.keys(files)
      .filter(uri => /^game:\/\/scenes\/[^/]+\/scene\.settings$/.test(uri))
      .map(uri => {
        registerUri(uri);
        settingsUris.push(uri);
        const document = parseSettings(files, uri);
        const scenes = asObject(document.scenes, 'scenes', uri);
        const sceneNames = Object.keys(scenes);
        if (sceneNames.length !== 1) {
          fail(
            'MULTIFILE_INVALID_SCHEMA',
            'scene.settings must contain exactly one scenes.<name> namespace.',
            uri
          );
        }
        const name = sceneNames[0];
        const namespace = restoreTomlPayload(
          requireNamespace(document, ['scenes', name], uri),
          uri
        );
        if (
          namespace.kind !== 'scene' ||
          namespace.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
        ) {
          fail(
            'MULTIFILE_UNSUPPORTED_VERSION',
            'Invalid scene namespace marker.',
            uri
          );
        }
        const entry = {
          name,
          order: readSettingsOrder(namespace, `scenes.${name}`, uri),
          layout: expectString(namespace.layout, 'scene.layout', uri),
          events: expectString(namespace.events, 'scene.events', uri),
        };
        validateOwnedScenePaths(uri, entry);
        return { entry, uri, document };
      })
      .sort((left, right) => left.entry.order - right.entry.order);
    assertUniqueManifestNames(
      sceneDocuments.map(({ entry }) => entry),
      'scene settings',
      MULTI_FILE_ENTRY_URI
    );
    assertContiguousSettingsOrder(sceneDocuments, 'Scene');
  }
  const legacyExtensionEntries = asArray(
    projectNamespace.extensionFiles,
    'project.extensionFiles'
  );
  const readChildDocuments = ({ entry, uri, namespace }) => {
    const childDocuments = [];
    [
      {
        manifestName: 'functionFiles',
        namespaceName: 'functions',
        folderName: 'functions',
        settingsName: 'function.settings',
        kind: 'function',
      },
      {
        manifestName: 'prefabFiles',
        namespaceName: 'prefabs',
        folderName: 'prefabs',
        settingsName: 'prefab.settings',
        kind: 'prefab',
      },
      {
        manifestName: 'behaviorFiles',
        namespaceName: 'behaviors',
        folderName: 'behaviors',
        settingsName: 'behavior.settings',
        kind: 'behavior',
      },
    ].forEach(config => {
      const legacyChildEntries = asArray(
        namespace[config.manifestName],
        config.manifestName,
        uri
      );
      let ownedDocuments;
      if (legacyChildEntries.length) {
        assertUniqueManifestNames(legacyChildEntries, config.manifestName, uri);
        ownedDocuments = legacyChildEntries.map((childEntry, order) => {
          const childUri = registerUri(
            expectString(childEntry.settings, `${config.manifestName}.settings`)
          );
          validateChildSettingsPath(uri, childUri, config.manifestName);
          settingsUris.push(childUri);
          return {
            manifestName: config.manifestName,
            entry: { ...childEntry, order },
            uri: childUri,
            document: parseSettings(files, childUri),
          };
        });
      } else {
        const ownerSegments = validateGameUri(uri).split('/');
        ownedDocuments = Object.keys(files)
          .filter(candidateUri => {
            const segments = validateGameUri(candidateUri).split('/');
            return (
              segments.length === 5 &&
              segments[0] === 'extensions' &&
              segments[1] === ownerSegments[1] &&
              segments[2] === config.folderName &&
              segments[4] === config.settingsName
            );
          })
          .map(childUri => {
            registerUri(childUri);
            validateChildSettingsPath(uri, childUri, config.manifestName);
            settingsUris.push(childUri);
            const document = parseSettings(files, childUri);
            const ownerNamespace = requireNamespace(
              document,
              ['extensions', entry.name],
              childUri
            );
            const componentNamespace = asObject(
              ownerNamespace[config.namespaceName],
              `extensions.${entry.name}.${config.namespaceName}`,
              childUri
            );
            const name = onlyNamespaceName(
              componentNamespace,
              `extensions.${entry.name}.${config.namespaceName}`,
              childUri
            );
            const payload = restoreTomlPayload(
              componentNamespace[name],
              childUri
            );
            if (
              payload.kind !== config.kind ||
              payload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
            ) {
              fail(
                'MULTIFILE_UNSUPPORTED_VERSION',
                `Invalid ${config.kind} namespace marker.`,
                childUri
              );
            }
            return {
              manifestName: config.manifestName,
              entry: {
                name,
                order: readSettingsOrder(
                  payload,
                  `extensions.${entry.name}.${config.namespaceName}.${name}`,
                  childUri
                ),
              },
              uri: childUri,
              document,
            };
          })
          .sort((left, right) => left.entry.order - right.entry.order);
        assertUniqueManifestNames(
          ownedDocuments.map(({ entry: childEntry }) => childEntry),
          `${entry.name} ${config.namespaceName} settings`,
          uri
        );
        assertContiguousSettingsOrder(
          ownedDocuments,
          `${entry.name} ${config.namespaceName}`
        );
      }
      childDocuments.push(...ownedDocuments);
    });
    return childDocuments;
  };

  let extensionDocuments;
  if (legacyExtensionEntries.length) {
    assertUniqueManifestNames(
      legacyExtensionEntries,
      'project.extensionFiles',
      MULTI_FILE_ENTRY_URI
    );
    extensionDocuments = legacyExtensionEntries.map((entry, order) => {
      validateExtensionSettingsPath(entry);
      const uri = registerUri(
        expectString(entry.settings, 'extension.settings')
      );
      settingsUris.push(uri);
      const document = parseSettings(files, uri);
      const namespace = requireNamespace(
        document,
        ['extensions', entry.name],
        uri
      );
      return {
        entry: { ...entry, order },
        uri,
        document,
        namespace,
        childDocuments: readChildDocuments({ entry, uri, namespace }),
      };
    });
  } else {
    extensionDocuments = Object.keys(files)
      .filter(uri =>
        /^game:\/\/extensions\/[^/]+\/extension\.settings$/.test(uri)
      )
      .map(uri => {
        registerUri(uri);
        settingsUris.push(uri);
        const document = parseSettings(files, uri);
        const extensions = asObject(document.extensions, 'extensions', uri);
        const name = onlyNamespaceName(extensions, 'extensions', uri);
        const namespace = requireNamespace(document, ['extensions', name], uri);
        const payload = restoreTomlPayload(namespace, uri);
        if (
          payload.kind !== 'extension' ||
          payload.settingsFormatVersion !== MULTI_FILE_FORMAT_VERSION
        ) {
          fail(
            'MULTIFILE_UNSUPPORTED_VERSION',
            'Invalid extension namespace marker.',
            uri
          );
        }
        const entry = {
          name,
          order: readSettingsOrder(payload, `extensions.${name}`, uri),
        };
        validateExtensionSettingsPath({ ...entry, settings: uri });
        return {
          entry,
          uri,
          document,
          namespace,
          childDocuments: readChildDocuments({ entry, uri, namespace }),
        };
      })
      .sort((left, right) => left.entry.order - right.entry.order);
    assertUniqueManifestNames(
      extensionDocuments.map(({ entry }) => entry),
      'extension settings',
      MULTI_FILE_ENTRY_URI
    );
    assertContiguousSettingsOrder(extensionDocuments, 'Extension');
  }

  const managedSettingsUriPattern = /^(?:game:\/\/(?:project|resources|config)\.settings|game:\/\/externals\/external\.settings|game:\/\/scenes\/[^/]+\/scene\.settings|game:\/\/extensions\/[^/]+\/(?:extension\.settings|functions\/[^/]+\/function\.settings|prefabs\/[^/]+\/prefab\.settings|behaviors\/[^/]+\/behavior\.settings))$/;
  Object.keys(files)
    .filter(uri => managedSettingsUriPattern.test(uri))
    .forEach(uri => {
      if (!settingsUris.includes(uri)) {
        fail(
          'MULTIFILE_ORPHAN_SETTINGS',
          'A discovered settings fragment has no valid owning component.',
          uri
        );
      }
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
  if (resourcesPayload) {
    project.resources = removeFormatFields(resourcesPayload);
  }
  if (globalConfigPayload) {
    project.globalConfig = globalConfigPayload;
  }
  project.layouts = sceneDocuments.map(({ entry, uri, document }) => {
    const namespace = restoreTomlPayload(
      requireNamespace(document, ['scenes', entry.name], uri),
      uri
    );
    validateManifestIdentity(entry, namespace, uri);
    const settings = omitFields(
      removeFormatFields(namespace),
      new Set(['order', 'layout', 'events'])
    );
    const layoutUri = registerUri(
      expectString(entry.layout, 'scene.layout', uri)
    );
    const eventsUri = registerUri(
      expectString(entry.events, 'scene.events', uri)
    );
    const layout = readLayout(files, layoutUri, 'gdevelop-scene-layout', {
      ...layoutObjectContext(settings.objects || [], project.objects || []),
    });
    Object.keys(layout).forEach(field => {
      if (settings[field] !== undefined) {
        fail(
          'MULTIFILE_OWNERSHIP_CONFLICT',
          `Scene settings duplicate layout field ${field}.`,
          uri
        );
      }
    });
    return {
      ...settings,
      ...layout,
      events: compileEvents(files, eventsUri, options),
    };
  });

  project.externalEvents = [];
  project.externalLayouts = [];
  if (externalDocument) {
    const uri = externalSettingsUri;
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
      const linkedSceneName = String(entry.linkedScene || '');
      const linkedScene = project.layouts.find(
        layout => layout.name === linkedSceneName
      );
      if (!linkedScene) {
        fail(
          'LAYOUT_UNKNOWN_SCENE',
          `External layout ${String(
            entry.name || ''
          )} references missing scene ${linkedSceneName}.`,
          uri
        );
      }
      return {
        ...omitFields(entry, new Set(['linkedScene', 'layout'])),
        name: expectString(entry.name, 'external layout name', uri),
        associatedLayout: linkedSceneName,
        ...readLayout(
          files,
          registerUri(expectString(entry.layout, 'external layout URI', uri)),
          'gdevelop-external-layout',
          {
            ...layoutObjectContext(
              linkedScene.objects || [],
              project.objects || []
            ),
            layerNames: (linkedScene.layers || []).map(layer =>
              String(layer.name || '')
            ),
          }
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
      new Set(['order', 'functionFiles', 'prefabFiles', 'behaviorFiles'])
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
          new Set(['order', 'extension', 'events'])
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

const normalizeLayoutFragment = (layout, editorField, hasLayers = true) => {
  // libGD can serialize an untouched custom-object variant editor settings
  // value as an empty array. The Layout DSL has a structured editor settings
  // block and therefore reconstructs the same empty value as an object. Both
  // representations mean that no editor settings are configured.
  if (
    !layout[editorField] ||
    (Array.isArray(layout[editorField]) && !layout[editorField].length)
  ) {
    layout[editorField] = {};
  }
  const editor = layout[editorField];
  if (
    editor.gridWidth !== undefined ||
    editor.gridHeight !== undefined ||
    editor.gridDepth !== undefined
  ) {
    editor.gridWidth = editor.gridWidth === undefined ? 32 : editor.gridWidth;
    editor.gridHeight =
      editor.gridHeight === undefined ? 32 : editor.gridHeight;
    editor.gridDepth = editor.gridDepth === undefined ? 32 : editor.gridDepth;
  }
  if (
    editor.gridOffsetX !== undefined ||
    editor.gridOffsetY !== undefined ||
    editor.gridOffsetZ !== undefined
  ) {
    editor.gridOffsetX =
      editor.gridOffsetX === undefined ? 0 : editor.gridOffsetX;
    editor.gridOffsetY =
      editor.gridOffsetY === undefined ? 0 : editor.gridOffsetY;
    editor.gridOffsetZ =
      editor.gridOffsetZ === undefined ? 0 : editor.gridOffsetZ;
  }
  layout.instances = (layout.instances || []).map(instance => {
    const normalized = {
      angle: 0,
      zOrder: 0,
      layer: '',
      customSize: false,
      width: 0,
      height: 0,
      numberProperties: [],
      stringProperties: [],
      initialVariables: [],
      ...instance,
    };
    if (normalized.z === 0) delete normalized.z;
    if (normalized.rotationX === 0) delete normalized.rotationX;
    if (normalized.rotationY === 0) delete normalized.rotationY;
    if (normalized.opacity === 255) delete normalized.opacity;
    if (normalized.flippedX === false) delete normalized.flippedX;
    if (normalized.flippedY === false) delete normalized.flippedY;
    if (normalized.flippedZ === false) delete normalized.flippedZ;
    if (normalized.locked === false) delete normalized.locked;
    if (normalized.sealed === false) delete normalized.sealed;
    if (normalized.behaviorOverridings) {
      normalized.behaviorOverridings = normalized.behaviorOverridings.map(
        behavior => {
          const normalizedBehavior = { ...behavior };
          if (normalizedBehavior.isFolded === false)
            delete normalizedBehavior.isFolded;
          if (normalizedBehavior.isMuted === false)
            delete normalizedBehavior.isMuted;
          if (normalizedBehavior.isInheritedFromObjectType === false)
            delete normalizedBehavior.isInheritedFromObjectType;
          if (normalizedBehavior.quickCustomizationVisibility === 'default')
            delete normalizedBehavior.quickCustomizationVisibility;
          if (
            normalizedBehavior.propertiesQuickCustomizationVisibilities &&
            !Object.keys(
              normalizedBehavior.propertiesQuickCustomizationVisibilities
            ).length
          )
            delete normalizedBehavior.propertiesQuickCustomizationVisibilities;
          return normalizedBehavior;
        }
      );
    }
    return normalized;
  });
  if (hasLayers) {
    layout.layers = (layout.layers || []).map(layer => {
      const normalizedLayer = {
        renderingType: '',
        cameraType: '',
        defaultCameraBehavior: 'top-left-anchored-if-never-moved',
        visibility: true,
        isLocked: false,
        isLightingLayer: false,
        followBaseLayerCamera: false,
        ambientLightColorR: 200,
        ambientLightColorG: 200,
        ambientLightColorB: 200,
        camera3DNearPlaneDistance: 3,
        camera3DFarPlaneDistance: 10000,
        camera3DFieldOfView: 45,
        camera2DPlaneMaxDrawingDistance: 5000,
        ...layer,
      };
      normalizedLayer.cameras = (layer.cameras || []).map(camera => ({
        defaultSize: true,
        width: 0,
        height: 0,
        defaultViewport: true,
        viewportLeft: 0,
        viewportTop: 0,
        viewportRight: 1,
        viewportBottom: 1,
        ...camera,
      }));
      normalizedLayer.effects = (layer.effects || []).map(effect => ({
        folded: false,
        disabled: false,
        doubleParameters: {},
        stringParameters: {},
        booleanParameters: {},
        ...effect,
      }));
      return normalizedLayer;
    });
  }
};

export const normalizeLegacyProjectForMultiFile = legacyProject => {
  const project = clone(legacyProject);
  project.layouts = project.layouts || [];
  project.externalEvents = project.externalEvents || [];
  project.externalLayouts = project.externalLayouts || [];
  project.eventsFunctionsExtensions = project.eventsFunctionsExtensions || [];
  project.layouts.forEach(layout => {
    layout.events = parseLegacyEventsJson(JSON.stringify(layout.events || []));
    normalizeLayoutFragment(layout, 'uiSettings');
  });
  project.externalLayouts.forEach(external =>
    normalizeLayoutFragment(external, 'editionSettings', false)
  );
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
      normalizeLayoutFragment(prefab, 'editionSettings');
      prefab.variants.forEach(variant =>
        normalizeLayoutFragment(variant, 'editionSettings')
      );
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
