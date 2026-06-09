// @flow
import * as React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';

type Props = {|
  open: boolean,
  message: React.Node,
  action: React.Node,
|};

export type DraggableSnackBarInterface = {|
  resetPosition: () => void,
|};

type DragState = {|
  startX: number,
  startY: number,
  initialX: number,
  initialY: number,
|};

// Minimum pixels that must remain visible inside the viewport on any edge.
const MIN_VISIBLE_EDGE = 40;

/**
 * A Snackbar that the user can drag to any position. The parent can reset the
 * position (e.g. when the preview session ends) via the forwarded ref.
 */
const DraggableSnackBar: React.AbstractComponent<
  Props,
  DraggableSnackBarInterface
> = React.forwardRef(({ open, message, action }, ref) => {
  const [position, setPosition] = React.useState<{|
    x: number,
    y: number,
  |} | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragRef = React.useRef<DragState | null>(null);

  React.useImperativeHandle(ref, () => ({
    resetPosition: () => setPosition(null),
  }));

  const onMouseMove = React.useCallback((event: MouseEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const x = Math.max(
      -(window.innerWidth - MIN_VISIBLE_EDGE),
      Math.min(window.innerWidth - MIN_VISIBLE_EDGE, drag.initialX + dx)
    );
    const y = Math.max(
      0,
      Math.min(window.innerHeight - MIN_VISIBLE_EDGE, drag.initialY + dy)
    );
    setPosition({ x, y });
  }, []);

  const onMouseUp = React.useCallback(
    () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      // $FlowFixMe[extra-arg] - self-reference is intentional here
      window.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);
    },
    [onMouseMove]
  );

  React.useEffect(
    () => {
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [onMouseMove, onMouseUp]
  );

  const onMouseDown = (event: SyntheticMouseEvent<HTMLElement>) => {
    // Don't hijack clicks on the action buttons inside the toast.
    const target: any = event.target;
    if (target && target.closest && target.closest('button')) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialX: rect.left,
      initialY: rect.top,
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    setIsDragging(true);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      style={
        position
          ? {
              top: position.y,
              left: position.x,
              right: 'auto',
              justifyContent: 'flex-start',
              transform: 'none',
            }
          : { top: 96 }
      }
    >
      <SnackbarContent
        onMouseDown={onMouseDown}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
        message={message}
        action={action}
      />
    </Snackbar>
  );
});

export default DraggableSnackBar;
