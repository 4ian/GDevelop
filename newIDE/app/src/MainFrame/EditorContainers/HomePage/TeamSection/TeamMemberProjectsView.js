// @flow

import * as React from 'react';
import SectionContainer, { SectionRow } from '../SectionContainer';
import { Trans } from '@lingui/macro';
import { Column, Line } from '../../../../UI/Grid';
import EmptyMessage from '../../../../UI/EmptyMessage';
import AlertMessage from '../../../../UI/AlertMessage';
import { List } from '../../../../UI/List';
import {
  ProjectFileListItem,
  transformCloudProjectsIntoFileMetadataWithStorageProviderName,
} from '../BuildSection';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { type FileMetadataAndStorageProviderName } from '../../../../ProjectsStorage';
import { type StorageProvider } from '../../../../ProjectsStorage';
import { type CloudProjectWithUserAccessInfo } from '../../../../Utils/GDevelopServices/Project';
import { type User } from '../../../../Utils/GDevelopServices/User';
import IconButton from '../../../../UI/IconButton';
import Refresh from '../../../../UI/CustomSvgIcons/Refresh';
import CircularProgress from '../../../../UI/CircularProgress';

type Props = {|
  user: User,
  onClickBack: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  storageProviders: Array<StorageProvider>,
  projects: Array<CloudProjectWithUserAccessInfo>,
  onRefreshProjects: (user: User) => Promise<void>,
  isLoadingProjects: boolean,
|};

const TeamMemberProjectsView = ({
  user,
  onClickBack,
  onOpenRecentFile,
  storageProviders,
  projects,
  onRefreshProjects,
  isLoadingProjects,
}: Props) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobile = windowWidth === 'small';

  const fileMetadataAndStorageProviderNames = transformCloudProjectsIntoFileMetadataWithStorageProviderName(
    projects,
    user.id
  );
  return (
    <SectionContainer
      title={<Trans>{user.username || user.email}'s projects</Trans>}
      titleAdornment={
        <IconButton
          onClick={() => onRefreshProjects(user)}
          disabled={isLoadingProjects}
        >
          {isLoadingProjects ? <CircularProgress size={20} /> : <Refresh />}
        </IconButton>
      }
      backAction={onClickBack}
    >
      <SectionRow>
        <Line>
          <Column noMargin expand>
            {fileMetadataAndStorageProviderNames.length === 0 ? (
              <>
                <EmptyMessage>
                  <Trans>This user does not have projects yet.</Trans>
                </EmptyMessage>
                <AlertMessage kind="info">
                  <Trans>
                    Here are displayed their cloud projects only, they might
                    need to save their local projects as cloud projects for you
                    to see them.
                  </Trans>
                </AlertMessage>
              </>
            ) : (
              <List>
                {fileMetadataAndStorageProviderNames.map(file => (
                  <ProjectFileListItem
                    file={file}
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
