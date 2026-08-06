// @ts-check

/**
 * Tests for gdjs.ResourcePackManager, and its integration in gdjs.ResourceLoader.
 *
 * The packs read here are built exactly like the exporter builds them, see
 * `newIDE/app/src/ExportAndShare/ResourcePacking/PackFormat.js`.
 */
describe('gdjs.ResourcePackManager', () => {
  const PACK_HEADER_SIZE = 12;
  const PACK_ALIGNMENT = 16;

  const alignUp = value => {
    const remainder = value % PACK_ALIGNMENT;
    return remainder === 0 ? value : value + (PACK_ALIGNMENT - remainder);
  };

  /**
   * @param {string} file
   * @returns {ResourceData}
   */
  const makeResourceData = file => ({
    kind: 'fake-resource-kind-for-testing-only',
    name: file,
    metadata: '',
    file,
    userAdded: true,
  });

  /**
   * A scene with no resource of its own.
   * @param {string} name
   * @returns {LayoutData}
   */
  const makeEmptySceneData = name => ({
    r: 0,
    v: 0,
    b: 0,
    mangledName: name,
    name,
    objects: [],
    objectsGroups: [],
    layers: [],
    instances: [],
    behaviorsSharedData: [],
    stopSoundsOnStartup: false,
    title: '',
    variables: [],
    usedResources: [],
    uiSettings: {
      grid: false,
      gridType: 'rectangular',
      gridWidth: 10,
      gridHeight: 10,
      gridDepth: 10,
      gridOffsetX: 0,
      gridOffsetY: 0,
      gridOffsetZ: 0,
      gridColor: 0,
      gridAlpha: 1,
      snap: false,
    },
  });

  /**
   * Build a ".gdpak" archive and return an URL to download it from.
   * @param {Array<{path: string, content: string, type: string}>} files
   * @returns {string}
   */
  const createPackUrl = files => {
    const encoder = new TextEncoder();
    const contents = files.map(file => encoder.encode(file.content));

    // The offsets depend on the length of the index, which depends on the
    // offsets: grow the index until it settles.
    let indexByteLength = 0;
    let indexJson = '';
    const entries = files.map((file, index) => ({
      path: file.path,
      offset: 0,
      size: contents[index].length,
      type: file.type,
    }));
    for (let attempt = 0; attempt < 8; attempt++) {
      let offset = alignUp(PACK_HEADER_SIZE + indexByteLength);
      for (const entry of entries) {
        entry.offset = offset;
        offset = alignUp(offset + entry.size);
      }
      indexJson = JSON.stringify({ files: entries });
      const newIndexByteLength = encoder.encode(indexJson).length;
      if (newIndexByteLength <= indexByteLength) break;
      indexByteLength = newIndexByteLength;
    }

    const contentStart = alignUp(PACK_HEADER_SIZE + indexByteLength);
    const packBytes = new Uint8Array(
      entries.length
        ? alignUp(
            entries[entries.length - 1].offset +
              entries[entries.length - 1].size
          )
        : contentStart
    );
    packBytes.set(encoder.encode('GDPK'), 0);
    const view = new DataView(packBytes.buffer);
    view.setUint32(4, 1, true);
    view.setUint32(8, indexByteLength, true);
    packBytes.set(
      encoder.encode(
        indexJson +
          ' '.repeat(indexByteLength - encoder.encode(indexJson).length)
      ),
      PACK_HEADER_SIZE
    );
    entries.forEach((entry, index) => {
      packBytes.set(contents[index], entry.offset);
    });

    return URL.createObjectURL(
      new Blob([packBytes], { type: 'application/octet-stream' })
    );
  };

  /** @type {Array<string>} */
  let createdUrls = [];

  const createPackedGame = (files, extraResourceFiles = []) => {
    const packUrl = createPackUrl(files);
    createdUrls.push(packUrl);

    gdjs.resourcePacks = {
      version: 1,
      packs: [packUrl],
      files: files.reduce((filesMap, file) => {
        filesMap[file.path] = 0;
        return filesMap;
      }, {}),
    };

    const allFiles = [...files.map(({ path }) => path), ...extraResourceFiles];
    return gdjs.getPixiRuntimeGame({
      resources: {
        resources: allFiles.map(filePath => ({
          kind: 'fake-resource-kind-for-testing-only',
          name: filePath,
          metadata: '',
          file: filePath,
          userAdded: true,
        })),
      },
    });
  };

  afterEach(() => {
    gdjs.resourcePacks = null;
    createdUrls.forEach(url => URL.revokeObjectURL(url));
    createdUrls = [];
  });

  it('reads a file back from a pack, keeping its content and its MIME type', async () => {
    const runtimeGame = createPackedGame([
      { path: 'a.png', content: 'content of a', type: 'image/png' },
      { path: 'b.mp3', content: 'the content of b', type: 'audio/mpeg' },
    ]);
    const resourceLoader = runtimeGame.getResourceLoader();

    await resourceLoader.ensurePackLoadedFor(makeResourceData('a.png'));

    const aUrl = resourceLoader.getFullUrl('a.png');
    expect(aUrl.startsWith('blob:')).to.be(true);
    const aResponse = await fetch(aUrl);
    expect(await aResponse.text()).to.be('content of a');
    expect(aResponse.headers.get('Content-Type')).to.be('image/png');

    // Every file of the pack is available once it is downloaded.
    const bResponse = await fetch(resourceLoader.getFullUrl('b.mp3'));
    expect(await bResponse.text()).to.be('the content of b');
    expect(bResponse.headers.get('Content-Type')).to.be('audio/mpeg');
  });

  it('hands out the same URL for a file, so that caches stay valid', async () => {
    const runtimeGame = createPackedGame([
      { path: 'a.png', content: 'content of a', type: 'image/png' },
    ]);
    const resourceLoader = runtimeGame.getResourceLoader();
    await resourceLoader.ensurePackLoadedFor(makeResourceData('a.png'));

    expect(resourceLoader.getFullUrl('a.png')).to.be(
      resourceLoader.getFullUrl('a.png')
    );
  });

  it('downloads a pack only once, even for concurrent requests', async () => {
    const runtimeGame = createPackedGame([
      { path: 'a.png', content: 'content of a', type: 'image/png' },
      { path: 'b.png', content: 'content of b', type: 'image/png' },
    ]);
    const resourceLoader = runtimeGame.getResourceLoader();

    await Promise.all([
      resourceLoader.ensurePackLoadedFor(makeResourceData('a.png')),
      resourceLoader.ensurePackLoadedFor(makeResourceData('b.png')),
      resourceLoader.ensurePackLoadedFor(makeResourceData('a.png')),
    ]);

    // Both files come from the same downloaded archive.
    expect(
      await (await fetch(resourceLoader.getFullUrl('a.png'))).text()
    ).to.be('content of a');
    expect(
      await (await fetch(resourceLoader.getFullUrl('b.png'))).text()
    ).to.be('content of b');
  });

  it('leaves the files that were not packed alone', async () => {
    const runtimeGame = createPackedGame(
      [{ path: 'a.png', content: 'content of a', type: 'image/png' }],
      ['loading-screen.png']
    );
    const resourceLoader = runtimeGame.getResourceLoader();

    expect(resourceLoader.isFileInResourcePack('a.png')).to.be(true);
    expect(resourceLoader.isFileInResourcePack('loading-screen.png')).to.be(
      false
    );

    // A file left out of the packs keeps being downloaded on its own.
    await resourceLoader.ensurePackLoadedFor(
      makeResourceData('loading-screen.png')
    );
    expect(resourceLoader.getFullUrl('loading-screen.png')).to.be(
      'loading-screen.png'
    );
  });

  it('does nothing for a game exported without packed resources', async () => {
    gdjs.resourcePacks = null;
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: {
        resources: [
          {
            kind: 'fake-resource-kind-for-testing-only',
            name: 'a.png',
            metadata: '',
            file: 'a.png',
            userAdded: true,
          },
        ],
      },
    });
    const resourceLoader = runtimeGame.getResourceLoader();

    await resourceLoader.ensurePackLoadedFor(makeResourceData('a.png'));
    expect(resourceLoader.isFileInResourcePack('a.png')).to.be(false);
    expect(resourceLoader.getFullUrl('a.png')).to.be('a.png');
  });

  it('releases the packs when all the resources are unloaded', async () => {
    const runtimeGame = createPackedGame([
      { path: 'a.png', content: 'content of a', type: 'image/png' },
    ]);
    const resourceLoader = runtimeGame.getResourceLoader();
    await resourceLoader.ensurePackLoadedFor(makeResourceData('a.png'));

    const urlBeforeUnload = resourceLoader.getFullUrl('a.png');
    expect(urlBeforeUnload.startsWith('blob:')).to.be(true);

    resourceLoader.unloadAllResources();

    // The archive is not held in memory anymore...
    expect(resourceLoader.getFullUrl('a.png')).to.be('a.png');
    // ...but the game knows it can download it again.
    expect(resourceLoader.isFileInResourcePack('a.png')).to.be(true);

    await resourceLoader.ensurePackLoadedFor(makeResourceData('a.png'));
    const response = await fetch(resourceLoader.getFullUrl('a.png'));
    expect(await response.text()).to.be('content of a');
  });

  it('downloads the startup packs before the first scene, for resources no scene refers to', async () => {
    // A sound played by name from an expression is in no `usedResources` list,
    // so nothing triggers the download of its pack - and the sound manager asks
    // for its URL synchronously when it is played. Without the startup packs,
    // the game would ask the server for a file that is not there anymore.
    const packUrl = createPackUrl([
      { path: 'dynamic.wav', content: 'the sound', type: 'audio/wav' },
    ]);
    createdUrls.push(packUrl);
    gdjs.resourcePacks = {
      version: 1,
      packs: [packUrl],
      files: { 'dynamic.wav': 0 },
      startupPacks: [0],
    };

    const runtimeGame = gdjs.getPixiRuntimeGame({
      layouts: [makeEmptySceneData('Scene1')],
      resources: {
        resources: [
          {
            kind: 'audio',
            name: 'dynamicSound',
            metadata: '',
            file: 'dynamic.wav',
            userAdded: true,
          },
        ],
      },
    });
    const resourceLoader = runtimeGame.getResourceLoader();

    // Before the game starts, the pack is not downloaded yet.
    expect(resourceLoader.getFullUrl('dynamic.wav')).to.be('dynamic.wav');

    await runtimeGame.loadFirstAssetsAndStartBackgroundLoading('Scene1');

    const url = resourceLoader.getFullUrl('dynamic.wav');
    expect(url.startsWith('blob:')).to.be(true);
    expect(await (await fetch(url)).text()).to.be('the sound');
  });

  it('fails clearly when a pack cannot be downloaded, and allows retrying', async () => {
    gdjs.resourcePacks = {
      version: 1,
      packs: ['this-pack-does-not-exist.pak'],
      files: { 'a.png': 0 },
    };
    const runtimeGame = gdjs.getPixiRuntimeGame({
      resources: {
        resources: [
          {
            kind: 'fake-resource-kind-for-testing-only',
            name: 'a.png',
            metadata: '',
            file: 'a.png',
            userAdded: true,
          },
        ],
      },
    });
    const resourceLoader = runtimeGame.getResourceLoader();

    let firstError = null;
    try {
      await resourceLoader.ensurePackLoadedFor(makeResourceData('a.png'));
    } catch (error) {
      firstError = error;
    }
    expect(firstError).not.to.be(null);

    // The failed download must not be remembered, otherwise the retries done by
    // the resource loader would all resolve to the same failure.
    let secondError = null;
    try {
      await resourceLoader.ensurePackLoadedFor(makeResourceData('a.png'));
    } catch (error) {
      secondError = error;
    }
    expect(secondError).not.to.be(null);
  });
});
