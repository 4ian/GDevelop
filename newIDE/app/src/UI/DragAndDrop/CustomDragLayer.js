// @flow
import * as React from 'react';
import { DragLayer } from 'react-dnd';
import { Identifier } from 'dnd-core';
import Text from '../Text';
import { instancesEditorId } from '../../InstancesEditor';
import {
  useScreenType,
  type ScreenType,
} from '../Responsive/ScreenTypeMeasurer';
import { CorsAwareImage } from '../CorsAwareImage';
import { type DraggedItem } from './DragSourceAndDropTarget';
import { swipeableDrawerContainerId } from '../../SceneEditor/SwipeableDrawerEditorsDisplay';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

const THUMBNAIL_SIZE = 48;
const THUMBNAIL_SIZE_TOUCHSCREEN = 80; // Bigger thumbnail on touch screen, so the finger doesn't cover it.
const TEXT_SHIFT = 16;

const getItemStyles = ({
  clientOffset,
  previewPosition,
  screenType,
}: {|
  clientOffset: ?{ x: number, y: number },
  previewPosition: 'center' | 'aboveRight',
  screenType: ScreenType,
|}) => {
  if (!clientOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = clientOffset;
  const thumbnailSize =
    screenType === 'touch' ? THUMBNAIL_SIZE_TOUCHSCREEN : THUMBNAIL_SIZE;

  const previewX =
    previewPosition === 'center' ? x - thumbnailSize / 2 : x + TEXT_SHIFT;
  const previewY =
    previewPosition === 'center' ? y - thumbnailSize / 2 : y - TEXT_SHIFT;

  const transform = `translate(${previewX}px, ${previewY}px)`;

  return {
    transform,
    WebkitTransform: transform,
  };
};

type XYCoord = {|
  x: number,
  y: number,
|};

type InternalCustomDragLayerProps = {|
  item?: DraggedItem,
  itemType?: Identifier | null,
  initialOffset?: XYCoord | null,
  currentOffset?: XYCoord | null,
  clientOffset?: XYCoord | null,
  isDragging?: boolean,
|};

const shouldHidePreviewBecauseDraggingOnSceneEditorCanvas = ({
  x,
  y,
}: XYCoord) => {
  const swipeableDrawerContainer = document.querySelector(
    `#${swipeableDrawerContainerId}`
  );
  // If the swipeable drawer exists, we are on mobile, and we want to show the preview
  // only when the user is dragging in the drawer, otherwise they are on the canvas.
  // (the drawer is on top of the canvas)
  if (swipeableDrawerContainer) {
    const drawerRect = swipeableDrawerContainer.getBoundingClientRect();
    if (
      x >= drawerRect.left &&
      x <= drawerRect.right &&
      y >= drawerRect.top &&
      y <= drawerRect.bottom
    ) {
      return false;
    }
    return true;
  }

  // Otherwise, we are on desktop, and we want to hide the preview when the user
  // is dragging on the canvas.
  const activeCanvas = document.querySelector(
    `#scene-editor[data-active=true] #${instancesEditorId}`
  );
  if (activeCanvas) {
    const canvasRect = activeCanvas.getBoundingClientRect();
    if (
      x >= canvasRect.left &&
      x <= canvasRect.right &&
      y >= canvasRect.top &&
      y <= canvasRect.bottom
    ) {
      return true;
    }
  }
  return false;
};

const CustomDragLayer = ({
  item,
  itemType,
  isDragging,
  initialOffset,
  currentOffset,
  clientOffset,
}: InternalCustomDragLayerProps) => {
  const screenType = useScreenType();
  const renderedItem = React.useMemo(
    () => {
      if (!item || !clientOffset) return null;

      if (shouldHidePreviewBecauseDraggingOnSceneEditorCanvas(clientOffset)) {
        return null;
      }

      const thumbnailSize =
        screenType === 'touch' ? THUMBNAIL_SIZE_TOUCHSCREEN : THUMBNAIL_SIZE;

      return item.thumbnail ? (
        <CorsAwareImage
          alt={item.name}
          src={item.thumbnail}
          style={{
            maxWidth: thumbnailSize,
            maxHeight: thumbnailSize,
          }}
        />
      ) : (
        <Text>{item.name}</Text>
      );
    },
    [item, clientOffset, screenType]
  );

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles({
          clientOffset,
          previewPosition: item && !item.thumbnail ? 'aboveRight' : 'center',
          screenType,
        })}
      >
        {renderedItem}
      </div>
    </div>
  );
};

const collect = (monitor: any): InternalCustomDragLayerProps => ({
  // This contains the item that is returned by the method `beginDrag` of the DragSourceAndDropTarget component.
  item: monitor.getItem(),
  // This contains the type of the item being dragged, defined when calling the function `makeDragSourceAndDropTarget`.
  itemType: monitor.getItemType(),
  // This is the initial offset of the drag source.
  initialOffset: monitor.getInitialSourceClientOffset(),
  // This is the current offset of the drag source (the whole wrapper element, not just the mouse position)
  currentOffset: monitor.getSourceClientOffset(),
  // This is the current offset of the mouse.
  clientOffset: monitor.getClientOffset(),
  isDragging: monitor.isDragging(),
});

// $FlowFixMe - Forcing the type of the component, unsure how to make the DragLayer happy.
const ExternalCustomDragLayer: ({||}) => React.Node = DragLayer(collect)(
  CustomDragLayer
);

export default ExternalCustomDragLayer;
