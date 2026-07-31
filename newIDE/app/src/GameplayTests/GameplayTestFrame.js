// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import classNames from 'classnames';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import Text from '../UI/Text';
import IconButton from '../UI/IconButton';
import { textEllipsisStyle } from '../UI/TextEllipsis';
import MinimizeIcon from '../UI/CustomSvgIcons/Minimize';
import MaximizeIcon from '../UI/CustomSvgIcons/Maximize';
import StopIcon from '../UI/CustomSvgIcons/Stop';
import CrossIcon from '../UI/CustomSvgIcons/Cross';
import {
  formatRunDuration,
  GameplayTestStatusChip,
  isGameplayTestStatusInProgress,
  type GameplayTestDisplayStatus,
} from './GameplayTestStatusIndicator';
import classes from './GameplayTestFrame.module.css';

/** The status of the run displayed on the gameplay test frame. */
export type GameplayTestFrameRunStatus = {|
  testName: string,
  status: GameplayTestDisplayStatus,
  /** The frame reached by the test, if it started playing. */
  frame: number | null,
  durationMs: number | null,
  /** The position of the test in the batch being run (0-based) and its size. */
  testIndex: number,
  testsCount: number,
|};

// Distance kept between the frame and the borders of the window.
const windowMargin = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

type Position = {| left: number, bottom: number |};

const clampPositionToWindow = (
  position: Position,
  element: HTMLElement | null
): Position => {
  if (!element) return position;
  const { width, height } = element.getBoundingClientRect();
  return {
    left: clamp(
      position.left,
      windowMargin,
      Math.max(windowMargin, window.innerWidth - width - windowMargin)
    ),
    bottom: clamp(
      position.bottom,
      windowMargin,
      Math.max(windowMargin, window.innerHeight - height - windowMargin)
    ),
  };
};

type GameplayTestFrameLayoutProps = {|
  runStatus: GameplayTestFrameRunStatus | null,
  isMinimized: boolean,
  onToggleMinimized: () => void,
  onStopRequested: () => void,
  /**
   * The game itself (an iframe running the preview). It is always rendered,
   * even when minimized, so that the test keeps running.
   */
  children: React.Node,
|};

/**
 * The floating window shown while a gameplay test is running: a draggable
 * title bar with the status of the run, the game itself and a summary of
 * the run.
 *
 * Kept separate from `GameplayTestFrame` so that it can be shown in Storybook
 * without a running preview.
 */
