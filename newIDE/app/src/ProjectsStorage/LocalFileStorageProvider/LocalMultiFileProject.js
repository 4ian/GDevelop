// @flow

import optionalRequire from '../../Utils/OptionalRequire';
import {
  MULTI_FILE_ENTRY_NAME,
  MULTI_FILE_CONSTANTS_URI,
  MULTI_FILE_ENTRY_URI,
  MULTI_FILE_FORMAT_VERSION,
  MULTI_FILE_RETIRED_EXTERNAL_SETTINGS_URI,
  MULTI_FILE_RESOURCES_URI,
  MultiFileProjectError,
  composeLegacyProjectFromFiles,
  decomposeLegacyProjectToFiles,
  encodeManagedName,
  getLegacyProjectFirstDifferenceDescription,
  parseTomlSource,
  validateGameUri,
} from '../MultiFileProjectFormat';
import {
  PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH,
  PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH,
  createCatalogInstructionResolver,
  mergeProjectInstructionCatalogs,
  validateProjectInstructionCatalog,
} from '../../EventsSheet/IfDoEventsDsl/ProjectInstructionCatalog';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const crypto = optionalRequire('crypto');

const MAX_MANAGED_FILES = 10000;
const MAX_SOURCE_FILE_SIZE = 16 * 1024 * 1024;
const MAX_COMPOSITE_SOURCE_FILE_SIZE = 32 * 1024 * 1024;
const MAX_COMPOSED_SOURCE_SIZE = 256 * 1024 * 1024;
const WINDOWS_INVALID_PATH_CHARACTER = /[<>:"/\\|?*]/;
const WINDOWS_DEVICE_PATH_SEGMENT = /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;

const requireFileSystem = () => {
  if (!fs || !path) throw new Error('Filesystem is not supported.');
};

const requiresPortablePathEncoding = (segment: string): boolean =>
  WINDOWS_INVALID_PATH_CHARACTER.test(segment) ||
  Array.from(segment).some(character => character.charCodeAt(0) < 32) ||
  WINDOWS_DEVICE_PATH_SEGMENT.test(segment) ||
  /[. ]$/.test(segment);

const gameUriPhysicalSegments = (uri: string): Array<string> => {
  validateGameUri(uri);
  return uri
    .slice('game://'.length)
    .split('/')
    .map(encodedSegment => {
      const decodedSegment = decodeURIComponent(encodedSegment);
      return requiresPortablePathEncoding(decodedSegment)
        ? encodedSegment
        : decodedSegment;
    });
};

const physicalNameToGameUriSegment = (name: string): string => {
  if (/%[0-9A-F]{2}/.test(name)) {
    try {
      const decodedName = decodeURIComponent(name);
      if (requiresPortablePathEncoding(decodedName)) {
        validateGameUri(`game://managed/${name}`);
        return name;
      }
    } catch (error) {
      // A user-owned percent sign is encoded normally below.
    }
  }
  return encodeManagedName(name);
};

const isInside = (rootPath: string, targetPath: string): boolean => {
  const relative = path.relative(rootPath, targetPath);
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative);
};

const assertInside = (rootPath: string, targetPath: string) => {
  if (targetPath !== rootPath && !isInside(rootPath, targetPath)) {
    throw new MultiFileProjectError(
      'MULTIFILE_PATH_ESCAPE',
      `Managed path escapes the project root: ${targetPath}`
    );
  }
};

export const resolveGameUriToPath = (
  projectRoot: string,
  uri: string
): string => {
  requireFileSystem();
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, ...gameUriPhysicalSegments(uri));
  assertInside(root, resolved);

  const realRoot = fs.realpathSync(root);
  let existing = resolved;
  while (!fs.existsSync(existing)) {
    const parent = path.dirname(existing);
    if (parent === existing) break;
    existing = parent;
  }
  const realExisting = fs.realpathSync(existing);
  assertInside(realRoot, realExisting);
  if (fs.existsSync(resolved)) {
    assertInside(realRoot, fs.realpathSync(resolved));
  }
  return resolved;
};

