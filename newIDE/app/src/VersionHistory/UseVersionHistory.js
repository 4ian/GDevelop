// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import Drawer from '@material-ui/core/Drawer';
import DrawerTopBar from '../UI/DrawerTopBar';
import {
  listVersionsOfProject,
  type ExpandedCloudProjectVersion,
  updateCloudProjectVersion,
} from '../Utils/GDevelopServices/Project';
import type { FileMetadata, StorageProvider } from '../ProjectsStorage';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { canUseCloudProjectHistory } from '../Utils/GDevelopServices/Usage';
import { Column, Line } from '../UI/Grid';
import VersionHistory, { type OpenedVersionStatus } from '.';
import UnsavedChangesContext from '../MainFrame/UnsavedChangesContext';
import AlertMessage from '../UI/AlertMessage';
import { ColumnStackLayout } from '../UI/Layout';
import RaisedButton from '../UI/RaisedButton';
import { SubscriptionSuggestionContext } from '../Profile/Subscription/SubscriptionSuggestionContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import type { MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import PlaceholderError from '../UI/PlaceholderError';
import CloudStorageProvider from '../ProjectsStorage/CloudStorageProvider';

const getCloudProjectFileMetadataIdentifier = (
  storageProviderInternalName: string,
  fileMetadata: ?FileMetadata
) => {
  if (
    !fileMetadata ||
    !(storageProviderInternalName === CloudStorageProvider.internalName)
  )
    return null;
  if (fileMetadata.fileIdentifier.startsWith('http')) {
    // When creating a cloud project from an example, there might be a moment where
    // the used Storage Provider is the cloud one but the file identifier is the url
    // to the example such as `https://ressources.gdevelop-app.com/...`.
    // A cloud project identifier is a uuid at the moment, so it does not contain the
    // 3 letters h t and p so there should be no risk af having a cloud project
    // uuid starting with http.
    return null;
  }
  return fileMetadata.fileIdentifier;
};

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
  const mostRecentVersionDateInList2 = Date.parse(list2[0].createdAt);
  const moreRecentVersionsInList1 = list1.filter(
    version => Date.parse(version.createdAt) > mostRecentVersionDateInList2
  );
  return [...moreRecentVersionsInList1, ...list2];
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
  isSavingProject: boolean,
  onOpenCloudProjectOnSpecificVersion: ({|
    fileMetadata: FileMetadata,
    versionId: string,
    ignoreUnsavedChanges: boolean,
    openingMessage: MessageDescriptor,
  |}) => Promise<void>,
|};