export const GameplayTestFrameLayout = ({
  runStatus,
  isMinimized,
  onToggleMinimized,
  onStopRequested,
  children,
}: GameplayTestFrameLayoutProps): React.Node => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState<Position>({
    left: windowMargin,
    bottom: windowMargin,
  });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const dragOrigin = React.useRef<{|
    pointerId: number,
    clientX: number,
    clientY: number,
    position: Position,
  |} | null>(null);

  // Keep the frame inside the window when it is resized (or when the frame
  // grows back after being minimized).
  React.useEffect(() => {
    const onWindowResized = () => {
      setPosition(position =>
        clampPositionToWindow(position, containerRef.current)
      );
    };
    window.addEventListener('resize', onWindowResized);
    return () => window.removeEventListener('resize', onWindowResized);
  }, []);
  React.useEffect(
    () => {
      setPosition(position =>
        clampPositionToWindow(position, containerRef.current)
      );
    },
    [isMinimized]
  );

  const onPointerDown = React.useCallback(
    (event: PointerEvent) => {
      if (event.button !== 0) return;
      const currentTarget = event.currentTarget;
      if (!(currentTarget instanceof HTMLElement)) return;

      dragOrigin.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        position,
      };
      // $FlowFixMe[incompatible-type] - the Flow definition of `setPointerCapture` wrongly takes a string.
      currentTarget.setPointerCapture(event.pointerId);
      setIsDragging(true);
    },
    [position]
  );

  const onPointerMove = React.useCallback((event: PointerEvent) => {
    const origin = dragOrigin.current;
    if (!origin || origin.pointerId !== event.pointerId) return;

    setPosition(
      clampPositionToWindow(
        {
          left: origin.position.left + (event.clientX - origin.clientX),
          // The frame is anchored to the bottom of the window.
          bottom: origin.position.bottom - (event.clientY - origin.clientY),
        },
        containerRef.current
      )
    );
  }, []);

  const onPointerUp = React.useCallback((event: PointerEvent) => {
    const origin = dragOrigin.current;
    if (!origin || origin.pointerId !== event.pointerId) return;

    dragOrigin.current = null;
    setIsDragging(false);
  }, []);

  const isInProgress = runStatus
    ? isGameplayTestStatusInProgress(runStatus.status)
    : false;

  return (
    <div
      ref={containerRef}
      className={classNames({
        [classes.container]: true,
        [classes.minimized]: isMinimized,
        [classes.dragging]: isDragging,
      })}
      style={{ left: position.left, bottom: position.bottom }}
    >
      <div className={classes.header}>
        <div
          className={classes.dragHandle}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <span className={classes.grip} />
          <Text
            noMargin
            size="body-small"
            style={textEllipsisStyle}
            tooltip={runStatus ? runStatus.testName : undefined}
          >
            {runStatus && runStatus.testName ? (
              runStatus.testName
            ) : (
              <Trans>Gameplay test</Trans>
            )}
          </Text>
          {runStatus && runStatus.testsCount > 1 && (
            <Text
              noMargin
              size="body-small"
              color="secondary"
              noShrink
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              <Trans>
                {runStatus.testIndex + 1}/{runStatus.testsCount}
              </Trans>
            </Text>
          )}
        </div>
        <div className={classes.headerButtons}>
          <IconButton
            size="small"
            tooltip={isMinimized ? t`Show the game` : t`Minimize`}
            onClick={onToggleMinimized}
          >
            {isMinimized ? (
              <MaximizeIcon className={classes.headerIcon} />
            ) : (
              <MinimizeIcon className={classes.headerIcon} />
            )}
          </IconButton>
          <IconButton
            size="small"
            tooltip={isInProgress ? t`Stop the test` : t`Close`}
            onClick={onStopRequested}
          >
            {isInProgress ? (
              <StopIcon className={classes.headerIcon} />
            ) : (
              <CrossIcon className={classes.headerIcon} />
            )}
          </IconButton>
        </div>
      </div>
      <div
        className={classNames({
          [classes.gameArea]: true,
          [classes.hiddenGameArea]: isMinimized,
        })}
      >
        {children}
      </div>
      <div className={classes.footer}>
        <GameplayTestStatusChip
          size="small"
          status={runStatus ? runStatus.status : 'launching'}
        />
        {runStatus && runStatus.frame !== null && (
          <Text
            noMargin
            size="body-small"
            color="secondary"
            noShrink
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {isInProgress ? (
              <Trans>frame {runStatus.frame}</Trans>
            ) : (
              <Trans>
                {runStatus.frame} frames in{' '}
                {formatRunDuration(runStatus.durationMs || 0)}
              </Trans>
            )}
          </Text>
        )}
      </div>
    </div>
  );
};

let onSetGameplayTestFramePreviewLocation:
  | null
  | ((previewIndexHtmlLocation: string) => void) = null;
let onSetGameplayTestFrameRunStatus:
  | null
  | ((runStatus: GameplayTestFrameRunStatus | null) => void) = null;

/**
 * Point the gameplay test frame to a preview (and show it).
 * Called by the preview launchers when launching a preview
 * with `isForGameplayTest`.
 */
export const setGameplayTestFramePreviewLocation = ({
  previewIndexHtmlLocation,
}: {|
  previewIndexHtmlLocation: string,
|}) => {
  if (!onSetGameplayTestFramePreviewLocation)
    throw new Error('No GameplayTestFrame registered.');
  onSetGameplayTestFramePreviewLocation(previewIndexHtmlLocation);
};

