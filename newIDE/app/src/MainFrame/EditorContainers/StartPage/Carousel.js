// @flow
import * as React from 'react';
import GridList from '@material-ui/core/GridList';
import { GridListTile, Paper } from '@material-ui/core';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import { Skeleton } from '@material-ui/lab';
import Text from '../../../UI/Text';
import './Carousel.css';
import { Column, Line, Spacer } from '../../../UI/Grid';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';
import { useResponsiveWindowWidth } from '../../../UI/Reponsive/ResponsiveWindowMeasurer';
import { Trans } from '@lingui/macro';

export type YoutubeThumbnail = {|
  link: string,
|};

export type ShowcaseThumbnail = {|
  title: string,
  imageSource: string,
|};

type GameTemplateThumbnail = {|
  title: string,
  imageSource: string,
|};

type SkeletonThumbnail = {|
  skeleton: boolean,
  key: string,
|};

type Props = {|
  title: React.Node,
  items: ?(
    | Array<YoutubeThumbnail>
    | Array<ShowcaseThumbnail>
    | Array<GameTemplateThumbnail>
  ),
  displayTitleSkeleton?: boolean,
  tabIndexOffset?: number,
|};

const referenceSizesByWindowSize = {
  imageHeight: {
    small: 130,
    medium: 150,
    large: 180,
  },
  arrowWidth: {
    small: 24,
    medium: 30,
    large: 36,
  },
};

const cellSpacing = 12;
const titleHeight = 30;
const spacerSize = 4;
const rightArrowMargin = 6; // Necessary because MUI adds a -6 margin to GridList

const styles = {
  itemTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
  gridList: { position: 'relative' },
  image: {
    objectFit: 'cover',
  },
  itemTitleContainer: { height: titleHeight },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
};

