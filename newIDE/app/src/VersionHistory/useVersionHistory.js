// @flow

import * as React from 'react';
import { Trans } from '@lingui/macro';
import Drawer from '@material-ui/core/Drawer';
import DrawerTopBar from '../UI/DrawerTopBar';
import {
  listVersionsOfProject,
  type FilledCloudProjectVersion,
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

type Props = {|
  getStorageProvider: () => StorageProvider,
  fileMetadata: ?FileMetadata,
|};

const useVersionHistory = ({ fileMetadata, getStorageProvider }: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const storageProvider = getStorageProvider();
  const [
    versions,
    setVersions,
  ] = React.useState<?(FilledCloudProjectVersion[])>(null);
  const [nextPageUri, setNextPageUri] = React.useState<?Object>(null);
  const [
    versionHistoryPanelOpen,
    setVersionHistoryPanelOpen,
  ] = React.useState<boolean>(false);
  const showVersionHistoryButton =
    storageProvider.internalName === 'Cloud' &&
    canSeeCloudProjectHistory(authenticatedUser.subscription);
  const cloudProjectId =
    storageProvider.internalName && fileMetadata
      ? fileMetadata.fileIdentifier
      : null;

  React.useEffect(
    () => {
      (async () => {
        if (!cloudProjectId) {
          setVersions(null);
          return;
        }
        if (!showVersionHistoryButton) {
          setVersions(null);
          return;
        }
        setNextPageUri(null);
        const listing = await listVersionsOfProject(
          authenticatedUser,
          cloudProjectId,
          // This effect should only run when the project changes, or the user subscription.
          // So we fetch the first page of versions.
          { forceUri: null }
        );
        if (!listing) return;
        setVersions(listing.versions);
        setNextPageUri(listing.nextPageUri);
      })();
    },
    [
      storageProvider,
      authenticatedUser,
      cloudProjectId,
      showVersionHistoryButton,
    ]
  );

  const onLoadMoreVersions = React.useCallback(
    async () => {
      if (!cloudProjectId) return;
      const listing = await listVersionsOfProject(
        authenticatedUser,
        cloudProjectId,
        { forceUri: nextPageUri }
      );
      if (!listing) return;
      setVersions([...(versions || []), ...listing.versions]);
      setNextPageUri(listing.nextPageUri);
    },
    [authenticatedUser, cloudProjectId, nextPageUri, versions]
  );

  const openVersionHistoryPanel = React.useCallback(() => {
    setVersionHistoryPanelOpen(true);
  }, []);

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
              canLoadMore={!!nextPageUri}
              onCheckoutVersion={() => console.log('checkout')}
              onLoadMore={onLoadMoreVersions}
              onRenameVersion={async () => console.log('rename')}
              openedVersionStatus={null}
              versions={versions || []}
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
