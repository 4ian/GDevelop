// @flow
import * as React from 'react';
import GridList from '@material-ui/core/GridList';
import { GridListTile, Paper } from '@material-ui/core';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import { Skeleton } from '@material-ui/lab';
import Text from '../../../UI/Text';
import './HorizontalScroll.css';
import { Column, Line, Spacer } from '../../../UI/Grid';
import GDevelopThemeContext from '../../../UI/Theme/ThemeContext';

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
  title: string,
  items: ?(
    | Array<YoutubeThumbnail>
    | Array<ShowcaseThumbnail>
    | Array<GameTemplateThumbnail>
  ),
  displayTitleSkeleton?: boolean,
|};

const cellSpacing = 12;
const imageHeight = 180;
const titleHeight = 30;
const spacerSize = 4;
const cellWidth = (16 / 9) * imageHeight;
const widthUnit = cellWidth + cellSpacing;
const arrowWidth = 30;

const styles = {
  container: { width: `calc(100% - ${arrowWidth}px)` },
  title: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
  gridList: { position: 'relative' },
  image: {
    objectFit: 'cover',
    height: imageHeight,
    minHeight: imageHeight,
    width: cellWidth,
  },
  itemTitle: { width: cellWidth, height: titleHeight },
  leftArrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: arrowWidth,
    marginTop: '32px',
  },
  rightArrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'sticky',
    right: '0',
    top: '6px',
    width: arrowWidth,
    backgroundColor: 'rgba(100,100,100,0.8)',
  },
};

const HorizontalScroll = ({
  title,
  items,
  displayTitleSkeleton = true,
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
              style={styles.image}
            />
          </a>
        );
      }
      if (item.imageSource) {
        return <img src={item.imageSource} style={styles.image} />;
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
            <div style={styles.itemTitle}>
              <Text noMargin size="title" style={styles.title}>
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
        currentFirstVisibleItemIndex >
        itemsToDisplay.length - visibleThumbnailsCount - 1
      )
        return 0;
      return roundScroll(
        scrollViewElement.scrollLeft + scale * (direction === 'left' ? -1 : 1),
        scrollViewElement
      );
    },
    [widthUnit, itemsToDisplay]
  );

  const roundScroll = React.useCallback(
    (value: number, scrollViewElement: HTMLUListElement): number => {
      const visibleThumbnailsCount = Math.floor(
        scrollViewElement.offsetWidth / widthUnit
      );

      const scale = visibleThumbnailsCount * widthUnit;
      return Math.round(value / scale) * scale;
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
        left: roundScroll(scrollViewElement.scrollLeft, scrollViewElement),
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
      <div style={styles.leftArrowContainer} onClick={onClickArrow('left')}>
        {!!items && shouldDisplayLeftArrow && <ArrowBackIos />}
      </div>
      <div style={styles.container}>
        <Text size="title">{title}</Text>
        <GridList
          cols={itemsToDisplay.length}
          cellHeight={cellHeight}
          spacing={cellSpacing}
          style={styles.gridList}
          ref={scrollView}
        >
          {itemsToDisplay.map(item => (
            <GridListTile key={computeItemKey(item)}>
              {renderThumbnail(item)}
              {renderItemTitle(item)}
            </GridListTile>
          ))}
          {!!items && (
            <div
              style={{ ...styles.rightArrowContainer, height: cellHeight - 12 }}
              onClick={onClickArrow('right')}
            >
              <ArrowForwardIos htmlColor="white" />
            </div>
          )}
        </GridList>
      </div>
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

export default HorizontalScroll;