const Carousel = ({
  title,
  items,
  displayTitleSkeleton = true,
  tabIndexOffset = 0,
}: Props) => {
  const theme = React.useContext(GDevelopThemeContext);
  const [
    shouldDisplayLeftArrow,
    setShouldDisplayLeftArrow,
  ] = React.useState<boolean>(false);
  const scrollView = React.useRef<?HTMLUListElement>(null);
  const itemsToDisplay =
    items ||
    Array(3)
      .fill({
        skeleton: true,
      })
      .map((item, index) => ({ ...item, key: `key${index}` }));

  const windowSize = useResponsiveWindowWidth();
  const imageHeight = referenceSizesByWindowSize.imageHeight[windowSize];
  const arrowWidth = referenceSizesByWindowSize.arrowWidth[windowSize];
  const cellWidth = (16 / 9) * imageHeight;
  const widthUnit = cellWidth + cellSpacing;

  let cellHeight = imageHeight;
  if (
    (!items && displayTitleSkeleton) ||
    itemsToDisplay.some(item => Object.keys(item).includes('title'))
  )
    cellHeight += titleHeight + spacerSize;

  const renderThumbnail = React.useCallback(
    (
      item:
        | YoutubeThumbnail
        | GameTemplateThumbnail
        | ShowcaseThumbnail
        | SkeletonThumbnail
    ): ?React.Node => {
      if (!item.link && !item.imageSource && !item.skeleton) return null;
      if (item.link) {
        return (
          <a href={item.link} target="_blank">
            <img
              src={constructImageLinkFromYoutubeLink(item.link)}
              style={{
                ...styles.image,
                height: imageHeight,
                minHeight: imageHeight,
                width: cellWidth,
              }}
            />
          </a>
        );
      }
      if (item.imageSource) {
        return (
          <img
            src={item.imageSource}
            style={{
              ...styles.image,
              height: imageHeight,
              minHeight: imageHeight,
              width: cellWidth,
            }}
          />
        );
      }
      if (item.skeleton) {
        return (
          <Skeleton variant="rect" height={imageHeight} width={cellWidth} />
        );
      }
    },
    [cellWidth, imageHeight]
  );

  const renderItemTitle = React.useCallback(
    (
      item:
        | YoutubeThumbnail
        | GameTemplateThumbnail
        | ShowcaseThumbnail
        | SkeletonThumbnail
    ): ?React.Node => {
      if (!(item.title || (item.skeleton && displayTitleSkeleton))) return null;
      return (
        <>
          <Spacer />
          {item.title ? (
            <div style={{ ...styles.itemTitleContainer, width: cellWidth }}>
              <Text noMargin style={styles.itemTitle}>
                {item.title}
              </Text>
            </div>
          ) : (
            <Skeleton
              variant="rect"
              height={titleHeight}
              width={(cellWidth / 3) * (1 + 2 * Math.random())}
            />
          )}
        </>
      );
    },
    [cellWidth, titleHeight]
  );

  const computeScroll = React.useCallback(
    (
      direction: 'left' | 'right',
      scrollViewElement: HTMLUListElement
    ): number => {
      const visibleThumbnailsCount = Math.floor(
        scrollViewElement.offsetWidth / widthUnit
      );
      const scale = visibleThumbnailsCount * widthUnit;

      const currentScroll = scrollViewElement.scrollLeft;
      const currentFirstVisibleItemIndex = currentScroll / widthUnit;

      if (
        direction === 'right' &&
        currentFirstVisibleItemIndex >
          itemsToDisplay.length - visibleThumbnailsCount - 1
      )
        return 0;
      return roundScroll(
        scrollViewElement.scrollLeft + scale * (direction === 'left' ? -1 : 1)
      );
    },
    [widthUnit, itemsToDisplay]
  );

  const roundScroll = React.useCallback(
    (value: number): number => {
      return Math.round(value / widthUnit) * widthUnit;
    },
    [widthUnit]
  );

  const onClickArrow = (direction: 'left' | 'right') =>
    React.useCallback(
      (): void => {
        const scrollViewElement = scrollView.current;
        if (!scrollViewElement) return;
        const newScrollPosition = computeScroll(direction, scrollViewElement);

        scrollViewElement.scrollTo({
          left: newScrollPosition,
          behavior: 'smooth',
        });
      },
      [computeScroll]
    );

  const handleScroll = React.useCallback(() => {
    const scrollViewElement = scrollView.current;
    if (!scrollViewElement) return;

    if (!shouldDisplayLeftArrow)
      setShouldDisplayLeftArrow(scrollViewElement.scrollLeft !== 0);
  });
  const handleScrollEnd = React.useCallback(
    () => {
      const scrollViewElement = scrollView.current;
      if (!scrollViewElement) return;

      scrollViewElement.scrollTo({
        left: roundScroll(scrollViewElement.scrollLeft),
        behavior: 'smooth',
      });
    },
    [roundScroll]
  );

  React.useEffect(() => {
    const scrollViewElement = scrollView.current;
    if (!scrollViewElement) return;

    scrollViewElement.addEventListener('scroll', handleScroll);
    scrollViewElement.addEventListener('touchend', handleScrollEnd);
    scrollViewElement.addEventListener('touchleave', handleScrollEnd);
  }, []);

  return (
    <Line noMargin expand>
      <div
        style={{ ...styles.arrowContainer, width: arrowWidth }}
        onClick={onClickArrow('left')}
      >
        {!!items && shouldDisplayLeftArrow && <ArrowBackIos />}
      </div>
      <div
        style={{
          width: `calc(100% - ${2 * arrowWidth}px - ${rightArrowMargin}px)`,
        }}
      >
        <Line noMargin justifyContent="space-between" alignItems="center">
          <Text size="bold-title">{title}</Text>
          {/* TODO: Add a tab index to this text for accessibility purposes */}
          <Text size="body2">
            <Trans>Browse all</Trans>
          </Text>
        </Line>
        <GridList
          cols={itemsToDisplay.length}
          cellHeight={cellHeight}
          spacing={cellSpacing}
          style={styles.gridList}
          ref={scrollView}
        >
          {itemsToDisplay.map((item, index) => (
            <GridListTile
              key={computeItemKey(item)}
              tabIndex={!items ? -1 : index + tabIndexOffset}
            >
              {renderThumbnail(item)}
              {renderItemTitle(item)}
            </GridListTile>
          ))}
        </GridList>
      </div>
      {!!items && (
        <div
          style={{
            ...styles.arrowContainer,
            width: arrowWidth,
            marginLeft: rightArrowMargin,
          }}
          onClick={onClickArrow('right')}
        >
          <ArrowForwardIos />
        </div>
      )}
    </Line>
  );
};

const extractVideoIdFromYoutubeLink = (link: string): ?string => {
  const url = new URL(link);
  const params = url.searchParams;
  return params.get('v') || null;
};

const constructImageLinkFromYoutubeLink = (link: string): string => {
  const videoId = extractVideoIdFromYoutubeLink(link) || 'null'; // youtube API returns its placeholder if id is not recognized.

  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; // Better quality hqdefault.jpg returns a 4/3 thumbnail that would need croping.
};

const computeItemKey = (
  item:
    | YoutubeThumbnail
    | SkeletonThumbnail
    | GameTemplateThumbnail
    | ShowcaseThumbnail
): string => {
  if (item.link) return item.link;
  if (item.imageSource) return item.imageSource;
  if (item.key) return item.key;
  return 'key';
};

export default Carousel;
