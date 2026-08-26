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
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
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
type Size = {| width: number, height: number |};

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

// Resolution assumed for the game before a preview is launched.
const fallbackGameResolution = { width: 1280, height: 720 };

// Game area width when the frame is opened: unobtrusive on top of the editor.
const defaultGameAreaWidth = 320;
const minGameAreaSize = { width: 240, height: 135 };

/**
 * The fixed zoom at which the game is displayed: the game window is always
 * `game area size / zoom`. Resizing the frame resizes the game window (like
 * resizing a preview window would), never the scale.
 */
const getGameZoomFactor = (gameResolution: Size): number =>
  // Never zoom in: a small game would only be displayed blurry.
  Math.min(1, defaultGameAreaWidth / gameResolution.width);

/** Game area size at which the game window is exactly the game resolution. */
const getDefaultGameAreaSize = (gameResolution: Size): Size => {
  const zoomFactor = getGameZoomFactor(gameResolution);
  return {
    width: Math.max(
      minGameAreaSize.width,
      Math.round(gameResolution.width * zoomFactor)
    ),
    height: Math.max(
      minGameAreaSize.height,
      Math.round(gameResolution.height * zoomFactor)
    ),
  };
};
// Approximate height of the chrome around the game area, to clamp the
// restored size before the frame is rendered (and can be measured).
const approximateFrameChromeHeight = 70;

type ResizeDirection =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

const resizeHandles: Array<{|
  direction: ResizeDirection,
  className: string,
|}> = [
  { direction: 'left', className: classes.resizeLeft },
  { direction: 'right', className: classes.resizeRight },
  { direction: 'top', className: classes.resizeTop },
  { direction: 'bottom', className: classes.resizeBottom },
  { direction: 'top-left', className: classes.resizeTopLeft },
  { direction: 'top-right', className: classes.resizeTopRight },
  { direction: 'bottom-left', className: classes.resizeBottomLeft },
  { direction: 'bottom-right', className: classes.resizeBottomRight },
];

