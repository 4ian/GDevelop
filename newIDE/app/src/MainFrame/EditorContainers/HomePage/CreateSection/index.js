// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import type { I18n as I18nType } from '@lingui/core';
import SectionContainer, { SectionRow } from '../SectionContainer';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import {
  deleteGame,
  registerGame,
  type Game,
} from '../../../../Utils/GDevelopServices/Game';
import { Column, Line } from '../../../../UI/Grid';
import { ColumnStackLayout } from '../../../../UI/Layout';
import { type GameDetailsTab } from '../../../../GameDashboard';
import GameDashboard from '../../../../GameDashboard';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import RouterContext from '../../../RouterContext';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import Text from '../../../../UI/Text';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import { useResponsiveWindowSize } from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import ChevronArrowRight from '../../../../UI/CustomSvgIcons/ChevronArrowRight';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from './MaxProjectCountAlertMessage';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import { getDefaultRegisterGameProperties } from '../../../../Utils/UseGameAndBuildsManager';
import EmptyAndStartingPointProjects from '../../../../ProjectCreation/EmptyAndStartingPointProjects';

const carrotsFontFamily =
  '"Cairo", "Noto Sans Arabic", "Noto Sans", "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Segoe UI", "Ubuntu", "Trebuchet MS", sans-serif';

const styles = {
  heroPanel: {
    display: 'flex',
    gap: 18,
    flexWrap: 'wrap',
    width: '100%',
  },
  actionCard: {
    flex: '1 1 380px',
    minHeight: 210,
    borderRadius: 20,
    border: '1px solid rgba(0, 0, 0, 0.08)',
    background: 'linear-gradient(165deg, #f7f7f4, #eceee8)',
    boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
    padding: 26,
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },
  actionCardIcon: {
    color: '#242323',
    opacity: 0.9,
    flexShrink: 0,
  },
  actionCardText: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  actionCardTitle: {
    fontFamily: carrotsFontFamily,
    fontSize: 38,
    fontWeight: 800,
    color: '#151515',
    lineHeight: '44px',
    textAlign: 'right',
  },
  actionCardTitleCompact: {
    fontSize: 34,
    lineHeight: '40px',
  },
  actionCardSubtitle: {
    fontFamily: carrotsFontFamily,
    fontSize: 25,
    color: '#353534',
    lineHeight: '32px',
    textAlign: 'right',
  },
  actionCardActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  filtersRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    borderRadius: 999,
    border: '1px solid rgba(28, 28, 28, 0.28)',
    color: '#2d2d2c',
    background: 'rgba(255, 255, 255, 0.74)',
    fontFamily: carrotsFontFamily,
    fontWeight: 700,
    fontSize: 24,
    lineHeight: '30px',
    padding: '5px 16px',
    cursor: 'pointer',
    outline: 'none',
  },
  filterChipActive: {
    background: '#ecebe7',
    borderColor: 'rgba(36, 36, 36, 0.45)',
  },
  sectionCard: {
    borderRadius: 20,
    padding: 16,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    background:
      'linear-gradient(160deg, rgba(246, 246, 242, 0.98), rgba(234, 235, 230, 0.98))',
    boxShadow: '0 14px 30px rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    fontFamily: carrotsFontFamily,
    fontSize: 40,
    lineHeight: '46px',
    fontWeight: 800,
    color: '#161616',
  },
  sectionDescription: {
    fontFamily: carrotsFontFamily,
    fontSize: 20,
    lineHeight: '28px',
    color: '#3d3d3c',
  },
  carrotsButton: {
    border: '1px solid rgba(28, 28, 28, 0.16)',
    borderRadius: 999,
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95), #eceee8)',
    color: '#262625',
    fontFamily: carrotsFontFamily,
    fontWeight: 700,
    letterSpacing: 0.2,
    fontSize: 22,
    minHeight: 48,
    padding: '7px 20px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
    outline: 'none',
    transition:
      'background 120ms ease, border-color 120ms ease, transform 120ms ease',
  },
  carrotsButtonPrimary: {
    borderColor: 'rgba(189, 170, 120, 0.6)',
    background:
      'linear-gradient(135deg, rgba(221, 171, 73, 0.94), rgba(142, 194, 132, 0.93))',
    color: '#ffffff',
    boxShadow: '0 8px 18px rgba(165, 153, 87, 0.28)',
  },
  carrotsButtonSecondary: {
    borderColor: 'rgba(0, 0, 0, 0.2)',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.95), #eceee8)',
    color: '#2f2f2e',
  },
  carrotsButtonDisabled: {
    opacity: 0.56,
    cursor: 'not-allowed',
  },
  carrotsButtonIcon: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

type CarrotsActionButtonProps = {|
  label: React.Node,
  onClick: () => void,
  disabled?: boolean,
  icon?: React.Node,
  id?: string,
  variant?: 'primary' | 'secondary',
|};

