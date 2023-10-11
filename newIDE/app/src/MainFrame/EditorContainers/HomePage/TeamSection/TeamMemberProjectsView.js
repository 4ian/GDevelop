// @flow

import * as React from 'react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../../../UI/Grid';
import EmptyMessage from '../../../../UI/EmptyMessage';
import AlertMessage from '../../../../UI/AlertMessage';
import { List } from '../../../../UI/List';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
} from '../../../../ProjectsStorage';
import { type StorageProvider } from '../../../../ProjectsStorage';
import { type CloudProjectWithUserAccessInfo } from '../../../../Utils/GDevelopServices/Project';
import { type User } from '../../../../Utils/GDevelopServices/User';
import Refresh from '../../../../UI/CustomSvgIcons/Refresh';
import FlatButton from '../../../../UI/FlatButton';
import Skeleton from '@material-ui/lab/Skeleton';
import ListItem from '@material-ui/core/ListItem';
import Text from '../../../../UI/Text';
import {
  getProjectLineHeight,
  transformCloudProjectsIntoFileMetadataWithStorageProviderName,
} from '../BuildSection/utils';
import ProjectFileListItem from '../BuildSection/ProjectFileListItem';

const styles = {
  listItem: {
    padding: 0,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
  skeleton: { borderRadius: 6 },
};

type Props = {|
  user: User,
  currentFileMetadata: ?FileMetadata,
  onClickBack: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  storageProviders: Array<StorageProvider>,
  projects: ?Array<CloudProjectWithUserAccessInfo>,
  onRefreshProjects: (user: User) => Promise<void>,
  isLoadingProjects: boolean,
|};

const TeamMemberProjectsView = ({
  user,
  currentFileMetadata,
  onClickBack,
  onOpenRecentFile,
  storageProviders,
  projects,
  onRefreshProjects,
  isLoadingProjects,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';
  const skeletonLineHeight = getProjectLineHeight(windowWidth);

  const fileMetadataAndStorageProviderNames = projects
    ? transformCloudProjectsIntoFileMetadataWithStorageProviderName(
        projects,
        user.id
      )
    : null;
  return (
    <SectionContainer
      title={<Trans>{user.username || user.email}'s projects</Trans>}
      titleAdornment={
        <FlatButton
          primary
          disabled={isLoadingProjects}
          label={
            isMobile ? <Trans>Refresh</Trans> : <Trans>Refresh dashboard</Trans>
          }
          onClick={() => onRefreshProjects(user)}
          leftIcon={<Refresh fontSize="small" />}
        />
      }
      backAction={onClickBack}
    >
      <SectionRow>
        {!isMobile && (
          <Line justifyContent="space-between">
            <Column expand>
              <Text color="secondary">
                <Trans>File name</Trans>
              </Text>
            </Column>
            <Column expand>
              <Text color="secondary">
                <Trans>Location</Trans>
              </Text>
            </Column>
            <Column expand>
              <Text color="secondary">
                <Trans>Last edited</Trans>
              </Text>
            </Column>
          </Line>
        )}
        <Line>
          <Column noMargin expand>
            {!fileMetadataAndStorageProviderNames ? (
              <List>
                {new Array(5).fill(0).map((_, index) => (
                  <ListItem style={styles.listItem} key={`skeleton-${index}`}>
                    <Line expand>
                      <Column expand>
                        <Skeleton
                          variant="rect"
                          height={skeletonLineHeight}
                          width={'100%'}
                          style={styles.skeleton}
                        />
                      </Column>
                    </Line>
                  </ListItem>
                ))}
              </List>
            ) : fileMetadataAndStorageProviderNames.length === 0 ? (
              <>
                <EmptyMessage>
                  <Trans>This user does not have projects yet.</Trans>
                </EmptyMessage>
                <AlertMessage kind="info">
                  <Trans>
                    Only cloud projects can be displayed here. If the user has
                    created local projects, they need to be saved as cloud
                    projects to be visible.
                  </Trans>
                </AlertMessage>
              </>
            ) : (
              <List>
                {fileMetadataAndStorageProviderNames.map(file => (
                  <ProjectFileListItem
                    file={file}
                    currentFileMetadata={currentFileMetadata}
                    key={file.fileMetadata.fileIdentifier}
                    onOpenRecentFile={onOpenRecentFile}
                    storageProviders={storageProviders}
                    isWindowWidthMediumOrLarger={!isMobile}
                    hideDeleteContextMenuAction={true}
                  />
                ))}
              </List>
            )}
          </Column>
        </Line>
      </SectionRow>
    </SectionContainer>
  );
};

export default TeamMemberProjectsView;