const removeEmptyManagedParentDirectories = async (
  projectRoot: string,
  uris: Array<string>
): Promise<void> => {
  const root = path.resolve(projectRoot);
  const directories: Set<string> = new Set();
  uris.forEach(uri => {
    const relative = validateGameUri(uri);
    const segments = relative.split('/');
    if (!['objects', 'scenes', 'extensions', 'externals'].includes(segments[0]))
      return;

    let directory = path.dirname(resolveGameUriToPath(root, uri));
    while (directory !== root) {
      const directorySegments = path.relative(root, directory).split(path.sep);
      // Keep the stable top-level containers.
      if (directorySegments.length <= 1) break;
      assertInside(root, directory);
      directories.add(directory);
      directory = path.dirname(directory);
    }
  });

  const deepestFirst = [...directories].sort(
    (left, right) => right.split(path.sep).length - left.split(path.sep).length
  );
  for (const directory of deepestFirst) {
    if (!fs.existsSync(directory)) continue;
    if ((await fs.readdir(directory)).length) continue;
    try {
      await fs.rmdir(directory);
    } catch (error) {
      // A concurrent write or a user-owned file can make this non-empty after
      // readdir. Empty-folder cleanup must never make a project save fail.
      if (!['ENOENT', 'ENOTEMPTY', 'EEXIST'].includes(error.code)) throw error;
    }
  }
};

export const recoverMultiFileTransactions = async (
  projectRoot: string
): Promise<void> => {
  requireFileSystem();
  const root = path.resolve(projectRoot);
  const transactionsRoot = path.join(root, '.gdevelop', 'transactions');
  if (!fs.existsSync(transactionsRoot)) return;
  assertInside(root, transactionsRoot);
  const transactionNames = await fs.readdir(transactionsRoot);
  for (const transactionName of transactionNames) {
    const transactionRoot = path.join(transactionsRoot, transactionName);
    assertInside(root, transactionRoot);
    const journalPath = path.join(transactionRoot, 'journal.json');
    if (!fs.existsSync(journalPath)) {
      throw new MultiFileProjectError(
        'MULTIFILE_INCOMPLETE_TRANSACTION',
        `Transaction has no recovery journal: ${transactionName}`
      );
    }
    let journal;
    try {
      journal = JSON.parse(await fs.readFile(journalPath, 'utf8'));
    } catch (error) {
      throw new MultiFileProjectError(
        'MULTIFILE_INCOMPLETE_TRANSACTION',
        `Transaction journal is invalid: ${transactionName}`
      );
    }
    if (
      journal.version !== 1 ||
      !['staged', 'committed'].includes(journal.state) ||
      !Array.isArray(journal.changedUris) ||
      (journal.obsoleteUris !== undefined &&
        !Array.isArray(journal.obsoleteUris))
    ) {
      throw new MultiFileProjectError(
        'MULTIFILE_INCOMPLETE_TRANSACTION',
        `Transaction journal has an unsupported shape: ${transactionName}`
      );
    }
    if (journal.state === 'staged') {
      for (const uri of [...journal.changedUris].reverse()) {
        validateGameUri(uri);
        const target = resolveGameUriToPath(root, uri);
        const staged = path.join(
          transactionRoot,
          'stage',
          ...gameUriPhysicalSegments(uri)
        );
        const backup = path.join(
          transactionRoot,
          'backup',
          ...gameUriPhysicalSegments(uri)
        );
        if (fs.existsSync(backup)) {
          await fs.ensureDir(path.dirname(target));
          await fs.copy(backup, target, { overwrite: true });
        } else if (!fs.existsSync(staged) && fs.existsSync(target)) {
          await fs.unlink(target);
        }
      }
      for (const uri of journal.obsoleteUris || []) {
        validateGameUri(uri);
        const target = resolveGameUriToPath(root, uri);
        const backup = path.join(
          transactionRoot,
          'backup',
          ...gameUriPhysicalSegments(uri)
        );
        if (fs.existsSync(backup) && !fs.existsSync(target)) {
          await fs.ensureDir(path.dirname(target));
          await fs.copy(backup, target, { overwrite: true });
        }
      }
      await removeEmptyManagedParentDirectories(root, journal.changedUris);
    } else {
      for (const uri of journal.obsoleteUris || []) {
        const target = resolveGameUriToPath(root, uri);
        if (fs.existsSync(target)) await fs.unlink(target);
      }
      await removeEmptyManagedParentDirectories(
        root,
        journal.obsoleteUris || []
      );
    }
    assertInside(root, transactionRoot);
    await fs.remove(transactionRoot);
  }
};

const readBoundedUtf8 = async (
  filePath: string,
  maximumSize: number = MAX_SOURCE_FILE_SIZE
): Promise<string> => {
  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      throw new MultiFileProjectError(
        'MULTIFILE_MISSING_FILE',
        `Managed source is missing: ${filePath}`
      );
    }
    throw error;
  }
  if (!stats.isFile())
    throw new Error(`Managed source is not a file: ${filePath}`);
  if (stats.size > maximumSize) {
    throw new MultiFileProjectError(
      'MULTIFILE_RESOURCE_LIMIT',
      `Managed source exceeds ${maximumSize} bytes: ${filePath}`
    );
  }
  return fs.readFile(filePath, 'utf8');
};

