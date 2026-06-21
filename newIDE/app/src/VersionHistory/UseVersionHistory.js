// @flow

import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import Drawer from '@material-ui/core/Drawer';
import GitHubIcon from '../UI/CustomSvgIcons/GitHub';
import DrawerTopBar from '../UI/DrawerTopBar';
import {
  listVersionsOfProject,
  type ExpandedCloudProjectVersion,
  getCloudProjectFileMetadataIdentifier,
  getCloudProjectVersion,
} from '../Utils/GDevelopServices/Project';
import type { FileMetadata, StorageProvider } from '../ProjectsStorage';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  getAiVersionHistoryRetentionDays,
  getCloudProjectHistoryRetentionDays,
} from '../Utils/GDevelopServices/Usage';
import { type OpenedVersionStatus } from '.';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import type { MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import CloudStorageProvider from '../ProjectsStorage/CloudStorageProvider';
import GitTool from './GitTool';
import { clearEditorOperationHistory } from '../Utils/EditorOperationHistory';
import { localFileStorageProviderInternalName } from '../ProjectsStorage/LocalFileStorageProvider/LocalFileStorageProviderInternalName';

const styles = {
  drawerContent: {
    width: 320,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

const mergeVersionsLists = (
  list1: ExpandedCloudProjectVersion[],
  list2: ExpandedCloudProjectVersion[]
) => {
  if (list2.length === 0) return list1;
  if (list1.length === 0) return list2;

  // Create a map of version IDs from list2 to detect duplicates
  const list2ById = new Map(list2.map(version => [version.id, version]));

  // Add versions from list1 that are not already in list2
  const uniqueVersionsFromList1 = list1.filter(
    version => !list2ById.has(version.id)
  );

  // Combine and sort by date (most recent first)
  const combined = [...uniqueVersionsFromList1, ...list2];
  combined.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

  return combined;
};

type PaginationState = {|
  versions: ?(ExpandedCloudProjectVersion[]),
  nextPageUri: ?Object,
|};

const emptyPaginationState: PaginationState = {
  versions: null,
  nextPageUri: null,
};

type Props = {|
  getStorageProvider: () => StorageProvider,
  fileMetadata: ?FileMetadata,
  project: ?gdProject,
  isSavingProject: boolean,
  onOpenCloudProjectOnSpecificVersion: ({|
    fileMetadata: FileMetadata,
    versionId: string,
    ignoreUnsavedChanges: boolean,
    ignoreAutoSave: boolean,
    openingMessage: MessageDescriptor,
  |}) => Promise<void>,
  onReloadProject: () => Promise<void>,
|};

const useVersionHistory = ({
  project,
  fileMetadata,
  isSavingProject,
  getStorageProvider,
  onOpenCloudProjectOnSpecificVersion,
  onReloadProject,
}: Props): {|
  checkedOutVersionStatus: ?OpenedVersionStatus,
  openVersionHistoryPanel: () => void,
  renderVersionHistoryPanel: () => React.Node,
  onQuitVersionHistory: () => Promise<void>,
  onCheckoutVersion: (
    version: ExpandedCloudProjectVersion,
    options?: {| dontSaveCheckedOutVersionStatus?: boolean |}
  ) => Promise<boolean>,
  getOrLoadProjectVersion: (
    versionId: string
  ) => Promise<ExpandedCloudProjectVersion>,
|} => {
  const { hasUnsavedChanges } = React.useContext(UnsavedChangesContext);
  const { showAlert } = useAlertDialog();
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const ignoreFileMetadataChangesRef = React.useRef<boolean>(false);
  const freezeWhileLoadingSpecificVersionRef = React.useRef<boolean>(false);
  const { limits, getAuthorizationHeader, profile } = authenticatedUser;
  const storageProvider = getStorageProvider();
  const [state, setState] = React.useState<PaginationState>(
    emptyPaginationState
  );
  const [
    checkedOutVersionStatus,
    setCheckedOutVersionStatus,
  ] = React.useState<?OpenedVersionStatus>(null);
  const [
    versionHistoryPanelOpen,
    setVersionHistoryPanelOpen,
  ] = React.useState<boolean>(false);
  const storageProviderInternalName = storageProvider.internalName;
  const isCloudProject =
    storageProviderInternalName === CloudStorageProvider.internalName;
  const historyRetentionDays = getCloudProjectHistoryRetentionDays(limits);
  const aiHistoryRetentionDays = getAiVersionHistoryRetentionDays(limits);
  const [cloudProjectId, setCloudProjectId] = React.useState<?string>(
    getCloudProjectFileMetadataIdentifier(
      storageProviderInternalName,
      fileMetadata
    )
  );
  const [
    cloudProjectLastModifiedDate,
    setCloudProjectLastModifiedDate,
  ] = React.useState<?number>(
    isCloudProject && fileMetadata ? fileMetadata.lastModifiedDate : null
  );
  const shouldFetchVersions =
    isCloudProject &&
    (historyRetentionDays !== 0 || aiHistoryRetentionDays !== 0);
  const latestVersionId =
    state.versions && state.versions[0] ? state.versions[0].id : null;
  const authenticatedUserId = profile ? profile.id : null;
  const currentProjectId = project ? project.ptr : null;
  const previousProjectIdRef = React.useRef<?number>(currentProjectId);

  React.useEffect(
    () => {
      if (previousProjectIdRef.current === currentProjectId) return;

      clearEditorOperationHistory();
      previousProjectIdRef.current = currentProjectId;
    },
    [currentProjectId]
  );

  // This effect is used to avoid having cloudProjectId and cloudProjectLastModifiedDate
  // set to null when checking out a version, unmounting the VersionHistory component,
  // making it lose its state (fetched versions and collapse states).
  React.useEffect(
    () => {
      if (ignoreFileMetadataChangesRef.current) return;
      setCloudProjectId(
        getCloudProjectFileMetadataIdentifier(
          storageProviderInternalName,
          fileMetadata
        )
      );
      setCloudProjectLastModifiedDate(
        isCloudProject && fileMetadata ? fileMetadata.lastModifiedDate : null
      );
    },
    [storageProviderInternalName, isCloudProject, fileMetadata]
  );

  // This effect is run in 2 cases:
  // - at start up to list the versions (when both cloudProjectId and
  //   cloudProjectLastModifiedDate are set at the same time)
  // - when a new save is done (cloudProjectLastModifiedDate is updated)
  React.useEffect(
    () => {
      (async () => {
        if (freezeWhileLoadingSpecificVersionRef.current) return;
        if (!cloudProjectId || !shouldFetchVersions) {
          setState(emptyPaginationState);
          return;
        }
        try {
          const listing = await listVersionsOfProject(
            getAuthorizationHeader,
            authenticatedUserId,
            cloudProjectId,
            // This effect should only run when the project changes, or the user subscription.
            // So we fetch the first page of versions.
            { forceUri: null }
          );
          if (!listing) return;

          setState(currentState => {
            if (!currentState.versions) {
              // Initial loading of versions.
              return {
                versions: listing.versions,
                nextPageUri: listing.nextPageUri,
              };
            }
            // From here, we're in the case where some versions were already loaded
            // so the effect is triggered by a modification of cloudProjectLastModifiedDate.
            // So the versions that are fetched should not replace the whole history that
            // the user maybe spent time to load.
            return {
              versions: mergeVersionsLists(
                currentState.versions,
                listing.versions
              ),
              // Do not change next page URI.
              nextPageUri: currentState.nextPageUri,
            };
          });
        } catch (error) {
          console.error(
            'An error occurred while fetching project versions:',
            error
          );
        }
      })();
    },
    [
      storageProvider,
      getAuthorizationHeader,
      authenticatedUserId,
      cloudProjectId,
      shouldFetchVersions,
      cloudProjectLastModifiedDate,
      limits,
    ]
  );

  // This effect watches the unsavedChanges instance to change the opened version status.
  React.useEffect(
    () => {
      if (freezeWhileLoadingSpecificVersionRef.current) return;
      setCheckedOutVersionStatus(currentCheckedOutVersionStatus => {
        if (
          !currentCheckedOutVersionStatus ||
          (hasUnsavedChanges &&
            currentCheckedOutVersionStatus.status === 'unsavedChanges')
        ) {
          return currentCheckedOutVersionStatus;
        }

        return {
          version: currentCheckedOutVersionStatus.version,
          status: 'unsavedChanges',
        };
      });
    },
    [hasUnsavedChanges]
  );

  // This effect watches the isSavingProject flag to change the opened version status.
  React.useEffect(
    () => {
      if (freezeWhileLoadingSpecificVersionRef.current) return;
      setCheckedOutVersionStatus(currentCheckedOutVersionStatus => {
        if (
          !currentCheckedOutVersionStatus ||
          (isSavingProject &&
            currentCheckedOutVersionStatus.status === 'saving')
        ) {
          return currentCheckedOutVersionStatus;
        }

        return isSavingProject
          ? {
              version: currentCheckedOutVersionStatus.version,
              status: 'saving',
            }
          : null;
      });
    },
    [isSavingProject]
  );

  // This effect watches the project file metadata to reset the opened version
  // if the project is closed.
  React.useEffect(
    () => {
      if (!fileMetadata) {
        setCheckedOutVersionStatus(null);
      }
    },
    [fileMetadata]
  );

  const openVersionHistoryPanel = React.useCallback(() => {
    setVersionHistoryPanelOpen(true);
  }, []);

  const onQuitVersionHistory = React.useCallback(
    async () => {
      if (!fileMetadata || !checkedOutVersionStatus || !latestVersionId) return;
      freezeWhileLoadingSpecificVersionRef.current = true;
      ignoreFileMetadataChangesRef.current = true;
      try {
        await onOpenCloudProjectOnSpecificVersion({
          fileMetadata,
          versionId: latestVersionId,
          ignoreUnsavedChanges: true,
          ignoreAutoSave: true,
          openingMessage: t`Opening latest save...`,
        });
        setCheckedOutVersionStatus(null);
      } finally {
        freezeWhileLoadingSpecificVersionRef.current = false;
        ignoreFileMetadataChangesRef.current = false;
      }
    },
    [
      fileMetadata,
      onOpenCloudProjectOnSpecificVersion,
      checkedOutVersionStatus,
      latestVersionId,
    ]
  );

  const onCheckoutVersion = React.useCallback(
    async (
      version: ExpandedCloudProjectVersion,
      options?: {| dontSaveCheckedOutVersionStatus?: boolean |}
    ): Promise<boolean> => {
      const shouldSaveCheckedOutVersionStatus =
        !options || !options.dontSaveCheckedOutVersionStatus;
      if (!fileMetadata) return false;
      if (
        !checkedOutVersionStatus &&
        shouldSaveCheckedOutVersionStatus &&
        hasUnsavedChanges
      ) {
        await showAlert({
          title: t`There are unsaved changes`,
          message: t`Save your project before using the version history.`,
        });
        return false;
      }
      if (checkedOutVersionStatus && version.id === latestVersionId) {
        await onQuitVersionHistory();
        setVersionHistoryPanelOpen(false);
        return true;
      }
      freezeWhileLoadingSpecificVersionRef.current = true;
      ignoreFileMetadataChangesRef.current = true;
      try {
        await onOpenCloudProjectOnSpecificVersion({
          fileMetadata,
          versionId: version.id,
          ignoreUnsavedChanges: true,
          ignoreAutoSave: true,
          openingMessage: t`Opening older version...`,
        });
        if (shouldSaveCheckedOutVersionStatus) {
          setCheckedOutVersionStatus({ version, status: 'opened' });
        }
        return true;
      } catch (error) {
        console.error('Error checking out version:', error);
        return false;
      } finally {
        freezeWhileLoadingSpecificVersionRef.current = false;
        ignoreFileMetadataChangesRef.current = false;
      }
    },
    [
      fileMetadata,
      onOpenCloudProjectOnSpecificVersion,
      checkedOutVersionStatus,
      showAlert,
      hasUnsavedChanges,
      latestVersionId,
      onQuitVersionHistory,
    ]
  );

  const addVersionToList = React.useCallback(
    (version: ExpandedCloudProjectVersion) => {
      setState(currentState => {
        if (!currentState.versions) {
          // If no versions exist, create a new list with this version
          return {
            versions: [version],
            nextPageUri: currentState.nextPageUri,
          };
        }
        // Merge the new version with existing ones using our merge function
        return {
          versions: mergeVersionsLists(currentState.versions, [version]),
          nextPageUri: currentState.nextPageUri,
        };
      });
    },
    []
  );

  const getOrLoadProjectVersion = React.useCallback(
    async (versionId: string): Promise<ExpandedCloudProjectVersion> => {
      // First, check if the version is already in the loaded list
      if (state.versions) {
        const existingVersion = state.versions.find(
          version => version.id === versionId
        );
        if (existingVersion) {
          return existingVersion;
        }
      }

      // Version not found in the list, try to fetch it
      if (!cloudProjectId || !authenticatedUserId) {
        throw new Error('No cloud project ID or user ID available');
      }

      const fetchedVersion = await getCloudProjectVersion(
        getAuthorizationHeader,
        {
          userId: authenticatedUserId,
          cloudProjectId,
          versionId,
        }
      );

      if (!fetchedVersion) {
        // This should not happen, as an error would be thrown if the version is not found.
        throw new Error('Version not found');
      }

      // Add it to the list of loaded versions
      addVersionToList(fetchedVersion);

      return fetchedVersion;
    },
    [
      state.versions,
      cloudProjectId,
      authenticatedUserId,
      getAuthorizationHeader,
      addVersionToList,
    ]
  );

  const renderVersionHistoryPanel = () => {
    return (
      <I18n>
        {({ i18n }) => (
          <Drawer
            open={versionHistoryPanelOpen}
            PaperProps={{
              style: styles.drawerContent,
              className: 'safe-area-aware-left-container',
            }}
            ModalProps={{
              keepMounted: true,
            }}
            onClose={() => setVersionHistoryPanelOpen(false)}
          >
            <DrawerTopBar
              icon={<GitHubIcon />}
              title={i18n._(t`Git tool`)}
              onClose={() => setVersionHistoryPanelOpen(false)}
              id="version-history-drawer"
            />
            <GitTool
              fileMetadata={fileMetadata}
              isLocalProject={
                storageProviderInternalName ===
                localFileStorageProviderInternalName
              }
              onReloadProject={onReloadProject}
            />
          </Drawer>
        )}
      </I18n>
    );
  };

  return {
    checkedOutVersionStatus,
    openVersionHistoryPanel,
    renderVersionHistoryPanel,
    onQuitVersionHistory,
    onCheckoutVersion,
    getOrLoadProjectVersion,
  };
};

export default useVersionHistory;
