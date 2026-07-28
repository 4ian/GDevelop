// @flow
import { packResourcesInFolder } from './LocalResourcePacker';
import { parsePackIndex } from './PackFormat';
import { readProjectDataFromDataJs } from './index';
import optionalRequire from '../../Utils/OptionalRequire';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');
const os = optionalRequire('os');

const makeDataJs = (projectData: Object) =>
  'gdjs.projectData = ' +
  JSON.stringify(projectData) +
  ';\ngdjs.runtimeGameOptions = {};\n';

const makeResource = (name: string, file: string, kind: string = 'image') => ({
  name,
  file,
  kind,
  metadata: '',
  userAdded: true,
});

/**
 * Read a resource back from the pack it was written in.
 */
const readFromPack = (packBytes: Uint8Array, filePath: string): string => {
  const entry = parsePackIndex(packBytes).entries.find(
    entry => entry.path === filePath
  );
  if (!entry) throw new Error(`"${filePath}" is not in this pack.`);

  return new TextDecoder().decode(
    packBytes.slice(entry.offset, entry.offset + entry.size)
  );
};

describe('packResourcesInFolder', () => {
  let exportDir = '';

  beforeEach(async () => {
    exportDir = await fs.mkdtemp(path.join(os.tmpdir(), 'gdevelop-pack-test-'));
  });

  afterEach(async () => {
    if (exportDir) await fs.remove(exportDir);
  });

  const writeExportFolder = async (projectData: Object, files: Object) => {
    await fs.writeFile(
      path.join(exportDir, 'data.js'),
      makeDataJs(projectData),
      'utf8'
    );
    for (const filePath of Object.keys(files)) {
      await fs.writeFile(
        path.join(exportDir, filePath),
        files[filePath],
        'utf8'
      );
    }
  };

  it('replaces the resource files by packs and declares them in data.js', async () => {
    const projectData = {
      properties: { loadingScreen: { backgroundImageResourceName: 'splash' } },
      resources: {
        resources: [
          makeResource('global', 'global.png'),
          makeResource('menu', 'menu.png'),
          makeResource('level', 'level.png'),
          makeResource('splash', 'splash.png'),
        ],
      },
      usedResources: [{ name: 'global' }],
      objects: [],
      layouts: [
        { name: 'Menu', usedResources: [{ name: 'menu' }], objects: [] },
        { name: 'Level', usedResources: [{ name: 'level' }], objects: [] },
      ],
    };
    await writeExportFolder(projectData, {
      'global.png': 'the global image',
      'menu.png': 'the menu image',
      'level.png': 'the level image',
      'splash.png': 'the splash image',
      // An engine file, which must be left alone.
      'runtimegame.js': 'gdjs.RuntimeGame = ...',
    });

    await packResourcesInFolder({
      exportDir,
      onProgress: (count: number, total: number) => {},
    });

    const remainingFiles = (await fs.readdir(exportDir)).sort();
    expect(remainingFiles).toEqual([
      'data.js',
      'resources.pak',
      'runtimegame.js',
      'scene-0.pak',
      'scene-1.pak',
      // The loading screen background stays an individual file: it is needed
      // before the loading screen can be shown.
      'splash.png',
    ]);

    const globalPack = await fs.readFile(path.join(exportDir, 'resources.pak'));
    expect(readFromPack(new Uint8Array(globalPack), 'global.png')).toBe(
      'the global image'
    );
    const menuPack = await fs.readFile(path.join(exportDir, 'scene-0.pak'));
    expect(readFromPack(new Uint8Array(menuPack), 'menu.png')).toBe(
      'the menu image'
    );
    const levelPack = await fs.readFile(path.join(exportDir, 'scene-1.pak'));
    expect(readFromPack(new Uint8Array(levelPack), 'level.png')).toBe(
      'the level image'
    );

    const dataJs = await fs.readFile(path.join(exportDir, 'data.js'), 'utf8');
    // The project data itself must be untouched: resource files keep their name,
    // which is what the packs are indexed by.
    expect(readProjectDataFromDataJs(dataJs)).toEqual(projectData);

    const manifestJson = dataJs
      .slice(
        dataJs.indexOf('gdjs.resourcePacks = ') + 'gdjs.resourcePacks = '.length
      )
      .trim()
      .replace(/;$/, '');
    const manifest = JSON.parse(manifestJson);
    expect(manifest.version).toBe(1);
    expect(manifest.packs).toEqual([
      'resources.pak',
      'scene-0.pak',
      'scene-1.pak',
    ]);
    expect(manifest.files).toEqual({
      'global.png': 0,
      'menu.png': 1,
      'level.png': 2,
    });
    expect(manifest.files['splash.png']).toBeUndefined();
  });

  it('writes contents that can be read back byte for byte', async () => {
    // Sizes that exercise the padding between contents.
    const contents = {
      'a.png': 'a',
      'b.png': 'b'.repeat(16),
      'c.png': 'c'.repeat(1000),
      'd.png': '',
    };
    const projectData = {
      properties: { loadingScreen: { backgroundImageResourceName: '' } },
      resources: {
        resources: Object.keys(contents).map(file => makeResource(file, file)),
      },
      usedResources: Object.keys(contents).map(file => ({ name: file })),
      objects: [],
      layouts: [],
    };
    await writeExportFolder(projectData, contents);

    await packResourcesInFolder({
      exportDir,
      onProgress: (count: number, total: number) => {},
    });

    const packBytes = new Uint8Array(
      await fs.readFile(path.join(exportDir, 'resources.pak'))
    );
    Object.keys(contents).forEach(filePath => {
      expect(readFromPack(packBytes, filePath)).toBe(contents[filePath]);
    });
  });

  it('does not lose a resource that no scene refers to', async () => {
    const projectData = {
      properties: { loadingScreen: { backgroundImageResourceName: '' } },
      resources: {
        resources: [makeResource('dynamic', 'dynamic.mp3', 'audio')],
      },
      // Referred to nowhere: only played by name from an expression.
      usedResources: [],
      objects: [],
      layouts: [{ name: 'Menu', usedResources: [], objects: [] }],
    };
    await writeExportFolder(projectData, { 'dynamic.mp3': 'the sound' });

    await packResourcesInFolder({
      exportDir,
      onProgress: (count: number, total: number) => {},
    });

    const packBytes = new Uint8Array(
      await fs.readFile(path.join(exportDir, 'resources.pak'))
    );
    expect(readFromPack(packBytes, 'dynamic.mp3')).toBe('the sound');
    // The MIME type must survive, as a blob: URL has no extension to guess from.
    const entry = parsePackIndex(packBytes).entries[0];
    expect(entry.type).toBe('audio/mpeg');
  });

  it('skips a resource whose file is missing from the export', async () => {
    const projectData = {
      properties: { loadingScreen: { backgroundImageResourceName: '' } },
      resources: {
        resources: [
          makeResource('present', 'present.png'),
          makeResource('missing', 'missing.png'),
        ],
      },
      usedResources: [{ name: 'present' }, { name: 'missing' }],
      objects: [],
      layouts: [],
    };
    await writeExportFolder(projectData, { 'present.png': 'here' });

    await packResourcesInFolder({
      exportDir,
      onProgress: (count: number, total: number) => {},
    });

    const dataJs = await fs.readFile(path.join(exportDir, 'data.js'), 'utf8');
    expect(dataJs).toContain('"present.png":0');
    expect(dataJs).not.toContain('missing.png":');
  });

  it('does nothing when the project has no resource', async () => {
    const projectData = {
      properties: { loadingScreen: { backgroundImageResourceName: '' } },
      resources: { resources: [] },
      usedResources: [],
      objects: [],
      layouts: [],
    };
    await writeExportFolder(projectData, {});

    await packResourcesInFolder({
      exportDir,
      onProgress: (count: number, total: number) => {},
    });

    expect(await fs.readdir(exportDir)).toEqual(['data.js']);
    const dataJs = await fs.readFile(path.join(exportDir, 'data.js'), 'utf8');
    expect(dataJs).not.toContain('gdjs.resourcePacks');
  });
});
