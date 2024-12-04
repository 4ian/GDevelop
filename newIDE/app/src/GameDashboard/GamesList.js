// @flow
import * as React from 'react';
import Fuse from 'fuse.js';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import { type Game } from '../Utils/GDevelopServices/Game';
import GameCard from './GameCard';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import SearchBar from '../UI/SearchBar';
import { useDebounce } from '../Utils/UseDebounce';
import {
  getFuseSearchQueryForSimpleArray,
  sharedFuseConfiguration,
} from '../UI/Search/UseSearchStructuredItem';
import IconButton from '../UI/IconButton';
import ChevronArrowLeft from '../UI/CustomSvgIcons/ChevronArrowLeft';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import { Column, Line } from '../UI/Grid';
import Text from '../UI/Text';
import Paper from '../UI/Paper';
import BackgroundText from '../UI/BackgroundText';
import SelectOption from '../UI/SelectOption';
import SearchBarSelectField from '../UI/SearchBarSelectField';
import {
  type FileMetadataAndStorageProviderName,
  type StorageProvider,
  type FileMetadata,
} from '../ProjectsStorage';
import RaisedButton from '../UI/RaisedButton';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import Add from '../UI/CustomSvgIcons/Add';
import FlatButton from '../UI/FlatButton';
import {
  getLastModifiedInfoByProjectId,
  useProjectsListFor,
} from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import ProjectCard from './ProjectCard';

const pageSize = 10;

const styles = {
  noGameMessageContainer: { padding: 10 },
  refreshIconContainer: { fontSize: 20, display: 'flex', alignItems: 'center' },
};

type OrderBy = 'totalSessions' | 'weeklySessions' | 'lastModifiedAt';

type DashboardItem = {|
  game?: Game, // A project can not be published, and thus not have a game.
  projectFiles?: Array<FileMetadataAndStorageProviderName>, // A game can have no or multiple projects.
|};

const totalSessionsSort = (
  itemA: DashboardItem,
  itemB: DashboardItem
): number =>
  ((itemB.game && itemB.game.cachedTotalSessionsCount) || 0) -
  ((itemA.game && itemA.game.cachedTotalSessionsCount) || 0);

const lastWeekSessionsSort = (
  itemA: DashboardItem,
  itemB: DashboardItem
): number =>
  ((itemB.game && itemB.game.cachedLastWeekSessionsCount) || 0) -
  ((itemA.game && itemA.game.cachedLastWeekSessionsCount) || 0);

const getDashboardItemLastModifiedAt = (item: DashboardItem): number => {
  // First prioritize the projects that have been modified recently, if any.
  if (item.projectFiles && item.projectFiles.length > 0) {
    return Math.max(
      ...item.projectFiles.map(
        projectFile => projectFile.fileMetadata.lastModifiedDate || 0
      )
    );
  }
  // Then the game, if any.
  return (item.game && item.game.updatedAt * 1000) || 0;
};

const lastModifiedAtSort = (
  itemA: DashboardItem,
  itemB: DashboardItem
): number => {
  return (
    getDashboardItemLastModifiedAt(itemB) -
    getDashboardItemLastModifiedAt(itemA)
  );
};

const areDashboardItemsEqual = (
  itemA: DashboardItem,
  itemB: DashboardItem
): boolean => {
  const gameA = itemA.game;
  const gameB = itemB.game;
  if (gameA && gameB) return gameA.id === gameB.id;
  const projectFilesA = itemA.projectFiles;
  const projectFilesB = itemB.projectFiles;
  if (projectFilesA && projectFilesB) {
    if (projectFilesA.length !== projectFilesB.length) return false;
    return projectFilesA.every((projectFile, index) => {
      const otherProjectFile = projectFilesB[index];
      return (
        projectFile.fileMetadata.gameId ===
          otherProjectFile.fileMetadata.gameId &&
        projectFile.fileMetadata.fileIdentifier ===
          otherProjectFile.fileMetadata.fileIdentifier
      );
    });
  }
  return false;
};

