// @flow
import * as React from 'react';
import GridList from '@material-ui/core/GridList';
import { GridListTile, Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import Text from '../../../UI/Text';
import './HorizontalScroll.css';
import { Spacer } from '../../../UI/Grid';
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
  const itemsToDisplay =
    items ||
    Array(5).fill({
      placeholder: true,
      title: null,
    });
  const imageHeight = 180;
  const titleHeight = 30;
  let cellHeight = imageHeight;
  if (itemsToDisplay.some(item => Object.keys(item).includes('title')))
    cellHeight += titleHeight;
  const cellWidth = (16 / 9) * imageHeight;

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
      return (
        <Skeleton
          variant="rectangular"
          height={imageHeight}
          width={cellWidth}
        />
      );
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
            variant="rectangular"
            height={titleHeight}
            width={(cellWidth / 3) * (1 + 2 * Math.random())}
          />
        )}
      </>
    );
  };

  return (
    <>
      <Text size="title">{title}</Text>
      <GridList
        cols={itemsToDisplay.length}
        cellHeight={cellHeight}
        spacing={12}
      >
        {itemsToDisplay.map(item => (
          <GridListTile>
            {renderThumbnail(item)}
            {renderItemTitle(item)}
          </GridListTile>
        ))}
      </GridList>
    </>
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
