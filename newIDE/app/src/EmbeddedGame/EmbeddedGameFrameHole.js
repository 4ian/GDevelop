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
) => {
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
  onRestartInGameEditorAfterError: (() => void) | null,
  marginBottom?: number,
|};

export const EmbeddedGameFrameHole = (props: Props) => {
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

  return (
    <div
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
      {props.onRestartInGameEditorAfterError && (
        <button
          style={{
            pointerEvents: 'all',
          }}
          onClick={props.onRestartInGameEditorAfterError}
        >
          Restart 3D editor
        </button>
      )}
    </div>
  );
};
