// @flow
import * as React from 'react';
import { DragLayer } from 'react-dnd';
import { Identifier } from 'dnd-core';
import Text from '../Text';

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
};

const THUMBNAIL_SIZE = 32;

function getItemStyles({
  initialOffset,
  clientOffset,
  previewPosition,
}: {
  initialOffset: ?{ x: number, y: number },
  clientOffset: ?{ x: number, y: number },
  previewPosition: 'center' | 'aboveRight',
}) {
  if (!initialOffset || !clientOffset) {
    return {
      display: 'none',
    };
  }

  const { x, y } = clientOffset;

  const previewX = previewPosition === 'center' ? x - THUMBNAIL_SIZE / 2 : x;
  const previewY =
    previewPosition === 'center'
      ? y - THUMBNAIL_SIZE / 2
      : previewPosition === 'aboveRight'
      ? y - THUMBNAIL_SIZE
      : y;

  const transform = `translate(${previewX}px, ${previewY}px)`;

  return {
    transform,
    WebkitTransform: transform,
  };
}

// This interface is supposed to be available in react-dnd, but flow complains.
type XYCoord = {|
  x: number,
  y: number,
|};

export type DraggedItem = {|
  name: string,
  thumbnail?: string,
|};

type InternalCustomDragLayerProps = {|
  item?: DraggedItem,
  itemType?: Identifier | null,
  initialOffset?: XYCoord | null,
  currentOffset?: XYCoord | null,
  clientOffset?: XYCoord | null,
  isDragging?: boolean,
|};

const CustomDragLayer = ({
  item,
  itemType,
  isDragging,
  initialOffset,
  currentOffset,
  clientOffset,
}: InternalCustomDragLayerProps) => {
  const itemThumbnail = React.useMemo(
    () => {
      if (!item) return null;
      return item.thumbnail;
    },
    [item]
  );

  const itemName = React.useMemo(
    () => {
      if (!item) return null;
      return item.name;
    },
    [item]
  );

  function renderItem() {
    return itemThumbnail ? (
      <img
        alt={itemName}
        src={itemThumbnail}
        style={{
          maxWidth: THUMBNAIL_SIZE,
          maxHeight: THUMBNAIL_SIZE,
        }}
      />
    ) : (
      <Text>{itemName}</Text>
    );
  }

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles({
          initialOffset,
          clientOffset,
          previewPosition: !itemThumbnail ? 'aboveRight' : 'center',
        })}
      >
        {renderItem()}
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