const CarrotsActionButton = ({
  label,
  onClick,
  disabled,
  icon,
  id,
  variant = 'secondary',
}: CarrotsActionButtonProps): React.Node => {
  const buttonStyle = {
    ...styles.carrotsButton,
    ...(variant === 'primary'
      ? styles.carrotsButtonPrimary
      : styles.carrotsButtonSecondary),
    ...(disabled ? styles.carrotsButtonDisabled : {}),
  };
  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled}
      id={id}
    >
      {icon && <span style={styles.carrotsButtonIcon}>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};

type Props = {|
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  storageProviders: Array<StorageProvider>,
  closeProject: () => Promise<void>,
  canOpen: boolean,
  askToCloseProject: () => Promise<boolean>,
  onSelectPrivateGameTemplateListingData: (
    privateGameTemplateListingData: PrivateGameTemplateListingData
  ) => void,
  onSelectExampleShortHeader: (exampleShortHeader: ExampleShortHeader) => void,
  i18n: I18nType,
  games: ?Array<Game>,
  onRefreshGames: () => Promise<void>,
  onGameUpdated: (game: Game) => void,
  gamesFetchingError: ?Error,
  openedGame: ?Game,
  setOpenedGameId: (gameId: ?string) => void,
  currentTab: GameDetailsTab,
  setCurrentTab: GameDetailsTab => void,
  onOpenNewProjectSetupDialog: () => void,
  onStartNewProject: () => void,
  onChooseProject: () => void,
  onSaveProject: () => Promise<?FileMetadata>,
  canSaveProject: boolean,
|};

