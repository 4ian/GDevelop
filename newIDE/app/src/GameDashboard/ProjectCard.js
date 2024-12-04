// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../ProjectsStorage';
import Text from '../UI/Text';
import Card from '../UI/Card';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import {
  getStorageProviderByInternalName,
  type LastModifiedInfo,
} from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import FlatButtonWithSplitMenu from '../UI/FlatButtonWithSplitMenu';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';
import LastModificationInfo from '../MainFrame/EditorContainers/HomePage/CreateSection/LastModificationInfo';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '../ProjectsStorage';
import { Line, Spacer } from '../UI/Grid';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import optionalRequire from '../Utils/OptionalRequire';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { deleteCloudProject } from '../Utils/GDevelopServices/Project';
import { extractGDevelopApiErrorStatusAndCode } from '../Utils/GDevelopServices/Errors';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { registerGame } from '../Utils/GDevelopServices/Game';
import { getDefaultRegisterGameProperties } from '../Utils/UseGameAndBuildsManager';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const styles = {
  buttonsContainer: { display: 'flex', flexShrink: 0 },
  iconAndText: { display: 'flex', gap: 2, alignItems: 'flex-start' },
};

const locateProjectFile = (file: FileMetadataAndStorageProviderName) => {
  if (!electron) return;
  electron.shell.showItemInFolder(
    path.resolve(file.fileMetadata.fileIdentifier)
  );
};

type Props = {|
  projectFileMetadataAndStorageProviderName: FileMetadataAndStorageProviderName,
  isCurrentProjectOpened: boolean,
  onOpenProject: () => Promise<void>,
  lastModifiedInfo: LastModifiedInfo | null,
  storageProviders: Array<StorageProvider>,
  currentFileMetadata: ?FileMetadata,
  closeProject: () => Promise<void>,
  askToCloseProject: () => Promise<boolean>,
  onRefreshGames: () => Promise<void>,
  disabled: boolean,
|};

