// @flow
import * as React from 'react';
import { useInterval } from '../Utils/UseInterval';
import { usePageBecameVisible } from '../Utils/PageVisibility';
import {
  type FileMetadata,
  type StorageProviderOperations,
} from '../ProjectsStorage';

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

// The credentials given by a storage provider to access the resources of a project
// can expire: the cookie giving access to GDevelop Cloud project resources is valid
// for 6 hours. If it's not renewed, any resource not yet loaded (or loaded by a new
// preview) fails to load, and is displayed with the "unknown texture" placeholder.
// Consider the credentials stale well before they actually expire, and renew them
// when it happens (only one API call every ~2.5 hours).
const MAXIMUM_CREDENTIALS_AGE = 2.5 * ONE_HOUR;
const CHECK_INTERVAL = 15 * ONE_MINUTE;

type Props = {|
  project: ?gdProject,
  fileMetadata: ?FileMetadata,
  getStorageProviderOperations: () => StorageProviderOperations,
|};

/**
 * Ensure the credentials required to access the resources of the currently
 * opened project stay valid, by renewing them before they expire.
 */
export const useResourcesAccessRefresh = ({
  project,
  fileMetadata,
  getStorageProviderOperations,
}: Props): {|
  ensureCanAccessResources: () => Promise<void>,
|} => {
  const lastRefreshTimeRef = React.useRef<number>(Date.now());
  const fileIdentifier = fileMetadata ? fileMetadata.fileIdentifier : null;

  React.useEffect(
    () => {
      // Credentials are fetched by the storage provider when a project is opened.
      lastRefreshTimeRef.current = Date.now();
    },
    [fileIdentifier]
  );

  const ensureCanAccessResources = React.useCallback(
    async () => {
      if (!project || !fileMetadata) return;
      const { onEnsureCanAccessResources } = getStorageProviderOperations();
      if (!onEnsureCanAccessResources) return;
      if (Date.now() - lastRefreshTimeRef.current < MAXIMUM_CREDENTIALS_AGE) {
        return;
      }

      // Update the time now to avoid concurrent refreshes.
      lastRefreshTimeRef.current = Date.now();
      try {
        await onEnsureCanAccessResources(project, fileMetadata);
      } catch (error) {
        console.warn(
          'Unable to refresh the credentials to access the project resources:',
          error
        );
      }
    },
    [project, fileMetadata, getStorageProviderOperations]
  );

  // The check is cheap (no API call unless the credentials are stale), so it's fine
  // to run it regularly and when the window is shown again (the computer may have
  // been asleep for a while).
  useInterval(
    () => {
      ensureCanAccessResources();
    },
    project ? CHECK_INTERVAL : null
  );
  usePageBecameVisible(() => {
    ensureCanAccessResources();
  });

  return { ensureCanAccessResources };
};
