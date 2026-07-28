// @flow
import {
  appendResourcePacksManifestToDataJs,
  buildResourcePacksManifest,
  readProjectDataFromDataJs,
} from './index';

/**
 * Build a "data.js" exactly as `ExporterHelper::ExportProjectData` writes it.
 */
const makeDataJs = (projectData: Object, runtimeGameOptions: Object = {}) =>
  'gdjs.projectData = ' +
  JSON.stringify(projectData) +
  ';\ngdjs.runtimeGameOptions = ' +
  JSON.stringify(runtimeGameOptions) +
  ';\n';

describe('readProjectDataFromDataJs', () => {
  it('reads back the project data written by the exporter', () => {
    const projectData = {
      firstLayout: 'Menu',
      resources: { resources: [{ name: 'image', file: 'image.png' }] },
      usedResources: [{ name: 'image' }],
      layouts: [{ name: 'Menu', usedResources: [] }],
    };

    expect(readProjectDataFromDataJs(makeDataJs(projectData))).toEqual(
      projectData
    );
  });

  it('is not fooled by a project containing the assignment as a string', () => {
    // A JavaScript event, or even a text object, can hold anything.
    const projectData = {
      firstLayout: 'Menu',
      resources: { resources: [] },
      usedResources: [],
      layouts: [],
      note: 'gdjs.runtimeGameOptions = {"tricky": true};',
    };

    expect(readProjectDataFromDataJs(makeDataJs(projectData))).toEqual(
      projectData
    );
  });

  it('throws a clear error when the file is not what is expected', () => {
    expect(() => readProjectDataFromDataJs('some other content')).toThrow(
      /does not have the expected content/
    );
  });
});

describe('appendResourcePacksManifestToDataJs', () => {
  it('declares the packs to the engine without touching the project data', () => {
    const projectData = {
      firstLayout: 'Menu',
      resources: { resources: [] },
      usedResources: [],
      layouts: [],
    };
    const dataJs = makeDataJs(projectData);

    const manifest = buildResourcePacksManifest(
      {
        packs: [
          {
            name: 'resources.pak',
            filePaths: ['image.png'],
            isLoadedAtStartup: true,
          },
          {
            name: 'scene-0.pak',
            filePaths: ['missing.png'],
            isLoadedAtStartup: false,
          },
        ],
        fileToPackIndex: { 'image.png': 0, 'missing.png': 1 },
        unpackedFilePaths: [],
      },
      // "missing.png" was not exported, so it must not be announced as packed.
      new Set(['image.png'])
    );

    const newDataJs = appendResourcePacksManifestToDataJs(dataJs, manifest);

    expect(readProjectDataFromDataJs(newDataJs)).toEqual(projectData);
    expect(newDataJs).toContain('gdjs.resourcePacks = ');
    expect(manifest).toEqual({
      version: 1,
      packs: ['resources.pak', 'scene-0.pak'],
      files: { 'image.png': 0 },
      startupPacks: [0],
    });
  });

  it('does not ask the game to download a pack that was never written', () => {
    const manifest = buildResourcePacksManifest(
      {
        packs: [
          {
            name: 'resources.pak',
            filePaths: ['missing.png'],
            isLoadedAtStartup: true,
          },
        ],
        fileToPackIndex: { 'missing.png': 0 },
        unpackedFilePaths: [],
      },
      new Set()
    );

    expect(manifest.startupPacks).toEqual([]);
    expect(manifest.files).toEqual({});
  });
});
