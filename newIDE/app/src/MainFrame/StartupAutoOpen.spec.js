// @flow
import { tryAutoOpenMostRecentProjectAtStartup } from './StartupAutoOpen';

const mockFn = (fn: Function): JestMockFn<any, any> => fn;

describe('tryAutoOpenMostRecentProjectAtStartup', () => {
  it('silently disables next startup auto-open when the recent project cannot be opened', async () => {
    const recentProject = {
      storageProviderName: 'LocalFile',
      fileMetadata: {
        fileIdentifier: 'C:\\missing\\game.json',
      },
    };
    const setHasProjectOpened = mockFn(jest.fn());
    const openFromFileMetadataWithStorageProvider = mockFn(
      jest.fn()
    ).mockRejectedValue(new Error('File not found'));

    await tryAutoOpenMostRecentProjectAtStartup({
      preferences: {
        getAutoOpenMostRecentProject: () => true,
        hadProjectOpenedDuringLastSession: () => true,
        getRecentProjectFiles: () => [recentProject],
        setHasProjectOpened,
      },
      storageProviders: [{ internalName: 'LocalFile' }],
      getStorageProviderOperations: () => ({
        requiresUserInteraction: false,
      }),
      ensureInteractionHappened: async () => true,
      openFromFileMetadataWithStorageProvider,
    });

    expect(openFromFileMetadataWithStorageProvider).toHaveBeenCalledWith(
      recentProject,
      {
        rethrowOpenError: true,
        suppressOpenErrorAlert: true,
      }
    );
    expect(setHasProjectOpened).toHaveBeenCalledWith(false);
  });
});