const getDashboardItemsToDisplay = ({
  project,
  currentFileMetadata,
  allDashboardItems,
  searchText,
  searchClient,
  currentPage,
  orderBy,
}: {|
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  allDashboardItems: Array<DashboardItem>,
  searchText: string,
  searchClient: Fuse,
  currentPage: number,
  orderBy: OrderBy,
|}): Array<DashboardItem> => {
  let itemsToDisplay: DashboardItem[] = allDashboardItems;

  // Always order items, with or without search.
  itemsToDisplay =
    orderBy === 'totalSessions'
      ? itemsToDisplay.sort(totalSessionsSort)
      : orderBy === 'weeklySessions'
      ? itemsToDisplay.sort(lastWeekSessionsSort)
      : orderBy === 'lastModifiedAt'
      ? itemsToDisplay.sort(lastModifiedAtSort)
      : itemsToDisplay;

  if (searchText) {
    const searchResults = searchClient.search(
      getFuseSearchQueryForSimpleArray(searchText)
    );
    itemsToDisplay = searchResults.map(result => result.item);
  } else {
    // If a project is opened and no search is performed, display it first.
    if (project) {
      const currentProjectId = project.getProjectUuid();
      const currentFileIdentifier = currentFileMetadata
        ? currentFileMetadata.fileIdentifier
        : null;
      const dashboardItemLinkedToOpenedProject = allDashboardItems.find(
        dashboardItem =>
          // Either it's a registered game.
          (dashboardItem.game && dashboardItem.game.id === currentProjectId) ||
          // Or it's just a project file.
          (dashboardItem.projectFiles &&
            dashboardItem.projectFiles.some(
              projectFile =>
                projectFile.fileMetadata.gameId === currentProjectId &&
                projectFile.fileMetadata.fileIdentifier ===
                  currentFileIdentifier
            ))
      );
      if (dashboardItemLinkedToOpenedProject) {
        itemsToDisplay = [
          dashboardItemLinkedToOpenedProject,
          ...itemsToDisplay.filter(
            item =>
              !areDashboardItemsEqual(item, dashboardItemLinkedToOpenedProject)
          ),
        ];
      } else {
        // In case a project is opened but not found in the list of recent projects,
        // either it's been saved but then removed from the list.
        // or it's never been saved.
        // In this case, add the opened project first in the list.
        const fileMetadata: FileMetadata = currentFileMetadata || {
          fileIdentifier: 'unsaved-project',
          name: project.getName(),
          gameId: project.getProjectUuid(),
        };
        const openedProjectDashboardItem: DashboardItem = {
          projectFiles: [
            {
              fileMetadata,
              // We're not sure about the storage provider, so we leave it empty.
              storageProviderName: '',
            },
          ],
        };
        itemsToDisplay = [openedProjectDashboardItem, ...itemsToDisplay];
      }
    }
  }

  const itemsWithoutUnsavedGames = itemsToDisplay.filter(
    item =>
      // Filter out unsaved games, unless they are the opened project.
      !item.game ||
      !item.game.unsaved ||
      (project && item.game.id === project.getProjectUuid())
  );

  return itemsWithoutUnsavedGames.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
};

type Props = {|
  storageProviders: Array<StorageProvider>,
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  games: Array<Game>,
  onRefreshGames: () => Promise<void>,
  onOpenGameId: (gameId: ?string) => void,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onUnregisterGame: (game: Game, i18n: I18nType) => Promise<void>,
  isUpdatingGame: boolean,
  canOpen: boolean,
  onOpenNewProjectSetupDialog: () => void,
  onChooseProject: () => void,
  closeProject: () => Promise<void>,
  askToCloseProject: () => Promise<boolean>,
  onSaveProject: () => Promise<void>,
  canSaveProject: boolean,
|};

