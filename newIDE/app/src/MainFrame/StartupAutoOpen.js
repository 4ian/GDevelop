type StartupAutoOpenPreferences = {|
  getAutoOpenMostRecentProject: () => boolean,
  hadProjectOpenedDuringLastSession: () => boolean,
  getRecentProjectFiles: () => Array<any>,
  setHasProjectOpened: boolean => void,
|};

export const tryAutoOpenMostRecentProjectAtStartup = async ({
  preferences,
  storageProviders,
  getStorageProviderOperations,
  ensureInteractionHappened,
  openFromFileMetadataWithStorageProvider,
}: {|
  preferences: StartupAutoOpenPreferences,
  storageProviders: Array<{ internalName: string, ... }>,
  getStorageProviderOperations: any => any,
  ensureInteractionHappened: any => Promise<boolean>,
  openFromFileMetadataWithStorageProvider: (any, any) => Promise<void>,
|}) => {
  if (
    !preferences.getAutoOpenMostRecentProject() ||
    !preferences.hadProjectOpenedDuringLastSession()
  ) {
    return;
  }

  const fileMetadataAndStorageProviderName = preferences.getRecentProjectFiles()[0];
  if (!fileMetadataAndStorageProviderName) return;

  const storageProvider = storageProviders.find(
    storageProvider =>
      storageProvider.internalName ===
      fileMetadataAndStorageProviderName.storageProviderName
  );
  if (!storageProvider) {
    preferences.setHasProjectOpened(false);
    return;
  }

  const storageProviderOperations = getStorageProviderOperations(
    storageProvider
  );
  const proceed = await ensureInteractionHappened(storageProviderOperations);
  if (!proceed) return;

  try {
    await openFromFileMetadataWithStorageProvider(
      fileMetadataAndStorageProviderName,
      {
        suppressOpenErrorAlert: true,
        rethrowOpenError: true,
      }
    );
  } catch (error) {
    preferences.setHasProjectOpened(false);
  }
};
