// @flow

// This is an intentionally opt-in compatibility suite. Run it with:
//   npm run test:examples-compatibility
//
// It sparse-downloads JSON sources from every example in GDevelop-examples,
// imports each legacy project through the editor's real local opener, writes
// the new multi-file representation, opens project.gdevelop, and verifies that
// the reconstructed project is equivalent to the normalized imported project.

// $FlowFixMe[cannot-resolve-module] Jest runs this compatibility test in Node.
import { execFileSync } from 'child_process';
// $FlowFixMe[cannot-resolve-module]
import fs from 'fs-extra';
// $FlowFixMe[cannot-resolve-module]
import os from 'os';
// $FlowFixMe[cannot-resolve-module]
import path from 'path';
import { getLegacyProjectFirstDifferenceDescription } from '../MultiFileProjectFormat';
import {
  readMultiFileSourceTree,
  resolveGameUriToPath,
} from './LocalMultiFileProject';
import { onOpen } from './LocalProjectOpener';

// $FlowFixMe[cannot-resolve-module] CommonJS loader shared with the desktop app.
const { loadExtension } = require('../../JsExtensionsLoader');

declare var __dirname: string;

const RUN_COMPATIBILITY_TEST =
  process.env.RUN_GDEVELOP_EXAMPLES_COMPATIBILITY === '1';
const EXAMPLES_REPOSITORY =
  process.env.GDEVELOP_EXAMPLES_REPOSITORY ||
  'https://github.com/GDevelopApp/GDevelop-examples.git';
const EXAMPLES_BRANCH = process.env.GDEVELOP_EXAMPLES_BRANCH || 'main';
const CACHE_ROOT =
  process.env.GDEVELOP_EXAMPLES_CACHE_DIR ||
  path.join(os.tmpdir(), 'gdevelop-examples-compatibility');

type ExampleProject = {|
  directoryPath: string,
  projectPath: string,
  relativeProjectPath: string,
|};

const runGit = (arguments_: Array<string>, inheritOutput: boolean = false) =>
  execFileSync('git', arguments_, {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
    stdio: inheritOutput ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });

const getRemoteRevision = (): string => {
  const output = runGit([
    'ls-remote',
    EXAMPLES_REPOSITORY,
    `refs/heads/${EXAMPLES_BRANCH}`,
  ]).trim();
  const revision = output.split(/\s+/)[0];
  if (!/^[0-9a-f]{40}$/i.test(revision || '')) {
    throw new Error(
      `Unable to resolve ${EXAMPLES_BRANCH} from ${EXAMPLES_REPOSITORY}.`
    );
  }
  return revision;
};

const downloadExamplesJsonSources = (): string => {
  const revision = getRemoteRevision();
  const repositoryPath = path.join(CACHE_ROOT, revision);
  if (fs.existsSync(path.join(repositoryPath, '.git'))) {
    return repositoryPath;
  }

  fs.ensureDirSync(CACHE_ROOT);
  const stagingPath = `${repositoryPath}.download-${process.pid}`;
  fs.removeSync(stagingPath);
  try {
    runGit(
      [
        'clone',
        '--branch',
        EXAMPLES_BRANCH,
        '--depth',
        '1',
        '--filter=blob:none',
        '--no-tags',
        '--sparse',
        EXAMPLES_REPOSITORY,
        stagingPath,
      ],
      true
    );
    const checkedOutRevision = runGit([
      '-C',
      stagingPath,
      'rev-parse',
      'HEAD',
    ]).trim();
    if (checkedOutRevision !== revision) {
      throw new Error(
        `The ${EXAMPLES_BRANCH} branch changed while downloading examples; rerun the suite.`
      );
    }
    runGit(
      [
        '-C',
        stagingPath,
        'sparse-checkout',
        'set',
        '--no-cone',
        '/examples/**/*.json',
      ],
      true
    );
    if (fs.existsSync(repositoryPath)) {
      // Another test process may have completed the same immutable revision.
      fs.removeSync(stagingPath);
    } else {
      fs.moveSync(stagingPath, repositoryPath);
    }
  } finally {
    if (fs.existsSync(stagingPath)) fs.removeSync(stagingPath);
  }
  return repositoryPath;
};

const readJson = (filePath: string): Object =>
  JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));

const isGDevelopProject = (value: any): boolean =>
  !!value &&
  typeof value === 'object' &&
  !!value.gdVersion &&
  !!value.properties &&
  !!value.resources &&
  Array.isArray(value.layouts) &&
  Array.isArray(value.objects);

const collectJsonFiles = (directoryPath: string): Array<string> =>
  fs.readdirSync(directoryPath, { withFileTypes: true }).flatMap(entry => {
    const entryPath = path.join(directoryPath, entry.name);
    return entry.isDirectory()
      ? collectJsonFiles(entryPath)
      : entry.isFile() && entry.name.endsWith('.json')
      ? [entryPath]
      : [];
  });