/**
 * Close the gameplay test frame (unloading the game running in it).
 */
export const clearGameplayTestFramePreview = () => {
  if (!onSetGameplayTestFramePreviewLocation) return;
  onSetGameplayTestFramePreviewLocation('');
};

/**
 * Update the status of the run displayed on the gameplay test frame.
 */
export const setGameplayTestFrameRunStatus = (
  runStatus: GameplayTestFrameRunStatus | null
) => {
  if (!onSetGameplayTestFrameRunStatus) return;
  onSetGameplayTestFrameRunStatus(runStatus);
};

type Props = {|
  previewDebuggerServer: ?PreviewDebuggerServer,
  onStopRequested: () => void,
|};

/**
 * The floating window showing the game while a gameplay test is running,
 * with controls to stop the test or minimize the window (the test keeps
 * running when minimized).
 */
export const GameplayTestFrame = ({
  previewDebuggerServer,
  onStopRequested,
}: Props): React.Node => {
  const iframeRef = React.useRef<HTMLIFrameElement | null>(null);
  const [
    previewIndexHtmlLocation,
    setPreviewIndexHtmlLocation,
  ] = React.useState<string>('');
  const [
    runStatus,
    setRunStatus,
  ] = React.useState<GameplayTestFrameRunStatus | null>(null);
  const [isMinimized, setIsMinimized] = React.useState<boolean>(false);

  React.useEffect(() => {
    onSetGameplayTestFramePreviewLocation = (
      newPreviewIndexHtmlLocation: string
    ) => {
      setPreviewIndexHtmlLocation(newPreviewIndexHtmlLocation);
      setIsMinimized(false);
      // Don't show the status of a previous run when the frame is closed
      // then shown again.
      if (!newPreviewIndexHtmlLocation) setRunStatus(null);
    };
    onSetGameplayTestFrameRunStatus = setRunStatus;
    return () => {
      onSetGameplayTestFramePreviewLocation = null;
      onSetGameplayTestFrameRunStatus = null;
    };
  }, []);

  // Register the iframe window in the debugger as soon as the iframe is shown.
  React.useEffect(() => {
    const iframe = iframeRef.current;
    if (previewDebuggerServer && iframe && !!previewIndexHtmlLocation)
      previewDebuggerServer.registerGameplayTestFrame(iframe.contentWindow);
  });

  // Unregister the iframe window when the frame is closed or unmounted.
  React.useEffect(
    () => {
      const iframe = iframeRef.current;
      const previousPreviewDebuggerServer = previewDebuggerServer;
      return () => {
        if (previousPreviewDebuggerServer && iframe) {
          previousPreviewDebuggerServer.unregisterGameplayTestFrame(
            iframe.contentWindow
          );
        }
      };
    },
    [previewDebuggerServer, previewIndexHtmlLocation]
  );

  if (!previewIndexHtmlLocation) return null;

  const isInProgress = runStatus
    ? isGameplayTestStatusInProgress(runStatus.status)
    : false;

  return (
    <GameplayTestFrameLayout
      runStatus={runStatus}
      isMinimized={isMinimized}
      onToggleMinimized={() => setIsMinimized(!isMinimized)}
      onStopRequested={() => {
        if (isInProgress) {
          // Stop the test (and the whole run) - the frame stays open,
          // showing the outcome.
          onStopRequested();
        } else {
          // The run is finished: the button closes the frame, unloading
          // the game running in it.
          setPreviewIndexHtmlLocation('');
          setRunStatus(null);
        }
      }}
    >
      <iframe
        ref={iframeRef}
        title="Gameplay Test"
        src={previewIndexHtmlLocation}
        tabIndex={-1}
        // The test simulates all the inputs itself: never let the user
        // interact with (or focus) the game.
        className={classes.gameIframe}
      />
    </GameplayTestFrameLayout>
  );
};
