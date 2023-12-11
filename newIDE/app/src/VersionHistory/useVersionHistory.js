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
import VersionHistory from '.';

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
|};

const useVersionHistory = ({ fileMetadata, getStorageProvider }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
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
    versionHistoryPanelOpen,
    setVersionHistoryPanelOpen,
  ] = React.useState<boolean>(false);
  const showVersionHistoryButton =
    storageProvider.internalName === 'Cloud' &&
    canSeeCloudProjectHistory(subscription);
  const cloudProjectId =
    storageProvider.internalName && fileMetadata
      ? fileMetadata.fileIdentifier
      : null;
  const cloudProjectLastModifiedDate =
    storageProvider.internalName && fileMetadata
      ? fileMetadata.lastModifiedDate
      : null;

  // This effect is run in 2 cases:
  // - at start up to list the versions (when both cloudProjectId and
  //   cloudProjectLastModifiedDate are set at the same time)
  // - when a new save is done (cloudProjectLastModifiedDate is updated)
  React.useEffect(
    () => {
      (async () => {
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
            <VersionHistory
              projectId={fileMetadata ? fileMetadata.fileIdentifier : ''}
              canLoadMore={!!state.nextPageUri}
              onCheckoutVersion={() => console.log('checkout')}
              onLoadMore={onLoadMoreVersions}
              onRenameVersion={onRenameVersion}
              openedVersionStatus={null}
              versions={state.versions || []}
            />
          </Column>
        </Line>
      </Drawer>
    );
  };

  return {
    showVersionHistoryButton,
    openVersionHistoryPanel,
    renderVersionHistoryPanel,
  };
};

export default useVersionHistory;
