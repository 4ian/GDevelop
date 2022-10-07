// @flow
import React from 'react';
import Rectangle from '../Utils/Rectangle';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';
import { getScrollParent } from './HTMLUtils';

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
};

function OnboardingElementHighlighter({ element }: Props) {
  const forceUpdate = useForceUpdate();
  useOnResize(forceUpdate);
  const observerRef = React.useRef<?IntersectionObserver>(null);

  const parent = getScrollParent(element);

  React.useEffect(
    () => {
      observerRef.current = new IntersectionObserver(forceUpdate, {
        root: null,
        threshold: 1,
      });
      observerRef.current.observe(element);
      return () => {
        if (observerRef.current) observerRef.current.disconnect();
      };
    },
    [element, forceUpdate]
  );


  React.useEffect(
    () => {
      if (parent) {
        // $FlowFixMe - Flow declaration does not seem to support scroll event
        parent.addEventListener('scroll', forceUpdate, { passive: true });
        return () => {
          // $FlowFixMe - Flow declaration does not seem to support scroll event
          parent.removeEventListener('scroll', forceUpdate);
        };
      }
    },
    [parent, forceUpdate]
  );

  const borderRadius = getComputedStyle(element).getPropertyValue(
    'border-radius'
  );

  const elementRectangle = Rectangle.fromDOMRect(
    element.getBoundingClientRect()
  );

  return (
    <div
      id="element-highlighter"
      style={{
        ...styles.rectangleHighlight,
        ...elementRectangle.toCSSPosition(),
        borderRadius: borderRadius,
      }}
    />
  );
}

export default OnboardingElementHighlighter;
