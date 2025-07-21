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
    isLeftMost: boolean,
    isRightMost: boolean,
    isDrawer: boolean,
    onSetPointerEventsNone: (enablePointerEventsNone: boolean) => void,
    panesDrawerState: { [string]: FloatingPaneState },
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
      if (isMobile) {
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
    [isMobile]
  );

  React.useEffect(
    () => {
      if (hasEditorsInRightPane) {
        // Just opened the first editor in the right pane: ensure the drawer
        // pane is shown.
        // Note that is the screen is big enough so that drawers are not shown,
        // the state is "open" anyway, this is fine.
        setPanesDrawerState(panesDrawerState => ({
          ...panesDrawerState,
          right: 'open',
        }));
      }
    },
    [hasEditorsInRightPane]
  );

  React.useEffect(
    () => {
      if (hasEditorsInLeftPane) {
        // Just opened the first editor in the left pane: ensure the drawer
        // pane is shown.
        // Note that is the screen is big enough so that drawers are not shown,
        // the state is "open" anyway, this is fine.
        setPanesDrawerState(panesDrawerState => ({
          ...panesDrawerState,
          left: 'open',
        }));
      }
    },
    [hasEditorsInLeftPane]
  );

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
          [classes.drawer]: isMobile,
          [classes.closedDrawer]:
            isMobile && panesDrawerState['left'] === 'closed',
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
          isLeftMost: true,
          isRightMost: false,
          isDrawer: isMobile,
          panesDrawerState,
          onSetPaneDrawerState: setPaneDrawerState,
          onSetPointerEventsNone: setLeftPanePointerEventsNone,
        })}
      </div>
      <div
        className={classNames({
          [classes.resizer]: true,
          [classes.hidden]: !hasEditorsInLeftPane || isMobile,
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
          isLeftMost: isMobile || !hasEditorsInLeftPane,
          isRightMost: isMobile || !hasEditorsInRightPane,
          isDrawer: false,
          panesDrawerState,
          onSetPaneDrawerState: setPaneDrawerState,
          onSetPointerEventsNone: setCenterPanePointerEventsNone,
        })}
      </div>
      <div
        className={classNames({
          [classes.resizer]: true,
          [classes.hidden]: !hasEditorsInRightPane || isMobile,
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
          [classes.drawer]: isMobile,
          [classes.closedDrawer]:
            isMobile && panesDrawerState['right'] === 'closed',
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
          isLeftMost: false,
          isRightMost: true,
          isDrawer: isMobile,
          panesDrawerState,
          onSetPaneDrawerState: setPaneDrawerState,
          onSetPointerEventsNone: setRightPanePointerEventsNone,
        })}
      </div>
    </div>
  );
};
