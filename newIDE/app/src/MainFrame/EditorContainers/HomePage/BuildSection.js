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
import AlertMessage from '../../../UI/AlertMessage';
import { Line, Column, Spacer } from '../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { LineStackLayout, ResponsiveLineStackLayout } from '../../../UI/Layout';

import type { MessageDescriptor } from '../../../Utils/i18n/MessageDescriptor.flow';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../ProjectsStorage';
import PreferencesContext from '../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from './SectionContainer';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../UI/Menu/ContextMenu';
import CircularProgress from '../../../UI/CircularProgress';
import { type MenuItemTemplate } from '../../../UI/Menu/Menu.flow';
import useConfirmDialog from '../../../UI/Confirm/useConfirmDialog';
import {
  CLOUD_PROJECT_MAX_COUNT,
  deleteCloudProject,
} from '../../../Utils/GDevelopServices/Project';
import optionalRequire from '../../../Utils/OptionalRequire';
import { showErrorBox } from '../../../UI/Messages/MessageBox';
import { getRelativeOrAbsoluteDisplayDate } from '../../../Utils/DateDisplay';
import useForceUpdate from '../../../Utils/UseForceUpdate';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

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
  storageProviders: Array<StorageProvider>,
|};

export type BuildSectionInterface = {|
  forceUpdate: () => void,
|};

const PrettyBreakablePath = ({ path }: {| path: string |}) => {
  const separatorIndices = Array.from(path)
    .map((char, index) => (['/', '\\'].includes(char) ? index : null))
    .filter(Boolean);
  return separatorIndices.reduce((acc, separatorIndex, listIndex) => {
    const nextSeparatorIndex = separatorIndices[listIndex + 1];
    return [
      ...acc,
      <wbr key={separatorIndex} />,
      path.substring(separatorIndex, nextSeparatorIndex || path.length),
    ];
  }, []);
};

const getStorageProviderByInternalName = (
  storageProviders: Array<StorageProvider>,
  internalName: string
): ?StorageProvider => {
  return storageProviders.find(
    storageProvider => storageProvider.internalName === internalName
  );
};

