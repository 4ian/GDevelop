// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { I18n as I18nType } from '@lingui/core';
import SectionContainer, { SectionRow } from '../SectionContainer';
import ErrorBoundary from '../../../../UI/ErrorBoundary';
import AuthenticatedUserContext from '../../../../Profile/AuthenticatedUserContext';
import GamesList from '../../../../GameDashboard/GamesList';
import {
  deleteGame,
  registerGame,
  type Game,
} from '../../../../Utils/GDevelopServices/Game';
import { type QuickCustomizationRecommendation } from '../../../../Utils/GDevelopServices/User';
import PlaceholderError from '../../../../UI/PlaceholderError';
import PlaceholderLoader from '../../../../UI/PlaceholderLoader';
import { Column, LargeSpacer, Line } from '../../../../UI/Grid';
import { ColumnStackLayout } from '../../../../UI/Layout';
import { type GameDetailsTab } from '../../../../GameDashboard';
import GameDashboard from '../../../../GameDashboard';
import useAlertDialog from '../../../../UI/Alert/useAlertDialog';
import RouterContext from '../../../RouterContext';
import { extractGDevelopApiErrorStatusAndCode } from '../../../../Utils/GDevelopServices/Errors';
import UserEarningsWidget from '../../../../GameDashboard/Monetization/UserEarningsWidget';
import {
  type FileMetadataAndStorageProviderName,
  type FileMetadata,
  type StorageProvider,
} from '../../../../ProjectsStorage';
import Text from '../../../../UI/Text';
import Grid from '@material-ui/core/Grid';
import WalletWidget from '../../../../GameDashboard/Wallet/WalletWidget';
import { QuickCustomizationGameTiles } from '../../../../QuickCustomization/QuickCustomizationGameTiles';
import { type NewProjectSetup } from '../../../../ProjectCreation/NewProjectSetupDialog';
import { type ExampleShortHeader } from '../../../../Utils/GDevelopServices/Example';
import UrlStorageProvider from '../../../../ProjectsStorage/UrlStorageProvider';
import {
  type WindowSizeType,
  useResponsiveWindowSize,
} from '../../../../UI/Responsive/ResponsiveWindowMeasurer';
import { type PrivateGameTemplateListingData } from '../../../../Utils/GDevelopServices/Shop';
import FlatButton from '../../../../UI/FlatButton';
import ChevronArrowRight from '../../../../UI/CustomSvgIcons/ChevronArrowRight';
import ExampleStore from '../../../../AssetStore/ExampleStore';
import {
  checkIfHasTooManyCloudProjects,
  MaxProjectCountAlertMessage,
} from './MaxProjectCountAlertMessage';
import { useProjectsListFor } from './utils';
import { deleteCloudProject } from '../../../../Utils/GDevelopServices/Project';
import { getDefaultRegisterGameProperties } from '../../../../Utils/UseGameAndBuildsManager';

const getExampleItemsColumns = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 4 : 2;
    case 'medium':
      return 3;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
    default:
      return 4;
  }
};

type Props = {|
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  storageProviders: Array<StorageProvider>,
  closeProject: () => Promise<void>,
  canOpen: boolean,
  onOpenProfile: () => void,
  askToCloseProject: () => Promise<boolean>,
  onCreateProjectFromExample: (
    exampleShortHeader: ExampleShortHeader,
    newProjectSetup: NewProjectSetup,
    i18n: I18nType,
    isQuickCustomization?: boolean
  ) => Promise<void>,
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
  onChooseProject: () => void,
  onSaveProject: () => Promise<void>,
  canSaveProject: boolean,
|};