const findGameUris = (value: any, output: Set<string>) => {
  if (
    typeof value === 'string' &&
    value.startsWith('game://') &&
    /\.(?:settings|layout|events)$/.test(value)
  ) {
    output.add(value);
  } else if (Array.isArray(value))
    value.forEach(item => findGameUris(item, output));
  else if (value && typeof value === 'object')
    Object.keys(value).forEach(key => findGameUris(value[key], output));
};

const isCompositeOwnerSettingsUri = (uri: string): boolean =>
  /^game:\/\/scenes\/[^/]+\/(?:scene\.settings|external-layout\/[^/]+\.settings)$/.test(
    uri
  ) ||
  /^game:\/\/scenes\/[^/]+\/externals\/[^/]+\/external-layout\.settings$/.test(
    uri
  ) ||
  /^game:\/\/extensions\/[^/]+\/prefabs\/[^/]+\/(?:prefab\.settings|variants\/[^/]+\/variant\.settings)$/.test(
    uri
  );

const discoverDirectSettingsFiles = async (
  directoryPath: string,
  uriSegments: Array<string>,
  output: Array<string>
): Promise<void> => {
  if (!fs.existsSync(directoryPath)) return;
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const encodedName = physicalNameToGameUriSegment(entry.name);
    if (entry.isFile() && entry.name.endsWith('.settings')) {
      output.push(`game://${[...uriSegments, encodedName].join('/')}`);
    }
  }
};

const discoverDirectEventsFiles = async (
  directoryPath: string,
  uriSegments: Array<string>,
  output: Array<string>
): Promise<void> => {
  if (!fs.existsSync(directoryPath)) return;
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.events')) continue;
    output.push(
      `game://${[...uriSegments, physicalNameToGameUriSegment(entry.name)].join(
        '/'
      )}`
    );
  }
};

const discoverDirectRetiredLayoutFiles = async (
  directoryPath: string,
  uriSegments: Array<string>,
  output: Array<string>
): Promise<void> => {
  if (!fs.existsSync(directoryPath)) return;
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const encodedName = physicalNameToGameUriSegment(entry.name);
    if (entry.isFile() && entry.name.endsWith('.layout')) {
      output.push(`game://${[...uriSegments, encodedName].join('/')}`);
    }
  }
};

const discoverRetiredFunctionSettings = async (
  functionsDirectoryPath: string,
  uriSegments: Array<string>,
  output: Array<string>
): Promise<void> => {
  if (!fs.existsSync(functionsDirectoryPath)) return;
  const entries = await fs.readdir(functionsDirectoryPath, {
    withFileTypes: true,
  });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const settingsPath = path.join(
      functionsDirectoryPath,
      entry.name,
      'function.settings'
    );
    if (!fs.existsSync(settingsPath)) continue;
    output.push(
      `game://${[
        ...uriSegments,
        physicalNameToGameUriSegment(entry.name),
        'function.settings',
      ].join('/')}`
    );
  }
};

