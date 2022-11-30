// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import Text from '../../../../UI/Text';
import TextButton from '../../../../UI/TextButton';
import RaisedButton from '../../../../UI/RaisedButton';
import { Line, Column, Spacer } from '../../../../UI/Grid';
import { useResponsiveWindowWidth } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import {
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../../../../UI/Layout';

import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import PreferencesContext from '../../../Preferences/PreferencesContext';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import SectionContainer, { SectionRow } from '../SectionContainer';
import ContextMenu, {
  type ContextMenuInterface,
} from '../../../../UI/Menu/ContextMenu';
import CircularProgress from '../../../../UI/CircularProgress';
import { type MenuItemTemplate } from '../../../../UI/Menu/Menu.flow';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from './MaxProjectCountAlertMessage';
import optionalRequire from '../../../../Utils/OptionalRequire';
import { showErrorBox } from '../../../../UI/Messages/MessageBox';
import { getRelativeOrAbsoluteDisplayDate } from '../../../../Utils/DateDisplay';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { ExampleStoreContext } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import { SubscriptionSuggestionContext } from '../../../../Profile/Subscription/SubscriptionSuggestionContext';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { type WidthType } from '../../../../UI/Reponsive/ResponsiveWindowMeasurer';
import Add from '../../../../UI/CustomSvgIcons/Add';
import ImageTileRow from '../../../../UI/ImageTileRow';
import { prepareExamples } from '../../../../AssetStore/ExampleStore';
import Window from '../../../../Utils/Window';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const styles = {
  listItem: {
    padding: 0,
    marginTop: 2,
    marginBottom: 2,
    borderRadius: 8,
    overflowWrap: 'anywhere', // Ensure everything is wrapped on small devices.
  },
};

const getTemplatesGridSizeFromWidth = (width: WidthType) => {
  switch (width) {
    case 'small':
      return 2;
    case 'medium':
      return 4;
    case 'large':
    default:
      return 6;
  }
};

type Props = {|
  project: ?gdProject,
  canOpen: boolean,
  onChooseProject: () => void,
  onOpenRecentFile: (file: FileMetadataAndStorageProviderName) => void,
  onOpenNewProjectSetupDialog: (?ExampleShortHeader) => void,
  onShowAllExamples: () => void,
  onSelectExample: (exampleShortHeader: ExampleShortHeader) => void,
  storageProviders: Array<StorageProvider>,
|};

export type BuildSectionInterface = {|
  forceUpdate: () => void,
|};

const PrettyBreakablePath = ({ path }: {| path: string |}) => {
  const separatorIndices = Array.from(path)
    .map((char, index) => (['/', '\\'].includes(char) ? index : null))
    .filter(Boolean);
  if (separatorIndices.length === 0) return path;

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

const useStylesForListItemIcon = makeStyles({
  root: {
    minWidth: 0,
  },
});

const BuildSection = React.forwardRef<Props, BuildSectionInterface>(
  (
    {
      project,
      canOpen,
      onChooseProject,
      onOpenNewProjectSetupDialog,
      onShowAllExamples,
      onSelectExample,
      onOpenRecentFile,
      storageProviders,
    },
    ref
  ) => {
    const { getRecentProjectFiles, removeRecentProjectFile } = React.useContext(
      PreferencesContext
    );
    const { allExamples } = React.useContext(ExampleStoreContext);
    const authenticatedUser = React.useContext(AuthenticatedUserContext);
    const { openSubscriptionDialog } = React.useContext(
      SubscriptionSuggestionContext
    );
    const { cloudProjects, limits } = authenticatedUser;
    const contextMenu = React.useRef<?ContextMenuInterface>(null);
    const { showDeleteConfirmation } = useAlertDialog();
    const [pendingProject, setPendingProject] = React.useState<?string>(null);
    const windowWidth = useResponsiveWindowWidth();
    const forceUpdate = useForceUpdate();

    // Search "activate cloud projects" in the codebase for everything to
    // remove once cloud projects are activated for the desktop app.
    const supportsCloudProjects = !electron || Window.isDev();

    const iconClasses = useStylesForListItemIcon();

    React.useImperativeHandle(ref, () => ({
      forceUpdate,
    }));

    let projectFiles: Array<FileMetadataAndStorageProviderName> = getRecentProjectFiles().filter(
      file => file.fileMetadata
    );

    // Show cloud projects on the web app only.
    if (supportsCloudProjects && cloudProjects) {
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
    const hasTooManyCloudProjects = checkIfHasTooManyCloudProjects(
      authenticatedUser
    );

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
          },
          { type: 'separator' },
          {
            label: i18n._(t`Remove from list`),
            click: () => onRemoveFromRecentFiles(file),
          },
        ]);
      } else {
        actions = actions.concat([
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
                limits && hasTooManyCloudProjects ? (
                  <Line>
                    <Column expand>
                      <MaxProjectCountAlertMessage
                        limits={limits}
                        onUpgrade={() =>
                          openSubscriptionDialog({
                            reason: 'Cloud Project limit reached',
                          })
                        }
                      />
                    </Column>
                  </Line>
                ) : null
              }
            >
              <SectionRow>
                <ImageTileRow
                  isLoading={!allExamples}
                  items={
                    allExamples
                      ? prepareExamples(allExamples).map(example => ({
                          onClick: () => onSelectExample(example),
                          imageUrl: example.previewImageUrls[0],
                        }))
                      : []
                  }
                  title={<Trans>Recommended templates</Trans>}
                  onShowAll={onShowAllExamples}
                  showAllIcon={<Add fontSize="small" />}
                  getColumnsFromWidth={getTemplatesGridSizeFromWidth}
                  getLimitFromWidth={getTemplatesGridSizeFromWidth}
                />
              </SectionRow>
              <SectionRow>
                <LineStackLayout
                  justifyContent="space-between"
                  alignItems="center"
                  noMargin
                  expand
                >
                  <Column noMargin>
                    <Text size="section-title">
                      <Trans>Existing projects</Trans>
                    </Text>
                  </Column>
                  <Column noMargin>
                    <ResponsiveLineStackLayout noMargin>
                      <RaisedButton
                        primary
                        label={<Trans>Create a project</Trans>}
                        onClick={() =>
                          onOpenNewProjectSetupDialog(
                            /*exampleShortHeader=*/ null
                          )
                        }
                        icon={<Add fontSize="small" />}
                        id="home-create-project-button"
                      />
                      {canOpen && (
                        <>
                          {isWindowWidthMediumOrLarger && (
                            <>
                              <Spacer />
                              <Text>
                                <Trans>or</Trans>
                              </Text>
                              <Spacer />
                            </>
                          )}
                          <TextButton
                            primary
                            label={<Trans>Open an existing project</Trans>}
                            onClick={onChooseProject}
                          />
                        </>
                      )}
                    </ResponsiveLineStackLayout>
                  </Column>
                </LineStackLayout>
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
                                <>
                                  {storageProvider &&
                                    storageProvider.renderIcon &&
                                    !isWindowWidthMediumOrLarger && (
                                      <ListItemAvatar
                                        classes={iconClasses}
                                        style={{
                                          marginTop: 8,
                                          alignSelf: 'flex-start',
                                        }}
                                      >
                                        {storageProvider.renderIcon({
                                          size: 'small',
                                        })}
                                      </ListItemAvatar>
                                    )}
                                  {isWindowWidthMediumOrLarger ? (
                                    <LineStackLayout
                                      justifyContent="flex-start"
                                      expand
                                    >
                                      <Column expand>
                                        <Line noMargin alignItems="center">
                                          {storageProvider &&
                                            storageProvider.renderIcon && (
                                              <>
                                                {storageProvider.renderIcon({
                                                  size: 'small',
                                                })}
                                                <Spacer />
                                              </>
                                            )}
                                          <Text noMargin>
                                            {file.fileMetadata.name || (
                                              <PrettyBreakablePath
                                                path={
                                                  file.fileMetadata
                                                    .fileIdentifier
                                                }
                                              />
                                            )}
                                          </Text>

                                          {pendingProject ===
                                            file.fileMetadata
                                              .fileIdentifier && (
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
                                                  file.fileMetadata
                                                    .fileIdentifier
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
                                </>
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
