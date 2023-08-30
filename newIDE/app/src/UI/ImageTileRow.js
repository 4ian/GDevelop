// @flow
import * as React from 'react';
import { Column, Line } from './Grid';
import Text from './Text';
import { LineStackLayout } from './Layout';
import FlatButton from './FlatButton';
import { Trans } from '@lingui/macro';
import ImageTileGrid, { type ImageTileComponent } from './ImageTileGrid';
import {
  useResponsiveWindowWidth,
  type WidthType,
} from './Reponsive/ResponsiveWindowMeasurer';

type ImageTileRowProps = {|
  title: React.Node,
  isLoading?: boolean,
  description?: React.Node,
  items: Array<ImageTileComponent>,
  onShowAll: () => void,
  showAllIcon: React.Node,
  getLimitFromWidth: (width: WidthType) => number,
  getColumnsFromWidth: (width: WidthType) => number,
  seeAllLabel?: React.Node,
|};

const ImageTileRow = ({
  title,
  description,
  isLoading,
  items,
  onShowAll,
  showAllIcon,
  getLimitFromWidth,
  getColumnsFromWidth,
  seeAllLabel,
}: ImageTileRowProps) => {
  const windowWidth = useResponsiveWindowWidth();
  const isMobileScreen = windowWidth === 'small';
  return (
    <>
      <LineStackLayout
        justifyContent="space-between"
        alignItems="center"
        noMargin
        expand
      >
        <Column noMargin>
          <Text size="section-title">{title}</Text>
        </Column>
        <Column noMargin>
          <FlatButton
            onClick={onShowAll}
            label={
              isMobileScreen ? (
                <Trans>Browse</Trans> // Short label on mobile.
              ) : (
                seeAllLabel || <Trans>See all</Trans>
              )
            }
            rightIcon={showAllIcon}
          />
        </Column>
      </LineStackLayout>
      {description && (
        <Line noMargin>
          <Text noMargin>{description}</Text>
        </Line>
      )}
      <ImageTileGrid
        items={items}
        isLoading={isLoading}
        getLimitFromWidth={getLimitFromWidth}
        getColumnsFromWidth={getColumnsFromWidth}
      />
    </>
  );
};

export default ImageTileRow;
