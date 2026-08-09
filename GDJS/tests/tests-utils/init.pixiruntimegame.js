// @ts-check

/**
 * Create and return a minimum working game.
 * @internal
 * @param {{layouts?: LayoutData[], resources?: ResourcesData, objects?: ObjectData[], objectsGroups?: ObjectGroupData[], propertiesOverrides?: Partial<ProjectPropertiesData>}=} settings
 * @returns {ProjectData}
 */
gdjs.createProjectData = (settings) => {
  return {
    variables: [],
    properties: {
      adaptGameResolutionAtRuntime: true,
      folderProject: false,
      orientation: 'landscape',
      packageName: 'com.gdevelop.integrationtest',
      projectFile: '',
      scaleMode: 'linear',
      pixelsRounding: false,
      displayCollisionShapes: false,
      sizeOnStartupMode: '',
      antialiasingMode: 'MSAA',
      antialisingEnabledOnMobile: false,
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
      watermark: { showWatermark: false, placement: 'bottom' },
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
    objects: (settings && settings.objects) || [],
    objectsGroups: (settings && settings.objectsGroups) || [],
    layouts: (settings && settings.layouts) || [],
    externalLayouts: [],
    resources: (settings && settings.resources) || { resources: [] },
    eventsFunctionsExtensions: [],
    usedResources: [],
  };
};

/**
 * Create and return a minimum working game.
 * @internal
 * @param {{layouts?: LayoutData[], resources?: ResourcesData, objects?: ObjectData[], objectsGroups?: ObjectGroupData[], propertiesOverrides?: Partial<ProjectPropertiesData>}=} settings
 * @returns {gdjs.RuntimeGame}
 */
gdjs.getPixiRuntimeGame = (settings) =>
  new gdjs.RuntimeGame(gdjs.createProjectData(settings));