const GamesList = ({
  project,
  currentFileMetadata,
  games,
  onRefreshGames,
  onOpenGameId,
  onOpenProject,
  onUnregisterGame,
  isUpdatingGame,
  storageProviders,
  canOpen,
  onOpenNewProjectSetupDialog,
  onChooseProject,
  closeProject,
  askToCloseProject,
  onSaveProject,
  canSaveProject,
}: Props) => {
  const { cloudProjects, profile, onCloudProjectsChanged } = React.useContext(
    AuthenticatedUserContext
  );
  const [orderBy, setGamesListOrderBy] = React.useState<OrderBy>(
    'lastModifiedAt'
  );
  const [searchText, setSearchText] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const { isMobile } = useResponsiveWindowSize();

  const allRecentProjectFiles = useProjectsListFor(null);
  const allDashboardItems: DashboardItem[] = React.useMemo(
    () => {
      const projectFilesWithGame = games.map(game => {
        const projectFiles = allRecentProjectFiles.filter(
          file => file.fileMetadata.gameId === game.id
        );
        return { game, projectFiles };
      });
      const projectFilesWithoutGame = allRecentProjectFiles
        .filter(
          file => !games.find(game => game.id === file.fileMetadata.gameId)
        )
        .map(file => ({ projectFiles: [file] }));
      return [...projectFilesWithGame, ...projectFilesWithoutGame];
    },
    [games, allRecentProjectFiles]
  );

  const searchClient = React.useMemo(
    () =>
      new Fuse(allDashboardItems, {
        ...sharedFuseConfiguration,
        keys: [
          { name: 'game.gameName', weight: 1 },
          { name: 'projectFiles.fileMetadata.name', weight: 1 },
        ],
      }),
    [allDashboardItems]
  );

  const [displayedDashboardItems, setDisplayedDashboardItems] = React.useState<
    Array<DashboardItem>
  >(
    getDashboardItemsToDisplay({
      project,
      currentFileMetadata,
      allDashboardItems,
      searchText,
      searchClient,
      currentPage,
      orderBy,
    })
  );

  const getDashboardItemsToDisplayDebounced = useDebounce(
    () => {
      setDisplayedDashboardItems(
        getDashboardItemsToDisplay({
          project,
          currentFileMetadata,
          allDashboardItems,
          searchText,
          searchClient,
          currentPage,
          orderBy,
        })
      );
    },
    // Use debounce when searching for a game.
    // Keep a lower debounce when changing pages so that the UI does not refresh until the
    // user stops changing pages, giving a sense of rapidity.
    searchText ? 250 : 150
  );

  // Refresh games to display, depending on a few parameters.
  React.useEffect(getDashboardItemsToDisplayDebounced, [
    getDashboardItemsToDisplayDebounced,
    searchText, // search text changes (user input)
    games, // games change (when updating a game for instance)
    currentPage, // user changes page
    orderBy, // user changes order
    currentFileMetadata, // opened project changes (when opening or closing a project from here)
    allRecentProjectFiles.length, // list of recent projects changes (when a project is removed from list)
    project, // opened project changes (when closing a project from here)
  ]);

  const projectUuid = project ? project.getProjectUuid() : null;

  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const refreshGamesList = React.useCallback(
    async () => {
      if (isRefreshing) return;
      try {
        setIsRefreshing(true);
        await Promise.all([onCloudProjectsChanged(), onRefreshGames()]);
      } finally {
        // Wait a bit to avoid spam as we don't have a "loading" state.
        setTimeout(() => setIsRefreshing(false), 2000);
      }
    },
    [onCloudProjectsChanged, isRefreshing, onRefreshGames]
  );

  const [
    lastModifiedInfoByProjectId,
    setLastModifiedInfoByProjectId,
  ] = React.useState({});
  // Look at projects where lastCommittedBy is not the current user (cloud projects only), and fetch
  // public profiles of the users that have modified them.
  React.useEffect(
    () => {
      const updateModificationInfoByProjectId = async () => {
        if (!cloudProjects || !profile) return;

        const _lastModifiedInfoByProjectId = await getLastModifiedInfoByProjectId(
          {
            cloudProjects,
            profile,
          }
        );
        setLastModifiedInfoByProjectId(_lastModifiedInfoByProjectId);
      };

      updateModificationInfoByProjectId();
    },
    [cloudProjects, profile]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <Line noMargin justifyContent="space-between">
            <LineStackLayout noMargin alignItems="center">
              <Text size="section-title" noMargin>
                <Trans>Games</Trans>
              </Text>
              {allDashboardItems.length > 0 && (
                <IconButton
                  size="small"
                  onClick={refreshGamesList}
                  disabled={isRefreshing}
                  tooltip={t`Refresh games`}
                >
                  <div style={styles.refreshIconContainer}>
                    <Refresh fontSize="inherit" />
                  </div>
                </IconButton>
              )}
            </LineStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <RaisedButton
                primary
                fullWidth={!canOpen}
                label={
                  isMobile ? (
                    <Trans>Create</Trans>
                  ) : (
                    <Trans>Create new game</Trans>
                  )
                }
                onClick={onOpenNewProjectSetupDialog}
                icon={<Add fontSize="small" />}
                id="home-create-project-button"
                disabled={isUpdatingGame}
              />
              {canOpen && (
                <FlatButton
                  label={
                    isMobile ? (
                      <Trans>Open</Trans>
                    ) : (
                      <Trans>Open a project</Trans>
                    )
                  }
                  onClick={onChooseProject}
                  disabled={isUpdatingGame}
                />
              )}
            </LineStackLayout>
          </Line>
          {allDashboardItems.length > 0 && (
            <ResponsiveLineStackLayout expand noMargin alignItems="center">
              <SearchBarSelectField
                value={orderBy}
                onChange={(e, i, value: string) =>
                  // $FlowFixMe
                  setGamesListOrderBy(value)
                }
              >
                <SelectOption value="lastModifiedAt" label={t`Last modified`} />
                <SelectOption
                  value="totalSessions"
                  label={t`Most sessions (all time)`}
                />
                <SelectOption
                  value="weeklySessions"
                  label={t`Most sessions (past 7 days)`}
                />
              </SearchBarSelectField>
              <Line noMargin expand alignItems="center">
                <Column noMargin expand>
                  <SearchBar
                    value={searchText}
                    onChange={setSearchText}
                    // Search is triggered on each search text change
                    onRequestSearch={() => {}}
                    placeholder={t`Search by name`}
                  />
                </Column>
                <IconButton
                  tooltip={t`Previous page`}
                  onClick={() => setCurrentPage(currentPage => currentPage - 1)}
                  disabled={!!searchText || currentPage === 0}
                  size="small"
                >
                  <ChevronArrowLeft />
                </IconButton>
                <Text
                  noMargin
                  style={{
                    opacity: searchText ? 0.6 : 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {searchText ? 1 : currentPage + 1}
                </Text>
                <IconButton
                  tooltip={t`Next page`}
                  onClick={() => setCurrentPage(currentPage => currentPage + 1)}
                  disabled={
                    !!searchText || (currentPage + 1) * pageSize >= games.length
                  }
                  size="small"
                >
                  <ChevronArrowRight />
                </IconButton>
              </Line>
            </ResponsiveLineStackLayout>
          )}
          {displayedDashboardItems.length > 0 ? (
            displayedDashboardItems
              .map((dashboardItem, index) => {
                const game = dashboardItem.game;
                if (game) {
                  return (
                    <GameCard
                      storageProviders={storageProviders}
                      key={game.id}
                      isCurrentProjectOpened={
                        !!projectUuid && game.id === projectUuid
                      }
                      game={game}
                      onOpenGameManager={() => {
                        onOpenGameId(game.id);
                      }}
                      onOpenProject={onOpenProject}
                      onUnregisterGame={() => onUnregisterGame(game, i18n)}
                      disabled={isUpdatingGame}
                      canSaveProject={canSaveProject}
                      askToCloseProject={askToCloseProject}
                      onSaveProject={onSaveProject}
                    />
                  );
                }
                const projectFiles = dashboardItem.projectFiles;
                if (projectFiles) {
                  const projectFileMetadataAndStorageProviderName =
                    projectFiles[0];
                  return (
                    <ProjectCard
                      projectFileMetadataAndStorageProviderName={
                        projectFileMetadataAndStorageProviderName
                      }
                      key={`${projectFileMetadataAndStorageProviderName
                        .fileMetadata.name || 'project'}-${index}`}
                      storageProviders={storageProviders}
                      onOpenProject={() =>
                        onOpenProject(projectFileMetadataAndStorageProviderName)
                      }
                      lastModifiedInfo={
                        lastModifiedInfoByProjectId[
                          projectFileMetadataAndStorageProviderName.fileMetadata
                            .fileIdentifier
                        ]
                      }
                      isCurrentProjectOpened={
                        !!projectUuid &&
                        projectFileMetadataAndStorageProviderName.fileMetadata
                          .gameId === projectUuid
                      }
                      currentFileMetadata={currentFileMetadata}
                      disabled={isUpdatingGame}
                      closeProject={closeProject}
                      askToCloseProject={askToCloseProject}
                      onRefreshGames={refreshGamesList}
                    />
                  );
                }

                return null;
              })
              .filter(Boolean)
          ) : !!searchText ? (
            <Column expand noMargin>
              <Paper
                variant="outlined"
                background="dark"
                style={styles.noGameMessageContainer}
              >
                <BackgroundText>
                  <Trans>No game matching your search.</Trans>
                </BackgroundText>
              </Paper>
            </Column>
          ) : null}
        </ColumnStackLayout>
      )}
    </I18n>
  );
};

export default GamesList;
