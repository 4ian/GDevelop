// @flow

import optionalRequire from '../../Utils/OptionalRequire';
import {
  MULTI_FILE_ENTRY_NAME,
  MULTI_FILE_CONSTANTS_URI,
  MULTI_FILE_ENTRY_URI,
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

const readBoundedUtf8 = async (filePath: string): Promise<string> => {
  const stats = await fs.stat(filePath);
  if (!stats.isFile())
    throw new Error(`Managed source is not a file: ${filePath}`);
  if (stats.size > MAX_SOURCE_FILE_SIZE) {
    throw new MultiFileProjectError(
      'MULTIFILE_RESOURCE_LIMIT',
      `Managed source exceeds ${MAX_SOURCE_FILE_SIZE} bytes: ${filePath}`
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

const discoverSettingsFilesRecursively = async (
  directoryPath: string,
  uriSegments: Array<string>,
  output: Array<string>
): Promise<void> => {
  if (!fs.existsSync(directoryPath)) return;
  const entries = await fs.readdir(directoryPath, { withFileTypes: true });
  for (const entry of entries) {
    const encodedName = physicalNameToGameUriSegment(entry.name);
    const entryPath = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      await discoverSettingsFilesRecursively(
        entryPath,
        [...uriSegments, encodedName],
        output
      );
    } else if (entry.isFile() && entry.name.endsWith('.settings')) {
      output.push(`game://${[...uriSegments, encodedName].join('/')}`);
    }
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
  await discoverSettingsFilesRecursively(
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
      const filePath = path.join(sceneRoot, 'scene.settings');
      if (fs.existsSync(filePath)) {
        discovered.push(`game://scenes/${sceneSegment}/scene.settings`);
      }
      await discoverSettingsFilesRecursively(
        path.join(sceneRoot, 'objects'),
        ['scenes', sceneSegment, 'objects'],
        discovered
      );
    }
  }

  const externalSettingsPath = path.join(
    projectRoot,
    'externals',
    'external.settings'
  );
  if (fs.existsSync(externalSettingsPath)) {
    discovered.push('game://externals/external.settings');
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
            await discoverSettingsFilesRecursively(
              path.join(componentRoot, 'functions'),
              [
                'extensions',
                extensionUriSegment,
                child.folder,
                childSegment,
                'functions',
              ],
              discovered
            );
          }
          if (child.folder !== 'prefabs') continue;
          await discoverSettingsFilesRecursively(
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
          const variantsRoot = path.join(componentRoot, 'variants');
          if (!fs.existsSync(variantsRoot)) continue;
          const variantEntries = await fs.readdir(variantsRoot, {
            withFileTypes: true,
          });
          for (const variantEntry of variantEntries) {
            if (!variantEntry.isDirectory()) continue;
            const variantSegment = physicalNameToGameUriSegment(
              variantEntry.name
            );
            await discoverSettingsFilesRecursively(
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
    const source = await readBoundedUtf8(filePath);
    totalSize += unescape(encodeURIComponent(source)).length;
    if (totalSize > MAX_COMPOSED_SOURCE_SIZE) {
      throw new MultiFileProjectError(
        'MULTIFILE_RESOURCE_LIMIT',
        `Managed source exceeds ${MAX_COMPOSED_SOURCE_SIZE} total bytes.`
      );
    }
    files[uri] = source;
    if (uri.endsWith('.settings')) {
      const document = parseTomlSource(source, uri);
      const references: Set<string> = new Set();
      findGameUris(document, references);
      references.forEach(reference => {
        validateGameUri(reference);
        if (files[reference] === undefined) pending.push(reference);
      });
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
      : uri.endsWith('/extension.settings') ||
        uri === 'game://externals/external.settings'
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
}: {
  legacyPath: string,
  legacySource: string,
  legacyProject: Object,
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
  });
  const verificationProject = composeLegacyProjectFromFiles(files);
  const verificationDifference = getLegacyProjectFirstDifferenceDescription(
    legacyProject,
    verificationProject
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
