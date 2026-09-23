// @flow
import * as React from 'react';

const isDraggingFiles = (e: SyntheticDragEvent<HTMLElement>) =>
  Array.from(e.dataTransfer.types).includes('Files');

/** Handlers to receive the files dropped on an element. */
export const useFileDropZone = (
  onFilesDropped: (files: Array<File>) => void
): {|
  isDraggingFilesOver: boolean,
  dropZoneProps: {|
    onDragOver: (e: SyntheticDragEvent<HTMLElement>) => void,
    onDragLeave: (e: SyntheticDragEvent<HTMLElement>) => void,
    onDrop: (e: SyntheticDragEvent<HTMLElement>) => void,
  |},
|} => {
  const [isDraggingFilesOver, setIsDraggingFilesOver] = React.useState(false);

  const dropZoneProps = React.useMemo(
    () => ({
      onDragOver: (e: SyntheticDragEvent<HTMLElement>) => {
        if (!isDraggingFiles(e)) return;
        e.preventDefault();
        setIsDraggingFilesOver(true);
      },
      onDragLeave: (e: SyntheticDragEvent<HTMLElement>) => {
        // Ignore the moves between the children of the zone.
        const relatedTarget = e.relatedTarget;
        if (
          relatedTarget instanceof Node &&
          e.currentTarget.contains(relatedTarget)
        )
          return;
        setIsDraggingFilesOver(false);
      },
      onDrop: (e: SyntheticDragEvent<HTMLElement>) => {
        if (!isDraggingFiles(e)) return;
        e.preventDefault();
        setIsDraggingFilesOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFilesDropped(files);
      },
    }),
    [onFilesDropped]
  );

  return { isDraggingFilesOver, dropZoneProps };
};
