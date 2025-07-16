// @flow
import * as React from 'react';
import GridList from '@material-ui/core/GridList';
import {
  useResponsiveWindowSize,
  type WindowSizeType,
} from './Responsive/ResponsiveWindowMeasurer';
import ChevronArrowLeft from './CustomSvgIcons/ChevronArrowLeft';
import ChevronArrowRight from './CustomSvgIcons/ChevronArrowRight';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { LARGE_WIDGET_SIZE } from '../MainFrame/EditorContainers/HomePage/CardWidget';
import { getColumnsFromWindowSize } from '../MainFrame/EditorContainers/HomePage/LearnSection/Utils';
import classes from './Carousel.module.css';

export type CarouselItem = {
  renderItem: () => React.Node,
};

type Props = {|
  items: Array<CarouselItem>,
|};

export const getCarouselColumnsFromWindowSize = (
  windowSize: WindowSizeType,
  isLandscape: boolean
) => {
  switch (windowSize) {
    case 'small':
      return isLandscape ? 2 : 1;
    case 'medium':
      return 2;
    case 'large':
      return 4;
    case 'xlarge':
      return 6;
    default:
      return 3;
  }
};

const MAX_COLUMNS = getColumnsFromWindowSize('xlarge', true);
const MAX_SECTION_WIDTH = (LARGE_WIDGET_SIZE + 2 * 5) * MAX_COLUMNS; // widget size + 5 padding per side
const ITEMS_SPACING = 5;
const styles = {
  gridList: {
    textAlign: 'center',
    // Avoid tiles taking too much space on large screens.
    maxWidth: MAX_SECTION_WIDTH,
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
    overflowX: 'scroll',
    overflowY: 'hidden',
    flexWrap: 'nowrap',
    scrollbarWidth: 'none' /* For modern browsers */,
    msOverflowStyle: 'none' /* For Internet Explorer and Edge */,
    '&::-webkit-scrollbar': {
      height: 0 /* For old hrome, Safari, and Opera */,
    },
  },
  container: { display: 'flex', position: 'relative', width: '100%' },
  arrowsContainer: {
    width: `calc(100% + ${2 * ITEMS_SPACING}px)`, // This is needed to compensate for the `margin: -5px` added by MUI related to spacing.
    left: -ITEMS_SPACING,
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
    padding: 0,
    maxWidth: MAX_SECTION_WIDTH,
    zIndex: 12, // Above text.
    transition: 'opacity 0.2s ease-in-out',
  },
  arrowContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: 50,
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
  },
  arrow: {
    fontSize: 50,
    cursor: 'pointer',
  },
};

const getAdditionalColumnToDisplayFromNumberOfColumns = (
  numberOfColumns: number
) => (numberOfColumns < 2 ? 0.6 : numberOfColumns < 4 ? 0.9 : 0.25);

const Carousel = ({ items }: Props) => {
  const [canScrollLeft, setCanScrollLeft] = React.useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = React.useState<boolean>(false);
  const [isHoveringContainer, setIsHoveringContainer] = React.useState<boolean>(
    false
  );
  const { windowSize, isMobile, isLandscape } = useResponsiveWindowSize();
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const scrollView = React.useRef<?HTMLUListElement>(null);
  const initialColumnsToDisplay = React.useMemo(
    () => getCarouselColumnsFromWindowSize(windowSize, isLandscape),
    [windowSize, isLandscape]
  );
  const actualColumnsToDisplay = React.useMemo(
    // Show a bit more to see the next item partially.
    () =>
      initialColumnsToDisplay +
      (items.length > initialColumnsToDisplay
        ? getAdditionalColumnToDisplayFromNumberOfColumns(
            initialColumnsToDisplay
          )
        : 0),
    [items.length, initialColumnsToDisplay]
  );
  const checkScrollability = React.useCallback(() => {
    if (!scrollView.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollView.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10); // Small buffer for rounding errors
  }, []);

  React.useEffect(
    () => {
      const element = scrollView.current;
      if (!element) {
        return;
      }

      checkScrollability();
      element.addEventListener('scroll', checkScrollability);

      // Create a ref to the resize handler to be used in cleanup
      const handleResize = () => {
        checkScrollability();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        if (element) {
          element.removeEventListener('scroll', checkScrollability);
          window.removeEventListener('resize', handleResize);
        }
      };
    },
    [checkScrollability]
  );

  const onScroll = React.useCallback(
    (direction: 'left' | 'right') => {
      const scrollViewRef = scrollView.current;
      if (!scrollViewRef) return;

      // Calculate actual item width based on visible items
      const firstItem = scrollViewRef.children[0];
      const itemWidth = firstItem.offsetWidth;

      // Calculate scroll to show full items
      const scrollAmount = initialColumnsToDisplay * itemWidth;
      const currentScroll = scrollViewRef.scrollLeft;
      const newScroll =
        direction === 'left'
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollViewRef.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      });
    },
    [initialColumnsToDisplay]
  );

  return (
    <div
      style={styles.container}
      onMouseEnter={() => setIsHoveringContainer(true)}
      onMouseLeave={() => setIsHoveringContainer(false)}
    >
      <div
        style={{
          ...styles.arrowsContainer,
          display: isMobile ? 'hidden' : 'flex',
          opacity: isHoveringContainer ? 1 : 0,
        }}
      >
        <div
          style={{
            ...styles.arrowContainer,
            backgroundColor: gdevelopTheme.paper.backgroundColor.medium,
            pointerEvents: canScrollLeft ? 'auto' : 'none',
            opacity: canScrollLeft ? 0.8 : 0,
          }}
          className={classes.arrowContainer}
          onClick={() => onScroll('left')}
        >
          <ChevronArrowLeft style={styles.arrow} />
        </div>
        <div
          style={{
            ...styles.arrowContainer,
            backgroundColor: gdevelopTheme.paper.backgroundColor.medium,
            pointerEvents: canScrollRight ? 'auto' : 'none',
            opacity: canScrollRight ? 0.8 : 0,
          }}
          className={classes.arrowContainer}
          onClick={() => onScroll('right')}
        >
          <ChevronArrowRight style={styles.arrow} />
        </div>
      </div>
      <GridList
        cols={actualColumnsToDisplay}
        style={styles.gridList}
        cellHeight="auto"
        spacing={ITEMS_SPACING * 2}
        ref={scrollView}
      >
        {items.map(item => item.renderItem())}
      </GridList>
    </div>
  );
};

export default Carousel;
