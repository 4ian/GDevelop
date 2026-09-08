// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import classNames from 'classnames';
import Text from './Text';
import IconButton from './IconButton';
import { textEllipsisStyle } from './TextEllipsis';
import MinimizeIcon from './CustomSvgIcons/Minimize';
import MaximizeIcon from './CustomSvgIcons/Maximize';
import CrossIcon from './CustomSvgIcons/Cross';
import classes from './FloatingPanel.module.css';

const windowMargin = 12;
// Larger at the top, to keep what is displayed there (like the tabs of the
// editor) reachable.
const windowTopMargin = windowMargin * 3;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

type Position = {| left: number, bottom: number |};
type Size = {| width: number, height: number |};

const clampPositionToWindow = (position: Position, size: Size): Position => ({
  left: clamp(
    position.left,
    windowMargin,
    Math.max(windowMargin, window.innerWidth - size.width - windowMargin)
  ),
  bottom: clamp(
    position.bottom,
    windowMargin,
    Math.max(windowMargin, window.innerHeight - size.height - windowTopMargin)
  ),
});

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

type Props = {|
  title: React.Node,
  children: React.Node,
  onClose: () => void,
  /** Where the panel opens, from the bottom-left corner of the window. */
  initialPosition?: Position,
  initialSize?: Size,
  minSize?: Size,
|};

/**
 * A small panel floating over the editor, that can be moved by its title bar,
 * resized by its borders, minimized and closed (the same look as the gameplay
 * test frame).
 */
const FloatingPanel = ({
  title,
  children,
  onClose,
  initialPosition,
  initialSize,
  minSize,
}: Props): React.Node => {
  const effectiveMinSize = minSize || { width: 240, height: 120 };
  const [position, setPosition] = React.useState<Position>(
    initialPosition || { left: windowMargin, bottom: windowMargin }
  );
  const [size, setSize] = React.useState<Size>(
    initialSize || { width: 360, height: 260 }
  );
  const [isMinimized, setIsMinimized] = React.useState<boolean>(false);
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
  |} | null>(null);

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

  const onPointerMove = React.useCallback(
    (event: PointerEvent) => {
      const origin = dragOrigin.current;
      if (!origin || origin.pointerId !== event.pointerId) return;

      setPosition(
        clampPositionToWindow(
          {
            left: origin.position.left + (event.clientX - origin.clientX),
            // The panel is anchored to the bottom of the window.
            bottom: origin.position.bottom - (event.clientY - origin.clientY),
          },
          size
        )
      );
    },
    [size]
  );

  const onPointerUp = React.useCallback((event: PointerEvent) => {
    const origin = dragOrigin.current;
    if (!origin || origin.pointerId !== event.pointerId) return;

    dragOrigin.current = null;
    setIsDragging(false);
  }, []);

  const onResizePointerDown = React.useCallback(
    (direction: ResizeDirection, event: PointerEvent) => {
      if (event.button !== 0) return;
      const currentTarget = event.currentTarget;
      if (!(currentTarget instanceof HTMLElement)) return;

      resizeOrigin.current = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        position,
        size,
        direction,
      };
      // $FlowFixMe[incompatible-type] - the Flow definition of `setPointerCapture` wrongly takes a string.
      currentTarget.setPointerCapture(event.pointerId);
      setIsResizing(true);
    },
    [position, size]
  );

  const onResizePointerMove = React.useCallback(
    (event: PointerEvent) => {
      const origin = resizeOrigin.current;
      if (!origin || origin.pointerId !== event.pointerId) return;

      const deltaX = event.clientX - origin.clientX;
      const deltaY = event.clientY - origin.clientY;
      const { direction } = origin;

      // The window space available for the moving edges to grow into (the
      // others are anchored and stay in place).
      const maxWidth = direction.includes('left')
        ? origin.size.width + origin.position.left - windowMargin
        : window.innerWidth - windowMargin - origin.position.left;
      const maxHeight = direction.includes('bottom')
        ? origin.size.height + origin.position.bottom - windowMargin
        : window.innerHeight - windowTopMargin - origin.position.bottom;

      const newSize = { ...origin.size };
      if (direction.includes('left')) {
        newSize.width = origin.size.width - deltaX;
      } else if (direction.includes('right')) {
        newSize.width = origin.size.width + deltaX;
      }
      if (direction.includes('top')) {
        newSize.height = origin.size.height - deltaY;
      } else if (direction.includes('bottom')) {
        newSize.height = origin.size.height + deltaY;
      }
      newSize.width = clamp(
        newSize.width,
        effectiveMinSize.width,
        Math.max(effectiveMinSize.width, maxWidth)
      );
      newSize.height = clamp(
        newSize.height,
        effectiveMinSize.height,
        Math.max(effectiveMinSize.height, maxHeight)
      );

      // Keep the anchored edges in place: growing from the left moves the
      // panel left, growing from the bottom moves it down.
      const newPosition = { ...origin.position };
      if (direction.includes('left')) {
        newPosition.left =
          origin.position.left + (origin.size.width - newSize.width);
      }
      if (direction.includes('bottom')) {
        newPosition.bottom =
          origin.position.bottom - (newSize.height - origin.size.height);
      }

      setSize(newSize);
      setPosition(newPosition);
    },
    [effectiveMinSize.width, effectiveMinSize.height]
  );

  const onResizePointerUp = React.useCallback((event: PointerEvent) => {
    const origin = resizeOrigin.current;
    if (!origin || origin.pointerId !== event.pointerId) return;

    resizeOrigin.current = null;
    setIsResizing(false);
  }, []);

  return (
    <div
      className={classNames({
        [classes.container]: true,
        [classes.dragging]: isDragging,
        [classes.resizing]: isResizing,
      })}
      style={{
        left: position.left,
        bottom: position.bottom,
        width: size.width,
        height: isMinimized ? undefined : size.height,
      }}
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
          <Text noMargin size="body-small" style={textEllipsisStyle}>
            {title}
          </Text>
        </div>
        <div className={classes.headerButtons}>
          <IconButton
            size="small"
            tooltip={isMinimized ? t`Expand` : t`Minimize`}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? (
              <MaximizeIcon className={classes.headerIcon} />
            ) : (
              <MinimizeIcon className={classes.headerIcon} />
            )}
          </IconButton>
          <IconButton size="small" tooltip={t`Close`} onClick={onClose}>
            <CrossIcon className={classes.headerIcon} />
          </IconButton>
        </div>
      </div>
      {!isMinimized && <div className={classes.content}>{children}</div>}
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

export default FloatingPanel;
