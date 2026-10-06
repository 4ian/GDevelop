// @ts-check

describe('gdjs.registerAsynchronouslyLoadingLibrary', function () {
  /** @type {any} */
  const globalObject = window;

  afterEach(() => {
    delete globalObject.__definedByALaterScript;
    delete globalObject.__loadedLibrary;
  });

  it('loads a library when the game loads, after all the scripts', async function () {
    let loadCount = 0;
    gdjs.registerAsynchronouslyLoadingLibrary(async () => {
      loadCount++;
      globalObject.__loadedLibrary = {
        value: globalObject.__definedByALaterScript + 1,
      };
    });
    // A script loaded after the one registering the library.
    globalObject.__definedByALaterScript = 41;
    expect(loadCount).to.be(0);

    await gdjs.getAllAsynchronouslyLoadingLibraryPromise();
    expect(globalObject.__loadedLibrary.value).to.be(42);

    // The library is loaded once, even if the game loads again (hot-reload).
    await gdjs.getAllAsynchronouslyLoadingLibraryPromise();
    expect(loadCount).to.be(1);
  });
});
