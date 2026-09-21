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
import PauseIcon from '../UI/CustomSvgIcons/Pause';
import {
  formatRunDuration,
  GameplayTestStatusChip,
  isGameplayTestStatusInProgress,
  type GameplayTestDisplayStatus,
} from './GameplayTestStatusIndicator';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import classes from './GameplayTestFrame.module.css';

/**
 * Why and for how long a run was frozen because the editor was in the
 * background (see the banner below).
 */
export type GameplayTestFrameHiddenPause = {|
  /** How long the game was frozen, in total. */
  pausedMs: number,
  /**
   * Whether the run was given up on (it stayed frozen for too long) rather
   * than resumed when the editor came back.
   */
  isRunInterrupted: boolean,
|};

// How long the "the test resumed by itself" banner stays before dismissing
// itself. Long enough to be read after coming back to the editor.
const RESUMED_BANNER_DURATION_MS = 12000;

/**
 * How long the run was paused, written for someone reading a message rather
 * than for a report: "paused for 40 seconds", "paused for 3 minutes".
 */
const renderPausedDurationTitle = (pausedMs: number): React.Node => {
  const seconds = Math.round(pausedMs / 1000);
  if (seconds < 90) return <Trans>Test paused for {seconds} seconds</Trans>;

  const minutes = Math.round(seconds / 60);
  return <Trans>Test paused for {minutes} minutes</Trans>;
};

type HiddenPauseBannerProps = {|
  hiddenPause: GameplayTestFrameHiddenPause,
  onDismiss: () => void,
|};

/**
 * Shown when a run was frozen because GDevelop was in the background: games
 * are not run by the browser in a hidden tab or a covered window, so the
 * test simply stopped progressing.
 *
 * This is the one thing that keeps a paused run from looking like a broken
 * game: the user (or the AI) must understand that nothing failed, that the
 * pause was not counted against the test, and what to do about it.
 */
export const GameplayTestHiddenPauseBanner = ({
  hiddenPause,
  onDismiss,
}: HiddenPauseBannerProps): React.Node => {
  const { pausedMs, isRunInterrupted } = hiddenPause;

  // A run that resumed on its own needs no action: say what happened, then
  // get out of the way. An interrupted one has to be run again, so it stays
  // until it is dismissed.
  React.useEffect(
    () => {
      if (isRunInterrupted) return;
      const timeoutId = setTimeout(onDismiss, RESUMED_BANNER_DURATION_MS);
      return () => clearTimeout(timeoutId);
    },
    [isRunInterrupted, onDismiss]
  );

  return (
    <div
      className={classNames({
        [classes.hiddenPauseBanner]: true,
        [classes.interrupted]: isRunInterrupted,
      })}
      role="status"
    >
      <span className={classes.hiddenPauseIcon}>
        <PauseIcon />
      </span>
      <div className={classes.hiddenPauseText}>
        <Text noMargin size="body-small" color="inherit">
          {isRunInterrupted ? (
            <Trans>Test paused - and not run to the end</Trans>
          ) : (
            renderPausedDurationTitle(pausedMs)
          )}
        </Text>
        <Text noMargin size="body-small" color="secondary">
          {isRunInterrupted ? (
            <Trans>
              GDevelop stayed in the background, where the browser stops running
              games. This is not a test failure - run it again with this window
              visible.
            </Trans>
          ) : (
            <Trans>
              GDevelop was in the background, where the browser stops running
              games. The test picked up where it left off, and the pause is not
              counted against it.
            </Trans>
          )}
        </Text>
      </div>
      <IconButton size="small" tooltip={t`Dismiss`} onClick={onDismiss}>
        <CrossIcon className={classes.headerIcon} />
      </IconButton>
      {!isRunInterrupted && (
        <span
          className={classes.hiddenPauseCountdown}
          style={{ animationDuration: `${RESUMED_BANNER_DURATION_MS}ms` }}
        />
      )}
    </div>
  );
};

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
// Larger at the top, to keep what is displayed there (like the tabs of the
// editor) reachable.
const windowTopMargin = windowMargin * 3;

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
      Math.max(windowMargin, window.innerHeight - height - windowTopMargin)
    ),
  };
};

