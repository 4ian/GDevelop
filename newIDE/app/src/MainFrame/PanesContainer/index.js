// @flow

import * as React from 'react';
import classes from './PanesContainer.module.css';
import classNames from 'classnames';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { useDebounce } from '../../Utils/UseDebounce';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';

const styles = {
  pointerEventsNone: {
    pointerEvents: 'none',
  },
  pointerEventsAll: {
    pointerEvents: 'all',
  },
};

export type FloatingPaneState = 'open' | 'closed';

type Props = {|
  renderPane: ({
    paneIdentifier: string,
    isLeftMostPane: boolean,
    isRightMostPane: boolean,
    isDrawer: boolean,
    areSidePanesDrawers: boolean,
    onSetPointerEventsNone: (enablePointerEventsNone: boolean) => void,
    onSetPaneDrawerState: (
      paneIdentifier: string,
      newState: FloatingPaneState
    ) => void,
  }) => React.Node,
  hasEditorsInLeftPane: boolean,
  hasEditorsInRightPane: boolean,
|};

type DraggingState = {|
  paneIdentifier: 'left' | 'right',
  startClientX: number,
  startWidth: number,
|};

const paneWidthMin = 300;

/** Allow a pane to be moved and closed with a swipe on touchscreens. */
const useSwipeableDrawer = ({
  enabled,
  paneRef,
  direction,
  onClose,
}: {|
  enabled: boolean,
  paneRef: {| current: HTMLDivElement | null |},
  direction: 'left' | 'right',
  onClose: () => void,
|}) => {
  React.useEffect(
    () => {
      const drawer = paneRef.current;
      if (!drawer) return;
      if (!enabled) return;

      let startX = 0;
      let currentX = 0;
      let isDragging = false;

      const minSwipeDistance = 80;

      const onTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].clientX;
        currentX = e.touches[0].clientX;
        isDragging = true;
        drawer.style.transition = 'none';
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging) return;

        currentX = e.touches[0].clientX;
        const deltaX = currentX - startX;

        const hasMovedEnough = Math.abs(deltaX) > 10;

        const translate = !hasMovedEnough
          ? 0
          : direction === 'left'
          ? Math.max(0, deltaX)
          : Math.min(0, deltaX); // Prevent dragging in wrong direction

        drawer.style.transform = `translateX(${translate}px)`;
      };

      const onTouchEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        const deltaX = currentX - startX;
        const shouldClose =
          direction === 'left'
            ? deltaX > minSwipeDistance
            : deltaX < -minSwipeDistance;

        // Animate the drawer either to close or fully open position,
        const animationTimeInMs = 200;
        drawer.style.transition = `transform 0.${animationTimeInMs}s ease-out`;

        if (shouldClose) {
          // Animate to close position.
          const closeTransform = direction === 'left' ? '100vw' : '-100vw';
          drawer.style.transform = `translateX(${closeTransform})`;

          // Delay to match animation time.
          setTimeout(() => {
            onClose(); // This is responsible for ensuring the drawer will stay closed.
            drawer.style.transform = ''; // Reset for future swipes
          }, 250);
        } else {
          // Snap back to open.
          drawer.style.transform = 'translateX(0)';

          // Delay to match animation time.
          setTimeout(() => {
            drawer.style.transform = ''; // Reset for future swipes
          }, 250);
        }
      };

      drawer.addEventListener('touchstart', onTouchStart);
      drawer.addEventListener('touchmove', onTouchMove);
      drawer.addEventListener('touchend', onTouchEnd);

      return () => {
        drawer.removeEventListener('touchstart', onTouchStart);
        drawer.removeEventListener('touchmove', onTouchMove);
        drawer.removeEventListener('touchend', onTouchEnd);
        drawer.style.transform = '';
      };
    },
    [enabled, paneRef, direction, onClose]
  );
};

