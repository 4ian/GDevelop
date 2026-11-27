// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import { Trans } from '@lingui/macro';
import GridList from '@material-ui/core/GridList';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { type PrivateGameTemplateListingData } from '../Utils/GDevelopServices/Shop';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { PrivateGameTemplateStoreContext } from '../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import {
  sendExampleDetailsOpened,
  sendGameTemplateInformationOpened,
} from '../Utils/Analytics/EventSender';
import { formatItemForGrid } from '../MainFrame/EditorContainers/HomePage/CreateSection/utils';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { ColumnStackLayout, LineStackLayout } from '../UI/Layout';
import BackgroundText from '../UI/BackgroundText';
import FlatButton from '../UI/FlatButton';
import EmptyProjectTile from './EmptyProjectTile';
import { getItemsColumns } from './NewProjectSetupDialog';
import {
  filterExamples,
  filterGameTemplates,
  isLinkedToStartingPointExampleShortHeader,
  orderProjectTemplatesForBrowsing,
  orderProjectTemplatesForSearch,
  type ProjectTemplate,
  type TemplateComplexity,
  type TemplateType,
} from './ProjectTemplatesOrdering';

const ITEMS_SPACING = 5;
const ROWS_COUNT_PER_PAGE = 6;
const styles = {
  grid: {
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

type Props = {|
  onSelectEmptyProject: () => void,
  onSelectExampleShortHeader: ExampleShortHeader => void,
  onSelectPrivateGameTemplateListingData: PrivateGameTemplateListingData => void,
  i18n: I18nType,
  templateTypes: Set<TemplateType>,
  complexities: Set<TemplateComplexity>,
  disabled?: boolean,
|};

const ProjectTemplatesList = ({
  onSelectEmptyProject,
  onSelectExampleShortHeader,
  onSelectPrivateGameTemplateListingData,
  i18n,
  templateTypes,
  complexities,
  disabled,
}: Props): React.Node => {
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  const columnsCount = getItemsColumns(windowSize, isLandscape);
  const { receivedGameTemplates } = React.useContext(AuthenticatedUserContext);
  const {
    exampleShortHeaders: allExampleShortHeaders,
    exampleShortHeadersSearchResults,
    fetchExamplesAndFilters,
    searchText,
  } = React.useContext(ExampleStoreContext);
  const {
    fetchGameTemplates,
    exampleStore: { privateGameTemplateListingDatasSearchResults },
  } = React.useContext(PrivateGameTemplateStoreContext);

  // Load examples and game templates on mount.
  React.useEffect(
    () => {
      fetchGameTemplates();
      fetchExamplesAndFilters();
    },
    [fetchGameTemplates, fetchExamplesAndFilters]
  );

  const isSearching = !!searchText;
  const hasFilters = templateTypes.size > 0 || complexities.size > 0;
  const shouldShowEmptyProject = !isSearching && !hasFilters;

  const projectTemplates: Array<ProjectTemplate> = React.useMemo(
    () => {
      const examples = filterExamples(
        (exampleShortHeadersSearchResults || []).filter(
          ({ item }) =>
            !allExampleShortHeaders ||
            !isLinkedToStartingPointExampleShortHeader(
              allExampleShortHeaders,
              item
            )
        ),
        templateTypes,
        complexities
      );
      const gameTemplates = filterGameTemplates(
        privateGameTemplateListingDatasSearchResults || [],
        templateTypes,
        complexities
      );
      if (isSearching) {
        return orderProjectTemplatesForSearch({ examples, gameTemplates });
      }

      const isOwned = (gameTemplate: PrivateGameTemplateListingData) =>
        !!receivedGameTemplates &&
        receivedGameTemplates.some(
          receivedGameTemplate => receivedGameTemplate.id === gameTemplate.id
        );
      const allGameTemplates = gameTemplates.map(({ item }) => item);
      return orderProjectTemplatesForBrowsing({
        examples: examples.map(({ item }) => item),
        // Show the owned game templates first.
        gameTemplates: [
          ...allGameTemplates.filter(isOwned),
          ...allGameTemplates.filter(gameTemplate => !isOwned(gameTemplate)),
        ],
        // The starters fill the first 2 rows, with the empty project tile.
        firstStartersCount: columnsCount * 2 - (shouldShowEmptyProject ? 1 : 0),
      });
    },
    [
      exampleShortHeadersSearchResults,
      allExampleShortHeaders,
      privateGameTemplateListingDatasSearchResults,
      templateTypes,
      complexities,
      isSearching,
      receivedGameTemplates,
      columnsCount,
      shouldShowEmptyProject,
    ]
  );

  const [displayedRowsCount, setDisplayedRowsCount] = React.useState(
    ROWS_COUNT_PER_PAGE
  );
  const maxTemplatesCount =
    displayedRowsCount * columnsCount - (shouldShowEmptyProject ? 1 : 0);
  const displayedProjectTemplates = projectTemplates.slice(
    0,
    maxTemplatesCount
  );

  if (!shouldShowEmptyProject && projectTemplates.length === 0) {
    return (
      <BackgroundText>
        <Trans>No results returned for your search. Try something else!</Trans>
      </BackgroundText>
    );
  }

  return (
    <ColumnStackLayout noMargin>
      <GridList
        cols={columnsCount}
        style={styles.grid}
        cellHeight="auto"
        spacing={ITEMS_SPACING * 2}
      >
        {shouldShowEmptyProject && (
          <EmptyProjectTile
            onSelectEmptyProject={onSelectEmptyProject}
            disabled={disabled}
          />
        )}
        {displayedProjectTemplates.map(projectTemplate =>
          formatItemForGrid({
            item: projectTemplate,
            onSelectGameTemplate: privateGameTemplateListingData => {
              const priceForUsageType = privateGameTemplateListingData.prices.find(
                price => price.usageType === 'default'
              );
              sendGameTemplateInformationOpened({
                gameTemplateName: privateGameTemplateListingData.name,
                gameTemplateId: privateGameTemplateListingData.id,
                source: 'examples-list',
                priceValue: priceForUsageType && priceForUsageType.value,
                priceCurrency: priceForUsageType && priceForUsageType.currency,
              });
              onSelectPrivateGameTemplateListingData(
                privateGameTemplateListingData
              );
            },
            onSelectExample: exampleShortHeader => {
              sendExampleDetailsOpened(exampleShortHeader.slug);
              onSelectExampleShortHeader(exampleShortHeader);
            },
            i18n,
            receivedGameTemplates,
            disabled,
          })
        )}
      </GridList>
      {projectTemplates.length > maxTemplatesCount && (
        <LineStackLayout justifyContent="center">
          <FlatButton
            primary
            label={<Trans>Show more</Trans>}
            onClick={() =>
              setDisplayedRowsCount(displayedRowsCount + ROWS_COUNT_PER_PAGE)
            }
            disabled={disabled}
          />
        </LineStackLayout>
      )}
    </ColumnStackLayout>
  );
};

export default ProjectTemplatesList;
