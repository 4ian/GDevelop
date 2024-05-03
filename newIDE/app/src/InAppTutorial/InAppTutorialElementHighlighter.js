// @flow
import * as React from 'react';
import Rectangle from '../Utils/Rectangle';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';
import { getDisplayZIndexForHighlighter, getScrollParent } from './HTMLUtils';
import ArrowTop from '../UI/CustomSvgIcons/ArrowTop';
import ArrowBottom from '../UI/CustomSvgIcons/ArrowBottom';
import ArrowLeft from '../UI/CustomSvgIcons/ArrowLeft';
import ArrowRight from '../UI/CustomSvgIcons/ArrowRight';
import useIsElementVisibleInScroll from '../Utils/UseIsElementVisibleInScroll';
import { aboveMaterialUiMaxZIndex } from '../UI/MaterialUISpecificUtil';

type Props = {|
  element: HTMLElement,
|};

const highlighterPrimaryColor = '#FF8629';

const styles = {
  rectangleHighlight: {
    position: 'fixed',
    outline: `1px solid ${highlighterPrimaryColor}`,
    boxShadow: `0 0 8px 6px ${highlighterPrimaryColor}`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  scrollIndicator: {
    position: 'fixed',
    zIndex: aboveMaterialUiMaxZIndex,
  },
  scrollDirectionArrow: {
    color: '#1D1D26',
    display: 'flex',
    backgroundColor: highlighterPrimaryColor,
    boxShadow: `0 0 12px 2px ${highlighterPrimaryColor}`,
    padding: 2,
    borderRadius: 3,
  },
};

function InAppTutorialElementHighlighter({ element }: Props) {
  const forceUpdate = useForceUpdate();
  useOnResize(forceUpdate);
  const [showHighlighter, setShowHighlighter] = React.useState<boolean>(true);

  const scrollParent = getScrollParent(element);
  const scrollParentRectangle = scrollParent
    ? Rectangle.fromDOMRect(scrollParent.getBoundingClientRect())
    : undefined;
  const elementRectangle = Rectangle.fromDOMRect(
    element.getBoundingClientRect()
  );

  // We look at both the scrollable parent position and the element to highlight's position.
  // If one of the element's boundaries is outside of the scrollable parent's boundaries,
  // we indicate this direction as the first direction to scroll to.
  const computeScrollDirection = React.useCallback(
    () => {
      if (!scrollParentRectangle) return null;
      if (elementRectangle.left < scrollParentRectangle.left) {
        return 'left';
      } else if (elementRectangle.right > scrollParentRectangle.right) {
        return 'right';
      } else if (elementRectangle.top < scrollParentRectangle.top) {
        return 'top';
      } else if (elementRectangle.bottom > scrollParentRectangle.bottom) {
        return 'bottom';
      }
      return null;
    },
    [scrollParentRectangle, elementRectangle]
  );

  const [scrollDirection, setScrollDirection] = React.useState<
    'top' | 'bottom' | 'left' | 'right' | null
  >(computeScrollDirection());

  const updateHighlighterVisibility = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const { isIntersecting } = entries[0];
      setShowHighlighter(isIntersecting);
      if (!isIntersecting && scrollParentRectangle) {
        setScrollDirection(computeScrollDirection());
      }
      forceUpdate();
    },
    [forceUpdate, scrollParentRectangle, computeScrollDirection]
  );

  useIsElementVisibleInScroll(element, updateHighlighterVisibility);

  React.useEffect(
    () => {
      if (scrollParent) {
        scrollParent.addEventListener('scroll', forceUpdate);
        return () => {
          scrollParent.removeEventListener('scroll', forceUpdate);
        };
      }
    },
    [scrollParent, forceUpdate]
  );
  const elementComputedStyle = getComputedStyle(element);

  const Icon = React.useMemo(
    () => {
      switch (scrollDirection) {
        case 'top':
          return ArrowTop;
        case 'bottom':
          return ArrowBottom;
        case 'left':
          return ArrowLeft;
        case 'right':
          return ArrowRight;
        default:
          return null;
      }
    },
    [scrollDirection]
  );

  return (
    <>
      {showHighlighter && (
        <div
          id="in-app-tutorial-element-highlighter"
          style={{
            ...styles.rectangleHighlight,
            ...elementRectangle.toCSSPosition(),
            borderRadius: elementComputedStyle.getPropertyValue(
              'border-radius'
            ),
            zIndex: getDisplayZIndexForHighlighter(element),
          }}
        />
      )}
      {!showHighlighter && scrollParentRectangle && (
        <div
          id="in-app-tutorial-scroll-indicator"
          style={{
            ...styles.scrollIndicator,
            animation: `0.5s ease-in-out 0s infinite alternate none running ${
              scrollDirection === 'top' || scrollDirection === 'bottom'
                ? 'vertical-translate'
                : 'horizontal-translate'
            }`,
            top:
              scrollDirection === 'top'
                ? scrollParentRectangle.top + 15
                : scrollDirection === 'bottom'
                ? scrollParentRectangle.bottom - 50
                : elementRectangle.centerY() - 15,
            left:
              scrollDirection === 'left'
                ? scrollParentRectangle.left + 15
                : scrollDirection === 'right'
                ? scrollParentRectangle.right - 50
                : elementRectangle.centerX() - 15,
          }}
        >
          <div style={styles.scrollDirectionArrow}>
            {Icon && <Icon fontSize="large" />}
          </div>
        </div>
      )}
    </>
  );
}

export default InAppTutorialElementHighlighter;
