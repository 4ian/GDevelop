// @flow
import * as React from 'react';
import { I18n } from '@lingui/react';
import { ExampleStoreContext } from '../AssetStore/ExampleStore/ExampleStoreContext';
import { ExampleTile } from '../AssetStore/ShopTiles';
import GridList from '@material-ui/core/GridList';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { useResponsiveWindowSize } from '../UI/Responsive/ResponsiveWindowMeasurer';
import { type QuickCustomizationRecommendation } from '../Utils/GDevelopServices/User';
import { selectMessageByLocale } from '../Utils/i18n/MessageByLocale';
import { LARGE_WIDGET_SIZE } from '../MainFrame/EditorContainers/HomePage/CardWidget';

const getColumnsCount = (windowSize: string, isLandscape: boolean) => {
  if (windowSize === 'small') {
    return isLandscape ? 3 : 2;
  } else if (windowSize === 'medium') {
    return 3;
  } else if (windowSize === 'large') {
    return 4;
  } else {
    return 6;
  }
};

const MAX_COLUMNS = getColumnsCount('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const ITEMS_SPACING = 5;
const styles = {
  grid: {
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
};

type Props = {|
  onSelectExampleShortHeader: (
    exampleShortHeader: ExampleShortHeader
  ) => Promise<void>,
  quickCustomizationRecommendation: QuickCustomizationRecommendation,
|};

export const QuickCustomizationGameTiles = ({
  onSelectExampleShortHeader,
  quickCustomizationRecommendation,
}: Props) => {
  const { exampleShortHeaders } = React.useContext(ExampleStoreContext);
  const { windowSize, isLandscape } = useResponsiveWindowSize();
  const columnsCount = getColumnsCount(windowSize, isLandscape);

  const displayedExampleShortHeaders = React.useMemo(
    () => {
      const allQuickCustomizationExampleShortHeaders = exampleShortHeaders
        ? quickCustomizationRecommendation.list
            .map(({ type, exampleSlug, thumbnailTitleByLocale }) => {
              if (type !== 'example') {
                return null;
              }

              const exampleShortHeader = exampleShortHeaders.find(
                exampleShortHeader => exampleShortHeader.slug === exampleSlug
              );
              if (!exampleShortHeader) return null;

              return {
                exampleShortHeader,
                thumbnailTitleByLocale,
              };
            })
            .filter(Boolean)
        : null;

      return allQuickCustomizationExampleShortHeaders;
    },
    [exampleShortHeaders, quickCustomizationRecommendation.list]
  );

  return (
    <I18n>
      {({ i18n }) => (
        <GridList
          cols={columnsCount}
          style={styles.grid}
          cellHeight="auto"
          spacing={ITEMS_SPACING * 2}
        >
          {displayedExampleShortHeaders
            ? displayedExampleShortHeaders.map(
                ({ exampleShortHeader, thumbnailTitleByLocale }) => (
                  <ExampleTile
                    exampleShortHeader={exampleShortHeader}
                    onSelect={() => {
                      onSelectExampleShortHeader(exampleShortHeader);
                    }}
                    customTitle={selectMessageByLocale(
                      i18n,
                      thumbnailTitleByLocale
                    )}
                    key={exampleShortHeader.name}
                    useQuickCustomizationThumbnail
                  />
                )
              )
            : new Array(quickCustomizationRecommendation.list.length)
                .fill(0)
                .map((_, index) => (
                  <ExampleTile
                    exampleShortHeader={null}
                    onSelect={() => {}}
                    key={`skeleton-${index}`}
                  />
                ))}
        </GridList>
      )}
    </I18n>
  );
};
