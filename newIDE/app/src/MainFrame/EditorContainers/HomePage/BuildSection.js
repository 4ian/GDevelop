// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import AddIcon from '@material-ui/icons/Add';
import Text from '../../../UI/Text';
import TextButton from '../../../UI/TextButton';
import RaisedButton from '../../../UI/RaisedButton';
import { Line, Column, Spacer } from '../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';

import { type FileMetadataAndStorageProviderName } from '../../../ProjectsStorage';
import PreferencesContext from '../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from './SectionContainer';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../UI/Menu/ContextMenu';
import { type MenuItemTemplate } from '../../../UI/Menu/Menu.flow';

const styles = {
  listItem: {
    padding: 0,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
};

type Props = {|
  project: ?gdProject,
  canOpen: boolean,
  onOpen: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onCreateProject: () => void,
|};

const BuildSection = ({
  project,
  canOpen,
  onOpen,
  onCreateProject,
  onOpenRecentFile,
}: Props) => {
  const { getRecentProjectFiles } = React.useContext(PreferencesContext);
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const contextMenu = React.useRef<?ContextMenuInterface>(null);
  const [
    selectedFile,
    setSelectedFile,
  ] = React.useState<?FileMetadataAndStorageProviderName>(null);

  const windowWidth = useResponsiveWindowWidth();

  let projectFiles: Array<FileMetadataAndStorageProviderName> = getRecentProjectFiles().filter(
    file => file.fileMetadata
  );

  const { cloudProjects } = authenticatedUser;

  if (cloudProjects) {
    projectFiles = projectFiles.concat(
      cloudProjects.map(cloudProject => {
        const file: FileMetadataAndStorageProviderName = {
          storageProviderName: 'Cloud',
          fileMetadata: {
            fileIdentifier: cloudProject.id,
            lastModifiedDate: Date.parse(cloudProject.lastModifiedAt),
            name: cloudProject.name,
          },
        };
        return file;
      })
    );
  }

  projectFiles.sort((a, b) => {
    if (!a.fileMetadata.lastModifiedDate) return 1;
    if (!b.fileMetadata.lastModifiedDate) return -1;
    return b.fileMetadata.lastModifiedDate - a.fileMetadata.lastModifiedDate;
  });

  const openContextMenu = (
    event: MouseEvent,
    file: FileMetadataAndStorageProviderName
  ) => {
    setSelectedFile(file);
    if (contextMenu.current) {
      contextMenu.current.open(event.clientX, event.clientY);
    }
  };

  const buildContextMenu = (
    i18n: I18nType,
    file: ?FileMetadataAndStorageProviderName
  ): Array<MenuItemTemplate> => {
    if (!file) return [];
    return [
      { label: i18n._(t`Open`), click: () => onOpenRecentFile(file) },
      // { label: i18n._(t`Duplicate`), click: () => console.log('duplicate') },
      { type: 'separator' },
      // { label: i18n._(t`Manage game`), click: () => console.log('Manage game') },
      { label: i18n._(t`Delete`), click: () => console.log('Delete') },
    ];
  };

  return (
    <I18n>
      {({ i18n }) => (
        <>
          <SectionContainer title={<Trans>My projects</Trans>}>
            <SectionRow>
              <Line noMargin>
                <ResponsiveLineStackLayout
                  noColumnMargin
                  justifyContent="start"
                  alignItems="center"
                >
                  <RaisedButton
                    primary
                    label={<Trans>Create a project</Trans>}
                    onClick={onCreateProject}
                    icon={<AddIcon />}
                    id="home-create-project-button"
                  />
                  {canOpen && (
                    <>
                      {windowWidth !== 'small' && (
                        <>
                          <Text>
                            <Trans>or</Trans>
                          </Text>
                          <Spacer />
                        </>
                      )}
                      <TextButton
                        primary
                        label={<Trans>Open an existing project</Trans>}
                        onClick={onOpen}
                      />
                    </>
                  )}
                </ResponsiveLineStackLayout>
              </Line>
              {authenticatedUser.loginState === 'loading' ? (
                <Column
                  useFullHeight
                  expand
                  noMargin
                  justifyContent="flex-start"
                  alignItems="center"
                >
                  <CircularProgress />
                  <Text>
                    <Trans>Loading projects...</Trans>
                  </Text>
                </Column>
              ) : (
                projectFiles &&
                projectFiles.length > 0 && (
                  <Line>
                    <Column noMargin expand>
                      {windowWidth !== 'small' && (
                        <LineStackLayout justifyContent="space-between">
                          <Column expand>
                            <Text color="secondary">
                              <Trans>File name</Trans>
                            </Text>
                          </Column>
                          <Column expand>
                            <Text color="secondary">
                              <Trans>Last edited</Trans>
                            </Text>
                          </Column>
                        </LineStackLayout>
                      )}
                      <List>
                        {projectFiles.map(file => (
                          <ListItem
                            button
                            key={file.fileMetadata.fileIdentifier}
                            onClick={() => {
                              onOpenRecentFile(file);
                            }}
                            style={styles.listItem}
                            onContextMenu={event =>
                              openContextMenu(event, file)
                            }
                          >
                            {windowWidth !== 'small' ? (
                              <LineStackLayout
                                justifyContent="flex-start"
                                expand
                              >
                                <Column expand>
                                  <Text noMargin>
                                    {file.fileMetadata.name ||
                                      file.fileMetadata.fileIdentifier}
                                  </Text>
                                </Column>
                                <Column expand>
                                  {file.fileMetadata.lastModifiedDate && (
                                    <Text noMargin>
                                      {i18n.date(
                                        file.fileMetadata.lastModifiedDate
                                      )}
                                    </Text>
                                  )}
                                </Column>
                              </LineStackLayout>
                            ) : (
                              <Column>
                                <ListItemText
                                  primary={
                                    file.fileMetadata.name ||
                                    file.fileMetadata.fileIdentifier
                                  }
                                  secondary={
                                    file.fileMetadata.lastModifiedDate
                                      ? i18n.date(
                                          file.fileMetadata.lastModifiedDate
                                        )
                                      : undefined
                                  }
                                  onContextMenu={event =>
                                    openContextMenu(event, file)
                                  }
                                />
                              </Column>
                            )}
                          </ListItem>
                        ))}
                      </List>
                    </Column>
                  </Line>
                )
              )}
            </SectionRow>
          </SectionContainer>
          <ContextMenu
            ref={contextMenu}
            buildMenuTemplate={_i18n => buildContextMenu(_i18n, selectedFile)}
          />
        </>
      )}
    </I18n>
  );
};

export default BuildSection;
