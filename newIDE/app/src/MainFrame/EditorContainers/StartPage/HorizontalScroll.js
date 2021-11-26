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

const styles = {
  title: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
  image: {
    objectFit: 'cover',
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
  const scrollView = React.useRef(null);
  const itemsToDisplay =
    items ||
    Array(3).fill({
      skeleton: true,
    });
  const cellSpacing = 12;
  const imageHeight = 180;
  const titleHeight = 30;
  const spacerSize = 4;
  let cellHeight = imageHeight;
  if (
    (!items && displayTitleSkeleton) ||
    itemsToDisplay.some(item => Object.keys(item).includes('title'))
  )
    cellHeight += titleHeight + spacerSize;
  const cellWidth = (16 / 9) * imageHeight;
  const arrowWidth = 30;

  const renderThumbnail = (
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
      return <Skeleton variant="rect" height={imageHeight} width={cellWidth} />;
    }
  };

  const renderItemTitle = (
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
          <div style={{ width: cellWidth, height: titleHeight }}>
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
  };

  const computeScroll = (direction: 'left' | 'right'): number => {
    const unit = cellWidth + cellSpacing;
    const visibleThumbnailsVisible = Math.floor(
      scrollView.current.offsetWidth / unit
    );
    const scale = visibleThumbnailsVisible * unit;
    return (
      Math.round(
        (scrollView.current.scrollLeft +
          scale * (direction === 'left' ? -1 : 1)) /
          scale
      ) * scale
    );
  };

  const onClickArrow = (direction: 'left' | 'right') => (): void => {
    const newScrollPosition = computeScroll(direction);
    setShouldDisplayLeftArrow(newScrollPosition !== 0);
    scrollView.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth',
    });
  };

  return (
    <Line noMargin expand>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: arrowWidth,
          marginTop: '32px',
        }}
        onClick={onClickArrow('left')}
      >
        {!!items && shouldDisplayLeftArrow && <ArrowBackIos />}
      </div>
      <div style={{ width: `calc(100% - ${arrowWidth}px)` }}>
        <Text size="title">{title}</Text>
        <GridList
          cols={itemsToDisplay.length}
          cellHeight={cellHeight}
          spacing={cellSpacing}
          style={{ position: 'relative' }}
          ref={scrollView}
        >
          {itemsToDisplay.map(item => (
            <GridListTile>
              {renderThumbnail(item)}
              {renderItemTitle(item)}
            </GridListTile>
          ))}
          {!!items && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'sticky',
                right: '0',
                top: '6px',
                height: cellHeight - 12,
                width: arrowWidth,
                backgroundColor: 'rgba(100,100,100,0.8)',
              }}
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
  const videoId = extractVideoIdFromYoutubeLink(link) || 'null'; // youtube API returns its skeleton if id is not recognized.

  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; // Better quality hqdefault.jpg returns a 4/3 thumbnail that would need croping.
};

export default HorizontalScroll;