// Game area width when the frame is opened: unobtrusive on top of the editor.
const defaultGameAreaWidth = 320;
// Below this, the header and footer of the frame become unusable.
const minGameAreaSize = { width: 240, height: 135 };

/*
 * The game window (the iframe running the preview) is always exactly the
 * game resolution: the game runs as in a preview window of this size and
 * can never observe the frame being moved, resized or minimized. The frame
 * only displays it at a variable zoom - the only thing resizing changes.
 * The aspect ratio of the game area is thus always the game one.
 */

/** The smallest zoom keeping the frame usable. */
const getMinZoomFactor = (gameResolution: Size): number =>
  Math.max(
    minGameAreaSize.width / gameResolution.width,
    minGameAreaSize.height / gameResolution.height
  );

/**
 * The largest allowed zoom: 1 (a game displayed larger than its resolution
 * would only be blurry), unless more is needed to reach the minimum frame
 * size (for games with a tiny resolution).
 */
const getMaxZoomFactor = (gameResolution: Size): number =>
  Math.max(1, getMinZoomFactor(gameResolution));

/** The zoom used when the frame is opened for the first time. */
const getDefaultZoomFactor = (gameResolution: Size): number =>
  clamp(
    defaultGameAreaWidth / gameResolution.width,
    getMinZoomFactor(gameResolution),
    getMaxZoomFactor(gameResolution)
  );

/** The size of the game area: the game resolution, displayed at this zoom. */
const getGameAreaSize = (gameResolution: Size, zoomFactor: number): Size => ({
  width: Math.round(gameResolution.width * zoomFactor),
  height: Math.round(gameResolution.height * zoomFactor),
});

// Approximate height of the chrome around the game area, to clamp the
// restored zoom before the frame is rendered (and can be measured).
const approximateFrameChromeHeight = 70;

/**
 * Clamp the zoom so the frame fits in the window - unless even the minimum
 * usable size does not (`clampPositionToWindow` then keeps the frame
 * reachable). `chromeWidth`/`chromeHeight` are the size of the borders,
 * header and footer around the game area.
 */
