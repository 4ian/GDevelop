// @flow
import * as React from 'react';
import Rectangle from '../Utils/Rectangle';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';
import { getScrollParent } from './HTMLUtils';
import ArrowTop from '../UI/CustomSvgIcons/ArrowTop';
import ArrowBottom from '../UI/CustomSvgIcons/ArrowBottom';

type Props = {|
  element: HTMLElement,
|};

const highlighterPrimaryColor = '#E0E026';

const styles = {
  rectangleHighlight: {
    position: 'fixed',
    zIndex: 1501, // highest z-index used by MaterialUI is 1500
    outline: `1px solid ${highlighterPrimaryColor}`,
    boxShadow: `0 0 8px 6px ${highlighterPrimaryColor}`,
    boxSizing: 'border-box',
    pointerEvents: 'none',
  },
  scrollIndicator: {
    position: 'fixed',
    zIndex: 1501, // highest z-index used by MaterialUI is 1500
    animation: '2s ease-in-out 0s infinite alternate none running verticalEaseShake'
  },
  scrollDirectionArrow: {
    color: highlighterPrimaryColor,
  },
};

function OnboardingElementHighlighter({ element }: Props) {
  const forceUpdate = useForceUpdate();
  useOnResize(forceUpdate);
  const observerRef = React.useRef<?IntersectionObserver>(null);
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
    entries => {
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

  React.useEffect(
    () => {
      observerRef.current = new IntersectionObserver(
        updateHighlighterVisibility,
        {
          root: null,
          threshold: 0.8,
        }
      );
      observerRef.current.observe(element);
      return () => {
        if (observerRef.current) observerRef.current.disconnect();
      };
    },
    [element, updateHighlighterVisibility]
  );

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

  const borderRadius = getComputedStyle(element).getPropertyValue(
    'border-radius'
  );

  const Icon = scrollDirection === 'top' ? ArrowTop : ArrowBottom;
  return (
    <>
      {showHighlighter && (
        <div
          id="element-highlighter"
          style={{
            ...styles.rectangleHighlight,
            ...elementRectangle.toCSSPosition(),
            borderRadius: borderRadius,
          }}
        />
      )}
      {!showHighlighter && scrollParentRectangle && (
        <div
          id="scroll-indicator"
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

export default OnboardingElementHighlighter;
