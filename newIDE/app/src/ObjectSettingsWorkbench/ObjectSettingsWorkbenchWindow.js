// @flow
import * as React from 'react';

import WindowPortal from '../UI/WindowPortal';
import AlertProvider from '../UI/Alert/AlertProvider';
import { FullThemeProvider } from '../UI/Theme/FullThemeProvider';
import { SpecificDimensionsWindowSizeProvider } from '../UI/Responsive/ResponsiveWindowMeasurer';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import ObjectSettingsWorkbench, {
  type ObjectSettingsWorkbenchInterface,
  type ObjectSettingsWorkbenchProps,
} from '.';

type Props = {|
  ...ObjectSettingsWorkbenchProps,
  onClose: () => void,
  focusRequestId: number,
|};

/**
 * The Object Settings surface is intentionally hosted in its own window.
 * It is not an editor tab and does not inherit the regular editor toolbar:
 * the workbench SVG defines the complete 1200 x 740 window surface.
 */
const ObjectSettingsWorkbenchWindow = ({
  onClose,
  focusRequestId,
  ...workbenchProps
}: Props): React.Node => {
  const workbenchRef = React.useRef<?ObjectSettingsWorkbenchInterface>(null);
  const [externalWindow, setExternalWindow] = React.useState<?any>(null);

  React.useEffect(
    () => {
      if (!externalWindow) return undefined;
      const refreshNativeObjects = () => {
        if (workbenchRef.current) workbenchRef.current.forceRefresh();
      };
      externalWindow.addEventListener('focus', refreshNativeObjects);
      return () => {
        try {
          externalWindow.removeEventListener('focus', refreshNativeObjects);
        } catch (error) {
          // The BrowserWindow document may already be tearing down.
        }
      };
    },
    [externalWindow]
  );

  return (
    <WindowPortal
      role="object-settings"
      title="Object Settings"
      initialWidth={1200}
      initialHeight={740}
      onClose={onClose}
      onWindowReady={setExternalWindow}
      focusRequestId={focusRequestId}
      renderContent={({ windowSize }) => (
        <SpecificDimensionsWindowSizeProvider
          innerWidth={windowSize.width}
          innerHeight={windowSize.height}
        >
          <FullThemeProvider forcedThemeName="Dark">
            <AlertProvider>
              <DragAndDropContextProvider
                key={
                  externalWindow
                    ? 'object-settings-external-window'
                    : 'object-settings-main-window-fallback'
                }
                window={externalWindow}
              >
                <ObjectSettingsWorkbench
                  {...workbenchProps}
                  onRequestWindowFocus={() => {
                    if (!externalWindow) return;
                    try {
                      externalWindow.focus();
                    } catch (error) {
                      // Ignore a focus request racing with window teardown.
                    }
                  }}
                  ref={workbench => (workbenchRef.current = workbench)}
                />
              </DragAndDropContextProvider>
            </AlertProvider>
          </FullThemeProvider>
        </SpecificDimensionsWindowSizeProvider>
      )}
    />
  );
};

export default ObjectSettingsWorkbenchWindow;