const clampZoomFactorToWindow = (
  zoomFactor: number,
  gameResolution: Size,
  chromeWidth: number,
  chromeHeight: number
): number => {
  const fittingZoomFactor = Math.min(
    (window.innerWidth - 2 * windowMargin - chromeWidth) / gameResolution.width,
    (window.innerHeight - windowMargin - windowTopMargin - chromeHeight) /
      gameResolution.height
  );
  const minZoomFactor = getMinZoomFactor(gameResolution);
  return clamp(
    zoomFactor,
    minZoomFactor,
    Math.max(
      minZoomFactor,
      Math.min(getMaxZoomFactor(gameResolution), fittingZoomFactor)
    )
  );
};

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
  /** Set when the run was frozen because the editor was in the background. */
  hiddenPause: GameplayTestFrameHiddenPause | null,
  onDismissHiddenPause: () => void,
  isMinimized: boolean,
  onToggleMinimized: () => void,
  onStopRequested: () => void,
  /**
   * The game resolution: the game window is fixed at exactly this size,
   * the frame only displays it zoomed.
   */
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
  hiddenPause,
  onDismissHiddenPause,
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
    setGameplayTestFrameZoomFactor,
  } = React.useContext(PreferencesContext);
  // Restore the last position of the frame (it will be clamped to the window
  // as soon as it is rendered, in case the window is now smaller).
  const [position, setPosition] = React.useState<Position>(
    () =>
      values.gameplayTestFramePosition || {
        left: windowMargin,
        bottom: windowMargin,
      }
  );
  // Restore the last zoom, clamped in case the window is now smaller (or
  // this project has a larger game resolution).
  const [zoomFactor, setZoomFactor] = React.useState<number>(() =>
    clampZoomFactorToWindow(
      values.gameplayTestFrameZoomFactor ||
        getDefaultZoomFactor(gameResolution),
      gameResolution,
      0,
      approximateFrameChromeHeight
    )
  );
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
    zoomFactor: number,
    size: Size,
    direction: ResizeDirection,
    /** Size of the chrome (borders, header, footer) around the game area. */
    chromeWidth: number,
    chromeHeight: number,
  |} | null>(null);

  // Keep the frame inside the window: zoom out if the window got too small
  // for the frame (not when minimized: the game area is then 1x1 and the
  // chrome around it can't be measured), then clamp the position.
  const keepFrameInsideWindow = React.useCallback(
    () => {
      const container = containerRef.current;
      const gameArea = gameAreaRef.current;
      if (!isMinimized && container && gameArea) {
        const containerRect = container.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();
        setZoomFactor(zoomFactor =>
          clampZoomFactorToWindow(
            zoomFactor,
            gameResolution,
            containerRect.width - gameAreaRect.width,
            containerRect.height - gameAreaRect.height
          )
        );
      }
      setPosition(position => clampPositionToWindow(position, container));
    },
    [isMinimized, gameResolution]
  );

  // Apply it when the window is resized, and when the frame is first
  // rendered or grows back after being minimized.
  React.useEffect(
    () => {
      window.addEventListener('resize', keepFrameInsideWindow);
      return () => window.removeEventListener('resize', keepFrameInsideWindow);
    },
    [keepFrameInsideWindow]
  );
  React.useEffect(keepFrameInsideWindow, [keepFrameInsideWindow]);

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
        zoomFactor,
        size: getGameAreaSize(gameResolution, zoomFactor),
        direction,
        chromeWidth: containerRect.width - gameAreaRect.width,
        chromeHeight: containerRect.height - gameAreaRect.height,
      };
      // $FlowFixMe[incompatible-type] - the Flow definition of `setPointerCapture` wrongly takes a string.
      currentTarget.setPointerCapture(event.pointerId);
      setIsResizing(true);
    },
    [position, zoomFactor, gameResolution]
  );

  const onResizePointerMove = React.useCallback(
    (event: PointerEvent) => {
      const origin = resizeOrigin.current;
      if (!origin || origin.pointerId !== event.pointerId) return;

      // The aspect ratio is fixed (it is the game one): resizing only
      // changes the zoom. Moving the pointer outwards zooms in.
      const deltaX = event.clientX - origin.clientX;
      const deltaY = event.clientY - origin.clientY;
      const widthDelta = origin.direction.includes('left')
        ? -deltaX
        : origin.direction.includes('right')
        ? deltaX
        : 0;
      const heightDelta = origin.direction.includes('top')
        ? -deltaY
        : origin.direction.includes('bottom')
        ? deltaY
        : 0;
      const zoomFactorFromWidth =
        origin.zoomFactor + widthDelta / gameResolution.width;
      const zoomFactorFromHeight =
        origin.zoomFactor + heightDelta / gameResolution.height;
      // On corners, follow the axis on which the pointer moved the most.
      const newZoomFactor =
        Math.abs(zoomFactorFromWidth - origin.zoomFactor) >=
        Math.abs(zoomFactorFromHeight - origin.zoomFactor)
          ? zoomFactorFromWidth
          : zoomFactorFromHeight;

      // The window space available for the two moving edges to grow into
      // (the two others are anchored and stay in place).
      const maxWidth = origin.direction.includes('left')
        ? origin.size.width + origin.position.left - windowMargin
        : window.innerWidth -
          windowMargin -
          origin.position.left -
          origin.chromeWidth;
      const maxHeight = origin.direction.includes('bottom')
        ? origin.size.height + origin.position.bottom - windowMargin
        : window.innerHeight -
          windowTopMargin -
          origin.position.bottom -
          origin.chromeHeight;
      const minZoomFactor = getMinZoomFactor(gameResolution);
      const clampedZoomFactor = clamp(
        newZoomFactor,
        minZoomFactor,
        Math.max(
          minZoomFactor,
          Math.min(
            getMaxZoomFactor(gameResolution),
            maxWidth / gameResolution.width,
            maxHeight / gameResolution.height
          )
        )
      );

      // Keep the anchored edges in place: growing from the left moves the
      // frame left, growing from the bottom moves it down.
      const newSize = getGameAreaSize(gameResolution, clampedZoomFactor);
      const newPosition = { ...origin.position };
      if (origin.direction.includes('left')) {
        newPosition.left =
          origin.position.left + (origin.size.width - newSize.width);
      }
      if (origin.direction.includes('bottom')) {
        newPosition.bottom =
          origin.position.bottom - (newSize.height - origin.size.height);
      }

      setZoomFactor(clampedZoomFactor);
      setPosition(newPosition);
    },
    [gameResolution]
  );

  const onResizePointerUp = React.useCallback(
    (event: PointerEvent) => {
      const origin = resizeOrigin.current;
      if (!origin || origin.pointerId !== event.pointerId) return;

      resizeOrigin.current = null;
      setIsResizing(false);
      setGameplayTestFrameZoomFactor(zoomFactor);
      // Resizing from the left or bottom edges also moves the frame.
      setGameplayTestFramePosition(position);
    },
    [
      zoomFactor,
      setGameplayTestFrameZoomFactor,
      position,
      setGameplayTestFramePosition,
    ]
  );

  const isInProgress = runStatus
    ? isGameplayTestStatusInProgress(runStatus.status)
    : false;

  const gameAreaSize = getGameAreaSize(gameResolution, zoomFactor);

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
      {hiddenPause && (
        <GameplayTestHiddenPauseBanner
          hiddenPause={hiddenPause}
          onDismiss={onDismissHiddenPause}
        />
      )}
      <div
        ref={gameAreaRef}
        className={classNames({
          [classes.gameArea]: true,
          [classes.hiddenGameArea]: isMinimized,
        })}
        style={
          // When minimized, let the CSS shrink the game area to 1x1 pixel.
          isMinimized
            ? undefined
            : { width: gameAreaSize.width, height: gameAreaSize.height }
        }
      >
        {/* The game window: always exactly the game resolution, only its
            displayed zoom changes - the game runs as in a preview window of
            this size and cannot observe the frame being moved, resized or
            minimized (minimizing only clips it, so the game keeps rendering
            and the test keeps running). Only the test itself can change the
            game resolution (see `setGameResolutionSize` in the harness):
            the game is then displayed fitted in this same window. */}
        <div
          className={classes.gameScaler}
          style={{
            width: gameResolution.width,
            height: gameResolution.height,
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
      {/* Resizing only changes the zoom at which the game is displayed:
          the game cannot observe it, so it is harmless even while a test
          is running. */}
      {!isMinimized &&
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
let onSetGameplayTestFrameHiddenPause:
  | null
  | ((hiddenPause: GameplayTestFrameHiddenPause | null) => void) = null;

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
   * The game resolution: the game window is fixed at exactly this size,
   * the frame only displays it zoomed.
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

/**
 * Show (or hide, with null) the banner telling that the run was frozen
 * because GDevelop was in the background.
 */
export const setGameplayTestFrameHiddenPause = (
  hiddenPause: GameplayTestFrameHiddenPause | null
) => {
  if (!onSetGameplayTestFrameHiddenPause) return;
  onSetGameplayTestFrameHiddenPause(hiddenPause);
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
  const [
    hiddenPause,
    setHiddenPause,
  ] = React.useState<GameplayTestFrameHiddenPause | null>(null);
  // Set together with the preview location, by the launcher starting the game.
  const [gameResolution, setGameResolution] = React.useState<Size | null>(null);

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
      if (!newPreviewIndexHtmlLocation) {
        setRunStatus(null);
        setHiddenPause(null);
      }
    };
    onSetGameplayTestFrameRunStatus = setRunStatus;
    onSetGameplayTestFrameHiddenPause = setHiddenPause;
    return () => {
      onSetGameplayTestFramePreviewLocation = null;
      onSetGameplayTestFrameRunStatus = null;
      onSetGameplayTestFrameHiddenPause = null;
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

  if (!previewIndexHtmlLocation || !gameResolution) return null;

  const isInProgress = runStatus
    ? isGameplayTestStatusInProgress(runStatus.status)
    : false;

  return (
    <GameplayTestFrameLayout
      runStatus={runStatus}
      hiddenPause={hiddenPause}
      onDismissHiddenPause={() => setHiddenPause(null)}
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
          setHiddenPause(null);
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
