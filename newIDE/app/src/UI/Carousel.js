// @flow
import * as React from 'react';
import { makeStyles, createStyles } from '@material-ui/styles';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import ArrowBackIos from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIos from '@material-ui/icons/ArrowForwardIos';
import ListOutlined from '@material-ui/icons/ListOutlined';
import Skeleton from '@material-ui/lab/Skeleton';

import Window from '../Utils/Window';
import Text from './Text';
import { Line, Spacer } from './Grid';
import { useResponsiveWindowWidth } from './Reponsive/ResponsiveWindowMeasurer';
import FlatButton from './FlatButton';
import { shouldValidate } from './KeyboardShortcuts/InteractionKeys';
import AlertMessage from './AlertMessage';

type Thumbnail = {
  id: string,
  title: string,
  thumbnailUrl: string,
  +link?: string,
  +onClick?: () => void,
};

type SkeletonThumbnail = {
  ...Thumbnail,
  skeleton: boolean,
};

type Props<ThumbnailType> = {|
  title: React.Node,
  items: ?Array<ThumbnailType>,
  additionalAction?: React.Node,
  onBrowseAllClick?: () => void,
  browseAllLink?: string,
  browseAllLabel: React.Node,
  displayItemTitles?: boolean,
  error?: React.Node,
|};

const referenceSizesByWindowSize = {
  imageHeight: {
    small: 120,
    medium: 130,
    large: 140,
  },
  arrowWidth: {
    small: 24,
    medium: 30,
    large: 36,
  },
};

const cellSpacing = 12;
const titleHeight = 24;
const spacerSize = 4;
const focusItemBorderWidth = 2;
const rightArrowMargin = cellSpacing / 2; // Necessary because MUI adds a margin to GridList corresponding to cell spacing
const skeletonNumber = 4;
const randomNumbers = Array(skeletonNumber)
  .fill(0)
  .map(e => Math.random());

const styles = {
  itemTitle: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    overflowWrap: 'break-word',
    whiteSpace: 'nowrap',
  },
  gridList: { position: 'relative' },
  image: {
    display: 'block',
    objectFit: 'cover',
  },
  error: { display: 'flex', justifyContent: 'center', alignItems: 'center' },
  itemTitleContainer: { height: titleHeight },
  arrowContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
};

const useStylesForGridList = makeStyles({
  root: {
    overflowX: 'scroll',
    overflowY: 'hidden',
    flexWrap: 'nowrap',
    scrollbarWidth: 'none' /* For Firefox */,
    '-ms-overflow-style': 'none' /* For Internet Explorer and Edge */,
    '&::-webkit-scrollbar': {
      height: 0 /* For Chrome, Safari, and Opera */,
    },
  },
});

const useStylesForGridListItem = makeStyles(theme =>
  createStyles({
    root: {
      width: 'unset !important',
      '&:focus': {
        border: `${focusItemBorderWidth}px solid ${theme.palette.primary.main}`,
        outline: 'none',
      },
      '&:focus-visible': { outline: 'unset' },
    },
    tile: {
      display: 'flex',
      flexDirection: 'column',
    },
  })
);

const useStylesForLeftArrow = makeStyles({
  arrow: { '& > path': { transform: 'translate(5px, 0px)' } }, // Translate path inside SVG since MUI icon is not centered
});