const discoverExampleProjects = (
  repositoryPath: string
): Array<ExampleProject> => {
  const examplesRoot = path.join(repositoryPath, 'examples');
  const exampleDirectories = fs
    .readdirSync(examplesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));
  const projects = [];
  const discoveryErrors = [];

  exampleDirectories.forEach(entry => {
    const directoryPath = path.join(examplesRoot, entry.name);
    const candidates = collectJsonFiles(directoryPath);
    const projectPaths = candidates.filter(candidate => {
      try {
        return isGDevelopProject(readJson(candidate));
      } catch (error) {
        return false;
      }
    });
    if (projectPaths.length === 0) {
      discoveryErrors.push(`${entry.name}: no GDevelop project JSON was found`);
      return;
    }
    projectPaths.sort().forEach(projectPath => {
      projects.push({
        directoryPath,
        projectPath,
        relativeProjectPath: path
          .relative(repositoryPath, projectPath)
          .replace(/\\/g, '/'),
      });
    });
  });

  if (discoveryErrors.length) {
    throw new Error(
      `Not every upstream example has a discoverable project:\n${discoveryErrors.join(
        '\n'
      )}`
    );
  }
  if (projects.length < exampleDirectories.length) {
    throw new Error(
      `Discovered ${projects.length} projects for ${
        exampleDirectories.length
      } example directories.`
    );
  }
  return projects;
};

const copyJsonSources = (sourceDirectory: string, targetDirectory: string) => {
  fs.copySync(sourceDirectory, targetDirectory, {
    filter: sourcePath =>
      fs.statSync(sourcePath).isDirectory() ||
      path.extname(sourcePath).toLowerCase() === '.json',
  });
};

const loadEditorJsExtensions = () => {
  const gd: libGDevelop = global.gd;
  const extensionsRoot = path.resolve(
    __dirname,
    '../../../../..',
    'Extensions'
  );
  const errors = [];

  gd.JsPlatform.get().reloadBuiltinExtensions();
  fs.readdirSync(extensionsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach(entry => {
      const extensionModulePath = path.join(
        extensionsRoot,
        entry.name,
        'JsExtension.js'
      );
      if (!fs.existsSync(extensionModulePath)) return;
      // $FlowFixMe[unsupported-syntax] This suite intentionally loads the same
      // extension declaration modules as the local desktop app.
      const extensionModule = require(extensionModulePath);
      const result = loadExtension(
        value => value,
        gd,
        gd.JsPlatform.get(),
        extensionModule
      );
      if (result.error) {
        errors.push(`${entry.name}: ${result.message}`);
      }
    });

  if (errors.length) {
    throw new Error(
      `Unable to initialize editor JS extensions:\n${errors.join('\n')}`
    );
  }
};

if (!RUN_COMPATIBILITY_TEST) {
  describe.skip('GDevelop examples multi-file compatibility', () => {
    test('is run only by npm run test:examples-compatibility', () => {});
  });
} else {
  const repositoryPath = downloadExamplesJsonSources();
  const examples = discoverExampleProjects(repositoryPath);

  // A single large extension-heavy example can take longer than a unit test.
  jest.setTimeout(5 * 60 * 1000);

  describe('GDevelop examples multi-file compatibility', () => {
    beforeAll(() => {
      loadEditorJsExtensions();
    });

    test(`discovers every example project (${examples.length})`, () => {
      expect(examples.length).toBeGreaterThan(250);
    });

    test.each(examples.map(example => [example.relativeProjectPath, example]))(
      'imports and reconstructs %s',
      async (relativeProjectPath, example) => {
        const temporaryDirectory = fs.mkdtempSync(
          path.join(os.tmpdir(), 'gdevelop-example-compatibility-')
        );
        try {
          copyJsonSources(example.directoryPath, temporaryDirectory);
          const legacyPath = path.join(
            temporaryDirectory,
            path.relative(example.directoryPath, example.projectPath)
          );
          const imported = await onOpen({ fileIdentifier: legacyPath });
          const entryPath = path.join(temporaryDirectory, 'project.gdevelop');

          expect(imported.fileMetadata).toBeDefined();
          expect(imported.fileMetadata.fileIdentifier).toBe(entryPath);
          expect(fs.existsSync(entryPath)).toBe(true);

          const sourceTree = await readMultiFileSourceTree(entryPath);
          expect(sourceTree.files['game://project.gdevelop']).toBeDefined();
          expect(Object.keys(sourceTree.files).length).toBeGreaterThan(1);
          Object.keys(sourceTree.files).forEach(uri => {
            expect(
              fs.existsSync(resolveGameUriToPath(temporaryDirectory, uri))
            ).toBe(true);
          });

          const reopened = await onOpen({ fileIdentifier: entryPath });
          const difference = getLegacyProjectFirstDifferenceDescription(
            imported.content,
            reopened.content
          );
          if (difference) {
            throw new Error(`${relativeProjectPath}: ${difference}`);
          }
        } finally {
          fs.removeSync(temporaryDirectory);
        }
      }
    );
  });
}