export const PanesContainer = ({
  renderPane,
  hasEditorsInLeftPane,
  hasEditorsInRightPane,
}: Props) => {
  const { isMobile } = useResponsiveWindowSize();
  const forceUpdate = useForceUpdate();
  const debouncedForceUpdate = useDebounce(forceUpdate, 200);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const leftResizerRef = React.useRef<HTMLDivElement | null>(null);
  const leftPaneRef = React.useRef<HTMLDivElement | null>(null);
  const centerPaneRef = React.useRef<HTMLDivElement | null>(null);
  const rightPaneRef = React.useRef<HTMLDivElement | null>(null);
  const rightResizerRef = React.useRef<HTMLDivElement | null>(null);

  const areSidePanesDrawers = isMobile;

  const [panesDrawerState, setPanesDrawerState] = React.useState<{
    [string]: FloatingPaneState,
  }>({
    left: 'open',
    right: 'open',
  });

  const setPaneDrawerState = React.useCallback(
    (paneIdentifier: string, newState: FloatingPaneState) => {
      setPanesDrawerState(panesDrawerState => ({
        ...panesDrawerState,
        [paneIdentifier]: newState,
      }));
    },
    []
  );

  React.useEffect(
    () => {
      if (areSidePanesDrawers) {
        // Just switched to mobile view: any drawer is closed.
        setPanesDrawerState({
          left: 'closed',
          right: 'closed',
        });
      } else {
        // Just switched to non-mobile view: always consider the pane drawers as open.
        setPanesDrawerState({
          left: 'open',
          right: 'open',
        });
      }
    },
    [areSidePanesDrawers]
  );

  React.useEffect(
    () => {
      if (hasEditorsInRightPane) {
        // Just opened the first editor in the right pane: ensure the drawer
        // pane is shown.
        // Note that is the screen is big enough so that drawers are not shown,
        // the state is "open" anyway, this is fine.
        setPaneDrawerState('right', 'open');
      }
    },
    [setPaneDrawerState, hasEditorsInRightPane]
  );

  React.useEffect(
    () => {
      if (hasEditorsInLeftPane) {
        // Just opened the first editor in the left pane: ensure the drawer
        // pane is shown.
        // Note that is the screen is big enough so that drawers are not shown,
        // the state is "open" anyway, this is fine.
        setPaneDrawerState('left', 'open');
      }
    },
    [setPaneDrawerState, hasEditorsInLeftPane]
  );

  const onCloseLeftPane = React.useCallback(
    () => setPaneDrawerState('left', 'closed'),
    [setPaneDrawerState]
  );
  useSwipeableDrawer({
    enabled: areSidePanesDrawers,
    paneRef: leftPaneRef,
    direction: 'left',
    onClose: onCloseLeftPane,
  });

  const onCloseRightPane = React.useCallback(
    () => setPaneDrawerState('right', 'closed'),
    [setPaneDrawerState]
  );
  useSwipeableDrawer({
    enabled: areSidePanesDrawers,
    paneRef: rightPaneRef,
    direction: 'left',
    onClose: onCloseRightPane,
  });

  const draggingStateRef = React.useRef<DraggingState | null>(null);

  React.useEffect(
    () => {
      const onPointerMove = (event: PointerEvent) => {
        const leftPane = leftPaneRef.current;
        const rightPane = rightPaneRef.current;
        const draggingState = draggingStateRef.current;
        if (!draggingState || !containerRef.current || !leftPane || !rightPane)
          return;

        const containerRect = containerRef.current.getBoundingClientRect();

        const newWidth =
          draggingState.paneIdentifier === 'left'
            ? draggingState.startWidth +
              (event.clientX - draggingState.startClientX)
            : draggingState.startWidth -
              (event.clientX - draggingState.startClientX);

        const min = paneWidthMin;
        const max = containerRect.width - paneWidthMin;
        const clampedWidth = Math.max(min, Math.min(max, newWidth));

        if (draggingState.paneIdentifier === 'left') {
          leftPane.style.flexBasis = `${clampedWidth}px`;
        } else {
          rightPane.style.flexBasis = `${clampedWidth}px`;
        }

        // Only trigger a React re-render after the user has stopped dragging,
        // to avoid re-rendering the panes too often.
        debouncedForceUpdate();
      };

      const onPointerUp = () => {
        draggingStateRef.current = null;
        forceUpdate();

        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };

      const onLeftResizerPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        const leftPane = leftPaneRef.current;
        if (!leftPane) return;

        draggingStateRef.current = {
          paneIdentifier: 'left',
          startClientX: event.clientX,
          startWidth: leftPane.getBoundingClientRect().width,
        };
        forceUpdate();

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      };

      const onRightResizerPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        const rightPane = rightPaneRef.current;
        if (!rightPane) return;

        draggingStateRef.current = {
          paneIdentifier: 'right',
          startClientX: event.clientX,
          startWidth: rightPane.getBoundingClientRect().width,
        };
        forceUpdate();

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
      };

      const leftResizer = leftResizerRef.current;
      if (leftResizer) {
        leftResizer.addEventListener('pointerdown', onLeftResizerPointerDown);
      }

      const rightResizer = rightResizerRef.current;
      if (rightResizer) {
        rightResizer.addEventListener('pointerdown', onRightResizerPointerDown);
      }

      return () => {
        if (leftResizer) {
          leftResizer.removeEventListener(
            'pointerdown',
            onLeftResizerPointerDown
          );
        }
        if (rightResizer) {
          rightResizer.removeEventListener(
            'pointerdown',
            onRightResizerPointerDown
          );
        }
      };
    },
    [debouncedForceUpdate, forceUpdate]
  );

  const [
    leftPanePointerEventsNone,
    setLeftPanePointerEventsNone,
  ] = React.useState(false);
  const [
    centerPanePointerEventsNone,
    setCenterPanePointerEventsNone,
  ] = React.useState(false);
  const [
    rightPanePointerEventsNone,
    setRightPanePointerEventsNone,
  ] = React.useState(false);

  const isDragging = draggingStateRef.current !== null;

  return (
    <div
      ref={containerRef}
      className={classes.container}
      role="group"
      aria-label="Resizable split pane"
      style={isDragging ? styles.pointerEventsAll : undefined}
    >
      <div
        ref={leftPaneRef}
        className={classNames({
          [classes.pane]: true,
          [classes.leftPane]: true,
          [classes.drawer]: areSidePanesDrawers,
          [classes.closedDrawer]:
            areSidePanesDrawers && panesDrawerState['left'] === 'closed',
          [classes.hidden]: !hasEditorsInLeftPane,
        })}
        style={
          leftPanePointerEventsNone && !isDragging
            ? styles.pointerEventsNone
            : undefined
        }
        id="pane-left"
      >
        {renderPane({
          paneIdentifier: 'left',
          isLeftMostPane: true,
          isRightMostPane: false,
          isDrawer: areSidePanesDrawers,
          areSidePanesDrawers,
          onSetPaneDrawerState: setPaneDrawerState,
          onSetPointerEventsNone: setLeftPanePointerEventsNone,
        })}
      </div>
      <div
        className={classNames({
          [classes.resizer]: true,
          [classes.hidden]: !hasEditorsInLeftPane || areSidePanesDrawers,
        })}
        role="separator"
        aria-orientation="vertical"
        aria-controls="pane-left pane-center"
        tabIndex={0}
        ref={leftResizerRef}
      />
      <div
        ref={centerPaneRef}
        className={classNames({
          [classes.pane]: true,
          [classes.centerPane]: true,
        })}
        style={
          centerPanePointerEventsNone && !isDragging
            ? styles.pointerEventsNone
            : undefined
        }
        id="pane-center"
      >
        {renderPane({
          paneIdentifier: 'center',
          isLeftMostPane: areSidePanesDrawers || !hasEditorsInLeftPane,
          isRightMostPane: areSidePanesDrawers || !hasEditorsInRightPane,
          isDrawer: false,
          areSidePanesDrawers,
          onSetPaneDrawerState: setPaneDrawerState,
          onSetPointerEventsNone: setCenterPanePointerEventsNone,
        })}
      </div>
      <div
        className={classNames({
          [classes.resizer]: true,
          [classes.hidden]: !hasEditorsInRightPane || areSidePanesDrawers,
        })}
        role="separator"
        aria-orientation="vertical"
        aria-controls="pane-center pane-right"
        tabIndex={0}
        ref={rightResizerRef}
      />
      <div
        ref={rightPaneRef}
        className={classNames({
          [classes.pane]: true,
          [classes.rightPane]: true,
          [classes.drawer]: areSidePanesDrawers,
          [classes.closedDrawer]:
            areSidePanesDrawers && panesDrawerState['right'] === 'closed',
          [classes.hidden]: !hasEditorsInRightPane,
        })}
        style={
          rightPanePointerEventsNone && !isDragging
            ? styles.pointerEventsNone
            : undefined
        }
        id="pane-right"
      >
        {renderPane({
          paneIdentifier: 'right',
          isLeftMostPane: false,
          isRightMostPane: true,
          isDrawer: areSidePanesDrawers,
          areSidePanesDrawers,
          onSetPaneDrawerState: setPaneDrawerState,
          onSetPointerEventsNone: setRightPanePointerEventsNone,
        })}
      </div>
    </div>
  );
};
