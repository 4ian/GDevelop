// @flow
import React from 'react';
import Rectangle from '../Utils/Rectangle';
import useOnResize from '../Utils/UseOnResize';
import useForceUpdate from '../Utils/UseForceUpdate';

type Props = {|
  elementId: string,
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

function OnboardingElementHighlighter({ elementId }: Props) {
  useOnResize(useForceUpdate());
  const element = document.querySelector(elementId);
  if (!element) return null;
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