const discoverOwnedSettingsUris = async (
  projectRoot: string
): Promise<Array<string>> => {
  const discovered = [];
  const constantsTomlPath = path.join(projectRoot, 'constants.toml');
  if (fs.existsSync(constantsTomlPath)) {
    discovered.push(MULTI_FILE_CONSTANTS_URI);
  }
  const resourcesSettingsPath = path.join(projectRoot, 'resources.settings');
  if (fs.existsSync(resourcesSettingsPath)) {
    discovered.push(MULTI_FILE_RESOURCES_URI);
  }
  await discoverDirectSettingsFiles(
    path.join(projectRoot, 'objects'),
    ['objects'],
    discovered
  );
  const scenesRoot = path.join(projectRoot, 'scenes');
  if (fs.existsSync(scenesRoot)) {
    const sceneEntries = await fs.readdir(scenesRoot, {
      withFileTypes: true,
    });
    for (const entry of sceneEntries) {
      if (!entry.isDirectory()) continue;
      const sceneSegment = physicalNameToGameUriSegment(entry.name);
      const sceneRoot = path.join(scenesRoot, entry.name);
      const sceneSettingsPath = path.join(sceneRoot, 'scene.settings');
      if (fs.existsSync(sceneSettingsPath)) {
        discovered.push(`game://scenes/${sceneSegment}/scene.settings`);
      }
      await discoverDirectSettingsFiles(
        path.join(sceneRoot, 'objects'),
        ['scenes', sceneSegment, 'objects'],
        discovered
      );
      const sceneFunctionsRoot = path.join(sceneRoot, 'functions');
      await discoverDirectSettingsFiles(
        sceneFunctionsRoot,
        ['scenes', sceneSegment, 'functions'],
        discovered
      );
      await discoverDirectEventsFiles(
        sceneFunctionsRoot,
        ['scenes', sceneSegment, 'functions'],
        discovered
      );
      await discoverRetiredFunctionSettings(
        sceneFunctionsRoot,
        ['scenes', sceneSegment, 'functions'],
        discovered
      );
      await discoverDirectRetiredLayoutFiles(
        sceneRoot,
        ['scenes', sceneSegment],
        discovered
      );
      const externalEventsRoot = path.join(sceneRoot, 'external-events');
      if (fs.existsSync(externalEventsRoot)) {
        const externalEventEntries = await fs.readdir(externalEventsRoot, {
          withFileTypes: true,
        });
        for (const externalEventEntry of externalEventEntries) {
          if (!externalEventEntry.isDirectory()) continue;
          const externalEventSegment = physicalNameToGameUriSegment(
            externalEventEntry.name
          );
          const externalEventRoot = path.join(
            externalEventsRoot,
            externalEventEntry.name
          );
          await discoverDirectSettingsFiles(
            externalEventRoot,
            ['scenes', sceneSegment, 'external-events', externalEventSegment],
            discovered
          );
          const externalFunctionsRoot = path.join(
            externalEventRoot,
            'functions'
          );
          await discoverDirectSettingsFiles(
            externalFunctionsRoot,
            [
              'scenes',
              sceneSegment,
              'external-events',
              externalEventSegment,
              'functions',
            ],
            discovered
          );
          await discoverDirectEventsFiles(
            externalFunctionsRoot,
            [
              'scenes',
              sceneSegment,
              'external-events',
              externalEventSegment,
              'functions',
            ],
            discovered
          );
          await discoverRetiredFunctionSettings(
            externalFunctionsRoot,
            [
              'scenes',
              sceneSegment,
              'external-events',
              externalEventSegment,
              'functions',
            ],
            discovered
          );
        }
      }
      await discoverDirectSettingsFiles(
        path.join(sceneRoot, 'external-layout'),
        ['scenes', sceneSegment, 'external-layout'],
        discovered
      );

      // Keep discovering the retired combined directory so a save can remove
      // its managed files transactionally and an open can reject it explicitly.
      const externalsRoot = path.join(sceneRoot, 'externals');
      await discoverDirectRetiredLayoutFiles(
        externalsRoot,
        ['scenes', sceneSegment, 'externals'],
        discovered
      );
      if (!fs.existsSync(externalsRoot)) continue;
      const externalEntries = await fs.readdir(externalsRoot, {
        withFileTypes: true,
      });
      for (const externalEntry of externalEntries) {
        if (!externalEntry.isDirectory()) continue;
        const externalSegment = physicalNameToGameUriSegment(
          externalEntry.name
        );
        const externalRoot = path.join(externalsRoot, externalEntry.name);
        await discoverDirectSettingsFiles(
          externalRoot,
          ['scenes', sceneSegment, 'externals', externalSegment],
          discovered
        );
        const externalFunctionsRoot = path.join(externalRoot, 'functions');
        await discoverDirectSettingsFiles(
          externalFunctionsRoot,
          ['scenes', sceneSegment, 'externals', externalSegment, 'functions'],
          discovered
        );
        await discoverDirectEventsFiles(
          externalFunctionsRoot,
          ['scenes', sceneSegment, 'externals', externalSegment, 'functions'],
          discovered
        );
        await discoverRetiredFunctionSettings(
          externalFunctionsRoot,
          ['scenes', sceneSegment, 'externals', externalSegment, 'functions'],
          discovered
        );
      }
    }
  }

  const externalSettingsPath = path.join(
    projectRoot,
    'externals',
    'external.settings'
  );
  if (fs.existsSync(externalSettingsPath)) {
    discovered.push(MULTI_FILE_RETIRED_EXTERNAL_SETTINGS_URI);
  }

  const extensionsRoot = path.join(projectRoot, 'extensions');
  if (fs.existsSync(extensionsRoot)) {
    const extensionEntries = await fs.readdir(extensionsRoot, {
      withFileTypes: true,
    });
    for (const extensionEntry of extensionEntries) {
      if (!extensionEntry.isDirectory()) continue;
      const extensionRoot = path.join(extensionsRoot, extensionEntry.name);
      const extensionUriSegment = physicalNameToGameUriSegment(
        extensionEntry.name
      );
      const extensionSettingsPath = path.join(
        extensionRoot,
        'extension.settings'
      );
      if (fs.existsSync(extensionSettingsPath)) {
        discovered.push(
          `game://extensions/${extensionUriSegment}/extension.settings`
        );
      }
      for (const child of [
        { folder: 'functions', settings: 'function.settings' },
        { folder: 'prefabs', settings: 'prefab.settings' },
        { folder: 'behaviors', settings: 'behavior.settings' },
      ]) {
        const childRoot = path.join(extensionRoot, child.folder);
        if (!fs.existsSync(childRoot)) continue;
        if (child.folder === 'functions') {
          await discoverDirectSettingsFiles(
            childRoot,
            ['extensions', extensionUriSegment, 'functions'],
            discovered
          );
          await discoverDirectEventsFiles(
            childRoot,
            ['extensions', extensionUriSegment, 'functions'],
            discovered
          );
          await discoverRetiredFunctionSettings(
            childRoot,
            ['extensions', extensionUriSegment, 'functions'],
            discovered
          );
          continue;
        }
        const childEntries = await fs.readdir(childRoot, {
          withFileTypes: true,
        });
        for (const entry of childEntries) {
          if (!entry.isDirectory()) continue;
          const childSegment = physicalNameToGameUriSegment(entry.name);
          const componentRoot = path.join(childRoot, entry.name);
          const settingsPath = path.join(componentRoot, child.settings);
          if (fs.existsSync(settingsPath)) {
            discovered.push(
              `game://extensions/${extensionUriSegment}/${
                child.folder
              }/${childSegment}/${child.settings}`
            );
          }
          if (child.folder === 'prefabs' || child.folder === 'behaviors') {
            const functionsRoot = path.join(componentRoot, 'functions');
            const functionsUriSegments = [
              'extensions',
              extensionUriSegment,
              child.folder,
              childSegment,
              'functions',
            ];
            await discoverDirectSettingsFiles(
              functionsRoot,
              functionsUriSegments,
              discovered
            );
            await discoverDirectEventsFiles(
              functionsRoot,
              functionsUriSegments,
              discovered
            );
            await discoverRetiredFunctionSettings(
              functionsRoot,
              functionsUriSegments,
              discovered
            );
          }
          if (child.folder !== 'prefabs') continue;
          await discoverDirectSettingsFiles(
            path.join(componentRoot, 'objects'),
            [
              'extensions',
              extensionUriSegment,
              'prefabs',
              childSegment,
              'objects',
            ],
            discovered
          );
          await discoverDirectRetiredLayoutFiles(
            componentRoot,
            ['extensions', extensionUriSegment, 'prefabs', childSegment],
            discovered
          );
          const variantsRoot = path.join(componentRoot, 'variants');
          if (!fs.existsSync(variantsRoot)) continue;
          await discoverDirectRetiredLayoutFiles(
            variantsRoot,
            [
              'extensions',
              extensionUriSegment,
              'prefabs',
              childSegment,
              'variants',
            ],
            discovered
          );
          const variantEntries = await fs.readdir(variantsRoot, {
            withFileTypes: true,
          });
          for (const variantEntry of variantEntries) {
            if (!variantEntry.isDirectory()) continue;
            const variantSegment = physicalNameToGameUriSegment(
              variantEntry.name
            );
            const variantSettingsPath = path.join(
              variantsRoot,
              variantEntry.name,
              'variant.settings'
            );
            if (fs.existsSync(variantSettingsPath)) {
              discovered.push(
                `game://extensions/${extensionUriSegment}/prefabs/${childSegment}/variants/${variantSegment}/variant.settings`
              );
            }
            await discoverDirectSettingsFiles(
              path.join(variantsRoot, variantEntry.name, 'objects'),
              [
                'extensions',
                extensionUriSegment,
                'prefabs',
                childSegment,
                'variants',
                variantSegment,
                'objects',
              ],
              discovered
            );
          }
        }
      }
    }
  }

  return discovered.sort((left, right) => left.localeCompare(right));
};

