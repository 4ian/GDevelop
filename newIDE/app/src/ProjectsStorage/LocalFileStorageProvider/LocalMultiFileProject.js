// @flow

import optionalRequire from '../../Utils/OptionalRequire';
import {
  MULTI_FILE_ENTRY_URI,
  MultiFileProjectError,
  areLegacyProjectsEquivalent,
  composeLegacyProjectFromFiles,
  decomposeLegacyProjectToFiles,
  encodeManagedName,
  parseTomlSource,
  validateGameUri,
} from '../MultiFileProjectFormat';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const crypto = optionalRequire('crypto');

const MAX_MANAGED_FILES = 10000;
const MAX_SOURCE_FILE_SIZE = 16 * 1024 * 1024;
const MAX_COMPOSED_SOURCE_SIZE = 256 * 1024 * 1024;

const requireFileSystem = () => {
  if (!fs || !path) throw new Error('Filesystem is not supported.');
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
  const relative = validateGameUri(uri);
  const root = path.resolve(projectRoot);
  const resolved = path.resolve(root, ...relative.split('/'));
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
        const relative = validateGameUri(uri);
        const target = resolveGameUriToPath(root, uri);
        const staged = path.join(
          transactionRoot,
          'stage',
          ...relative.split('/')
        );
        const backup = path.join(
          transactionRoot,
          'backup',
          ...relative.split('/')
        );
        if (fs.existsSync(backup)) {
          await fs.ensureDir(path.dirname(target));
          await fs.copy(backup, target, { overwrite: true });
        } else if (!fs.existsSync(staged) && fs.existsSync(target)) {
          await fs.unlink(target);
        }
      }
      for (const uri of journal.obsoleteUris || []) {
        const relative = validateGameUri(uri);
        const target = resolveGameUriToPath(root, uri);
        const backup = path.join(
          transactionRoot,
          'backup',
          ...relative.split('/')
        );
        if (fs.existsSync(backup) && !fs.existsSync(target)) {
          await fs.ensureDir(path.dirname(target));
          await fs.copy(backup, target, { overwrite: true });
        }
      }
    } else {
      for (const uri of journal.obsoleteUris || []) {
        const target = resolveGameUriToPath(root, uri);
        if (fs.existsSync(target)) await fs.unlink(target);
      }
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

export const readMultiFileSourceTree = async (
  entryPath: string
): Promise<{| projectRoot: string, files: { [string]: string } |}> => {
  requireFileSystem();
  if (path.basename(entryPath) !== 'project.settings') {
    throw new MultiFileProjectError(
      'MULTIFILE_INVALID_ENTRY',
      'The multi-file entry must be named project.settings.'
    );
  }
  const projectRoot = path.resolve(path.dirname(entryPath));
  await recoverMultiFileTransactions(projectRoot);
  const files: { [string]: string } = {};
  const pending: Array<string> = [MULTI_FILE_ENTRY_URI];
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
  const { files } = await readMultiFileSourceTree(entryPath);
  return composeLegacyProjectFromFiles(files, options || {});
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

export const writeMultiFileSourceTree = async ({
  entryPath,
  files,
  obsoleteUris = [],
}: {
  entryPath: string,
  files: { [string]: string },
  obsoleteUris?: Array<string>,
}): Promise<Array<string>> => {
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
    const relative = validateGameUri(uri);
    await writeAndFlush(
      path.join(stageRoot, ...relative.split('/')),
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
      const relative = validateGameUri(uri);
      const target = resolveGameUriToPath(projectRoot, uri);
      const staged = path.join(stageRoot, ...relative.split('/'));
      const backup = path.join(backupRoot, ...relative.split('/'));
      if (fs.existsSync(target)) {
        await fs.ensureDir(path.dirname(backup));
        await fs.copy(target, backup, { overwrite: true });
      }
      await fs.ensureDir(path.dirname(target));
      await fs.move(staged, target, { overwrite: true });
      committed.push({ uri, target, backup });
    }
    for (const uri of obsoleteUris) {
      const relative = validateGameUri(uri);
      const target = resolveGameUriToPath(projectRoot, uri);
      const backup = path.join(backupRoot, ...relative.split('/'));
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
  } catch (error) {
    for (const item of committed.reverse()) {
      if (fs.existsSync(item.backup))
        await fs.copy(item.backup, item.target, { overwrite: true });
      else if (fs.existsSync(item.target)) await fs.unlink(item.target);
    }
    throw error;
  } finally {
    assertInside(projectRoot, transactionRoot);
    await fs.remove(transactionRoot);
  }
  return [...changedUris, ...obsoleteUris];
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
  const entryPath = path.join(path.dirname(legacyPath), 'project.settings');
  const files = decomposeLegacyProjectToFiles(legacyProject, {
    migration: {
      source: sourceUriForLegacyPath(legacyPath),
      sourceSha256: sha256(legacySource),
      importedAt: new Date().toISOString(),
      importerVersion: 1,
    },
  });
  const verificationProject = composeLegacyProjectFromFiles(files);
  if (!areLegacyProjectsEquivalent(legacyProject, verificationProject)) {
    throw new MultiFileProjectError(
      'MULTIFILE_MIGRATION_VERIFICATION_FAILED',
      'The composed project differs from the legacy source.'
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
  return document.project && document.project.migration
    ? document.project.migration.sourceSha256 || null
    : null;
};

export const hashLegacySource = (source: string): string => sha256(source);

export const writeLegacyProjectAsMultiFile = async (
  legacyProject: Object,
  entryPath: string
): Promise<Array<string>> => {
  let migration;
  let previousFiles: { [string]: string } = {};
  if (fs.existsSync(entryPath)) {
    previousFiles = (await readMultiFileSourceTree(entryPath)).files;
    const document = parseTomlSource(
      await readBoundedUtf8(entryPath),
      MULTI_FILE_ENTRY_URI
    );
    migration = document.project ? document.project.migration : undefined;
  }
  const files = decomposeLegacyProjectToFiles(legacyProject, { migration });
  const verificationProject = composeLegacyProjectFromFiles(files);
  if (!areLegacyProjectsEquivalent(legacyProject, verificationProject)) {
    throw new MultiFileProjectError(
      'MULTIFILE_SAVE_VERIFICATION_FAILED',
      'Generated multi-file sources do not reconstruct the project.'
    );
  }
  const obsoleteUris: Array<string> = Object.keys(previousFiles).filter(
    uri => files[uri] === undefined
  );
  return writeMultiFileSourceTree({ entryPath, files, obsoleteUris });
};