const CreateSection = ({
  project,
  currentFileMetadata,
  onOpenProject,
  storageProviders,
  closeProject,
  canOpen,
  onOpenProfile,
  askToCloseProject,
  onCreateProjectFromExample,
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
  onChooseProject,
  onSaveProject,
  canSaveProject,
}: Props) => {
  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const {
    profile,
    getAuthorizationHeader,
    loginState,
    recommendations,
    limits,
  } = authenticatedUser;
  const {
    showDeleteConfirmation,
    showConfirmation,
    showAlert,
  } = useAlertDialog();
  const [isUpdatingGame, setIsUpdatingGame] = React.useState(false);
  const [initialWidgetToScrollTo, setInitialWidgetToScrollTo] = React.useState(
    null
  );
  const { routeArguments, removeRouteArguments } = React.useContext(
    RouterContext
  );
  // $FlowIgnore
  const quickCustomizationRecommendation: ?QuickCustomizationRecommendation = React.useMemo(
    () => {
      return recommendations
        ? recommendations.find(
            recommendation => recommendation.type === 'quick-customization'
          )
        : null;
    },
    [recommendations]
  );
  const { windowSize, isMobile, isLandscape } = useResponsiveWindowSize();
  const isMobileOrMediumWidth =
    windowSize === 'small' || windowSize === 'medium';
  const hasTooManyCloudProjects = checkIfHasTooManyCloudProjects(
    authenticatedUser
  );
  const allRecentProjectFiles = useProjectsListFor(null);
  const savedGames = (games || []).filter(game => game.savedStatus !== 'draft');
  const hasAProjectOpenedNowOrRecentlyOrGameSaved =
    !!project || savedGames.length || !!allRecentProjectFiles.length;
  const hidePerformanceDashboard =
    !!limits &&
    !!limits.capabilities.classrooms &&
    limits.capabilities.classrooms.hideSocials;

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

  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchText, setSearchText] = React.useState<string>('');

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
          disabled={isUpdatingGame}
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
          <SectionRow expand>
            {!!profile || loginState === 'done' ? (
              <ColumnStackLayout noMargin>
                {hidePerformanceDashboard ? null : hasAProjectOpenedNowOrRecentlyOrGameSaved ? (
                  <ColumnStackLayout noMargin>
                    <Grid container spacing={2}>
                      <UserEarningsWidget
                        size={
                          isMobile && isLandscape
                            ? 'half'
                            : isMobileOrMediumWidth
                            ? 'full'
                            : 'twoThirds'
                        }
                      />
                      <WalletWidget
                        onOpenProfile={onOpenProfile}
                        showOneItem
                        size={
                          isMobile && isLandscape
                            ? 'half'
                            : isMobileOrMediumWidth
                            ? 'full'
                            : 'oneThird'
                        }
                      />
                    </Grid>
                  </ColumnStackLayout>
                ) : (
                  <Grid container spacing={2}>
                    <WalletWidget onOpenProfile={onOpenProfile} size="full" />
                  </Grid>
                )}
                <LargeSpacer />
                <GamesList
                  storageProviders={storageProviders}
                  project={project}
                  games={games}
                  onRefreshGames={onRefreshGames}
                  onOpenGameManager={({
                    game,
                    widgetToScrollTo,
                  }: {
                    game: Game,
                    widgetToScrollTo?: 'projects',
                  }) => {
                    setInitialWidgetToScrollTo(widgetToScrollTo);
                    setOpenedGameId(game.id);
                  }}
                  onOpenProject={onOpenProject}
                  isUpdatingGame={isUpdatingGame}
                  onUnregisterGame={onUnregisterGame}
                  canOpen={canOpen}
                  onOpenNewProjectSetupDialog={onOpenNewProjectSetupDialog}
                  onChooseProject={onChooseProject}
                  currentFileMetadata={currentFileMetadata}
                  closeProject={closeProject}
                  askToCloseProject={askToCloseProject}
                  onSaveProject={onSaveProject}
                  canSaveProject={canSaveProject}
                  onDeleteCloudProject={onDeleteCloudProject}
                  onRegisterProject={onRegisterProject}
                  // Controls
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  searchText={searchText}
                  setSearchText={setSearchText}
                />
                {isMobile && hasTooManyCloudProjects && (
                  <MaxProjectCountAlertMessage margin="dense" />
                )}
                {quickCustomizationRecommendation && (
                  <ColumnStackLayout noMargin>
                    <Line noMargin>
                      <Text size="block-title">
                        <Trans>Remix a game in 2 minutes</Trans>
                      </Text>
                    </Line>
                    <QuickCustomizationGameTiles
                      onSelectExampleShortHeader={async exampleShortHeader => {
                        const projectIsClosed = await askToCloseProject();
                        if (!projectIsClosed) {
                          return;
                        }

                        const newProjectSetup: NewProjectSetup = {
                          storageProvider: UrlStorageProvider,
                          saveAsLocation: null,
                          openQuickCustomizationDialog: true,
                        };
                        onCreateProjectFromExample(
                          exampleShortHeader,
                          newProjectSetup,
                          i18n,
                          true // isQuickCustomization
                        );
                      }}
                      quickCustomizationRecommendation={
                        quickCustomizationRecommendation
                      }
                    />
                  </ColumnStackLayout>
                )}
                {!hasAProjectOpenedNowOrRecentlyOrGameSaved && (
                  <ColumnStackLayout noMargin>
                    <Line noMargin justifyContent="space-between">
                      <Text size="block-title" noMargin>
                        <Trans>Start from a template</Trans>
                      </Text>
                      <FlatButton
                        onClick={onOpenNewProjectSetupDialog}
                        label={
                          isMobile ? (
                            <Trans>Browse</Trans>
                          ) : (
                            <Trans>Browse all templates</Trans>
                          )
                        }
                        leftIcon={<ChevronArrowRight fontSize="small" />}
                      />
                    </Line>
                    <ExampleStore
                      onSelectExampleShortHeader={onSelectExampleShortHeader}
                      onSelectPrivateGameTemplateListingData={
                        onSelectPrivateGameTemplateListingData
                      }
                      i18n={i18n}
                      columnsCount={getExampleItemsColumns(
                        windowSize,
                        isLandscape
                      )}
                      hideSearch
                      onlyShowGames
                    />
                  </ColumnStackLayout>
                )}
              </ColumnStackLayout>
            ) : gamesFetchingError ? (
              <PlaceholderError onRetry={onRefreshGames}>
                <Trans>
                  Can't load the games. Verify your internet connection or retry
                  later.
                </Trans>
              </PlaceholderError>
            ) : (
              <Column expand justifyContent="center">
                <PlaceholderLoader />
              </Column>
            )}
          </SectionRow>
        </SectionContainer>
      )}
    </I18n>
  );
};

const CreateSectionWithErrorBoundary = (props: Props) => (
  <ErrorBoundary
    componentTitle={<Trans>Create section</Trans>}
    scope="start-page-create"
  >
    <CreateSection {...props} />
  </ErrorBoundary>
);

export default CreateSectionWithErrorBoundary;
