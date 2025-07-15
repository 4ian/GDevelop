// @flow

import * as React from 'react';
import classes from './PanesContainer.module.css';
import classNames from 'classnames';
import useForceUpdate from '../../Utils/UseForceUpdate';
import { useDebounce } from '../../Utils/UseDebounce';

type Props = {|
  renderPane: ({
    paneIdentifier: string,
    isLeftMost: boolean,
    isRightMost: boolean,
  }) => React.Node,
  isLeftPaneOpened: boolean,
  isRightPaneOpened: boolean,
|};

type DraggingState = {|
  paneIdentifier: 'left' | 'right',
  startClientX: number,
  startWidth: number,
|};

const paneWidthMin = 300;

export const PanesContainer = ({
  renderPane,
  isLeftPaneOpened,
  isRightPaneOpened,
}: Props) => {
  const forceUpdate = useForceUpdate();
  const debouncedForceUpdate = useDebounce(forceUpdate, 200);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const leftResizerRef = React.useRef<HTMLDivElement | null>(null);
  const leftPaneRef = React.useRef<HTMLDivElement | null>(null);
  const rightPaneRef = React.useRef<HTMLDivElement | null>(null);
  const rightResizerRef = React.useRef<HTMLDivElement | null>(null);

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
    [debouncedForceUpdate]
  );

  return (
    <div
      ref={containerRef}
      className={classes.container}
      role="group"
      aria-label="Resizable split pane"
    >
      <div
        ref={leftPaneRef}
        className={classNames({
          [classes.pane]: true,
          [classes.leftPane]: true,
          [classes.hidden]: !isLeftPaneOpened,
        })}
        id="pane-left"
      >
        {renderPane({
          paneIdentifier: 'left',
          isLeftMost: true,
          isRightMost: false,
        })}
      </div>
      <div
        className={classNames({
          [classes.resizer]: true,
          [classes.hidden]: !isLeftPaneOpened,
        })}
        role="separator"
        aria-orientation="vertical"
        aria-controls="pane-left pane-center"
        tabIndex={0}
        ref={leftResizerRef}
      />
      <div
        className={classNames({
          [classes.pane]: true,
          [classes.centerPane]: true,
        })}
        id="pane-right"
      >
        {renderPane({
          paneIdentifier: 'center',
          isLeftMost: !isLeftPaneOpened,
          isRightMost: !isRightPaneOpened,
        })}
      </div>
      <div
        className={classNames({
          [classes.resizer]: true,
          [classes.hidden]: !isRightPaneOpened,
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
          [classes.hidden]: !isRightPaneOpened,
        })}
        id="pane-right"
      >
        {renderPane({
          paneIdentifier: 'right',
          isLeftMost: false,
          isRightMost: true,
        })}
      </div>
    </div>
  );
};
