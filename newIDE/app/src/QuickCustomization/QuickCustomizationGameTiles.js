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

const styles = {
  grid: {
    margin: 0,
    // Remove the scroll capability of the grid, the scroll view handles it.
    overflow: 'unset',
  },
  cellSpacing: 2,
};

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
          spacing={styles.cellSpacing}
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