const Carousel = <ThumbnailType: Thumbnail>({
  title,
  items,
  additionalAction,
  browseAllLink,
  onBrowseAllClick,
  browseAllLabel,
  error,
  displayItemTitles = true,
}: Props<ThumbnailType>) => {
  const [
    shouldDisplayLeftArrow,
    setShouldDisplayLeftArrow,
  ] = React.useState<boolean>(false);
  const classesForGridList = useStylesForGridList();
  const classesForGridListItem = useStylesForGridListItem();
  const classesForLeftArrow = useStylesForLeftArrow();
  const scrollView = React.useRef<?HTMLUListElement>(null);
  const [hoveredElement, setHoveredElement] = React.useState<?HTMLElement>(
    null
  );
  const areItemsSet = items && items.length > 0;
  const itemsToDisplay =
    items && items.length > 0
      ? items
      : Array(skeletonNumber)
          .fill({
            skeleton: true,
            title: '',
            thumbnail: '',
          })
          .map((item, index) => ({ ...item, id: `skeleton${index}` }));

  const windowSize = useResponsiveWindowWidth();
  const imageHeight = referenceSizesByWindowSize.imageHeight[windowSize];
  const arrowWidth = referenceSizesByWindowSize.arrowWidth[windowSize];
  const cellWidth = (16 / 9) * imageHeight;
  const widthUnit = cellWidth + cellSpacing;

  const cellHeight =
    imageHeight +
    (displayItemTitles ? titleHeight + spacerSize : 2 * focusItemBorderWidth); // Take focus border into account to make sure it is not cut (box-sizing: content-box not working)

  const renderImage = React.useCallback(
    (item: ThumbnailType | SkeletonThumbnail): React.Node => (
      <img
        src={item.thumbnailUrl}
        style={{
          ...styles.image,
          height: imageHeight,
          minHeight: imageHeight,
          width: cellWidth,
        }}
        alt={item.title}
        title={item.title}
      />
    ),
    [cellWidth, imageHeight]
  );

  const openLinkCallback = (link: string): (() => void) => (): void => {
    Window.openExternalURL(link);
  };

  const renderThumbnail = React.useCallback(
    (item: ThumbnailType | SkeletonThumbnail): ?React.Node => {
      if (!item.skeleton && !item.link && !item.thumbnailUrl) return null;
      if (item.thumbnailUrl || item.link) {
        return renderImage(item);
      }
      if (item.skeleton) {
        return (
          <Skeleton variant="rect" height={imageHeight} width={cellWidth} />
        );
      }
    },
    [renderImage, cellWidth, imageHeight]
  );

  const renderItemTitle = React.useCallback(
    (item: ThumbnailType | SkeletonThumbnail, index: number): ?React.Node => {
      if (!displayItemTitles) return null;
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
              width={(cellWidth / 3) * (1 + 2 * randomNumbers[index])} // Make rectangles of different lengths so that the UI feels more "alive".
            />
          )}
        </>
      );
    },
    [cellWidth, displayItemTitles]
  );

  const roundScroll = React.useCallback(
    (value: number): number => {
      return Math.round(value / widthUnit) * widthUnit;
    },
    [widthUnit]
  );

  const getVisibleThumbnailsCount = React.useCallback(
    (element: HTMLElement): number =>
      Math.max(Math.floor(element.offsetWidth / widthUnit), 1),
    [widthUnit]
  );

  const computeScroll = React.useCallback(
    (
      direction: 'left' | 'right',
      scrollViewElement: HTMLUListElement
    ): number => {
      const visibleThumbnailsCount = getVisibleThumbnailsCount(
        scrollViewElement
      );
      const scale = visibleThumbnailsCount * widthUnit;

      const currentScroll = scrollViewElement.scrollLeft;
      const currentFirstVisibleItemIndex = Math.round(
        currentScroll / widthUnit
      );

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
    [widthUnit, itemsToDisplay, roundScroll, getVisibleThumbnailsCount]
  );

  const onClickArrow = React.useCallback(
    (direction: 'left' | 'right') => (): void => {
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

  const handleScroll = React.useCallback(
    (): void => {
      const scrollViewElement = scrollView.current;
      if (!scrollViewElement) return;

      if (!shouldDisplayLeftArrow)
        setShouldDisplayLeftArrow(scrollViewElement.scrollLeft !== 0);
    },
    [shouldDisplayLeftArrow]
  );

  const handleScrollEnd = React.useCallback(
    (): void => {
      const scrollViewElement = scrollView.current;
      if (!scrollViewElement) return;

      scrollViewElement.scrollTo({
        left: roundScroll(scrollViewElement.scrollLeft),
        behavior: 'smooth',
      });
    },
    [roundScroll]
  );

  const onFocusItem = React.useCallback(
    (event: SyntheticFocusEvent<HTMLLIElement>, index: number): void => {
      // Clicked element receives focus before click event is triggered.
      // If a scroll occurs before onmouseup event and the element is scrolled out
      // of the cursor, the click of the user is logically but wrongly ignored.
      if (event.currentTarget !== hoveredElement) {
        const element = event.currentTarget;
        const parent = element.offsetParent;
        if (!parent || !(parent instanceof HTMLElement)) return;

        const visibleThumbnailsCount = getVisibleThumbnailsCount(parent);

        // Browsers handle differently a focus on an out-of-sight element.
        // To ensure the behavior is the same across all browsers, we compute
        // the scroll value to reach to make the tab navigation pleasant.
        const elementBoundingRect = element.getBoundingClientRect();
        const parentBoundingRect = parent.getBoundingClientRect();
        const isHiddenLeft =
          Math.round(elementBoundingRect.left - parentBoundingRect.left) < 0;
        const isHiddenRight =
          Math.round(elementBoundingRect.right - parentBoundingRect.right) >= 0;
        if (isHiddenLeft)
          parent.scroll({
            left: element.offsetLeft,
          });
        else if (isHiddenRight)
          parent.scroll({
            left: widthUnit * (index - visibleThumbnailsCount + 1),
          });
      }
    },
    [getVisibleThumbnailsCount, hoveredElement, widthUnit]
  );

  React.useEffect(
    () => {
      const scrollViewElement = scrollView.current;
      if (!scrollViewElement) return;

      // Add event listeners on component mount. There is no need to
      // remove them with a cleanup function because scrollview element
      // does not change and they will be destroyed when the element is
      // removed from the DOM.
      scrollViewElement.addEventListener('scroll', handleScroll);
      scrollViewElement.addEventListener('touchend', handleScrollEnd);
      scrollViewElement.addEventListener('touchleave', handleScrollEnd);
    },
    [handleScroll, handleScrollEnd]
  );

  return (
    <Line noMargin>
      <div
        style={{
          ...styles.arrowContainer,
          width: arrowWidth,
        }}
        onClick={onClickArrow('left')}
      >
        {areItemsSet && shouldDisplayLeftArrow && (
          <ArrowBackIos className={classesForLeftArrow.arrow} />
        )}
      </div>
      <div
        style={{
          width: `calc(100% - ${2 * arrowWidth}px - ${rightArrowMargin}px)`,
        }}
      >
        <Line justifyContent="space-between" alignItems="center">
          <Text size="bold-title">{title}</Text>
          <Line>
            {additionalAction && (
              <>
                {additionalAction}
                <Spacer />
              </>
            )}
            <FlatButton
              onClick={
                onBrowseAllClick ||
                (browseAllLink ? openLinkCallback(browseAllLink) : () => {})
              }
              label={browseAllLabel}
              leftIcon={<ListOutlined />}
            />
          </Line>
        </Line>
        {error ? (
          <div style={{ ...styles.error, height: cellHeight }}>
            <AlertMessage kind="warning">{error}</AlertMessage>
          </div>
        ) : (
          <GridList
            classes={classesForGridList}
            cols={itemsToDisplay.length}
            cellHeight={cellHeight}
            spacing={cellSpacing}
            style={styles.gridList}
            ref={scrollView}
          >
            {itemsToDisplay.map((item, index) => (
              <GridListTile
                classes={classesForGridListItem}
                key={item.id}
                tabIndex={0}
                onFocus={event => onFocusItem(event, index)}
                onMouseEnter={event => setHoveredElement(event.currentTarget)}
                onMouseLeave={() => setHoveredElement(null)}
                onKeyPress={(
                  event: SyntheticKeyboardEvent<HTMLLIElement>
                ): void => {
                  if (shouldValidate(event)) {
                    if (item.link) openLinkCallback(item.link)();
                    if (item.onClick) item.onClick();
                  }
                }}
                onClick={
                  item.link
                    ? openLinkCallback(item.link)
                    : item.onClick
                    ? item.onClick
                    : null
                }
              >
                {renderThumbnail(item)}
                {renderItemTitle(item, index)}
              </GridListTile>
            ))}
          </GridList>
        )}
      </div>
      {areItemsSet && (
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

export default Carousel;