type GameplayTestFrameLayoutProps = {|
  runStatus: GameplayTestFrameRunStatus | null,
  isMinimized: boolean,
  onToggleMinimized: () => void,
  onStopRequested: () => void,
  /** The game resolution, giving the display zoom (see `getGameZoomFactor`). */
  gameResolution: Size,
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
  gameResolution,
  children,
}: GameplayTestFrameLayoutProps): React.Node => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const gameAreaRef = React.useRef<HTMLDivElement | null>(null);
  const {
    values,
    setGameplayTestFramePosition,
    setGameplayTestFrameSize,
  } = React.useContext(PreferencesContext);
  const zoomFactor = getGameZoomFactor(gameResolution);
  // Restore the last position of the frame (it will be clamped to the window
  // as soon as it is rendered, in case the window is now smaller).
  const [position, setPosition] = React.useState<Position>(
    () =>
      values.gameplayTestFramePosition || {
        left: windowMargin,
        bottom: windowMargin,
      }
  );
  // Restore the last size, clamped in case the window is now smaller.
  const [size, setSize] = React.useState<Size>(() => {
    const savedSize = values.gameplayTestFrameSize;
    if (!savedSize) return getDefaultGameAreaSize(gameResolution);
    return {
      width: clamp(
        savedSize.width,
        minGameAreaSize.width,
        Math.max(minGameAreaSize.width, window.innerWidth - 2 * windowMargin)
      ),
      height: clamp(
        savedSize.height,
        minGameAreaSize.height,
        Math.max(
          minGameAreaSize.height,
          window.innerHeight - 2 * windowMargin - approximateFrameChromeHeight
        )
      ),
    };
  });
  const [isDragging, setIsDragging] = React.useState<boolean>(false);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const dragOrigin = React.useRef<{|
    pointerId: number,
    clientX: number,
    clientY: number,
    position: Position,
  |} | null>(null);
  const resizeOrigin = React.useRef<{|
    pointerId: number,
    clientX: number,
    clientY: number,
    position: Position,
    size: Size,
    direction: ResizeDirection,
    /** Size of the chrome (borders, header, footer) around the game area. */
    chromeWidth: number,
    chromeHeight: number,
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

  const onPointerUp = React.useCallback(
    (event: PointerEvent) => {
      const origin = dragOrigin.current;
      if (!origin || origin.pointerId !== event.pointerId) return;

      dragOrigin.current = null;
      setIsDragging(false);
      setGameplayTestFramePosition(position);
    },
    [position, setGameplayTestFramePosition]
  );

  const onResizePointerDown = React.useCallback(
    (direction: ResizeDirection, event: PointerEvent) => {
      if (event.button !== 0) return;
      const currentTarget = event.currentTarget;
      if (!(currentTarget instanceof HTMLElement)) return;
      const container = containerRef.current;
      const gameArea = gameAreaRef.current;
      if (!container || !gameArea) return;

      const containerRect = container.getBoundingClientRect();
      const gameAreaRect = gameArea.getBoundingClientRect();
      resizeOrigin.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        position,
        size,
        direction,
        chromeWidth: containerRect.width - gameAreaRect.width,
        chromeHeight: containerRect.height - gameAreaRect.height,
      };
      // $FlowFixMe[incompatible-type] - the Flow definition of `setPointerCapture` wrongly takes a string.
      currentTarget.setPointerCapture(event.pointerId);
      setIsResizing(true);
    },
    [position, size]
  );

  const onResizePointerMove = React.useCallback((event: PointerEvent) => {
    const origin = resizeOrigin.current;
    if (!origin || origin.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - origin.clientX;
    const deltaY = event.clientY - origin.clientY;
    const newSize = { ...origin.size };
    const newPosition = { ...origin.position };

    if (origin.direction.includes('right')) {
      // The left border stays in place: only the width changes.
      const maxWidth =
        window.innerWidth -
        windowMargin -
        origin.position.left -
        origin.chromeWidth;
      newSize.width = clamp(
        origin.size.width + deltaX,
        minGameAreaSize.width,
        Math.max(minGameAreaSize.width, maxWidth)
      );
    } else if (origin.direction.includes('left')) {
      // The right border stays in place: the frame moves as it grows.
      const maxWidth = origin.size.width + origin.position.left - windowMargin;
      newSize.width = clamp(
        origin.size.width - deltaX,
        minGameAreaSize.width,
        Math.max(minGameAreaSize.width, maxWidth)
      );
      newPosition.left =
        origin.position.left + (origin.size.width - newSize.width);
    }
    if (origin.direction.includes('top')) {
      // Anchored to the window bottom: the frame grows upwards without moving.
      const maxHeight =
        window.innerHeight -
        windowMargin -
        origin.position.bottom -
        origin.chromeHeight;
      newSize.height = clamp(
        origin.size.height - deltaY,
        minGameAreaSize.height,
        Math.max(minGameAreaSize.height, maxHeight)
      );
    } else if (origin.direction.includes('bottom')) {
      // The top border stays in place: the frame moves down as it grows.
      const maxHeight =
        origin.size.height + origin.position.bottom - windowMargin;
      newSize.height = clamp(
        origin.size.height + deltaY,
        minGameAreaSize.height,
        Math.max(minGameAreaSize.height, maxHeight)
      );
      newPosition.bottom =
        origin.position.bottom - (newSize.height - origin.size.height);
    }

    setSize(newSize);
    setPosition(newPosition);
  }, []);

  const onResizePointerUp = React.useCallback(
    (event: PointerEvent) => {
      const origin = resizeOrigin.current;
      if (!origin || origin.pointerId !== event.pointerId) return;

      resizeOrigin.current = null;
      setIsResizing(false);
      setGameplayTestFrameSize(size);
      // Resizing from the left or bottom edges also moves the frame.
      setGameplayTestFramePosition(position);
    },
    [size, setGameplayTestFrameSize, position, setGameplayTestFramePosition]
  );

  const isInProgress = runStatus
    ? isGameplayTestStatusInProgress(runStatus.status)
    : false;

  // Cancel any resize in progress when a test starts.
  React.useEffect(
    () => {
      if (isInProgress) {
        resizeOrigin.current = null;
        setIsResizing(false);
      }
    },
    [isInProgress]
  );

  return (
    <div
      ref={containerRef}
      className={classNames({
        [classes.container]: true,
        [classes.minimized]: isMinimized,
        [classes.dragging]: isDragging,
        [classes.resizing]: isResizing,
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
        ref={gameAreaRef}
        className={classNames({
          [classes.gameArea]: true,
          [classes.hiddenGameArea]: isMinimized,
        })}
        style={
          // When minimized, let the CSS shrink the game area to 1x1 pixel.
          isMinimized ? undefined : { width: size.width, height: size.height }
        }
      >
        {/* The game window: the game area at 1:1 scale, displayed zoomed
            out - the game runs like in a preview window of this size. When
            minimized it is only clipped, so the game keeps rendering and
            the test keeps running. */}
        <div
          className={classes.gameScaler}
          style={{
            width: Math.round(size.width / zoomFactor),
            height: Math.round(size.height / zoomFactor),
            transform: `translate(-50%, -50%) scale(${zoomFactor})`,
          }}
        >
          {children}
        </div>
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
      {/* Resizing resizes the game window, which would skew a running
          test: only allow it when no test is in progress. */}
      {!isMinimized &&
        !isInProgress &&
        resizeHandles.map(({ direction, className }) => (
          <div
            key={direction}
            className={classNames(classes.resizeHandle, className)}
            onPointerDown={event => onResizePointerDown(direction, event)}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onPointerCancel={onResizePointerUp}
          />
        ))}
    </div>
  );
};

let onSetGameplayTestFramePreviewLocation:
  | null
  | ((
      previewIndexHtmlLocation: string,
      gameResolution: Size | null
    ) => void) = null;
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
  gameResolution,
}: {|
  previewIndexHtmlLocation: string,
  /**
   * The game resolution: the frame opens with the game window at exactly
   * this size (see `getGameZoomFactor`).
   */
  gameResolution: Size,
|}) => {
  if (!onSetGameplayTestFramePreviewLocation)
    throw new Error('No GameplayTestFrame registered.');
  onSetGameplayTestFramePreviewLocation(
    previewIndexHtmlLocation,
    gameResolution
  );
};

/**
 * Close the gameplay test frame (unloading the game running in it).
 */
export const clearGameplayTestFramePreview = () => {
  if (!onSetGameplayTestFramePreviewLocation) return;
  onSetGameplayTestFramePreviewLocation('', null);
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
  const [gameResolution, setGameResolution] = React.useState<Size>(
    fallbackGameResolution
  );

  React.useEffect(() => {
    onSetGameplayTestFramePreviewLocation = (
      newPreviewIndexHtmlLocation: string,
      newGameResolution: Size | null
    ) => {
      setPreviewIndexHtmlLocation(newPreviewIndexHtmlLocation);
      if (newGameResolution) setGameResolution(newGameResolution);
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
      gameResolution={gameResolution}
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
