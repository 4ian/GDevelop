// @ts-check

/**
 * Create and return a minimum working game.
 * @internal
 * @param {{layouts?: LayoutData[], resources?: ResourcesData, propertiesOverrides?: Partial<ProjectPropertiesData>}=} settings
 * @returns {gdjs.RuntimeGame}
 */
gdjs.getPixiRuntimeGame = (settings) => {
  const runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: {
      adaptGameResolutionAtRuntime: true,
      folderProject: false,
      orientation: 'landscape',
      packageName: 'com.gdevelop.integrationtest',
      projectFile: '',
      scaleMode: 'linear',
      pixelsRounding: false,
      sizeOnStartupMode: '',
      antialiasingMode: 'MSAA',
      antialisingEnabledOnMobile: false,
      useExternalSourceFiles: true,
      version: '1.0.0',
      name: 'Test game',
      author: '',
      windowWidth: 800,
      windowHeight: 600,
      latestCompilationDirectory: '',
      maxFPS: 60,
      minFPS: 20,
      verticalSync: true,
      loadingScreen: {
        showGDevelopSplash: true,
        backgroundImageResourceName: '',
        backgroundColor: 0,
        backgroundFadeInDuration: 0.2,
        minDuration: 0,
        logoAndProgressFadeInDuration: 0.2,
        logoAndProgressLogoFadeInDelay: 0.2,
        showProgressBar: true,
        progressBarMinWidth: 40,
        progressBarMaxWidth: 300,
        progressBarWidthPercent: 40,
        progressBarHeight: 20,
        progressBarColor: 0xffffff,
      },
      authorIds: [],
      authorUsernames: [],
      watermark: { showWatermark: true, placement: 'bottom' },
      currentPlatform: '',
      extensionProperties: [],
      ...(settings ? settings.propertiesOverrides : undefined),
    },
    firstLayout: '',
    gdVersion: {
      major: 5,
      minor: 0,
      build: 0,
      revision: 0,
    },
    objects: [],
    layouts: (settings && settings.layouts) || [],
    externalLayouts: [],
    resources: (settings && settings.resources) || { resources: [] },
    eventsFunctionsExtensions: [],
    usedResources: [],
  });

  return runtimeGame;
};
