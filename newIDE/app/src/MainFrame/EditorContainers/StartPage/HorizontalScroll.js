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

type ShowcaseThumbnail = {|
  title: string,
  imageSource: string,
|};

type GameTemplateThumbnail = {|
  title: string,
  imageSource: string,
|};

type PlaceholderThumbnail = {|
  placeholder: boolean,
|};

type Props = {|
  title: string,
  items: ?(
    | Array<YoutubeThumbnail>
    | Array<ShowcaseThumbnail>
    | Array<GameTemplateThumbnail>
  ),
  onClickItem?: () => void,
|};

const styles = {
  title: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
};

const HorizontalScroll = ({ title, items }: Props) => {
  const theme = React.useContext(GDevelopThemeContext);
  const scrollView = React.useRef(null);
  const itemsToDisplay =
    items ||
    Array(5).fill({
      placeholder: true,
      title: null,
    });
  const cellSpacing = 12;
  const imageHeight = 180;
  const titleHeight = 30;
  let cellHeight = imageHeight;
  if (itemsToDisplay.some(item => Object.keys(item).includes('title')))
    cellHeight += titleHeight;
  const cellWidth = (16 / 9) * imageHeight;
  const arrowWidth = '30px';

  const renderThumbnail = (
    item:
      | YoutubeThumbnail
      | GameTemplateThumbnail
      | ShowcaseThumbnail
      | PlaceholderThumbnail
  ): ?React.Node => {
    if (!item.link && !item.imageSource && !item.placeholder) return null;
    if (item.link) {
      return (
        <a href={item.link} target="_blank">
          <img
            width={cellWidth}
            src={constructImageLinkFromYoutubeLink(item.link)}
          />
        </a>
      );
    }
    if (item.imageSource) {
      return <img width={cellWidth} src={item.imageSource} />;
    }
    if (item.placeholder) {
      return <Skeleton variant="rect" height={imageHeight} width={cellWidth} />;
    }
  };

  const renderItemTitle = (
    item:
      | YoutubeThumbnail
      | GameTemplateThumbnail
      | ShowcaseThumbnail
      | PlaceholderThumbnail
  ): ?React.Node => {
    if (!item.title && !item.placeholder) return null;
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
    const unit = 2 * (cellWidth + cellSpacing);
    return (
      Math.round(
        (scrollView.current.scrollLeft +
          unit * (direction === 'left' ? -1 : 1)) /
          unit
      ) * unit
    );
  };

  const onClickArrow = (direction: 'left' | 'right') => (): void => {
    scrollView.current.scrollTo({
      left: computeScroll(direction),
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
        <ArrowBackIos />
      </div>
      <div style={{ width: `calc(100% - ${arrowWidth})` }}>
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

export default HorizontalScroll;
