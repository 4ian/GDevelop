// @flow
import * as React from 'react';
import Rectangle from '../Utils/Rectangle';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';
import {
  AboveMaterialUIMaxZIndex,
  getDisplayZIndexForHighlighter,
  getScrollParent,
} from './HTMLUtils';
import ArrowTop from '../UI/CustomSvgIcons/ArrowTop';
import ArrowBottom from '../UI/CustomSvgIcons/ArrowBottom';
import useIsElementVisibleInScroll from '../Utils/UseIsElementVisibleInScroll';

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
    zIndex: AboveMaterialUIMaxZIndex,
    animation:
      '2s ease-in-out 0s infinite alternate none running verticalEaseShake',
  },
  scrollDirectionArrow: {
    color: highlighterPrimaryColor,
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

  const [scrollDirection, setScrollDirection] = React.useState<
    'top' | 'bottom'
  >(() => {
    if (!scrollParentRectangle) return 'bottom';
    if (elementRectangle.bottom <= scrollParentRectangle.centerY()) {
      return 'top';
    } else if (elementRectangle.top >= scrollParentRectangle.centerY()) {
      return 'bottom';
    }
    return 'bottom';
  });

  const updateHighlighterVisibility = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const { isIntersecting } = entries[0];
      setShowHighlighter(isIntersecting);
      if (!isIntersecting && scrollParentRectangle) {
        if (elementRectangle.bottom <= scrollParentRectangle.centerY()) {
          setScrollDirection('top');
        } else if (elementRectangle.top >= scrollParentRectangle.centerY()) {
          setScrollDirection('bottom');
        }
      }
      forceUpdate();
    },
    [forceUpdate, scrollParentRectangle, elementRectangle]
  );

  useIsElementVisibleInScroll(element, updateHighlighterVisibility);

  React.useEffect(
    () => {
      if (scrollParent) {
        // $FlowFixMe - Flow declaration does not seem to support scroll event
        scrollParent.addEventListener('scroll', forceUpdate, { passive: true });
        return () => {
          // $FlowFixMe - Flow declaration does not seem to support scroll event
          scrollParent.removeEventListener('scroll', forceUpdate);
        };
      }
    },
    [scrollParent, forceUpdate]
  );
  const elementComputedStyle = getComputedStyle(element);

  const Icon = scrollDirection === 'top' ? ArrowTop : ArrowBottom;

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
            top:
              scrollDirection === 'top'
                ? scrollParentRectangle.top
                : scrollParentRectangle.bottom - 50,
            left: scrollParentRectangle.right - 80,
          }}
        >
          <div style={styles.scrollDirectionArrow}>
            <Icon fontSize="large" />
          </div>
        </div>
      )}
    </>
  );
}

export default InAppTutorialElementHighlighter;
