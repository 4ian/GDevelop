namespace gdjs {
  export namespace steamworks {
    const logger = new gdjs.Logger('Steamworks');
    export let steamAPI: import('steamworks.js').Client | null = null;

    gdjs.registerFirstRuntimeSceneLoadedCallback((runtimeScene) => {
      const remote = runtimeScene.getGame().getRenderer().getElectronRemote();
      if (!remote) return; // Steamworks is only supported on electron

      try {
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
      } catch {
        logger.error(
          'Something wrong happened while initializing Steamworks! Is Steam currently launched?'
        );
      }
    });

    // ---

    export function claimAchievement(achievement: string): void {
      if (steamAPI) steamAPI.achievement.activate(achievement);
      else
        logger.warn(
          `Could not claim achievement ${achievement}, steamworks was not properly loaded!`
        );
    }

    export function unclaimAchievement(achievement: string): void {
      if (steamAPI) steamAPI.achievement.clear(achievement);
      else
        logger.warn(
          `Could not unclaim achievement ${achievement}, steamworks was not properly loaded!`
        );
    }

    export function hasAchievement(achievement: string): boolean {
      return !!steamAPI && steamAPI.achievement.isActivated(achievement);
    }

    // ---

    export function getSteamId(): string {
      return steamAPI
        ? steamAPI.localplayer.getSteamId().steamId64.toString(10)
        : '';
    }

    export function getName(): string {
      return steamAPI ? steamAPI.localplayer.getName() : 'Unknown';
    }

    export function getCountry(): string {
      return steamAPI ? steamAPI.localplayer.getIpCountry() : 'Unknown';
    }

    export function getLevel(): number {
      return steamAPI ? steamAPI.localplayer.getLevel() : 0;
    }

    export function setRichPresence(key: string, value: string): void {
      if (steamAPI) steamAPI.localplayer.setRichPresence(key, value);
      else
        logger.warn(
          `Could not set the rich presence, steamworks was not properly loaded!`
        );
    }

    // ---

    export function isSteamworksProperlyLoaded(): boolean {
      return !!steamAPI;
    }

    export function getAppID(): number {
      return steamAPI ? steamAPI.utils.getAppId() : 0;
    }

    export function getServerRealTime(): number {
      return steamAPI ? steamAPI.utils.getServerRealTime() : Date.now();
    }

    export function isOnSteamDeck(): boolean {
      return steamAPI ? steamAPI.utils.isSteamRunningOnSteamDeck() : false;
    }

    // ---

    enum LobbyType {
      Private = 0,
      FriendsOnly = 1,
      Public = 2,
      Invisible = 3,
    }

    const knownLobbies = new Map<
      string,
      import('steamworks.js/client').matchmaking.Lobby
    >();
    let currentLobby:
      | import('steamworks.js/client').matchmaking.Lobby
      | null = null;

    export function getKnownLobby(lobbyId: string) {
      if (!steamAPI) {
        logger.warn(
          `Could not access lobby '${lobbyId}', steamworks was not properly loaded!`
        );
        return null;
      }

      const lobby = knownLobbies.get(lobbyId);
      if (!lobby) {
        logger.error(
          `Could not access lobby '${lobbyId}'! You might need to join it before trying to access it.`
        );
        return null;
      }

      return lobby;
    }

    export function createLobby(
      lobbyType: 'Private' | 'FriendsOnly' | 'Public' | 'Invisible',
      maxPlayers: number,
      result: gdjs.Variable
    ): gdjs.AsyncTask {
      if (steamAPI) {
        return new gdjs.PromiseTask(
          steamAPI.matchmaking
            .createLobby(
              LobbyType[lobbyType] as any /* Const enums are 😩 */,
              maxPlayers
            )
            .then((lobby) => {
              const id = lobby.id.toString(10);
              knownLobbies.set(id, lobby);
              currentLobby = lobby;
              result.setString(id);
            })
            .catch(() => {
              result.setString('failure');
            })
        );
      } else {
        logger.warn(
          `Could not create a lobby, steamworks was not properly loaded!`
        );
        return new gdjs.ResolveTask();
      }
    }

    export function getLobbiesList(results: gdjs.Variable): gdjs.AsyncTask {
      if (steamAPI) {
        return new gdjs.PromiseTask(
          steamAPI.matchmaking
            .getLobbies()
            .then((lobbies) => {
              const allLobbiesIds = lobbies.map((lobby) => {
                const id = lobby.id.toString(10);
                knownLobbies.set(id, lobby);
                return id;
              });
              results.fromJSObject(allLobbiesIds);
            })
            .catch(() => {
              results.setString('failure');
            })
        );
      } else {
        logger.warn(
          `Could not obtain the lobbies list, steamworks was not properly loaded!`
        );
        return new gdjs.ResolveTask();
      }
    }

    export function joinLobby(
      lobbyId: string,
      result: gdjs.Variable
    ): gdjs.AsyncTask {
      if (steamAPI) {
        return new gdjs.PromiseTask(
          steamAPI.matchmaking
            .joinLobby(BigInt(lobbyId))
            .then((lobby) => {
              knownLobbies.set(lobbyId, lobby);
              currentLobby = lobby;
              result.setString(lobbyId);
            })
            .catch(() => {
              result.setString('failure');
            })
        );
      } else {
        logger.warn(
          `Could not join a lobby, steamworks was not properly loaded!`
        );
        return new gdjs.ResolveTask();
      }
    }

    export function getCurrentLobbyId(): string {
      return currentLobby ? currentLobby.id.toString(10) : 'none';
    }

    export function leaveCurrentLobby(): void {
      if (currentLobby) currentLobby.leave();
    }

    export function openDialogForInvitingUsersToTheCurrentLobby(): void {
      if (currentLobby) currentLobby.openInviteDialog();
    }

    export function getCurrentLobbyAttribute(attribute: string): string {
      if (!currentLobby) return '';

      const data = currentLobby.getData(attribute);
      return data === null ? '' : data;
    }

    export function getLobbyAttribute(
      lobbyId: string,
      attribute: string
    ): string {
      const lobby = getKnownLobby(lobbyId);
      if (!lobby) return '';

      const data = lobby.getData(attribute);
      return data === null ? '' : data;
    }

    export function setCurrentLobbyAttribute(
      attribute: string,
      value: string,
      success: gdjs.Variable
    ): void {
      if (currentLobby)
        success.setBoolean(currentLobby.setData(attribute, value));
    }

    export function setCurrentLobbyJoinability(
      shouldBeJoinable: boolean,
      success: gdjs.Variable
    ): void {
      if (currentLobby)
        success.setBoolean(currentLobby.setJoinable(shouldBeJoinable));
    }

    export function getCurrentLobbyMemberCount(): number {
      return currentLobby ? Number(currentLobby.getMemberCount()) : 0;
    }

    export function getLobbyMemberCount(lobbyId: string): number {
      const lobby = getKnownLobby(lobbyId);
      return lobby ? Number(lobby.getMemberCount()) : 0;
    }

    export function getCurrentLobbyMemberLimit(): number {
      return currentLobby ? Number(currentLobby.getMemberLimit()) : 0;
    }

    export function getLobbyMemberLimit(lobbyId: string): number {
      const lobby = getKnownLobby(lobbyId);
      if (!lobby) return 0;
      return lobby ? Number(lobby.getMemberLimit()) : 0;
    }

    export function getCurrentLobbyOwner(): string {
      return currentLobby ? currentLobby.getOwner().steamId64.toString(10) : '';
    }

    export function getLobbyOwner(lobbyId: string): string {
      const lobby = getKnownLobby(lobbyId);
      return lobby ? lobby.getOwner().steamId64.toString(10) : '';
    }

    export function getCurrentLobbyMembersList(storeIn: gdjs.Variable): void {
      if (currentLobby) {
        storeIn.fromJSObject(
          currentLobby
            .getMembers()
            .map((steamID) => steamID.steamId64.toString(10))
        );
      }
    }

    export function getLobbyMembersList(
      lobbyId: string,
      storeIn: gdjs.Variable
    ): void {
      const lobby = getKnownLobby(lobbyId);
      if (lobby) {
        storeIn.fromJSObject(
          lobby.getMembers().map((steamID) => steamID.steamId64.toString(10))
        );
      }
    }

    // ---

    export function isAppOwned(appId: string): boolean {
      return !!steamAPI && steamAPI.apps.isSubscribedApp(Number(appId));
    }

    export function isAppInstalled(appId: string): boolean {
      return !!steamAPI && steamAPI.apps.isAppInstalled(Number(appId));
    }

    export function isDLCInstalled(dlcId: string): boolean {
      return !!steamAPI && steamAPI.apps.isDlcInstalled(Number(dlcId));
    }

    export function getAppInstallDirectory(appId: string): string {
      return steamAPI ? steamAPI.apps.appInstallDir(Number(appId)) : '';
    }

    export function isVacBanned(): boolean {
      return !!steamAPI && steamAPI.apps.isVacBanned();
    }

    export function isLowViolence(): boolean {
      return !!steamAPI && steamAPI.apps.isLowViolence();
    }

    export function userBoughtTheGame(): boolean {
      return !!steamAPI && steamAPI.apps.isSubscribed();
    }

    export function currentGameLanguage(): string {
      return steamAPI ? steamAPI.apps.currentGameLanguage() : '';
    }

    export function currentBetaName(): string {
      return steamAPI ? steamAPI.apps.currentBetaName() || '' : '';
    }

    export function getBuildId(): number {
      return steamAPI ? steamAPI.apps.appBuildId() : 0;
    }

    // ---

    export function isCloudEnabled(): boolean {
      return (
        !!steamAPI &&
        steamAPI.cloud.isEnabledForAccount() &&
        steamAPI.cloud.isEnabledForApp()
      );
    }

    export function readFile(fileName: string): string {
      return steamAPI ? steamAPI.cloud.readFile(fileName) : '';
    }

    export function writeFile(
      fileName: string,
      content: string,
      results: gdjs.Variable
    ): void {
      if (steamAPI)
        results.setBoolean(steamAPI.cloud.writeFile(fileName, content));
    }

    export function fileExists(fileName: string): boolean {
      return steamAPI ? steamAPI.cloud.fileExists(fileName) : false;
    }

    export function deleteFile(fileName: string, results: gdjs.Variable): void {
      if (steamAPI) results.setBoolean(steamAPI.cloud.deleteFile(fileName));
    }

    // ---

    export function createWorkshopItem(result: gdjs.Variable): gdjs.AsyncTask {
      if (steamAPI)
        return new gdjs.PromiseTask(
          steamAPI.workshop
            .createItem()
            .then(({ itemId }) => {
              result.setString(itemId.toString());
            })
            .catch(() => {
              result.setString('failure');
            })
        );
      else {
        result.setString('failure');
        return new gdjs.ResolveTask();
      }
    }

    enum UgcItemVisibility {
      Public = 0,
      FriendsOnly = 1,
      Private = 2,
      Unlisted = 3,
    }

    export function updateWorkshopItem(
      itemId: string,
      title: string,
      description: string,
      changeNote: string,
      previewPath: string,
      contentPath: string,
      tags: string,
      visibility: keyof import('steamworks.js/client').workshop.UgcItemVisibility,
      result: gdjs.Variable
    ): gdjs.AsyncTask {
      if (steamAPI) {
        const changes: import('steamworks.js/client').workshop.UgcUpdate = {};

        if (title) changes.title = title;
        if (description) changes.description = description;
        if (changeNote) changes.changeNote = changeNote;
        if (previewPath) changes.previewPath = previewPath;
        if (contentPath) changes.contentPath = contentPath;
        if (tags) changes.tags = tags.split(',');
        if (visibility)
          //@ts-ignore const enum 😩
          changes.visibility = UgcItemVisibility[visibility];

        return new gdjs.PromiseTask(
          steamAPI.workshop
            .updateItem(BigInt(itemId), changes)
            .then(() => {
              result.setBoolean(true);
            })
            .catch(() => {
              result.setBoolean(false);
            })
        );
      } else {
        result.setBoolean(false);
        return new gdjs.ResolveTask();
      }
    }

    export function subscribeToWorkshopItem(
      itemId: string,
      result: gdjs.Variable
    ): gdjs.AsyncTask {
      if (steamAPI)
        return new gdjs.PromiseTask(
          steamAPI.workshop
            .subscribe(BigInt(itemId))
            .then(() => {
              result.setBoolean(true);
            })
            .catch(() => {
              result.setBoolean(false);
            })
        );
      else {
        result.setBoolean(false);
        return new gdjs.ResolveTask();
      }
    }

    export function unsubscribeToWorkshopItem(
      itemId: string,
      result: gdjs.Variable
    ): gdjs.AsyncTask {
      if (steamAPI)
        return new gdjs.PromiseTask(
          steamAPI.workshop
            .unsubscribe(BigInt(itemId))
            .then(() => {
              result.setBoolean(true);
            })
            .catch(() => {
              result.setBoolean(false);
            })
        );
      else {
        result.setBoolean(false);
        return new gdjs.ResolveTask();
      }
    }

    export function startWorkshopDownload(
      itemId: string,
      highPriority: boolean
    ): void {
      if (steamAPI) steamAPI.workshop.download(BigInt(itemId), highPriority);
    }

    enum WorkshopItemStates {
      None = 0,
      Subscribed = 1,
      LegacyItem = 2,
      Installed = 4,
      NeedsUpdate = 8,
      Downloading = 16,
      DownloadPending = 32,
    }

    export function workshopItemState(
      itemId: string,
      state: keyof WorkshopItemStates
    ): boolean {
      return (
        !!steamAPI &&
        (steamAPI.workshop.state(BigInt(itemId)) &
          WorkshopItemStates[state]) !==
          0
      );
    }

    export function getWorkshopItemLocation(itemId: string): string {
      return steamAPI
        ? steamAPI.workshop.installInfo(BigInt(itemId))?.folder || ''
        : '';
    }

    export function getWorkshopItemSizeOnDisk(itemId: string): number {
      return steamAPI
        ? Number(steamAPI.workshop.installInfo(BigInt(itemId))?.sizeOnDisk) || 0
        : 0;
    }

    export function getWorkshopItemInstallTimestamp(itemId: string): number {
      return steamAPI
        ? steamAPI.workshop.installInfo(BigInt(itemId))?.timestamp || 0
        : 0;
    }

    export function getWorkshopItemDownloadProgress(itemId: string): number {
      return steamAPI
        ? Number(steamAPI.workshop.downloadInfo(BigInt(itemId))?.current) || 0
        : 0;
    }

    export function getWorkshopItemDownloadTotal(itemId: string): number {
      return steamAPI
        ? Number(steamAPI.workshop.downloadInfo(BigInt(itemId))?.total) || 0
        : 0;
    }
  }
}
