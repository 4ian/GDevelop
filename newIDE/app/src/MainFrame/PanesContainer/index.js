// @flow

import * as React from 'react';
import classes from './PanesContainer.module.css';
import classNames from 'classnames';

type Props = {|
  renderPane: ({
    paneIdentifier: string,
    isLeftMost: boolean,
    isRightMost: boolean,
  }) => React.Node,
  isLeftPaneOpened: boolean,
|};

type DraggingState = {|
  startClientX: number,
  startWidth: number,
|};

const paneWidthMin = 100;

export const PanesContainer = ({ renderPane, isLeftPaneOpened }: Props) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const resizerRef = React.useRef<HTMLDivElement | null>(null);
  const leftPaneRef = React.useRef<HTMLDivElement | null>(null);
  const draggingStateRef = React.useRef<DraggingState | null>(null);

  React.useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const leftPane = leftPaneRef.current;
      const draggingState = draggingStateRef.current;
      if (!draggingState || !containerRef.current || !leftPane) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        draggingState.startWidth + (event.clientX - draggingState.startClientX);

      const min = paneWidthMin;
      const max = containerRect.width - paneWidthMin;
      const clampedWidth = Math.max(min, Math.min(max, newLeftWidth));

      leftPane.style.flexBasis = `${clampedWidth}px`;
    };

    const onPointerUp = () => {
      draggingStateRef.current = null;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      const leftPane = leftPaneRef.current;
      if (!leftPane) return;

      draggingStateRef.current = {
        startClientX: event.clientX,
        startWidth: leftPane.getBoundingClientRect().width,
      };
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    };

    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener('pointerdown', onPointerDown);
    }

    return () => {
      if (resizer) {
        resizer.removeEventListener('pointerdown', onPointerDown);
      }
    };
  }, []);

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
        aria-controls="pane-left pane-right"
        tabIndex={0}
        ref={resizerRef}
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
          isRightMost: true,
        })}
      </div>
    </div>
  );
};
