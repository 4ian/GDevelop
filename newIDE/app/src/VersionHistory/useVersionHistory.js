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
  const [
    versionHistoryPanelOpen,
    setVersionHistoryPanelOpen,
  ] = React.useState<boolean>(true);
  const showVersionHistoryButton =
    storageProvider.internalName === 'Cloud' &&
    canSeeCloudProjectHistory(authenticatedUser.subscription);

  React.useEffect(
    () => {
      (async () => {
        if (!fileMetadata) {
          setVersions(null);
          return;
        }
        if (!showVersionHistoryButton) {
          setVersions(null);
          return;
        }
        const projectVersions = await listVersionsOfProject(
          authenticatedUser,
          fileMetadata.fileIdentifier
        );
        setVersions(projectVersions);
      })();
    },
    [storageProvider, authenticatedUser, fileMetadata, showVersionHistoryButton]
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
              canLoadMore={true}
              onCheckoutVersion={() => console.log('checkout')}
              onLoadMore={async () => console.log('load more')}
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