export const readMultiFileSourceTree = async (
  entryPath: string
): Promise<{| projectRoot: string, files: { [string]: string } |}> => {
  requireFileSystem();
  if (path.basename(entryPath) !== MULTI_FILE_ENTRY_NAME) {
    throw new MultiFileProjectError(
      'MULTIFILE_INVALID_ENTRY',
      `The multi-file entry must be named ${MULTI_FILE_ENTRY_NAME}.`
    );
  }
  const projectRoot = path.resolve(path.dirname(entryPath));
  await recoverMultiFileTransactions(projectRoot);
  const files: { [string]: string } = {};
  const pending: Array<string> = [
    MULTI_FILE_ENTRY_URI,
    ...(await discoverOwnedSettingsUris(projectRoot)),
  ];
  let totalSize = 0;

  while (pending.length) {
    const uri = pending.shift();
    if (!uri) continue;
    if (files[uri] !== undefined) continue;
    if (Object.keys(files).length >= MAX_MANAGED_FILES) {
      throw new MultiFileProjectError(
        'MULTIFILE_RESOURCE_LIMIT',
        `Project references more than ${MAX_MANAGED_FILES} managed files.`
      );
    }
    const filePath = resolveGameUriToPath(projectRoot, uri);
    const source = await readBoundedUtf8(
      filePath,
      isCompositeOwnerSettingsUri(uri)
        ? MAX_COMPOSITE_SOURCE_FILE_SIZE
        : MAX_SOURCE_FILE_SIZE
    );
    totalSize += unescape(encodeURIComponent(source)).length;
    if (totalSize > MAX_COMPOSED_SOURCE_SIZE) {
      throw new MultiFileProjectError(
        'MULTIFILE_RESOURCE_LIMIT',
        `Managed source exceeds ${MAX_COMPOSED_SOURCE_SIZE} total bytes.`
      );
    }
    files[uri] = source;
    if (
      uri.endsWith('.settings') &&
      uri !== MULTI_FILE_RETIRED_EXTERNAL_SETTINGS_URI
    ) {
      const document = parseTomlSource(source, uri);
      if (
        uri === MULTI_FILE_ENTRY_URI &&
        (!document.gdevelop ||
          document.gdevelop.combinedSettingsFormatVersion !==
            MULTI_FILE_FORMAT_VERSION)
      ) {
        throw new MultiFileProjectError(
          'MULTIFILE_UNSUPPORTED_VERSION',
          'Unsupported project.gdevelop format marker.',
          uri
        );
      }
      const references: Set<string> = new Set();
      findGameUris(document, references);
      references.forEach(reference => {
        validateGameUri(reference);
        if (files[reference] === undefined) pending.push(reference);
      });
      if (
        document.kind === 'function' &&
        document.settingsFormatVersion === MULTI_FILE_FORMAT_VERSION &&
        /\/functions\/[^/]+\.settings$/.test(uri)
      ) {
        const eventsUri = uri.replace(/\.settings$/, '.events');
        validateGameUri(eventsUri);
        if (files[eventsUri] === undefined) pending.push(eventsUri);
      }
    }
  }
  return { projectRoot, files };
};

