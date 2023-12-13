// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
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

const SAVED_STATUS_TIMEOUT = 3000;

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
  onOpenCloudProjectOnSpecificVersion: (
    fileMetadata: FileMetadata,
    versionId: string
  ) => Promise<void>,
|};

const useVersionHistory = ({
  fileMetadata,
  isSavingProject,
  getStorageProvider,
  onOpenCloudProjectOnSpecificVersion,
}: Props) => {
  const { hasUnsavedChanges } = React.useContext(UnsavedChangesContext);
  const savedStateTimeoutRef = React.useRef<?TimeoutID>(null);
  const { openSubscriptionDialog } = React.useContext(
    SubscriptionSuggestionContext
  );
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
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
  const isProjectOpen = !!fileMetadata;
  const isCloudProject = storageProvider.internalName === 'Cloud';
  const isUserAllowedToSeeVersionHistory = canSeeCloudProjectHistory(
    subscription
  );
  const showVersionHistoryButton =
    isCloudProject && isUserAllowedToSeeVersionHistory;
  const cloudProjectId =
    isCloudProject && fileMetadata ? fileMetadata.fileIdentifier : null;
  const cloudProjectLastModifiedDate =
    isCloudProject && fileMetadata ? fileMetadata.lastModifiedDate : null;

  // This effect is run in 2 cases:
  // - at start up to list the versions (when both cloudProjectId and
  //   cloudProjectLastModifiedDate are set at the same time)
  // - when a new save is done (cloudProjectLastModifiedDate is updated)
  React.useEffect(
    () => {
      (async () => {
        if (preventEffectsRunningRef.current) return;
        if (!cloudProjectId || !showVersionHistoryButton) {
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
      showVersionHistoryButton,
      cloudProjectLastModifiedDate,
    ]
  );

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
          id: currentCheckedOutVersionStatus.id,
          status: 'unsavedChanges',
        };
      });
    },
    [hasUnsavedChanges]
  );

  React.useEffect(
    () => {
      if (preventEffectsRunningRef.current) return;
      setCheckedOutVersionStatus(currentCheckedOutVersionStatus => {
        if (
          !currentCheckedOutVersionStatus ||
          (isSavingProject &&
            currentCheckedOutVersionStatus.status === 'saving') ||
          (!isSavingProject &&
            currentCheckedOutVersionStatus.status === 'saved')
        ) {
          return currentCheckedOutVersionStatus;
        }

        if (isSavingProject) {
          return {
            id: currentCheckedOutVersionStatus.id,
            status: 'saving',
          };
        }
        savedStateTimeoutRef.current = setTimeout(() => {
          setCheckedOutVersionStatus(null);
        }, SAVED_STATUS_TIMEOUT);
        return {
          id: currentCheckedOutVersionStatus.id,
          status: 'saved',
        };
      });
      return () => {
        if (savedStateTimeoutRef.current) {
          clearTimeout(savedStateTimeoutRef.current);
          savedStateTimeoutRef.current = null;
        }
      };
    },
    [isSavingProject]
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

  const onCheckoutVersion = React.useCallback(
    async (version: FilledCloudProjectVersion) => {
      if (!fileMetadata) return;
      preventEffectsRunningRef.current = true;
      try {
        await onOpenCloudProjectOnSpecificVersion(fileMetadata, version.id);
        setCheckedOutVersionStatus({ id: version.id, status: 'opened' });
      } finally {
        preventEffectsRunningRef.current = false;
      }
    },
    [fileMetadata, onOpenCloudProjectOnSpecificVersion]
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
        <Line useFullHeight expand>
          <Column expand>
            {!isProjectOpen ? (
              <AlertMessage kind="info">
                <Trans>Open a cloud project to see the version history.</Trans>
              </AlertMessage>
            ) : !isCloudProject ? (
              <AlertMessage kind="info">
                <Trans>
                  The version history is available for cloud projects only.
                </Trans>
              </AlertMessage>
            ) : !isUserAllowedToSeeVersionHistory ? (
              <ColumnStackLayout>
                <AlertMessage kind="info">
                  <Trans>
                    The version history is not included in your subscription.
                  </Trans>
                </AlertMessage>
                <RaisedButton
                  primary
                  label={<Trans>Upgrade my subscription</Trans>}
                  onClick={() =>
                    openSubscriptionDialog({ reason: 'Version history' })
                  }
                />
              </ColumnStackLayout>
            ) : (
              <VersionHistory
                isVisible={versionHistoryPanelOpen}
                projectId={fileMetadata ? fileMetadata.fileIdentifier : ''}
                canLoadMore={!!state.nextPageUri}
                onCheckoutVersion={onCheckoutVersion}
                onLoadMore={onLoadMoreVersions}
                onRenameVersion={onRenameVersion}
                openedVersionStatus={checkedOutVersionStatus}
                versions={state.versions || []}
              />
            )}
          </Column>
        </Line>
      </Drawer>
    );
  };

  return {
    checkedOutVersionStatus,
    showVersionHistoryButton,
    openVersionHistoryPanel,
    renderVersionHistoryPanel,
  };
};

export default useVersionHistory;
