// @flow
import * as React from 'react';

export const embeddedGameFrameHoleId =
  'instances-editor-embedded-game-frame-hole';

let activeEmbeddedGameFrameHoleCount = 0;

export type ActiveEmbeddedGameFrameHoleCountCallback = ({
  activeEmbeddedGameFrameHoleCount: number,
}) => void;

let activeEmbeddedGameFrameHoleCallbacks: ActiveEmbeddedGameFrameHoleCountCallback[] = [];
export const registerActiveEmbeddedGameFrameHoleCountCallback = (
  callback: ActiveEmbeddedGameFrameHoleCountCallback
): (() => void) => {
  activeEmbeddedGameFrameHoleCallbacks.push(callback);
  callback({ activeEmbeddedGameFrameHoleCount }); // Ensure the callback is called with the current count.

  return () => {
    activeEmbeddedGameFrameHoleCallbacks.splice(
      activeEmbeddedGameFrameHoleCallbacks.indexOf(callback),
      1
    );
  };
};

const notifyActiveEmbeddedGameFrameHoleCountCallbacks = () => {
  activeEmbeddedGameFrameHoleCallbacks.forEach(callback =>
    callback({ activeEmbeddedGameFrameHoleCount })
  );
};

let embeddedGameFrameHoleResizeCallbacks: Array<() => void> = [];
export const registerEmbeddedGameFrameHoleResizeCallback = (
  callback: () => void
): (() => void) => {
  embeddedGameFrameHoleResizeCallbacks.push(callback);
  return () => {
    embeddedGameFrameHoleResizeCallbacks.splice(
      embeddedGameFrameHoleResizeCallbacks.indexOf(callback),
      1
    );
  };
};

const notifyEmbeddedGameFrameHoleResizeCallbacks = () => {
  embeddedGameFrameHoleResizeCallbacks.forEach(callback => callback());
};

export const getActiveEmbeddedGameFrameHoleRect = (): ?ClientRect => {
  // There is only one embedded game frame hole active at a time,
  // so we don't need to check if the parent scene editor is active.
  const activeEmbeddedGameFrameHole = document.querySelector(
    `#${embeddedGameFrameHoleId}`
  );
  if (activeEmbeddedGameFrameHole) {
    const rect = activeEmbeddedGameFrameHole.getBoundingClientRect();
    return rect;
  }
  return null;
};

type Props = {|
  isActive: boolean,
  showRestartInGameEditorAfterErrorButton: boolean,
  onRestartInGameEditor: (reason: string) => void,
  marginBottom?: number,
|};

export const EmbeddedGameFrameHole = (props: Props): React.MixedElement => {
  React.useEffect(
    () => {
      if (props.isActive) {
        activeEmbeddedGameFrameHoleCount++;
        notifyActiveEmbeddedGameFrameHoleCountCallbacks();

        return () => {
          activeEmbeddedGameFrameHoleCount--;
          notifyActiveEmbeddedGameFrameHoleCountCallbacks();
        };
      }
    },
    [props.isActive]
  );

  // Notify when the hole is resized (panels opened, closed or resized), so that
  // the in-game editor knows the part of the game frame that is visible.
  const holeRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(
    () => {
      const hole = holeRef.current;
      if (!props.isActive || !hole || typeof ResizeObserver === 'undefined')
        return;

      const resizeObserver = new ResizeObserver(
        notifyEmbeddedGameFrameHoleResizeCallbacks
      );
      resizeObserver.observe(hole);
      return () => resizeObserver.disconnect();
    },
    [props.isActive]
  );

  return (
    <div
      ref={holeRef}
      style={{
        height: `calc(100% - ${props.marginBottom || 0}px)`,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        boxSizing: 'border-box',
        // Uncomment this to debug the embedded game frame hole placement.
        // backgroundColor: 'rgba(255, 255, 0, 0.5)',
      }}
      id={props.isActive ? embeddedGameFrameHoleId : undefined}
    >
      {props.showRestartInGameEditorAfterErrorButton && (
        <button
          style={{
            pointerEvents: 'all',
          }}
          onClick={() =>
            props.onRestartInGameEditor('relaunched-manually-after-error')
          }
        >
          Restart 3D editor
        </button>
      )}
    </div>
  );
};