export const openMultiFileProject = async (
  entryPath: string,
  options?: Object
): Promise<Object> => {
  const { projectRoot, files } = await readMultiFileSourceTree(entryPath);
  const effectiveOptions = { ...(options || {}) };
  const ignoreInstructionCatalog =
    effectiveOptions.ignoreInstructionCatalog === true;
  delete effectiveOptions.ignoreInstructionCatalog;
  const authoringCatalogPath = path.join(
    projectRoot,
    ...PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
  );
  const deprecatedCatalogPath = path.join(
    projectRoot,
    ...PROJECT_DEPRECATED_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
  );
  if (!ignoreInstructionCatalog && fs.existsSync(authoringCatalogPath)) {
    let catalog;
    try {
      catalog = validateProjectInstructionCatalog(
        JSON.parse(await readBoundedUtf8(authoringCatalogPath))
      );
      if (fs.existsSync(deprecatedCatalogPath)) {
        const deprecatedCatalog = validateProjectInstructionCatalog(
          JSON.parse(await readBoundedUtf8(deprecatedCatalogPath))
        );
        catalog = mergeProjectInstructionCatalogs(catalog, deprecatedCatalog);
      }
    } catch (error) {
      throw new MultiFileProjectError(
        'MULTIFILE_INVALID_INSTRUCTION_CATALOG',
        `Unable to read the generated instruction catalog: ${error.message}`
      );
    }
    effectiveOptions.compileOptions = {
      resolveInstruction: createCatalogInstructionResolver(catalog),
      ...((options && options.compileOptions) || {}),
    };
  }
  const project = composeLegacyProjectFromFiles(files, effectiveOptions);
  return project;
};

const sortForCommit = (left: string, right: string): number => {
  const priority = (uri: string): number =>
    uri === MULTI_FILE_ENTRY_URI
      ? 4
      : uri.endsWith('/extension.settings')
      ? 3
      : uri.endsWith('.settings')
      ? 2
      : 1;
  return priority(left) - priority(right) || left.localeCompare(right);
};

