namespace gdjs {
  const logger = new gdjs.Logger('Steamworks');
  let steamAPI: import('steamworks.js').Client | null = null;

  gdjs.registerFirstRuntimeSceneLoadedCallback((runtimeScene) => {
    const remote = runtimeScene.getGame().getRenderer().getElectronRemote();
    if (!remote) return; // Steamworks is only supported on electron
    const steamworks_js = remote.require(
      'steamworks.js'
    ) as typeof import('steamworks.js');

    // Sets the proper electron flags for the steam overlay to function properly
    steamworks_js.electronEnableSteamOverlay();

    const unparsedAppID = runtimeScene
      .getGame()
      .getExtensionProperty('Steamworks', 'AppID');

    if (!unparsedAppID) {
      logger.error(
        'A steam AppID needs to be configured in the game properties for steamworks features to be used!'
      );
      return;
    }

    const appID = parseInt(unparsedAppID, 10);

    // Restart the game through steam if it needs to be launched with steam but has not been
    if (
      runtimeScene
        .getGame()
        .getExtensionProperty('Steamworks', 'RequireSteam') &&
      !runtimeScene.getGame().isPreview() &&
      steamworks_js.restartAppIfNecessary(appID)
    ) {
      remote.process.exit(1);
      return;
    }

    steamAPI = steamworks_js.init(appID);
  });

  export namespace steamworks {
    export function claimAchievement(achievement: string) {
      if (steamAPI) steamAPI.achievement.activate(achievement);
      else
        logger.warn(
          `Could not claim achievement ${achievement}, steamworks was not properly loaded!`
        );
    }

    export function unclaimAchievement(achievement: string) {
      if (steamAPI) steamAPI.achievement.clear(achievement);
      else
        logger.warn(
          `Could not unclaim achievement ${achievement}, steamworks was not properly loaded!`
        );
    }
  }
}
