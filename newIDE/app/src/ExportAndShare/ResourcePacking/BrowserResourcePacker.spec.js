// @flow
import { packResourcesInBlobFiles } from './BrowserResourcePacker';
import { parsePackIndex } from './PackFormat';
import { readProjectDataFromDataJs } from './index';

const BASE_PATH = '/export/';

// The test environment has no `Blob`, while the browser this code runs in
// always has one. Node's implementation supports everything used here
// (`size`, `slice`, `text`, `arrayBuffer`, and Blobs as constructor parts).
beforeAll(() => {
  if (typeof global.Blob === 'undefined') {
    global.Blob = require('buffer').Blob;
  }
});

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

const readFromPack = async (packBlob: Blob, filePath: string) => {
  const packBytes = new Uint8Array(await packBlob.arrayBuffer());
  const entry = parsePackIndex(packBytes).entries.find(
    entry => entry.path === filePath
  );
  if (!entry) throw new Error(`"${filePath}" is not in this pack.`);

  return {
    text: await packBlob.slice(entry.offset, entry.offset + entry.size).text(),
    type: entry.type,
  };
};

describe('packResourcesInBlobFiles', () => {
  const projectData = {
    properties: { loadingScreen: { backgroundImageResourceName: 'splash' } },
    resources: {
      resources: [
        makeResource('global', 'global.png'),
        makeResource('music', 'music.mp3', 'audio'),
        makeResource('menu', 'menu.png'),
        makeResource('splash', 'splash.png'),
      ],
    },
    usedResources: [{ name: 'global' }, { name: 'music' }],
    objects: [],
    layouts: [{ name: 'Menu', usedResources: [{ name: 'menu' }], objects: [] }],
  };

  const makeInput = () => ({
    textFiles: [
      { filePath: '/export/data.js', text: makeDataJs(projectData) },
      { filePath: '/export/runtimegame.js', text: 'gdjs.RuntimeGame = ...' },
    ],
    blobFiles: [
      { filePath: '/export/global.png', blob: new Blob(['the global image']) },
      { filePath: '/export/music.mp3', blob: new Blob(['the music']) },
      { filePath: '/export/menu.png', blob: new Blob(['the menu image']) },
      { filePath: '/export/splash.png', blob: new Blob(['the splash image']) },
      // A binary engine file, which must be left alone.
      {
        filePath: '/export/pixi-renderers/draco/gltf/draco_decoder.wasm',
        blob: new Blob(['not a resource']),
      },
    ],
    basePath: BASE_PATH,
    onProgress: (count: number, total: number) => {},
  });

  it('replaces the resource blobs by packs, leaving the engine files alone', async () => {
    const { textFiles, blobFiles } = await packResourcesInBlobFiles(
      makeInput()
    );

    expect(blobFiles.map(({ filePath }) => filePath).sort()).toEqual([
      // The loading screen background is needed before the loading screen can
      // be shown, so it stays an individual file.
      '/export/pixi-renderers/draco/gltf/draco_decoder.wasm',
      '/export/resources.pak',
      '/export/scene-0.pak',
      '/export/splash.png',
    ]);
    // Text files are untouched, apart from data.js.
    expect(
      textFiles.find(({ filePath }) => filePath === '/export/runtimegame.js')
        ?.text
    ).toBe('gdjs.RuntimeGame = ...');
  });

  it('writes contents that can be read back, with their MIME type', async () => {
    const { blobFiles } = await packResourcesInBlobFiles(makeInput());

    const globalPack = blobFiles.find(
      ({ filePath }) => filePath === '/export/resources.pak'
    );
    if (!globalPack) throw new Error('The global pack was not written.');

    expect(await readFromPack(globalPack.blob, 'global.png')).toEqual({
      text: 'the global image',
      type: 'image/png',
    });
    expect(await readFromPack(globalPack.blob, 'music.mp3')).toEqual({
      text: 'the music',
      type: 'audio/mpeg',
    });

    const scenePack = blobFiles.find(
      ({ filePath }) => filePath === '/export/scene-0.pak'
    );
    if (!scenePack) throw new Error('The scene pack was not written.');
    expect(await readFromPack(scenePack.blob, 'menu.png')).toEqual({
      text: 'the menu image',
      type: 'image/png',
    });
  });

  it('declares the packs in data.js without touching the project data', async () => {
    const { textFiles } = await packResourcesInBlobFiles(makeInput());

    const dataJs = textFiles.find(
      ({ filePath }) => filePath === '/export/data.js'
    );
    if (!dataJs) throw new Error('data.js is missing.');

    expect(readProjectDataFromDataJs(dataJs.text)).toEqual(projectData);

    const manifest = JSON.parse(
      dataJs.text
        .slice(
          dataJs.text.indexOf('gdjs.resourcePacks = ') +
            'gdjs.resourcePacks = '.length
        )
        .trim()
        .replace(/;$/, '')
    );
    expect(manifest).toEqual({
      version: 1,
      packs: ['resources.pak', 'scene-0.pak'],
      files: { 'global.png': 0, 'music.mp3': 0, 'menu.png': 1 },
      // The global pack must be downloaded up front, as it holds the resources
      // that no loading task refers to.
      startupPacks: [0],
    });
  });

  it('leaves the export untouched when there is nothing to pack', async () => {
    const emptyProjectData = {
      properties: { loadingScreen: { backgroundImageResourceName: '' } },
      resources: { resources: [] },
      usedResources: [],
      objects: [],
      layouts: [],
    };
    const { textFiles, blobFiles } = await packResourcesInBlobFiles({
      textFiles: [
        { filePath: '/export/data.js', text: makeDataJs(emptyProjectData) },
      ],
      blobFiles: [],
      basePath: BASE_PATH,
      onProgress: (count: number, total: number) => {},
    });

    expect(blobFiles).toEqual([]);
    expect(textFiles[0].text).not.toContain('gdjs.resourcePacks');
  });

  it('fails clearly when data.js is not in the export', async () => {
    await expect(
      packResourcesInBlobFiles({
        textFiles: [],
        blobFiles: [],
        basePath: BASE_PATH,
        onProgress: (count: number, total: number) => {},
      })
    ).rejects.toThrow(/Could not find "\/export\/data.js"/);
  });
});