const BuildSection = React.forwardRef<Props, BuildSectionInterface>(
  (
    {
      project,
      canOpen,
      onOpen,
      onCreateProject,
      onOpenRecentFile,
      storageProviders,
    },
    ref
  ) => {
    const { getRecentProjectFiles, removeRecentProjectFile } = React.useContext(
      PreferencesContext
    );
    const authenticatedUser = React.useContext(AuthenticatedUserContext);
    const contextMenu = React.useRef<?ContextMenuInterface>(null);
    const { showDeleteConfirmation } = useConfirmDialog();
    const [pendingProject, setPendingProject] = React.useState<?string>(null);
    const windowWidth = useResponsiveWindowWidth();
    const forceUpdate = useForceUpdate();

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    let projectFiles: Array<FileMetadataAndStorageProviderName> = getRecentProjectFiles().filter(
      file => file.fileMetadata
    );

    let hasTooManyCloudProjects = false;

    // Show cloud projects on the web app only.
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
        hasTooManyCloudProjects =
          cloudProjects.filter(cloudProject => !cloudProject.deletedAt)
            .length >= 10;
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
      if (contextMenu.current) {
        contextMenu.current.open(event.clientX, event.clientY, { file });
      }
    };

    const onDeleteCloudProject = async (
      i18n: I18nType,
      { fileMetadata, storageProviderName }: FileMetadataAndStorageProviderName
    ) => {
      if (storageProviderName !== 'Cloud') return;
      const projectName = fileMetadata.name;
      if (!projectName) return; // Only cloud projects can be deleted, and all cloud projects have names.

      const deleteAnswer = await showDeleteConfirmation({
        title: t`Do you really want to permanently delete your project ${projectName}?`,
        message: t`You’re about to permanently delete your project ${projectName}. You will no longer be able to access it.`,
        fieldMessage: t`Type your project name to delete it:`,
        confirmText: projectName,
      });
      if (!deleteAnswer) return;

      try {
        setPendingProject(fileMetadata.fileIdentifier);
        await deleteCloudProject(
          authenticatedUser,
          fileMetadata.fileIdentifier
        );
        authenticatedUser.onCloudProjectsChanged();
      } catch (error) {
        showErrorBox({
          message: i18n._(
            t`An error occurred when deleting cloud project ${projectName}. Please try again later.`
          ),
          rawError: error,
          errorId: 'cloud-project-delete-error',
        });
      } finally {
        setPendingProject(null);
      }
    };

    const onRemoveFromRecentFiles = removeRecentProjectFile;

    const locateProjectFile = (file: FileMetadataAndStorageProviderName) => {
      electron.shell.showItemInFolder(
        path.resolve(file.fileMetadata.fileIdentifier)
      );
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
            click: () => onDeleteCloudProject(i18n, file),
          },
        ]);
      } else if (file.storageProviderName === 'LocalFile') {
        actions = actions.concat([
          {
            label: i18n._(t`Show in local folder`),
            click: () => locateProjectFile(file),
            enabled: !isWebApp,
          },
          { type: 'separator' },
          {
            label: i18n._(t`Remove from list`),
            click: () => onRemoveFromRecentFiles(file),
          },
        ]);
      }
      return actions;
    };

    const isWindowWidthMediumOrLarger = windowWidth !== 'small';

    return (
      <I18n>
        {({ i18n }) => (
          <>
            <SectionContainer
              title={<Trans>My projects</Trans>}
              renderFooter={() =>
                isWebApp &&
                hasTooManyCloudProjects && (
                  <Line>
                    <Column expand>
                      <AlertMessage kind="warning">
                        <Text size="block-title">
                          <Trans>
                            You've reached your maximum storage of{' '}
                            {CLOUD_PROJECT_MAX_COUNT}
                            cloud-based projects
                          </Trans>
                        </Text>
                        <Text>
                          <Trans>
                            To keep using GDevelop cloud, consider deleting one
                            of your projects.
                          </Trans>
                        </Text>
                      </AlertMessage>
                    </Column>
                  </Line>
                )
              }
            >
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
                        {isWindowWidthMediumOrLarger && (
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
                {authenticatedUser.loginState === 'loggingIn' ? (
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
                        {isWindowWidthMediumOrLarger && (
                          <LineStackLayout justifyContent="space-between">
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
                          </LineStackLayout>
                        )}
                        <List>
                          {projectFiles.map(file => {
                            const storageProvider = getStorageProviderByInternalName(
                              storageProviders,
                              file.storageProviderName
                            );
                            return (
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
                                {isWindowWidthMediumOrLarger ? (
                                  <LineStackLayout
                                    justifyContent="flex-start"
                                    expand
                                  >
                                    <Column expand>
                                      <Line noMargin alignItems="center">
                                        <Text noMargin>
                                          {file.fileMetadata.name || (
                                            <PrettyBreakablePath
                                              path={
                                                file.fileMetadata.fileIdentifier
                                              }
                                            />
                                          )}
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
                                      <Text noMargin>
                                        {storageProvider
                                          ? i18n._(storageProvider.name)
                                          : ''}
                                      </Text>
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
                                          file.fileMetadata.name || (
                                            <PrettyBreakablePath
                                              path={
                                                file.fileMetadata.fileIdentifier
                                              }
                                            />
                                          )
                                        }
                                        secondary={
                                          file.fileMetadata.lastModifiedDate
                                            ? getRelativeOrAbsoluteDisplayDate(
                                                i18n,
                                                file.fileMetadata
                                                  .lastModifiedDate
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
                            );
                          })}
                        </List>
                      </Column>
                    </Line>
                  )
                )}
              </SectionRow>
            </SectionContainer>
            <ContextMenu
              ref={contextMenu}
              buildMenuTemplate={(_i18n, { file }) =>
                buildContextMenu(_i18n, file)
              }
            />
          </>
        )}
      </I18n>
    );
  }
);

export default BuildSection;
