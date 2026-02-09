// @flow
import { aboveMaterialUiMaxZIndex } from '../UI/MaterialUISpecificUtil';

// $FlowFixMe[cannot-resolve-name]
const getStyleAttribute = (element: Element, prop: string) =>
  // $FlowFixMe[cannot-resolve-name]
  getComputedStyle(element).getPropertyValue(prop);

// $FlowFixMe[cannot-resolve-name]
const getOverflowAttributes = (element: Element) =>
  getStyleAttribute(element, 'overflow') +
  getStyleAttribute(element, 'overflow-y') +
  getStyleAttribute(element, 'overflow-x');

export const getElementAncestry = (
  // $FlowFixMe[cannot-resolve-name]
  element: Element,
  // $FlowFixMe[cannot-resolve-name]
  elementPath: Array<Element>
): any => {
  if (!element.parentElement) {
    return elementPath;
  }
  return getElementAncestry(
    element.parentElement,
    elementPath.concat([element])
  );
};

// $FlowFixMe[cannot-resolve-name]
const isScrollableElement = (element: Element) => {
  const regex = /(auto|scroll)/;
  return regex.test(getOverflowAttributes(element));
};

// Taken from https://stackoverflow.com/a/49186677/9517183
// $FlowFixMe[cannot-resolve-name]
export const getScrollParent = (element: Element): Element | null => {
  // $FlowFixMe[cannot-resolve-name]
  if (!(element instanceof HTMLElement)) {
    return null;
  }

  const elementParent = element.parentElement;
  if (!elementParent) return null;

  const elementAncestry = getElementAncestry(elementParent, []);

  for (let parent of elementAncestry) {
    if (isScrollableElement(parent)) {
      return parent;
    }
  }

  // $FlowFixMe[cannot-resolve-name]
  return document.scrollingElement || document.documentElement;
};

// $FlowFixMe[cannot-resolve-name]
export const isContainedInReactRootNode = (element: HTMLElement): any | boolean => {
  // $FlowFixMe[cannot-resolve-name]
  const reactRootNode = document.querySelector('#root');
  if (!reactRootNode) return false;
  return reactRootNode.contains(element);
};

// $FlowFixMe[cannot-resolve-name]
export const getDisplayZIndexForHighlighter = (element: HTMLElement): any | number => {
  // If the element is the tutorial avatar, it should be above everything else,
  // to avoid modals or drawers to be displayed above it.
  if (element.id === 'in-app-tutorial-avatar') return aboveMaterialUiMaxZIndex;

  if (isContainedInReactRootNode(element)) {
    // $FlowFixMe[cannot-resolve-name]
    return getComputedStyle(element).getPropertyPriority('z-index') + 10;
  }

  return aboveMaterialUiMaxZIndex;
};
