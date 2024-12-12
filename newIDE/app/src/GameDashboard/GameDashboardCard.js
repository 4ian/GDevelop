// @flow
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import {
  type FileMetadata,
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
} from '../ProjectsStorage';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { GameThumbnail } from './GameThumbnail';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import {
  getGameMainImageUrl,
  getGameUrl,
  type Game,
} from '../Utils/GDevelopServices/Game';
import Card from '../UI/Card';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Visibility from '../UI/CustomSvgIcons/Visibility';
import VisibilityOff from '../UI/CustomSvgIcons/VisibilityOff';
import DollarCoin from '../UI/CustomSvgIcons/DollarCoin';
import Cross from '../UI/CustomSvgIcons/Cross';
import Messages from '../UI/CustomSvgIcons/Messages';
import GameLinkAndShareIcons from './GameLinkAndShareIcons';
import { getStorageProviderByInternalName } from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import { type LastModifiedInfoByProjectId } from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import LastModificationInfo from '../MainFrame/EditorContainers/HomePage/CreateSection/LastModificationInfo';
import optionalRequire from '../Utils/OptionalRequire';
import RaisedButton from '../UI/RaisedButton';
import { Column, Line, Spacer } from '../UI/Grid';
import ElementWithMenu from '../UI/Menu/ElementWithMenu';
import IconButton from '../UI/IconButton';
import ThreeDotsMenu from '../UI/CustomSvgIcons/ThreeDotsMenu';
import WarningRound from '../UI/CustomSvgIcons/WarningRound';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import FileWithLines from '../UI/CustomSvgIcons/FileWithLines';
import TextButton from '../UI/TextButton';
import { Tooltip } from '@material-ui/core';
const electron = optionalRequire('electron');
const path = optionalRequire('path');

