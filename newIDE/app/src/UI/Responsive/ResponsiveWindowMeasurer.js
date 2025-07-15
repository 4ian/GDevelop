// @flow
import * as React from 'react';
import useOnResize from '../../Utils/UseOnResize';

// Typically, small corresponds to mobile phones.
// Medium corresponds to tablets and small screens.
// Large corresponds to most laptop and desktop screens.
// Xlarge corresponds to large desktop screens.
export type WindowSizeType = 'small' | 'medium' | 'large' | 'xlarge';
export type OrientationAndWindowSizeType =
  | 'small-portrait'
  | 'medium-portrait'
  | 'large-portrait'
  | 'xlarge-portrait'
  | 'small-landscape'
  | 'medium-landscape'
  | 'large-landscape'
  | 'xlarge-landscape';

type WindowSize = {|
  windowSize: WindowSizeType,
  isMobile: boolean,
  isMediumScreen: boolean,
  isLandscape: boolean,
|};

const sizeThresholds = {
  smallHeight: 500,
  smallWidth: 600,
  mediumWidth: 1150,
  largeWidth: 1500,
};

/**
 * Give the orientation and window size from the specified dimensions
 * (be it the top-level window or a specific size, like a tab of the editor).
 */
const getOrientationAndWindowSizeFromDimensions = (
  innerWidth: number,
  innerHeight: number
): OrientationAndWindowSizeType => {
  const orientation = innerWidth > innerHeight ? 'landscape' : 'portrait';

  const sizeType =
    innerWidth < sizeThresholds.smallWidth ||
    innerHeight < sizeThresholds.smallHeight // Mobile devices can be in landscape mode, so check both width and height.
      ? 'small'
      : innerWidth < sizeThresholds.mediumWidth
      ? 'medium'
      : innerWidth < sizeThresholds.largeWidth
      ? 'large'
      : 'xlarge';

  // $FlowFixMe - this is guaranteed to be a valid OrientationAndWindowSizeType.
  return sizeType + '-' + orientation;
};

// Map from orientation and window size to a WindowSize object, to ensure stability
// across re-renders.
const keyToSize: { [OrientationAndWindowSizeType]: WindowSize } = {
  'small-portrait': {
    windowSize: 'small',
    isMobile: true,
    isMediumScreen: false,
    isLandscape: false,
  },
  'medium-portrait': {
    windowSize: 'medium',
    isMobile: false,
    isMediumScreen: true,
    isLandscape: false,
  },
  'large-portrait': {
    windowSize: 'large',
    isMobile: false,
    isMediumScreen: false,
    isLandscape: false,
  },
  'xlarge-portrait': {
    windowSize: 'xlarge',
    isMobile: false,
    isMediumScreen: false,
    isLandscape: false,
  },
  'small-landscape': {
    windowSize: 'small',
    isMobile: true,
    isMediumScreen: false,
    isLandscape: true,
  },
  'medium-landscape': {
    windowSize: 'medium',
    isMobile: false,
    isMediumScreen: true,
    isLandscape: true,
  },
  'large-landscape': {
    windowSize: 'large',
    isMobile: false,
    isMediumScreen: false,
    isLandscape: true,
  },
  'xlarge-landscape': {
    windowSize: 'xlarge',
    isMobile: false,
    isMediumScreen: false,
    isLandscape: true,
  },
};

const getWindowSizeFromTopLevelWindow = (): WindowSize | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return keyToSize[
    getOrientationAndWindowSizeFromDimensions(
      window.innerWidth,
      window.innerHeight
    )
  ];
};

/**
 * A context that has a specific window size. If null, the window size is
 * supposed to be determined by the top-level window itself.
 */
const WindowSizeContext = React.createContext<WindowSize | null>(null);

type TopLevelWindowSizeProviderProps = {|
  children: React.Node,
|};

/**
 * "Reset" the dimensions to use the size of the window itself.
 * Typically: for dialogs.
 */
export const TopLevelWindowSizeProvider = ({
  children,
}: TopLevelWindowSizeProviderProps) => {
  return (
    <WindowSizeContext.Provider value={null}>
      {children}
    </WindowSizeContext.Provider>
  );
};

type SpecificDimensionsWindowSizeProviderProps = {|
  children: React.Node,
  innerWidth: number | null,
  innerHeight: number | null,
|};

/**
 * Pass a specific dimension for the children to use.
 * Useful when the component knows the dimensions in which its children are displayed.
 * Typically: a tab in an editor.
 */
export const SpecificDimensionsWindowSizeProvider = ({
  children,
  innerWidth,
  innerHeight,
}: SpecificDimensionsWindowSizeProviderProps) => {
  const windowSize = React.useMemo(
    () => {
      if (innerWidth === null || innerHeight === null) {
        return null;
      }

      return keyToSize[
        getOrientationAndWindowSizeFromDimensions(innerWidth, innerHeight)
      ];
    },
    [innerWidth, innerHeight]
  );

  return (
    <WindowSizeContext.Provider value={windowSize}>
      {windowSize ? children : null}
    </WindowSizeContext.Provider>
  );
};

type ResponsiveWindowMeasurerProps = {|
  children: ({
    windowSize: WindowSizeType,
    isMobile: boolean,
    isMediumScreen: boolean,
    isLandscape: boolean,
  }) => React.Node,
|};

/**
 * Wraps useResponsiveWindowSize in a component.
 */
export const ResponsiveWindowMeasurer = ({
  children,
}: ResponsiveWindowMeasurerProps) => children(useResponsiveWindowSize());

/**
 * Return the size of the window.
 * The returned object is stable as long as the window size has not changed from
 * one category to another.
 */
export const useResponsiveWindowSize = (): WindowSize => {
  const windowSizeFromContext = React.useContext(WindowSizeContext);
  const [windowSizeFromWindow, setWindowSizeFromWindow] = React.useState(
    getWindowSizeFromTopLevelWindow
  );
  useOnResize(
    React.useCallback(
      () => {
        if (windowSizeFromContext) {
          return; // Size is defined by the context already.
        }

        // Only trigger a re-render if the window size has changed.
        const newWindowSize = getWindowSizeFromTopLevelWindow();
        if (newWindowSize !== windowSizeFromWindow) {
          setWindowSizeFromWindow(newWindowSize);
        }
      },
      [windowSizeFromWindow, windowSizeFromContext]
    )
  );

  return (
    windowSizeFromContext ||
    windowSizeFromWindow ||
    keyToSize['medium-landscape']
  );
};