const ProjectCard = ({
  projectFileMetadataAndStorageProviderName,
  isCurrentProjectOpened,
  onOpenProject,
  lastModifiedInfo,
  storageProviders,
  currentFileMetadata,
  closeProject,
  askToCloseProject,
  onRefreshGames,
  disabled,
}: Props) => {
  useOnResize(useForceUpdate());
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { removeRecentProjectFile } = React.useContext(PreferencesContext);
  const { isMobile } = useResponsiveWindowSize();
  const {
    showDeleteConfirmation,
    showConfirmation,
    showAlert,
  } = useAlertDialog();
  const fileMetadata = projectFileMetadataAndStorageProviderName.fileMetadata;
  const projectName = fileMetadata.name || 'Unknown project';
  const storageProvider = getStorageProviderByInternalName(
    storageProviders,
    projectFileMetadataAndStorageProviderName.storageProviderName
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const renderTitle = (i18n: I18nType) => (
    <ColumnStackLayout noMargin>
      {fileMetadata.lastModifiedDate && (
        <LineStackLayout noMargin>
          {storageProvider && (
            <Line noMargin alignItems="center">
              {storageProvider.renderIcon && (
                <>
                  {storageProvider.renderIcon({
                    size: 'small',
                  })}
                  <Spacer />
                </>
              )}
              <Text noMargin color="secondary">
                {i18n._(storageProvider.name)}
              </Text>
            </Line>
          )}
          <LastModificationInfo
            file={projectFileMetadataAndStorageProviderName}
            lastModifiedInfo={lastModifiedInfo}
            storageProvider={storageProvider}
            authenticatedUser={authenticatedUser}
            currentFileMetadata={currentFileMetadata}
            textColor="secondary"
            textPrefix={
              isCurrentProjectOpened ? null : <Trans>Last edited:</Trans>
            }
          />
        </LineStackLayout>
      )}
      <Text size="block-title" noMargin>
        {projectName}
      </Text>
    </ColumnStackLayout>
  );

  const onDeleteCloudProject = async (
    i18n: I18nType,
    { fileMetadata, storageProviderName }: FileMetadataAndStorageProviderName
  ) => {
    if (storageProviderName !== 'Cloud') return;
    const projectName = fileMetadata.name;
    if (!projectName) return; // Only cloud projects can be deleted, and all cloud projects have names.

    if (isCurrentProjectOpened) {
      const result = await showConfirmation({
        title: t`Project is opened`,
        message: t`You are about to delete the project ${projectName}, which is currently opened. If you proceed, the project will be closed and you will lose any unsaved changes. Do you want to proceed?`,
        confirmButtonLabel: t`Continue`,
      });
      if (!result) return;
      await closeProject();
    }

    // Extract word translation to ensure it is not wrongly translated in the sentence.
    const translatedConfirmText = i18n._(t`delete`);

    const deleteAnswer = await showDeleteConfirmation({
      title: t`Permanently delete the project?`,
      message: t`Project ${projectName} will be deleted. You will no longer be able to access it.`,
      fieldMessage: t`To confirm, type "${translatedConfirmText}"`,
      confirmText: translatedConfirmText,
      confirmButtonLabel: t`Delete project`,
    });
    if (!deleteAnswer) return;

    try {
      setIsLoading(true);
      await deleteCloudProject(authenticatedUser, fileMetadata.fileIdentifier);
      authenticatedUser.onCloudProjectsChanged();
    } catch (error) {
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      const message =
        extractedStatusAndCode && extractedStatusAndCode.status === 403
          ? t`You don't have permissions to delete this project.`
          : t`An error occurred when saving the project. Please try again later.`;
      showAlert({
        title: t`Unable to delete the project`,
        message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRemoveRecentProjectFile = React.useCallback(
    async (file: FileMetadataAndStorageProviderName) => {
      const result = await showConfirmation({
        title: t`Remove project from list`,
        message: t`You are about to remove "${
          file.fileMetadata.name
        }" from the list of your projects.${'\n\n'}It will not delete it from your disk and you can always re-open it later. Do you want to proceed?`,
        confirmButtonLabel: t`Remove`,
      });
      if (!result) return;
      removeRecentProjectFile(file);
    },
    [removeRecentProjectFile, showConfirmation]
  );

  const onRegisterProject = React.useCallback(
    async () => {
      const projectId = fileMetadata.gameId;
      if (!authenticatedUser.profile || !projectId) return;

      const { id, username } = authenticatedUser.profile;
      try {
        setIsLoading(true);
        await registerGame(
          authenticatedUser.getAuthorizationHeader,
          id,
          getDefaultRegisterGameProperties({
            projectId,
            projectName: fileMetadata.name,
            projectAuthor: username,
            // A project is always saved when appearing in the list of recent projects.
            isProjectSaved: true,
          })
        );
        await onRefreshGames();
      } catch (error) {
        console.error('Unable to register the game.', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
          await showAlert({
            title: t`Game already registered`,
            message: t`The project currently opened is registered online but you don't have
          access to it. Ask the original owner of the game to share it with you
          to be able to manage it.`,
          });
        } else {
          await showAlert({
            title: t`Unable to register the game`,
            message: t`An error happened while registering the game. Verify your internet connection
          or retry later.`,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [
      authenticatedUser.getAuthorizationHeader,
      authenticatedUser.profile,
      fileMetadata.gameId,
      fileMetadata.name,
      onRefreshGames,
      showAlert,
    ]
  );

  const buildContextMenu = (
    i18n: I18nType,
    file: ?FileMetadataAndStorageProviderName
  ): Array<MenuItemTemplate> => {
    if (!file) return [];

    const actions = [
      {
        label: i18n._(t`Register the game online`),
        click: () => onRegisterProject(),
      },
    ];

    if (file.storageProviderName === 'Cloud') {
      actions.push({
        label: i18n._(t`Delete`),
        click: () => onDeleteCloudProject(i18n, file),
      });
    } else {
      if (file.storageProviderName === 'LocalFile') {
        actions.push({
          label: i18n._(t`Show in local folder`),
          click: () => locateProjectFile(file),
        });
      }

      // Don't allow removing project if opened, as it would not result in any change in the list.
      if (!isCurrentProjectOpened) {
        actions.push(
          {
            type: 'separator',
          },
          {
            label: i18n._(t`Remove from list`),
            click: () => onRemoveRecentProjectFile(file),
          }
        );
      }
    }

    if (isCurrentProjectOpened) {
      actions.push(
        {
          type: 'separator',
        },
        {
          label: i18n._(t`Close project`),
          click: async () => {
            await askToCloseProject();
          },
        }
      );
    }

    return actions;
  };

  // Empty full width button on mobile to make sure the buttons are aligned
  const ManageButtonPlacerHolder = () => <div style={{ width: '100%' }} />;

  const renderButtons = ({ fullWidth }: { fullWidth: boolean }) => {
    return (
      <div style={styles.buttonsContainer}>
        <LineStackLayout noMargin expand>
          {fullWidth ? <ManageButtonPlacerHolder /> : null}
          <FlatButtonWithSplitMenu
            primary
            fullWidth={fullWidth}
            disabled={isLoading || disabled}
            label={
              isCurrentProjectOpened ? (
                <Trans>Opened</Trans>
              ) : (
                <Trans>Open</Trans>
              )
            }
            onClick={isCurrentProjectOpened ? undefined : onOpenProject}
            buildMenuTemplate={i18n =>
              buildContextMenu(i18n, projectFileMetadataAndStorageProviderName)
            }
          />
        </LineStackLayout>
      </div>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <Card
          background={'medium'}
          isHighlighted={isCurrentProjectOpened}
          padding={isMobile ? 8 : 16}
        >
          {isMobile ? (
            <ColumnStackLayout>
              {renderTitle(i18n)}
              {renderButtons({ fullWidth: true })}
            </ColumnStackLayout>
          ) : (
            <LineStackLayout noMargin>
              <ColumnStackLayout
                expand
                justifyContent="space-between"
                noOverflowParent
              >
                <LineStackLayout
                  noMargin
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  {renderTitle(i18n)}
                  {renderButtons({ fullWidth: false })}
                </LineStackLayout>
              </ColumnStackLayout>
            </LineStackLayout>
          )}
        </Card>
      )}
    </I18n>
  );
};

export default ProjectCard;
