// @flow
import * as React from 'react';
import { useDragDropManager } from 'react-dnd';

/**
 * True while an item is dragged (optionally, only items of the given
 * react-dnd type).
 */
export const useIsDragging = (itemType?: string): boolean => {
  const dragDropManager = useDragDropManager();
  const [isDragging, setIsDragging] = React.useState(false);
  React.useEffect(
    () => {
      const monitor = dragDropManager.getMonitor();
      const update = () =>
        setIsDragging(
          monitor.isDragging() &&
            (itemType === undefined || monitor.getItemType() === itemType)
        );
      update();
      return monitor.subscribeToStateChange(update);
    },
    [dragDropManager, itemType]
  );
  return isDragging;
};
