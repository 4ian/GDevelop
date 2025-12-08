// @flow
import * as React from 'react';

/**
 * While not striclty necessary, because when the in-game editor is crashing
 * or detects that its WebGL context is lost, it will automatically be restarted
 * (with a new preview + hard-reload),
 * we still restart it regularly if there are too many switches between 2D and 3D.
 */
export const useAutomatedRegularInGameEditorRestart = ({
  onRestartInGameEditor,
  gameEditorMode,
}: {|
  onRestartInGameEditor: (reason: string) => void,
  gameEditorMode: 'embedded-game' | 'instances-editor',
|}) => {
  const [changeCount, setChangeCount] = React.useState(0);

  React.useEffect(
    () => {
      setChangeCount(prevChangeCount => prevChangeCount + 1);
    },
    [gameEditorMode]
  );

  React.useEffect(
    () => {
      if (changeCount >= 10 && gameEditorMode === 'embedded-game') {
        console.info(
          'Restarting in-game editor because of regular restart after too many switches between 2D and 3D.'
        );
        onRestartInGameEditor('relaunched-because-of-regular-restart');
        setChangeCount(0);
      }
    },
    [changeCount, gameEditorMode, onRestartInGameEditor]
  );
};