const useVersionHistory = ({
  fileMetadata,
  isSavingProject,
  getStorageProvider,
  onOpenCloudProjectOnSpecificVersion,
}: Props) => {
  const { hasUnsavedChanges } = React.useContext(UnsavedChangesContext);
  const { showAlert } = useAlertDialog();
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const [
    versionsFetchingError,
    setVersionsFetchingError,
  ] = React.useState<?React.Node>(null);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const ignoreFileMetadataChangesRef = React.useRef<boolean>(false);
  const freezeWhileLoadingSpecificVersionRef = React.useRef<boolean>(false);
  const { subscription, getAuthorizationHeader, profile } = authenticatedUser;
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
  const isUserAllowedToSeeVersionHistory = canUseCloudProjectHistory(
    subscription
  );
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
    isCloudProject && isUserAllowedToSeeVersionHistory;
  const latestVersionId =
    state.versions && state.versions[0] ? state.versions[0].id : null;
  const authenticatedUserId = profile ? profile.id : null;

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
        setVersionsFetchingError(null);
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
                listing.versions,
                currentState.versions
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
          setVersionsFetchingError(
            <Trans>
              Could not load the project versions. Verify your internet
              connection or try again later.
            </Trans>
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

  const onLoadMoreVersions = React.useCallback(
    async () => {
      if (!cloudProjectId) return;

      setVersionsFetchingError(null);
      try {
        const listing = await listVersionsOfProject(
          getAuthorizationHeader,
          authenticatedUserId,
          cloudProjectId,
          { forceUri: state.nextPageUri }
        );
        if (!listing) return;
        setState({
          versions: [...(state.versions || []), ...listing.versions],
          nextPageUri: listing.nextPageUri,
        });
      } catch (error) {
        console.error(
          'An error occurred while fetching more project versions:',
          error
        );
        setVersionsFetchingError(
          <Trans>
            Could not load the project versions. Verify your internet connection
            or try again later.
          </Trans>
        );
      }
    },
    [getAuthorizationHeader, authenticatedUserId, cloudProjectId, state]
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
    async (version: ExpandedCloudProjectVersion) => {
      if (!fileMetadata) return;
      if (!checkedOutVersionStatus && hasUnsavedChanges) {
        await showAlert({
          title: t`There are unsaved changes`,
          message: t`Save your project before using the version history.`,
        });
        return;
      }
      if (checkedOutVersionStatus && version.id === latestVersionId) {
        await onQuitVersionHistory();
        setVersionHistoryPanelOpen(false);
        return;
      }
      freezeWhileLoadingSpecificVersionRef.current = true;
      ignoreFileMetadataChangesRef.current = true;
      try {
        await onOpenCloudProjectOnSpecificVersion({
          fileMetadata,
          versionId: version.id,
          ignoreUnsavedChanges: true,
          openingMessage: t`Opening older version...`,
        });
        setCheckedOutVersionStatus({ version, status: 'opened' });
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

  const onRenameVersion = React.useCallback(
    async (
      version: ExpandedCloudProjectVersion,
      attributes: {| label: string |}
    ) => {
      if (!cloudProjectId) return;
      const updatedVersion = await updateCloudProjectVersion(
        authenticatedUser,
        cloudProjectId,
        version.id,
        attributes
      );
      if (!updatedVersion) return;
      setState(currentState => {
        if (!currentState.versions) return currentState;
        return {
          versions: currentState.versions.map(version =>
            version.id === updatedVersion.id
              ? { ...version, label: updatedVersion.label }
              : version
          ),
          nextPageUri: currentState.nextPageUri,
        };
      });
    },
    [authenticatedUser, cloudProjectId]
  );

  const renderVersionHistoryPanel = () => {
    return (
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
          title={<Trans>File history</Trans>}
          onClose={() => setVersionHistoryPanelOpen(false)}
          id="version-history-drawer"
        />
        {!cloudProjectId ? (
          <Line expand>
            <Column expand>
              <AlertMessage kind="info">
                <Trans>
                  The version history is available for cloud projects only.
                </Trans>
              </AlertMessage>
            </Column>
          </Line>
        ) : !isUserAllowedToSeeVersionHistory ? (
          <Line expand>
            <ColumnStackLayout>
              <AlertMessage kind="info">
                <Trans>
                  Access project history, name saves, restore older versions.
                  <br />
                  Upgrade to a Pro plan to get started!
                </Trans>
              </AlertMessage>
              <RaisedButton
                primary
                label={<Trans>Upgrade my subscription</Trans>}
                onClick={() =>
                  openSubscriptionDialog({
                    analyticsMetadata: { reason: 'Version history' },
                    filter: 'team',
                  })
                }
              />
            </ColumnStackLayout>
          </Line>
        ) : !state.versions && versionsFetchingError ? (
          <Line expand>
            <Column expand>
              <PlaceholderError onRetry={onLoadMoreVersions}>
                {versionsFetchingError}
              </PlaceholderError>
            </Column>
          </Line>
        ) : state.versions ? (
          <VersionHistory
            authenticatedUserId={
              authenticatedUser.profile ? authenticatedUser.profile.id : ''
            }
            isVisible={versionHistoryPanelOpen}
            projectId={fileMetadata ? fileMetadata.fileIdentifier : ''}
            canLoadMore={!!state.nextPageUri}
            onCheckoutVersion={onCheckoutVersion}
            onLoadMore={onLoadMoreVersions}
            onRenameVersion={onRenameVersion}
            openedVersionStatus={checkedOutVersionStatus}
            versions={state.versions}
          />
        ) : (
          <PlaceholderLoader />
        )}
      </Drawer>
    );
  };

  return {
    checkedOutVersionStatus,
    openVersionHistoryPanel,
    renderVersionHistoryPanel,
    onQuitVersionHistory,
  };
};

export default useVersionHistory;
