// @flow
import * as React from 'react';
import Fuse from 'fuse.js';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans, t } from '@lingui/macro';
import { type Game } from '../Utils/GDevelopServices/Game';
import GameDashboardCard, {
  getThumbnailWidth,
  type DashboardItem,
} from './GameDashboardCard';
import {
  ColumnStackLayout,
  LineStackLayout,
  ResponsiveLineStackLayout,
} from '../UI/Layout';
import SearchBar from '../UI/SearchBar';
import { useDebounce } from '../Utils/UseDebounce';
import {
  getFuseSearchQueryForMultipleKeys,
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
import {
  getLastModifiedInfoByProjectId,
  useProjectsListFor,
} from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import Refresh from '../UI/CustomSvgIcons/Refresh';
import optionalRequire from '../Utils/OptionalRequire';
import TextButton from '../UI/TextButton';
import Skeleton from '@material-ui/lab/Skeleton';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
const electron = optionalRequire('electron');

const isDesktop = !!electron;

const pageSize = 10;

const styles = {
  noGameMessageContainer: { padding: 10 },
  refreshIconContainer: { fontSize: 20, display: 'flex', alignItems: 'center' },
  gameLoadingSkeleton: {
    // Display a skeleton with the same aspect and border as the game card:
    borderRadius: 8,
  },
};

export type GamesDashboardOrderBy =
  | 'totalSessions'
  | 'weeklySessions'
  | 'lastModifiedAt';

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
  return (item.game && (item.game.updatedAt || 0) * 1000) || 0;
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
  allDashboardItems: ?Array<DashboardItem>,
  searchText: string,
  searchClient: Fuse,
  currentPage: number,
  orderBy: GamesDashboardOrderBy,
|}): ?Array<DashboardItem> => {
  if (!allDashboardItems) return null;
  let itemsToDisplay: DashboardItem[] = allDashboardItems;

  if (searchText) {
    // If there is a search, just return those items, ordered by the search relevance.
    const searchResults = searchClient.search(
      getFuseSearchQueryForMultipleKeys(searchText, [
        'game.gameName',
        'projectFiles.fileMetadata.name',
      ])
    );
    itemsToDisplay = searchResults.map(result => result.item);
  } else {
    // If there is no search, sort the items by the selected order.
    itemsToDisplay =
      orderBy === 'totalSessions'
        ? itemsToDisplay.sort(totalSessionsSort)
        : orderBy === 'weeklySessions'
        ? itemsToDisplay.sort(lastWeekSessionsSort)
        : orderBy === 'lastModifiedAt'
        ? itemsToDisplay.sort(lastModifiedAtSort)
        : itemsToDisplay;

    // If a project is opened, no search is done, and sorted by last modified date,
    // then the opened project should be displayed first.
    if (project && orderBy === 'lastModifiedAt') {
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

    // Finally, if there is no search, paginate the results.
    itemsToDisplay = itemsToDisplay.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }

  return itemsToDisplay;
};

type Props = {|
  storageProviders: Array<StorageProvider>,
  project: ?gdProject,
  currentFileMetadata: ?FileMetadata,
  games: ?Array<Game>,
  onRefreshGames: () => Promise<void>,
  onOpenGameManager: ({
    game: Game,
    widgetToScrollTo?: 'projects',
  }) => void,
  onOpenProject: (file: FileMetadataAndStorageProviderName) => Promise<void>,
  onUnregisterGame: (
    gameId: string,
    i18n: I18nType,
    options?: { skipConfirmation: boolean, throwOnError: boolean }
  ) => Promise<void>,
  onRegisterProject: (
    file: FileMetadataAndStorageProviderName
  ) => Promise<?Game>,
  isUpdatingGame: boolean,
  canOpen: boolean,
  onOpenNewProjectSetupDialog: () => void,
  onChooseProject: () => void,
  closeProject: () => Promise<void>,
  askToCloseProject: () => Promise<boolean>,
  onSaveProject: () => Promise<void>,
  canSaveProject: boolean,
  onDeleteCloudProject: (
    i18n: I18nType,
    file: FileMetadataAndStorageProviderName,
    options?: { skipConfirmation: boolean }
  ) => Promise<void>,
  // Controls
  currentPage: number,
  setCurrentPage: (currentPage: number) => void,
  searchText: string,
  setSearchText: (searchText: string) => void,
|};

const GamesList = ({
  project,
  currentFileMetadata,
  games,
  onRefreshGames,
  onOpenGameManager,
  onOpenProject,
  onUnregisterGame,
  onRegisterProject,
  onDeleteCloudProject,
  isUpdatingGame,
  storageProviders,
  canOpen,
  onOpenNewProjectSetupDialog,
  onChooseProject,
  closeProject,
  askToCloseProject,
  onSaveProject,
  canSaveProject,
  // Make the page controlled, so that it can be saved when navigating to a game.
  currentPage,
  setCurrentPage,
  searchText,
  setSearchText,
}: Props) => {
  const { cloudProjects, profile, onCloudProjectsChanged } = React.useContext(
    AuthenticatedUserContext
  );
  const {
    values: { gamesDashboardOrderBy: orderBy },
    setGamesDashboardOrderBy,
  } = React.useContext(PreferencesContext);

  const { isMobile } = useResponsiveWindowSize();
  const gameThumbnailWidth = getThumbnailWidth({ isMobile });

  const allRecentProjectFiles = useProjectsListFor(null);
  const allDashboardItems: ?(DashboardItem[]) = React.useMemo(
    () => {
      if (!games) return null;
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
      const allItems = [...projectFilesWithGame, ...projectFilesWithoutGame];

      return allItems.filter(
        item =>
          // Filter out draft games which are not the current opened project.
          !(
            item.game &&
            item.game.savedStatus === 'draft' &&
            (!project || item.game.id !== project.getProjectUuid())
          )
      );
    },
    [games, allRecentProjectFiles, project]
  );

  const totalNumberOfPages = allDashboardItems
    ? Math.ceil(allDashboardItems.length / pageSize)
    : 1;
  const onCurrentPageChange = React.useCallback(
    newPage => {
      const minPage = 1;
      const maxPage = totalNumberOfPages;
      if (newPage < minPage) {
        setCurrentPage(minPage);
      } else if (newPage > maxPage) {
        setCurrentPage(maxPage);
      } else {
        setCurrentPage(newPage);
      }
    },
    [setCurrentPage, totalNumberOfPages]
  );

  const searchClient = React.useMemo(
    () =>
      new Fuse(allDashboardItems || [], {
        ...sharedFuseConfiguration,
        keys: [
          { name: 'game.gameName', weight: 1 },
          { name: 'projectFiles.fileMetadata.name', weight: 1 },
        ],
      }),
    [allDashboardItems]
  );

  const [
    displayedDashboardItems,
    setDisplayedDashboardItems,
  ] = React.useState<?Array<DashboardItem>>(
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

  React.useEffect(
    getDashboardItemsToDisplayDebounced,
    // Refresh games to display, depending on a few parameters.
    [
      getDashboardItemsToDisplayDebounced,
      searchText, // search text changes (user input)
      games, // games change (when updating a game for instance)
      currentPage, // user changes page
      orderBy, // user changes order
      currentFileMetadata, // opened project changes (when opening or closing a project from here)
      allRecentProjectFiles.length, // list of recent projects changes (when a project is removed from list)
      project, // opened project changes (when closing a project from here)
    ]
  );

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

  React.useEffect(
    () => {
      // Look at projects where lastCommittedBy is not the current user (cloud projects only), and fetch
      // public profiles of the users that have modified them.
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

  React.useEffect(
    () => {
      // Reset pagination when modifying the sorting order.
      setCurrentPage(1);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderBy]
  );

  const shouldShowOpenProject =
    canOpen &&
    // Only show on large screens.
    !isMobile &&
    // Only show on desktop as otherwise, cloud projects are the only ones that can be opened.
    isDesktop;

  return (
    <I18n>
      {({ i18n }) => (
        <ColumnStackLayout noMargin>
          <Line noMargin justifyContent="space-between">
            <LineStackLayout noMargin alignItems="center">
              <Text size="section-title" noMargin>
                <Trans>Games</Trans>
              </Text>
              <IconButton
                size="small"
                onClick={refreshGamesList}
                disabled={
                  isRefreshing ||
                  !allDashboardItems ||
                  !allDashboardItems.length
                }
                tooltip={t`Refresh games`}
              >
                <div style={styles.refreshIconContainer}>
                  <Refresh fontSize="inherit" />
                </div>
              </IconButton>
            </LineStackLayout>
            <LineStackLayout noMargin alignItems="center">
              <RaisedButton
                primary
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
              {shouldShowOpenProject && (
                <TextButton
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
          {allDashboardItems && allDashboardItems.length > 0 && (
            <ResponsiveLineStackLayout
              expand
              noMargin
              alignItems="center"
              noResponsiveLandscape
            >
              <Column noMargin expand>
                <SearchBar
                  value={searchText}
                  onChange={setSearchText}
                  // Search is triggered on each search text change
                  onRequestSearch={() => {}}
                  placeholder={t`Search by name`}
                />
              </Column>
              <Line noMargin justifyContent="space-between">
                <SearchBarSelectField
                  value={orderBy}
                  onChange={(e, i, value: string) =>
                    // $FlowFixMe
                    setGamesDashboardOrderBy(value)
                  }
                >
                  <SelectOption
                    value="lastModifiedAt"
                    label={t`Last modified`}
                  />
                  <SelectOption
                    value="totalSessions"
                    label={t`Most sessions (all time)`}
                  />
                  <SelectOption
                    value="weeklySessions"
                    label={t`Most sessions (past 7 days)`}
                  />
                </SearchBarSelectField>
                <Line
                  noMargin
                  expand
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <IconButton
                    tooltip={t`Previous page`}
                    onClick={() => onCurrentPageChange(currentPage - 1)}
                    disabled={!!searchText || currentPage === 1}
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
                    {searchText || totalNumberOfPages === 1
                      ? 1
                      : `${currentPage}/${totalNumberOfPages}`}
                  </Text>
                  <IconButton
                    tooltip={t`Next page`}
                    onClick={() => onCurrentPageChange(currentPage + 1)}
                    disabled={!!searchText || currentPage >= totalNumberOfPages}
                    size="small"
                  >
                    <ChevronArrowRight />
                  </IconButton>
                </Line>
              </Line>
            </ResponsiveLineStackLayout>
          )}
          {!displayedDashboardItems &&
            Array.from({ length: pageSize }).map((_, i) => (
              <Line key={i} expand>
                <Skeleton
                  variant="rect"
                  height={
                    gameThumbnailWidth
                      ? (gameThumbnailWidth * 9) / 16
                      : (window.innerWidth * 9) / 16
                  }
                  width="100%"
                  style={styles.gameLoadingSkeleton}
                />
              </Line>
            ))}
          {displayedDashboardItems && displayedDashboardItems.length > 0 ? (
            displayedDashboardItems
              .map((dashboardItem, index) => {
                const game = dashboardItem.game;
                const projectFileMetadataAndStorageProviderName = dashboardItem.projectFiles
                  ? dashboardItem.projectFiles[0]
                  : null;

                const key = game
                  ? game.id
                  : projectFileMetadataAndStorageProviderName
                  ? `${projectFileMetadataAndStorageProviderName.fileMetadata
                      .name || 'project'}-${index}`
                  : '';
                const isCurrentProjectOpened =
                  (!!projectUuid && (!!game && game.id === projectUuid)) ||
                  (!!projectFileMetadataAndStorageProviderName &&
                    !!currentFileMetadata &&
                    projectFileMetadataAndStorageProviderName.fileMetadata
                      .gameId === projectUuid &&
                    projectFileMetadataAndStorageProviderName.fileMetadata
                      .fileIdentifier === currentFileMetadata.fileIdentifier);

                return (
                  <GameDashboardCard
                    key={key}
                    dashboardItem={dashboardItem}
                    storageProviders={storageProviders}
                    isCurrentProjectOpened={isCurrentProjectOpened}
                    onOpenGameManager={onOpenGameManager}
                    onOpenProject={onOpenProject}
                    onUnregisterGame={async () => {
                      if (!game) return;
                      await onUnregisterGame(game.id, i18n, {
                        // Unregistering is done as part of the project deletion, so no need to ask for extra confirmation.
                        skipConfirmation: true,
                        // Ensure we throw to stop the project deletion if an error occurs.
                        throwOnError: true,
                      });
                    }}
                    onRegisterProject={onRegisterProject}
                    disabled={isUpdatingGame}
                    canSaveProject={canSaveProject}
                    askToCloseProject={askToCloseProject}
                    closeProject={closeProject}
                    onSaveProject={onSaveProject}
                    lastModifiedInfoByProjectId={lastModifiedInfoByProjectId}
                    currentFileMetadata={currentFileMetadata}
                    onRefreshGames={refreshGamesList}
                    onDeleteCloudProject={async (
                      file: FileMetadataAndStorageProviderName
                    ) => {
                      await onDeleteCloudProject(i18n, file, {
                        skipConfirmation: true,
                      });
                    }}
                  />
                );
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