const styles = {
  buttonsContainer: {
    display: 'flex',
    flexShrink: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  iconAndText: { display: 'flex', gap: 2, alignItems: 'flex-start' },
  title: {
    ...textEllipsisStyle,
    overflowWrap: 'break-word',
  },
  projectFilesButton: { minWidth: 32 },
  fileIcon: {
    width: 16,
    height: 16,
  },
};

const locateProjectFile = (file: FileMetadataAndStorageProviderName) => {
  if (!electron) return;
  electron.shell.showItemInFolder(
    path.resolve(file.fileMetadata.fileIdentifier)
  );
};

const getFileNameWithoutExtensionFromPath = (path: string) => {
  const fileName = path.split('/').pop();
  return fileName
    ? fileName
        .split('.')
        .slice(0, -1)
        .join('.')
    : '';
};

const getProjectItemLabel = (
  file: FileMetadataAndStorageProviderName,
  storageProviders: Array<StorageProvider>,
  i18n: I18nType
): string => {
  const fileMetadataName = file.fileMetadata.name || '-';
  const name =
    file.storageProviderName === 'LocalFile'
      ? getFileNameWithoutExtensionFromPath(file.fileMetadata.fileIdentifier) ||
        fileMetadataName
      : fileMetadataName;
  const storageProvider = getStorageProviderByInternalName(
    storageProviders,
    file.storageProviderName
  );
  return i18n._(
    `${name} (${
      storageProvider ? i18n._(storageProvider.name) : file.storageProviderName
    })`
  );
};

export type DashboardItem = {|
  game?: Game, // A project can not be published, and thus not have a game.
  projectFiles?: Array<FileMetadataAndStorageProviderName>, // A game can have no or multiple projects.
|};

type Props = {|
  dashboardItem: DashboardItem,
  storageProviders: Array<StorageProvider>,
  isCurrentProjectOpened: boolean,
  onOpenGameManager: ({ game: Game, widgetToScrollTo?: 'projects' }) => void,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onUnregisterGame: () => Promise<void>,
  disabled: boolean,
  canSaveProject: boolean,
  askToCloseProject: () => Promise<boolean>,
  closeProject: () => Promise<void>,
  onSaveProject: () => Promise<void>,
  lastModifiedInfoByProjectId: LastModifiedInfoByProjectId,
  currentFileMetadata: ?FileMetadata,
  onRefreshGames: () => Promise<void>,
  onDeleteCloudProject: (
    file: FileMetadataAndStorageProviderName
  ) => Promise<void>,
  onRegisterProject: (
    file: FileMetadataAndStorageProviderName
  ) => Promise<?Game>,
|};

const GameDashboardCard = ({
  dashboardItem,
  storageProviders,
  isCurrentProjectOpened,
  onOpenGameManager,
  onOpenProject,
  onUnregisterGame,
  disabled,
  canSaveProject,
  askToCloseProject,
  closeProject,
  onSaveProject,
  lastModifiedInfoByProjectId,
  currentFileMetadata,
  onRefreshGames,
  onDeleteCloudProject,
  onRegisterProject,
}: Props) => {
  useOnResize(useForceUpdate());
  const projectsList = React.useMemo(() => dashboardItem.projectFiles || [], [
    dashboardItem.projectFiles,
  ]);
  const game = dashboardItem.game;
  const projectFileMetadataAndStorageProviderName = projectsList.length
    ? projectsList[0]
    : null;
  const lastModifiedInfo = projectFileMetadataAndStorageProviderName
    ? lastModifiedInfoByProjectId[
        projectFileMetadataAndStorageProviderName.fileMetadata.fileIdentifier
      ]
    : null;

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { removeRecentProjectFile } = React.useContext(PreferencesContext);
  const {
    showAlert,
    showConfirmation,
    showDeleteConfirmation,
  } = useAlertDialog();

  const isPublishedOnGdGames = !!game && game.publicWebBuildId;
  const gameUrl = isPublishedOnGdGames ? getGameUrl(game) : null;

  const gameThumbnailUrl = React.useMemo(
    () => (game ? getGameMainImageUrl(game) : null),
    [game]
  );
  const gameName = game
    ? game.gameName
    : projectFileMetadataAndStorageProviderName
    ? projectFileMetadataAndStorageProviderName.fileMetadata.name ||
      'Unknown game'
    : 'Unknown game';

  const { isMobile, windowSize } = useResponsiveWindowSize();
  const isSmallOrMediumScreen =
    windowSize === 'small' || windowSize === 'medium';
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const itemStorageProvider = projectFileMetadataAndStorageProviderName
    ? getStorageProviderByInternalName(
        storageProviders,
        projectFileMetadataAndStorageProviderName.storageProviderName
      )
    : null;

  const renderPublicInfo = () => {
    const DiscoverabilityIcon =
      game && game.discoverable && gameUrl ? Visibility : VisibilityOff;
    const AdsIcon = game && game.displayAdsOnGamePage ? DollarCoin : Cross;
    const PlayerFeedbackIcon =
      game && game.acceptsGameComments ? Messages : Cross;
    const textProps = {
      color: 'secondary',
      size: 'body-small',
      noMargin: true,
    };
    const iconProps = {
      htmlColor: gdevelopTheme.text.color.secondary,
      fontSize: 'small',
    };
    return (
      <ResponsiveLineStackLayout alignItems="center" noColumnMargin>
        <div style={styles.iconAndText}>
          <DiscoverabilityIcon {...iconProps} />
          <Text {...textProps}>
            {game && game.discoverable && gameUrl ? (
              <Trans>Public on gd.games</Trans>
            ) : gameUrl ? (
              <Trans>Hidden on gd.games</Trans>
            ) : (
              <Trans>Not published</Trans>
            )}
          </Text>
        </div>
        {game && (
          <div style={styles.iconAndText}>
            <AdsIcon {...iconProps} />
            <Text {...textProps}>
              {game.displayAdsOnGamePage ? (
                <Trans>Ad revenue sharing on</Trans>
              ) : (
                <Trans>Ad revenue sharing off</Trans>
              )}
            </Text>
          </div>
        )}
        {game && (
          <div style={styles.iconAndText}>
            <PlayerFeedbackIcon {...iconProps} />
            <Text {...textProps}>
              {game.acceptsGameComments ? (
                <Trans>Player feedback on</Trans>
              ) : (
                <Trans>Player feedback off</Trans>
              )}
            </Text>
          </div>
        )}
      </ResponsiveLineStackLayout>
    );
  };

  const renderTitle = () => (
    <Line noMargin expand alignItems="center">
      <Text size="block-title" noMargin style={styles.title}>
        {gameName}
      </Text>
      {projectsList.length > 0 && game && (
        <>
          <Spacer />
          <Tooltip
            title={
              projectsList.length === 1 ? (
                <Trans>{projectsList.length} project</Trans>
              ) : (
                <Trans>{projectsList.length} projects</Trans>
              )
            }
          >
            <TextButton
              onClick={() =>
                onOpenGameManager({ game, widgetToScrollTo: 'projects' })
              }
              icon={<FileWithLines style={styles.fileIcon} />}
              label={
                <Text noMargin color="secondary">
                  {projectsList.length}
                </Text>
              }
              disabled={disabled}
              style={styles.projectFilesButton}
            />
          </Tooltip>
        </>
      )}
    </Line>
  );

  const renderLastModification = (i18n: I18nType) =>
    projectFileMetadataAndStorageProviderName ? (
      <LastModificationInfo
        file={projectFileMetadataAndStorageProviderName}
        lastModifiedInfo={lastModifiedInfo}
        storageProvider={itemStorageProvider}
        authenticatedUser={authenticatedUser}
        currentFileMetadata={currentFileMetadata}
        textColor="secondary"
        textPrefix={isCurrentProjectOpened ? null : <Trans>Last edited:</Trans>}
      />
    ) : game ? (
      <LineStackLayout noMargin expand>
        <Text color="secondary" noMargin size="body-small">
          <Trans>Last edited:</Trans>
        </Text>
        <Text color="secondary" noMargin size="body-small">
          {i18n.date(game.updatedAt * 1000)}
        </Text>
      </LineStackLayout>
    ) : null;

  const renderStorageProvider = (i18n: I18nType) => {
    const icon = itemStorageProvider ? (
      itemStorageProvider.renderIcon ? (
        itemStorageProvider.renderIcon({
          size: 'small',
        })
      ) : null
    ) : (
      <WarningRound />
    );
    const name = itemStorageProvider ? (
      i18n._(itemStorageProvider.name)
    ) : isCurrentProjectOpened ? (
      <Trans>Project not saved</Trans>
    ) : (
      <Trans>Project not found</Trans>
    );

    return (
      <Line noMargin alignItems="center">
        {icon && (
          <>
            {icon}
            <Spacer />
          </>
        )}
        <Text noMargin color="secondary">
          {name}
        </Text>
      </Line>
    );
  };

  const renderThumbnail = () => (
    <GameThumbnail
      gameName={gameName}
      gameId={game ? game.id : undefined}
      thumbnailUrl={gameThumbnailUrl}
      background="light"
      width={
        isMobile
          ? undefined
          : // On medium/large screens, adapt the size to the width of the window.
            Math.min(245, Math.max(130, window.innerWidth / 4))
      }
    />
  );

  const buildOpenContextMenu = (
    i18n: I18nType,
    projectsList: FileMetadataAndStorageProviderName[]
  ): Array<MenuItemTemplate> => {
    const actions = [];
    if (projectsList.length > 1) {
      actions.push(
        ...[
          ...projectsList.map(fileMetadataAndStorageProviderName => {
            return {
              label: getProjectItemLabel(
                fileMetadataAndStorageProviderName,
                storageProviders,
                i18n
              ),
              click: () => onOpenProject(fileMetadataAndStorageProviderName),
            };
          }),
          { type: 'separator' },
          {
            label: i18n._(t`See all in the game dashboard`),
            click: game ? () => onOpenGameManager({ game }) : undefined,
          },
        ]
      );
    }

    return actions;
  };

  const renderAdditionalActions = () => {
    return (
      <ElementWithMenu
        element={
          <IconButton size="small" disabled={disabled}>
            <ThreeDotsMenu />
          </IconButton>
        }
        buildMenuTemplate={(i18n: I18nType) => {
          const actions = [];

          // Close action
          if (isCurrentProjectOpened) {
            actions.push({
              label: i18n._(t`Close project`),
              click: async () => {
                await askToCloseProject();
              },
            });
          }

          // Management actions.
          if (projectsList.length < 2) {
            const file = projectsList[0];
            if (file && file.storageProviderName === 'LocalFile') {
              actions.push({
                label: i18n._(t`Show in local folder`),
                click: () => locateProjectFile(file),
              });
            }
          } else {
            // If there are multiple projects, suggest opening the game dashboard.
            actions.push({
              label: i18n._(t`See all projects`),
              click: game ? () => onOpenGameManager({ game }) : undefined,
            });
          }

          // Delete actions.
          // Don't allow removing project if opened, as it would not result in any change in the list.
          // (because an opened project is always displayed)
          if (!isCurrentProjectOpened && projectsList.length < 2) {
            if (actions.length > 0) {
              actions.push({
                type: 'separator',
              });
            }

            const file = projectsList[0];
            actions.push({
              label: i18n._(t`Delete`),
              click: async () => {
                // Extract word translation to ensure it is not wrongly translated in the sentence.
                const translatedConfirmText = i18n._(t`delete`);

                const answer = await showDeleteConfirmation({
                  title: t`Delete game`,
                  message: t`Your game will be deleted. This action is irreversible. Do you want to continue?`,
                  confirmButtonLabel: t`Delete game`,
                  fieldMessage: t`To confirm, type "${translatedConfirmText}"`,
                  confirmText: translatedConfirmText,
                });
                if (!answer) return;

                // If the game is registered, unregister it.
                // If it fails, this will throw, to prevent deleting a game with leaderboards or not owned.
                if (game) {
                  try {
                    await onUnregisterGame();
                  } catch (error) {
                    console.error('Unable to unregister the game.', error);
                    // Alert is handled by onUnregisterGame. Just ensure we don't continue.
                    return;
                  }
                }

                // If there is a project file (local or cloud), remove it.
                if (file) {
                  if (file.storageProviderName === 'Cloud') {
                    await onDeleteCloudProject(file);
                  } else {
                    await removeRecentProjectFile(file);
                  }
                }

                await onRefreshGames();
              },
            });
          }

          return actions;
        }}
      />
    );
  };

  const onManageGame = React.useCallback(
    async () => {
      if (game) {
        onOpenGameManager({ game });
        return;
      } else {
        if (!authenticatedUser.profile) {
          authenticatedUser.onOpenLoginDialog();
          return;
        }
        const answer = await showConfirmation({
          title: t`Manage game online`,
          message: t`This game is not registered online. Do you want to register it to access the online features?`,
          confirmButtonLabel: t`Continue`,
        });
        if (!answer) return;

        const registeredGame = await onRegisterProject(projectsList[0]);
        if (!registeredGame) return;

        await onRefreshGames();
        onOpenGameManager({ game: registeredGame });
      }
    },
    [
      game,
      onOpenGameManager,
      showConfirmation,
      onRegisterProject,
      projectsList,
      onRefreshGames,
      authenticatedUser,
    ]
  );

  const renderButtons = ({ fullWidth }: { fullWidth: boolean }) => {
    const openProjectLabel = isCurrentProjectOpened ? (
      <Trans>Save</Trans>
    ) : (
      <Trans>Open</Trans>
    );
    const mainAction = isCurrentProjectOpened
      ? onSaveProject
      : projectsList.length > 0
      ? () => onOpenProject(projectsList[0])
      : () => {
          showAlert({
            title: t`No project found`,
            message: t`We couldn't find a project for this game. You may have saved it in a different location? You can open it manually to get it linked to this game.`,
          });
        };

    return (
      <div style={styles.buttonsContainer}>
        <LineStackLayout noMargin>
          <FlatButton
            primary
            fullWidth={fullWidth}
            label={<Trans>Manage</Trans>}
            onClick={onManageGame}
            disabled={disabled}
          />
          {projectsList.length < 2 ? (
            <RaisedButton
              primary
              fullWidth={fullWidth}
              label={openProjectLabel}
              onClick={mainAction}
              disabled={disabled || (isCurrentProjectOpened && !canSaveProject)}
            />
          ) : (
            <RaisedButtonWithSplitMenu
              primary
              fullWidth={fullWidth}
              label={openProjectLabel}
              onClick={mainAction}
              buildMenuTemplate={i18n =>
                buildOpenContextMenu(i18n, projectsList)
              }
              disabled={disabled || (isCurrentProjectOpened && !canSaveProject)}
            />
          )}
        </LineStackLayout>
      </div>
    );
  };

  const renderShareUrl = (i18n: I18nType) =>
    gameUrl ? (
      <GameLinkAndShareIcons
        url={gameUrl}
        display={isSmallOrMediumScreen ? 'column' : 'line'}
      />
    ) : null;

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
              <Column noMargin>
                <LineStackLayout noMargin justifyContent="space-between">
                  {renderTitle()}
                  {renderAdditionalActions()}
                </LineStackLayout>
                {renderLastModification(i18n)}
              </Column>
              <LineStackLayout noMargin>
                {renderThumbnail()}
                {renderPublicInfo()}
              </LineStackLayout>
              {renderShareUrl(i18n)}
              {renderButtons({ fullWidth: true })}
            </ColumnStackLayout>
          ) : (
            <LineStackLayout noMargin>
              {renderThumbnail()}
              <ColumnStackLayout
                expand
                justifyContent="space-between"
                noOverflowParent
              >
                <ColumnStackLayout noMargin>
                  <LineStackLayout
                    noMargin
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <ColumnStackLayout noMargin>
                      {renderLastModification(i18n)}
                      {renderTitle()}
                    </ColumnStackLayout>
                    <LineStackLayout noMargin>
                      {!isSmallOrMediumScreen && renderStorageProvider(i18n)}
                      {renderAdditionalActions()}
                    </LineStackLayout>
                  </LineStackLayout>
                  {renderPublicInfo()}
                </ColumnStackLayout>
                <LineStackLayout
                  noMargin
                  justifyContent={gameUrl ? 'space-between' : 'flex-end'}
                >
                  {renderShareUrl(i18n)}
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

export default GameDashboardCard;
