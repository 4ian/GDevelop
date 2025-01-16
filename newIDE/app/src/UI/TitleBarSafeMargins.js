// @flow
import * as React from 'react';
import { isMacLike } from '../Utils/Platform';
import useForceUpdate from '../Utils/UseForceUpdate';
import Window, { useWindowControlsOverlayWatcher } from '../Utils/Window';
import optionalRequire from '../Utils/OptionalRequire';

const electron = optionalRequire('electron');

const DRAGGABLE_PART_CLASS_NAME = 'title-bar-draggable-part';

const titleBarStyles = {
  leftSideArea: {
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  rightSideArea: { alignSelf: 'stretch', flex: 1 },
};

export const TitleBarLeftSafeMargins = ({
  backgroundColor,
}: {|
  backgroundColor?: string,
|}) => {
  // An installed PWA can have window controls displayed as overlay. If supported,
  // we set up a listener to detect any change and force a refresh that will read
  // the latest size of the controls.
  const forceUpdate = useForceUpdate();
  useWindowControlsOverlayWatcher({ onChanged: forceUpdate });

  let leftSideOffset = 0;
  // macOS displays the "traffic lights" on the left.
  const isDesktopMacosFullScreen =
    !!electron && isMacLike() && Window.isFullScreen();

  if (isDesktopMacosFullScreen) {
    // When in full screen on macOS, the "traffic lights" are not in the overlay.
    leftSideOffset = 0;
  } else {
    // Otherwise, the windowControlsOverlay tells us how much space is needed.
    // This can happen for mac apps, or installed PWA.
    // $FlowFixMe - this API is not handled by Flow.
    const { windowControlsOverlay } = navigator;
    if (windowControlsOverlay) {
      if (windowControlsOverlay.visible) {
        const { x } = windowControlsOverlay.getTitlebarAreaRect();
        leftSideOffset = x;
      }
    }
  }

  if (leftSideOffset) {
    return (
      <div
        className={DRAGGABLE_PART_CLASS_NAME}
        style={{
          ...titleBarStyles.leftSideArea,
          width: leftSideOffset,
          backgroundColor: backgroundColor || 'transparent',
        }}
      />
    );
  }

  // Not on the desktop app, and not in an installed PWA with window controls displayed
  // as overlay: no need to display a spacing.
  return null;
};

export const TitleBarRightSafeMargins = ({
  backgroundColor,
  rightSideAdditionalOffsetToGiveSpaceToDrag,
}: {|
  backgroundColor?: string,
  rightSideAdditionalOffsetToGiveSpaceToDrag?: boolean,
|}) => {
  // An installed PWA can have window controls displayed as overlay. If supported,
  // we set up a listener to detect any change and force a refresh that will read
  // the latest size of the controls.
  const forceUpdate = useForceUpdate();
  useWindowControlsOverlayWatcher({ onChanged: forceUpdate });

  const isDesktopWindowsOrLinux = !!electron && !isMacLike();
  // Windows and Linux have their "window controls" on the right
  let rightSideOffset = isDesktopWindowsOrLinux ? 150 : 0;

  // An installed PWA can have window controls displayed as overlay,
  // which we measure here to set the offsets.
  // $FlowFixMe - this API is not handled by Flow.
  const { windowControlsOverlay } = navigator;
  if (windowControlsOverlay) {
    if (windowControlsOverlay.visible) {
      const { x, width } = windowControlsOverlay.getTitlebarAreaRect();
      rightSideOffset = window.innerWidth - x - width;
    }
  }

  const draggableMinWidth =
    rightSideOffset + (rightSideAdditionalOffsetToGiveSpaceToDrag ? 30 : 0);

  // Always display this draggable area, as it will take the whole available space
  // in the title bar.
  return (
    <div
      className={DRAGGABLE_PART_CLASS_NAME}
      style={{
        ...titleBarStyles.rightSideArea,
        minWidth: draggableMinWidth,
        backgroundColor: backgroundColor || 'transparent',
      }}
    />
  );
};
