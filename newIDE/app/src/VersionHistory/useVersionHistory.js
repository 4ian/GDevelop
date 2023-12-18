// @flow

import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import Drawer from '@material-ui/core/Drawer';
import DrawerTopBar from '../UI/DrawerTopBar';
import {
  listVersionsOfProject,
  type FilledCloudProjectVersion,
  updateCloudProjectVersion,
} from '../Utils/GDevelopServices/Project';
import type { FileMetadata, StorageProvider } from '../ProjectsStorage';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { canSeeCloudProjectHistory } from '../Utils/GDevelopServices/Usage';
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

const styles = {
  drawerContent: {
    width: 320,
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};

const mergeVersionsLists = (
  list1: FilledCloudProjectVersion[],
  list2: FilledCloudProjectVersion[]
) => {
  const mostRecentVersionDateInList2 = Date.parse(list2[0].createdAt);
  const moreRecentVersionsInList1 = list1.filter(
    version => Date.parse(version.createdAt) > mostRecentVersionDateInList2
  );
  return [...moreRecentVersionsInList1, ...list2];
};

type PaginationState = {|
  versions: ?(FilledCloudProjectVersion[]),
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
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const ignoreFileMetadataChangesRef = React.useRef<boolean>(false);
  const preventEffectsRunningRef = React.useRef<boolean>(false);
  const {
    subscription,
    getAuthorizationHeader,
    firebaseUser,
  } = authenticatedUser;
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
  const isCloudProject = storageProvider.internalName === 'Cloud';
  const isUserAllowedToSeeVersionHistory = canSeeCloudProjectHistory(
    subscription
  );
  const [cloudProjectId, setCloudProjectId] = React.useState<?string>(
    isCloudProject && fileMetadata ? fileMetadata.fileIdentifier : null
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

  // This effect is used to avoid having cloudProjectId and cloudProjectLastModifiedDate
  // set to null when checking out a version, unmounting the VersionHistory component,
  // making it lose its state (fetched versions and collapse states).
  React.useEffect(
    () => {
      if (ignoreFileMetadataChangesRef.current) return;
      setCloudProjectId(
        isCloudProject && fileMetadata ? fileMetadata.fileIdentifier : null
      );
      setCloudProjectLastModifiedDate(
        isCloudProject && fileMetadata ? fileMetadata.lastModifiedDate : null
      );
    },
    [isCloudProject, fileMetadata]
  );

  // This effect is run in 2 cases:
  // - at start up to list the versions (when both cloudProjectId and
  //   cloudProjectLastModifiedDate are set at the same time)
  // - when a new save is done (cloudProjectLastModifiedDate is updated)
  React.useEffect(
    () => {
      (async () => {
        if (preventEffectsRunningRef.current) return;
        if (!cloudProjectId || !shouldFetchVersions) {
          setState(emptyPaginationState);
          return;
        }
        const listing = await listVersionsOfProject(
          getAuthorizationHeader,
          firebaseUser,
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
          // From here, we're in the case where some versions where already loaded
          // so the effect is triggered by a modification of cloudProjectLastModifiedDate.
          // To the versions that are fetched should not replace the whole history that
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
      })();
    },
    [
      storageProvider,
      getAuthorizationHeader,
      firebaseUser,
      cloudProjectId,
      shouldFetchVersions,
      cloudProjectLastModifiedDate,
    ]
  );

  // This effect watches the unsavedChanges instance to change the opened version status.
  React.useEffect(
    () => {
      if (preventEffectsRunningRef.current) return;
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
      if (preventEffectsRunningRef.current) return;
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
      const listing = await listVersionsOfProject(
        getAuthorizationHeader,
        firebaseUser,
        cloudProjectId,
        { forceUri: state.nextPageUri }
      );
      if (!listing) return;
      setState({
        versions: [...(state.versions || []), ...listing.versions],
        nextPageUri: listing.nextPageUri,
      });
    },
    [getAuthorizationHeader, firebaseUser, cloudProjectId, state]
  );

  const openVersionHistoryPanel = React.useCallback(() => {
    setVersionHistoryPanelOpen(true);
  }, []);

  const onQuitVersionHistory = React.useCallback(
    async () => {
      if (!fileMetadata || !checkedOutVersionStatus || !latestVersionId) return;
      preventEffectsRunningRef.current = true;
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
        preventEffectsRunningRef.current = false;
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
    async (version: FilledCloudProjectVersion) => {
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
      preventEffectsRunningRef.current = true;
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
        preventEffectsRunningRef.current = false;
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
      version: FilledCloudProjectVersion,
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
        ) : state.versions ? (
          <VersionHistory
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
