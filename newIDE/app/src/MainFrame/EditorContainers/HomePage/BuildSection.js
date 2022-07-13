// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
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
import CircularProgress from '../../../UI/CircularProgress';
import { type MenuItemTemplate } from '../../../UI/Menu/Menu.flow';
import useConfirmDialog from '../../../UI/Confirm/useConfirmDialog';
import { deleteCloudProject } from '../../../Utils/GDevelopServices/Project';
import optionalRequire from '../../../Utils/OptionalRequire';
const electron = optionalRequire('electron');

const isWebApp = !electron;

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

const getRelativeOrAbsoluteDisplayDate = (
  i18n: I18nType,
  dateAsNumber: number
): React.Node => {
  const nowAsNumber = Date.now();
  if (nowAsNumber - dateAsNumber < 60 * 1000) {
    return i18n._(t`Now`);
  }
  const now = new Date(nowAsNumber);
  const date = new Date(dateAsNumber);

  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate()
  ) {
    return i18n._(t`Today`);
  }
  const yesterdayAtSameTime = new Date(now);
  yesterdayAtSameTime.setDate(now.getDate() - 1);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    yesterdayAtSameTime.getDate() === date.getDate()
  ) {
    return i18n._(t`Yesterday`);
  }

  const sevenDaysAgoAtFirstHour = new Date(now);
  sevenDaysAgoAtFirstHour.setDate(now.getDate() - 7);
  sevenDaysAgoAtFirstHour.setHours(0, 0, 0, 0);
  if (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    sevenDaysAgoAtFirstHour.getTime() <= date.getTime()
  ) {
    return i18n._(t`This week`);
  }
  return i18n.date(date);
};

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
  const { getConfirmation, getDeleteConfirmation } = useConfirmDialog();
  const [
    selectedFile,
    setSelectedFile,
  ] = React.useState<?FileMetadataAndStorageProviderName>(null);
  const [pendingProject, setPendingProject] = React.useState<?string>(null);
  const windowWidth = useResponsiveWindowWidth();

  let projectFiles: Array<FileMetadataAndStorageProviderName> = getRecentProjectFiles().filter(
    file => file.fileMetadata
  );

  // Only show cloud projects on the web app
  if (isWebApp) {
    const { cloudProjects } = authenticatedUser;

    if (cloudProjects) {
      projectFiles = projectFiles.concat(
        cloudProjects
          .map(cloudProject => {
            if (cloudProject.deletedAt) return null;
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
          .filter(Boolean)
      );
    }
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

  const onDeleteProject = async ({
    fileMetadata,
    storageProviderName,
  }: FileMetadataAndStorageProviderName) => {
    if (storageProviderName !== 'Cloud') return;
    const projectName = fileMetadata.name;
    if (!projectName) return; // Only cloud projects can be deleted, and all cloud projects have names.

    const answer = await getConfirmation({
      title: t`Delete project ${projectName}?`,
      message: t`Are you sure you want to delete this project?`,
    });
    if (!answer) return;

    const deleteAnswer = await getDeleteConfirmation({
      title: t`Do you really want to permanently delete your project ${projectName}?`,
      message: t`You’re about to permanently delete your project ${projectName}. You will no longer be able to access it.`,
      fieldMessage: t`Type your project name to delete it:`,
      confirmText: projectName,
    });
    if (!deleteAnswer) return;

    try {
      setPendingProject(fileMetadata.fileIdentifier);
      await deleteCloudProject(authenticatedUser, fileMetadata.fileIdentifier);
      authenticatedUser.onCloudProjectsChanged();
    } catch (error) {
      console.error(
        `An error occurred when deleting cloud project ${projectName}. Please try again later.`,
        error
      );
    } finally {
      setPendingProject(null);
    }
  };

  const buildContextMenu = (
    i18n: I18nType,
    file: ?FileMetadataAndStorageProviderName
  ): Array<MenuItemTemplate> => {
    if (!file) return [];
    let actions = [
      { label: i18n._(t`Open`), click: () => onOpenRecentFile(file) },
    ];
    if (file.storageProviderName === 'Cloud') {
      actions = actions.concat([
        { type: 'separator' },
        {
          label: i18n._(t`Delete`),
          click: () => onDeleteProject(file),
        },
      ]);
    }
    return actions;
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
                                  <Line noMargin alignItems="center">
                                    <Text noMargin>
                                      {file.fileMetadata.name ||
                                        file.fileMetadata.fileIdentifier}
                                    </Text>
                                    {pendingProject ===
                                      file.fileMetadata.fileIdentifier && (
                                      <>
                                        <Spacer />
                                        <CircularProgress size={16} />
                                      </>
                                    )}
                                  </Line>
                                </Column>
                                <Column expand>
                                  {file.fileMetadata.lastModifiedDate && (
                                    <Text noMargin>
                                      {getRelativeOrAbsoluteDisplayDate(
                                        i18n,
                                        file.fileMetadata.lastModifiedDate
                                      )}
                                    </Text>
                                  )}
                                </Column>
                              </LineStackLayout>
                            ) : (
                              <Column expand>
                                <Line
                                  noMargin
                                  alignItems="center"
                                  justifyContent="space-between"
                                >
                                  <ListItemText
                                    primary={
                                      file.fileMetadata.name ||
                                      file.fileMetadata.fileIdentifier
                                    }
                                    secondary={
                                      file.fileMetadata.lastModifiedDate
                                        ? getRelativeOrAbsoluteDisplayDate(
                                            i18n,
                                            file.fileMetadata.lastModifiedDate
                                          )
                                        : undefined
                                    }
                                    onContextMenu={event =>
                                      openContextMenu(event, file)
                                    }
                                  />
                                  {pendingProject ===
                                    file.fileMetadata.fileIdentifier && (
                                    <CircularProgress size={24} />
                                  )}
                                </Line>
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