const writeAndFlush = async (filePath: string, content: string) => {
  await fs.ensureDir(path.dirname(filePath));
  const handle = await fs.open(filePath, 'w');
  try {
    await fs.writeFile(handle, content, 'utf8');
    await fs.fsync(handle);
  } finally {
    await fs.close(handle);
  }
  const written = await fs.readFile(filePath, 'utf8');
  if (written !== content)
    throw new Error(`Written file verification failed: ${filePath}`);
};

type WriteMultiFileSourceTreeOptions = {|
  entryPath: string,
  files: { [string]: string },
  obsoleteUris?: Array<string>,
|};

const projectSourceWriteQueues: Map<string, Promise<void>> = new Map();

const writeMultiFileSourceTreeTransaction = async ({
  entryPath,
  files,
  obsoleteUris = [],
}: WriteMultiFileSourceTreeOptions): Promise<Array<string>> => {
  requireFileSystem();
  const projectRoot = path.resolve(path.dirname(entryPath));
  await fs.ensureDir(projectRoot);
  await recoverMultiFileTransactions(projectRoot);
  const transactionId = `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
  const transactionRoot = path.join(
    projectRoot,
    '.gdevelop',
    'transactions',
    transactionId
  );
  assertInside(projectRoot, transactionRoot);
  const stageRoot = path.join(transactionRoot, 'stage');
  const backupRoot = path.join(transactionRoot, 'backup');
  const changedUris = [];

  for (const uri of Object.keys(files)) {
    validateGameUri(uri);
    const target = resolveGameUriToPath(projectRoot, uri);
    const existing = fs.existsSync(target)
      ? await fs.readFile(target, 'utf8')
      : null;
    if (existing !== files[uri]) changedUris.push(uri);
  }
  obsoleteUris.forEach(uri => {
    validateGameUri(uri);
    if (files[uri] !== undefined) {
      throw new MultiFileProjectError(
        'MULTIFILE_TRANSACTION_CONFLICT',
        `A managed URI cannot be written and removed together: ${uri}`
      );
    }
  });
  if (!changedUris.length && !obsoleteUris.length) return [];

  await fs.ensureDir(stageRoot);
  for (const uri of changedUris) {
    validateGameUri(uri);
    await writeAndFlush(
      path.join(stageRoot, ...gameUriPhysicalSegments(uri)),
      files[uri]
    );
  }
  await writeAndFlush(
    path.join(transactionRoot, 'journal.json'),
    `${JSON.stringify(
      { version: 1, state: 'staged', changedUris, obsoleteUris },
      null,
      2
    )}\n`
  );

  const committed = [];
  try {
    for (const uri of [...changedUris].sort(sortForCommit)) {
      validateGameUri(uri);
      const target = resolveGameUriToPath(projectRoot, uri);
      const physicalSegments = gameUriPhysicalSegments(uri);
      const staged = path.join(stageRoot, ...physicalSegments);
      const backup = path.join(backupRoot, ...physicalSegments);
      if (fs.existsSync(target)) {
        await fs.ensureDir(path.dirname(backup));
        await fs.copy(target, backup, { overwrite: true });
      }
      await fs.ensureDir(path.dirname(target));
      await fs.move(staged, target, { overwrite: true });
      committed.push({ uri, target, backup });
    }
    for (const uri of obsoleteUris) {
      validateGameUri(uri);
      const target = resolveGameUriToPath(projectRoot, uri);
      const backup = path.join(backupRoot, ...gameUriPhysicalSegments(uri));
      if (fs.existsSync(target)) {
        await fs.ensureDir(path.dirname(backup));
        await fs.copy(target, backup, { overwrite: true });
        await fs.unlink(target);
        committed.push({ uri, target, backup });
      }
    }
    await writeAndFlush(
      path.join(transactionRoot, 'journal.json'),
      `${JSON.stringify(
        { version: 1, state: 'committed', changedUris, obsoleteUris },
        null,
        2
      )}\n`
    );
    await removeEmptyManagedParentDirectories(projectRoot, obsoleteUris);
  } catch (error) {
    for (const item of committed.reverse()) {
      if (fs.existsSync(item.backup))
        await fs.copy(item.backup, item.target, { overwrite: true });
      else if (fs.existsSync(item.target)) await fs.unlink(item.target);
    }
    await removeEmptyManagedParentDirectories(projectRoot, changedUris);
    throw error;
  } finally {
    assertInside(projectRoot, transactionRoot);
    await fs.remove(transactionRoot);
  }
  return [...changedUris, ...obsoleteUris];
};

export const writeMultiFileSourceTree = (
  options: WriteMultiFileSourceTreeOptions
): Promise<Array<string>> => {
  requireFileSystem();
  const projectRoot = path.resolve(path.dirname(options.entryPath));
  const previousWrite =
    projectSourceWriteQueues.get(projectRoot) || Promise.resolve();
  const write = previousWrite.then(() =>
    writeMultiFileSourceTreeTransaction(options)
  );
  const queueTail = write.then(() => undefined, () => undefined);
  projectSourceWriteQueues.set(projectRoot, queueTail);
  queueTail.then(() => {
    if (projectSourceWriteQueues.get(projectRoot) === queueTail) {
      projectSourceWriteQueues.delete(projectRoot);
    }
  });
  return write;
};

const sha256 = (content: string): string => {
  if (!crypto) throw new Error('Cryptographic hashes are not supported.');
  return crypto
    .createHash('sha256')
    .update(content, 'utf8')
    .digest('hex');
};

const sourceUriForLegacyPath = (legacyPath: string): string =>
  `game://${encodeManagedName(path.basename(legacyPath))}`;

export const migrateLegacyProject = async ({
  legacyPath,
  legacySource,
  legacyProject,
  decomposeOptions,
  composeOptions,
}: {
  legacyPath: string,
  legacySource: string,
  legacyProject: Object,
  decomposeOptions?: Object,
  composeOptions?: Object,
}): Promise<{| entryPath: string, files: { [string]: string } |}> => {
  requireFileSystem();
  const entryPath = path.join(path.dirname(legacyPath), MULTI_FILE_ENTRY_NAME);
  const files = decomposeLegacyProjectToFiles(legacyProject, {
    migration: {
      source: sourceUriForLegacyPath(legacyPath),
      sourceSha256: sha256(legacySource),
      importedAt: new Date().toISOString(),
      importerVersion: 1,
    },
    ...(decomposeOptions || {}),
  });
  const verificationProject = composeLegacyProjectFromFiles(
    files,
    composeOptions || {}
  );
  const verificationDifference = getLegacyProjectFirstDifferenceDescription(
    legacyProject,
    verificationProject,
    {
      behaviorPropertySchemasByType:
        decomposeOptions && decomposeOptions.behaviorPropertySchemasByType,
      instructionParameterIndicesToIgnoreByType:
        decomposeOptions &&
        decomposeOptions.instructionParameterIndicesToIgnoreByType,
    }
  );
  if (verificationDifference) {
    throw new MultiFileProjectError(
      'MULTIFILE_MIGRATION_VERIFICATION_FAILED',
      `The composed project differs from the legacy source. ${verificationDifference}`
    );
  }
  await writeMultiFileSourceTree({ entryPath, files });
  return { entryPath, files };
};

export const getLegacyMigrationSourceHash = async (
  entryPath: string
): Promise<?string> => {
  if (!fs.existsSync(entryPath)) return null;
  const source = await readBoundedUtf8(entryPath);
  const document = parseTomlSource(source, MULTI_FILE_ENTRY_URI);
  return document.migration ? document.migration.sourceSha256 || null : null;
};

export const hashLegacySource = (source: string): string => sha256(source);

export const writeLegacyProjectAsMultiFile = async (
  legacyProject: Object,
  entryPath: string,
  options?: Object
): Promise<Array<string>> => {
  let migration;
  let previousFiles: { [string]: string } = {};
  const decomposeOptions = (options && options.decomposeOptions) || {};
  if (fs.existsSync(entryPath)) {
    previousFiles = (await readMultiFileSourceTree(entryPath)).files;
    const document = parseTomlSource(
      await readBoundedUtf8(entryPath),
      MULTI_FILE_ENTRY_URI
    );
    migration = document.migration;
  }
  const files = decomposeLegacyProjectToFiles(legacyProject, {
    migration,
    ...decomposeOptions,
  });
  const verificationProject = composeLegacyProjectFromFiles(
    files,
    (options && options.composeOptions) || {}
  );
  const verificationDifference = getLegacyProjectFirstDifferenceDescription(
    legacyProject,
    verificationProject,
    {
      behaviorPropertySchemasByType:
        decomposeOptions.behaviorPropertySchemasByType,
      instructionParameterIndicesToIgnoreByType:
        decomposeOptions.instructionParameterIndicesToIgnoreByType,
    }
  );
  if (verificationDifference) {
    throw new MultiFileProjectError(
      'MULTIFILE_SAVE_VERIFICATION_FAILED',
      `Generated multi-file sources do not reconstruct the project. ${verificationDifference}`
    );
  }
  const obsoleteUris: Array<string> = Object.keys(previousFiles).filter(
    uri => files[uri] === undefined
  );
  return writeMultiFileSourceTree({ entryPath, files, obsoleteUris });
};