const CreateSection = ({
  project,
  currentFileMetadata,
  onOpenProject,
  storageProviders,
  closeProject,
  canOpen,
  askToCloseProject,
  onSelectPrivateGameTemplateListingData,
  onSelectExampleShortHeader,
  i18n,
  games,
  onRefreshGames,
  onGameUpdated,
  gamesFetchingError,
  openedGame,
  setOpenedGameId,
  currentTab,
  setCurrentTab,
  onOpenNewProjectSetupDialog,
  onStartNewProject,
  onChooseProject,
  onSaveProject,
  canSaveProject,
}: Props) => {
  void i18n;
  void onSelectPrivateGameTemplateListingData;
  void gamesFetchingError;
  void onSaveProject;
  void canSaveProject;

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const { profile, getAuthorizationHeader } = authenticatedUser;
  const {
    showDeleteConfirmation,
    showConfirmation,
    showAlert,
  } = useAlertDialog();
  const [isUpdatingGame, setIsUpdatingGame] = React.useState(false);
  const initialWidgetToScrollTo = null;
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );
  const { isMobile } = useResponsiveWindowSize();
  const hasTooManyCloudProjects = checkIfHasTooManyCloudProjects(
    authenticatedUser
  );

  React.useEffect(
    () => {
      onRefreshGames();
    },
    // Refresh the games when the callback changes (defined in useGamesList), that's
    // to say when the user profile changes.
    [onRefreshGames]
  );

  React.useEffect(
    () => {
      if (openedGame && !profile) {
        setOpenedGameId(null);
      }
    },
    // Close game view if user logs out.
    [profile, openedGame, setOpenedGameId]
  );

  const [templateCategory, setTemplateCategory] = React.useState<
    'games' | '2d' | '3d'
  >('games');

  const onUnregisterGame = React.useCallback(
    async (
      gameId: string,
      i18n: I18nType,
      options?: { skipConfirmation: boolean, throwOnError: boolean }
    ) => {
      if (!profile) return;

      if (!options || !options.skipConfirmation) {
        const answer = await showConfirmation({
          title: t`Unregister game`,
          message: t`Are you sure you want to unregister this game?${'\n\n'}If you haven't saved it, it will disappear from your games dashboard and you won't get access to player services, unless you register it again.`,
        });
        if (!answer) return;
      }

      const { id } = profile;
      setIsUpdatingGame(true);
      try {
        await deleteGame(getAuthorizationHeader, id, gameId);
        if (openedGame && openedGame.id === gameId) {
          setOpenedGameId(null);
        }
      } catch (error) {
        console.error('Unable to delete the game:', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (
          extractedStatusAndCode &&
          extractedStatusAndCode.code === 'game-deletion/leaderboards-exist'
        ) {
          await showAlert({
            title: t`Unable to unregister the game`,
            message: t`You cannot unregister a game that has active leaderboards. To delete them, access the player services, and delete them one by one.`,
          });
        } else {
          await showAlert({
            title: t`Unable to unregister the game`,
            message: t`An error happened while unregistering the game. Verify your internet connection or retry later.`,
          });
        }

        if (options && options.throwOnError) {
          throw error;
        }
      } finally {
        setIsUpdatingGame(false);
      }

      onRefreshGames();
    },
    [
      openedGame,
      profile,
      getAuthorizationHeader,
      onRefreshGames,
      setOpenedGameId,
      showConfirmation,
      showAlert,
    ]
  );

  React.useEffect(
    () => {
      const loadInitialGame = async () => {
        // When games are loaded and we have an initial game id, try to open it.
        const initialGameId = routeArguments['game-id'];
        if (games && initialGameId) {
          const game = games.find(game => game.id === initialGameId);
          removeRouteArguments(['game-id']);
          if (game) {
            setOpenedGameId(game.id);
          } else {
            await showAlert({
              title: t`Game not found`,
              message: t`The game you're trying to open is not registered online. Open the project
              file, then register it before continuing.`,
            });
          }
        }
      };
      loadInitialGame();
    },
    [
      games,
      routeArguments,
      removeRouteArguments,
      showConfirmation,
      showAlert,
      project,
      setOpenedGameId,
    ]
  );

  const onBack = React.useCallback(
    () => {
      setCurrentTab('details');
      setOpenedGameId(null);
    },
    [setCurrentTab, setOpenedGameId]
  );

  const onDeleteCloudProject = async (
    i18n: I18nType,
    { fileMetadata, storageProviderName }: FileMetadataAndStorageProviderName,
    options?: { skipConfirmation: boolean }
  ) => {
    if (storageProviderName !== 'Cloud') return;
    const projectName = fileMetadata.name;
    if (!projectName) return; // Only cloud projects can be deleted, and all cloud projects have names.

    const isCurrentProjectOpened =
      !!project &&
      !!currentFileMetadata &&
      fileMetadata.fileIdentifier === currentFileMetadata.fileIdentifier;

    if (isCurrentProjectOpened) {
      const result = await showConfirmation({
        title: t`Project is opened`,
        message: t`You are about to delete the project ${projectName}, which is currently opened. If you proceed, the project will be closed and you will lose any unsaved changes. Do you want to proceed?`,
        confirmButtonLabel: t`Continue`,
      });
      if (!result) return;
      await closeProject();
    }

    if (!options || !options.skipConfirmation) {
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
    }

    try {
      setIsUpdatingGame(true);
      await deleteCloudProject(authenticatedUser, fileMetadata.fileIdentifier);
      authenticatedUser.onCloudProjectsChanged();
    } catch (error) {
      const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
        error
      );
      const message =
        extractedStatusAndCode && extractedStatusAndCode.status === 403
          ? t`You don't have permissions to delete this project.`
          : t`An error occurred when deleting the project. Please try again later.`;
      showAlert({
        title: t`Unable to delete the project`,
        message,
      });
    } finally {
      setIsUpdatingGame(false);
    }
  };

  const onRegisterProject = React.useCallback(
    async (file: FileMetadataAndStorageProviderName): Promise<?Game> => {
      const projectId = file.fileMetadata.gameId;

      if (!authenticatedUser.profile) return;

      if (!projectId) {
        console.error('No project id found for registering the game.');
        showAlert({
          title: t`Unable to register the game`,
          message: t`An error happened while registering the game. Verify your internet connection
          or retry later.`,
        });
        return;
      }

      const { id, username } = authenticatedUser.profile;
      try {
        setIsUpdatingGame(true);
        const game = await registerGame(
          authenticatedUser.getAuthorizationHeader,
          id,
          // $FlowFixMe[incompatible-type]
          getDefaultRegisterGameProperties({
            projectId,
            projectName: file.fileMetadata.name,
            projectAuthor: username,
            // A project is always saved when appearing in the list of recent projects.
            savedStatus: 'saved',
          })
        );
        return game;
      } catch (error) {
        console.error('Unable to register the game.', error);
        const extractedStatusAndCode = extractGDevelopApiErrorStatusAndCode(
          error
        );
        if (extractedStatusAndCode && extractedStatusAndCode.status === 403) {
          await showAlert({
            title: t`Game already registered`,
            message: t`This game is registered online but you don't have
          access to it. Ask the owner of the game to add your account to the list of owners to be able to manage it.`,
          });
        } else {
          await showAlert({
            title: t`Unable to register the game`,
            message: t`An error happened while registering the game. Verify your internet connection
          or retry later.`,
          });
        }
      } finally {
        setIsUpdatingGame(false);
      }
    },
    [
      authenticatedUser.getAuthorizationHeader,
      authenticatedUser.profile,
      showAlert,
    ]
  );
  void onRegisterProject;

  const isLoading = isUpdatingGame;

  if (openedGame) {
    return (
      <SectionContainer flexBody>
        <GameDashboard
          project={project}
          currentFileMetadata={currentFileMetadata}
          onOpenProject={onOpenProject}
          storageProviders={storageProviders}
          closeProject={closeProject}
          currentView={currentTab}
          setCurrentView={setCurrentTab}
          game={openedGame}
          onBack={onBack}
          onGameUpdated={onGameUpdated}
          disabled={isLoading}
          onUnregisterGame={() => onUnregisterGame(openedGame.id, i18n)}
          onDeleteCloudProject={onDeleteCloudProject}
          initialWidgetToScrollTo={initialWidgetToScrollTo}
        />
      </SectionContainer>
    );
  }

  return (
    <I18n>
      {({ i18n }) => (
        <SectionContainer
          flexBody
          renderFooter={
            !isMobile && hasTooManyCloudProjects
              ? () => (
                  <Line>
                    <Column expand>
                      <MaxProjectCountAlertMessage />
                    </Column>
                  </Line>
                )
              : undefined
          }
          showUrgentAnnouncements
        >
          <SectionRow>
            <div id="carrots-home-build-section" style={styles.heroPanel}>
              <div style={styles.actionCard}>
                <div style={styles.actionCardIcon}>
                  <CreateNewFolderIcon style={{ fontSize: 72 }} />
                </div>
                <div style={styles.actionCardText}>
                  <Text noMargin style={styles.actionCardTitle}>
                    <Trans>Create New Project</Trans>
                  </Text>
                  <Text noMargin style={styles.actionCardSubtitle}>
                    <Trans>Start quickly with powerful and simple tools.</Trans>
                  </Text>
                  <div style={styles.actionCardActions}>
                    <CarrotsActionButton
                      label={<Trans>Start Project</Trans>}
                      onClick={onStartNewProject}
                      disabled={isLoading}
                      variant="primary"
                    />
                  </div>
                </div>
              </div>
              <div style={styles.actionCard}>
                <div style={styles.actionCardIcon}>
                  <FolderSharedIcon style={{ fontSize: 72 }} />
                </div>
                <div style={styles.actionCardText}>
                  <Text
                    noMargin
                    style={{
                      ...styles.actionCardTitle,
                      ...styles.actionCardTitleCompact,
                    }}
                  >
                    <Trans>Open Existing Project</Trans>
                  </Text>
                  <Text noMargin style={styles.actionCardSubtitle}>
                    <Trans>Continue your saved projects.</Trans>
                  </Text>
                  <div style={styles.actionCardActions}>
                    <CarrotsActionButton
                      label={<Trans>Open Project</Trans>}
                      onClick={onChooseProject}
                      disabled={!canOpen || isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </SectionRow>
          <SectionRow>
            <div id="carrots-home-templates-section">
              <ColumnStackLayout noMargin style={styles.sectionCard}>
                <Line noMargin justifyContent="space-between">
                  <Text size="title" noMargin style={styles.sectionTitle}>
                    <Trans>Featured Templates</Trans>
                  </Text>
                  <CarrotsActionButton
                    onClick={onOpenNewProjectSetupDialog}
                    label={
                      isMobile ? (
                        <Trans>Browse</Trans>
                      ) : (
                        <Trans>Browse More Templates</Trans>
                      )
                    }
                    icon={<ChevronArrowRight fontSize="small" />}
                    disabled={isLoading}
                    variant="secondary"
                    id="browse-basic-templates"
                  />
                </Line>
                <div style={styles.filtersRow}>
                  <button
                    type="button"
                    style={{
                      ...styles.filterChip,
                      ...(templateCategory === 'games'
                        ? styles.filterChipActive
                        : {}),
                    }}
                    onClick={() => setTemplateCategory('games')}
                  >
                    <Trans>Games</Trans>
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.filterChip,
                      ...(templateCategory === '2d'
                        ? styles.filterChipActive
                        : {}),
                    }}
                    onClick={() => setTemplateCategory('2d')}
                  >
                    <Trans>2D</Trans>
                  </button>
                  <button
                    type="button"
                    style={{
                      ...styles.filterChip,
                      ...(templateCategory === '3d'
                        ? styles.filterChipActive
                        : {}),
                    }}
                    onClick={() => setTemplateCategory('3d')}
                  >
                    <Trans>3D</Trans>
                  </button>
                </div>
                <EmptyAndStartingPointProjects
                  onSelectExampleShortHeader={onSelectExampleShortHeader}
                  onSelectEmptyProject={onOpenNewProjectSetupDialog}
                  disabled={isLoading}
                />
              </ColumnStackLayout>
            </div>
          </SectionRow>
        </SectionContainer>
      )}
    </I18n>
  );
};

const CreateSectionWithErrorBoundary = (props: Props): React.Node => (
  <ErrorBoundary
    componentTitle={<Trans>Create section</Trans>}
    scope="start-page-create"
  >
    <CreateSection {...props} />
  </ErrorBoundary>
);

export default CreateSectionWithErrorBoundary;
