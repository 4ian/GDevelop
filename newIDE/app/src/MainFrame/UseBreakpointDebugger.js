// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import {
  resumePausedPreview,
  stepPausedPreview,
  schedulePauseAtNextEvent,
  onPreviewDebuggerPauseChange,
  isElectronCDPBridgeAvailable,
} from '../Debugger/ElectronCDPBridge';
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import { type ShowAlertDialogOptions } from '../UI/Alert/AlertContext';

const gd: libGDevelop = global.gd;

type Params = {|
  previewDebuggerServer: ?PreviewDebuggerServer,
  currentProject: ?gdProject,
  previewLayoutName: ?string,
  openLayout: (
    layoutName: string,
    options: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,
  focusOnExtensionFunction: (
    extensionName: string,
    functionName: string,
    behaviorName: ?string,
    objectName: ?string
  ) => void,
  showAlert: (options: ShowAlertDialogOptions) => Promise<void>,
|};

type Result = {|
  togglePauseExecution: () => void,
  stepNextEvent: () => void,
|};

const useBreakpointDebugger = ({
  previewDebuggerServer,
  currentProject,
  previewLayoutName,
  openLayout,
  focusOnExtensionFunction,
  showAlert,
}: Params): Result => {
  const previewPausedRef = React.useRef<boolean>(false);
  const lastHitEventIdRef = React.useRef<string>('');
  const lastHitFunctionIdRef = React.useRef<string>('');

  // Stable ref to the hit handler so the CDP listener never needs to re-subscribe.
  type BreakpointHitHandler = (
    functionId: string,
    eventId: string,
    sceneName: string
  ) => void;
  const handleBreakpointHitRef = React.useRef<?BreakpointHitHandler>(null);

  React.useEffect(
    () => {
      const handleBreakpointHit = (
        functionId: string,
        eventId: string,
        sceneName: string
      ) => {
        previewPausedRef.current = true;
        lastHitEventIdRef.current = eventId;
        lastHitFunctionIdRef.current = functionId;

        // Behavior object methods are compiled with compilationForRuntime=true
        // and never appear as extension function hits; skip them.
        if (functionId.startsWith('gdjs.evtsExt__') && currentProject) {
          try {
            const count = currentProject.getEventsFunctionsExtensionsCount();
            for (let i = 0; i < count; i++) {
              const ext = currentProject.getEventsFunctionsExtensionAt(i);
              const prefix = gd.MetadataDeclarationHelper.getExtensionCodeNamespacePrefix(
                ext
              );
              if (!functionId.startsWith(prefix)) continue;
              if (ext.getOriginName() !== '') break;

              const freeFuncs = ext.getEventsFunctions();
              let resolved = false;
              for (let j = 0; j < freeFuncs.getEventsFunctionsCount(); j++) {
                const func = freeFuncs.getEventsFunctionAt(j);
                const ns = gd.MetadataDeclarationHelper.getFreeFunctionCodeNamespace(
                  func,
                  prefix
                );
                if (ns === functionId) {
                  focusOnExtensionFunction(
                    ext.getName(),
                    func.getName(),
                    null,
                    null
                  );
                  resolved = true;
                  break;
                }
              }
              if (resolved) return;

              const ebos = ext.getEventsBasedObjects();
              for (let k = 0; k < ebos.getCount(); k++) {
                const ebo = ebos.getAt(k);
                const objFuncs = ebo.getEventsFunctions();
                for (let m = 0; m < objFuncs.getEventsFunctionsCount(); m++) {
                  const func = objFuncs.getEventsFunctionAt(m);
                  const ns = gd.MetadataDeclarationHelper.getObjectEventsFunctionFullyQualifiedContextName(
                    ebo,
                    func,
                    prefix
                  );
                  if (ns === functionId) {
                    focusOnExtensionFunction(
                      ext.getName(),
                      func.getName(),
                      null,
                      ebo.getName()
                    );
                    resolved = true;
                    break;
                  }
                }
                if (resolved) break;
              }
              if (resolved) return;
              break;
            }
          } catch (_) {}
        }

        const layoutName = sceneName || previewLayoutName;
        if (!layoutName) return;
        openLayout(layoutName, {
          openEventsEditor: true,
          openSceneEditor: false,
          focusWhenOpened: 'events',
        });
      };
      handleBreakpointHitRef.current = handleBreakpointHit;

      if (!previewDebuggerServer) return;
      // Safety net: CDP detach doesn't emit a synthetic `Debugger.resumed`,
      // so reset refs when the preview connection closes.
      const resetPauseRefs = () => {
        previewPausedRef.current = false;
        lastHitEventIdRef.current = '';
        lastHitFunctionIdRef.current = '';
      };
      const unregister = previewDebuggerServer.registerCallbacks({
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: resetPauseRefs,
        onConnectionOpened: resetPauseRefs,
        onConnectionErrored: () => {},
        onHandleParsedMessage: () => {},
      });
      return unregister;
    },
    [
      previewDebuggerServer,
      previewLayoutName,
      openLayout,
      focusOnExtensionFunction,
      currentProject,
    ]
  );

  // CDP pause / resume events forwarded from Electron main.
  React.useEffect(() => {
    const unregister = onPreviewDebuggerPauseChange((isPaused, payload) => {
      const breakpoint = payload && payload.breakpoint;
      if (
        isPaused &&
        breakpoint &&
        typeof breakpoint.eventId === 'string' &&
        typeof breakpoint.functionId === 'string' &&
        handleBreakpointHitRef.current
      ) {
        handleBreakpointHitRef.current(
          breakpoint.functionId,
          breakpoint.eventId,
          breakpoint.sceneName || ''
        );
      } else if (!isPaused) {
        previewPausedRef.current = false;
        lastHitEventIdRef.current = '';
        lastHitFunctionIdRef.current = '';
      }
    });
    return unregister;
  }, []);

  const notifyBreakpointsUnsupported = React.useCallback(
    () => {
      showAlert({
        title: t`Debugger not available here`,
        message: t`Pausing, stepping and breakpoints only work in the local Electron preview. Please use "Preview" (F5) on this computer to debug your events.`,
      });
    },
    [showAlert]
  );

  const togglePauseExecution = React.useCallback(
    () => {
      if (!previewDebuggerServer) return;
      if (!isElectronCDPBridgeAvailable()) {
        notifyBreakpointsUnsupported();
        return;
      }
      if (previewPausedRef.current) {
        resumePausedPreview();
        previewPausedRef.current = false;
      } else {
        // Pause fires in the next checkBreakpoint call inside the running preview.
        schedulePauseAtNextEvent();
      }
    },
    [previewDebuggerServer, notifyBreakpointsUnsupported]
  );

  const stepNextEvent = React.useCallback(
    () => {
      if (!previewDebuggerServer) return;
      if (!isElectronCDPBridgeAvailable()) {
        notifyBreakpointsUnsupported();
        return;
      }
      if (!previewPausedRef.current) return;
      stepPausedPreview({
        currentEventId: lastHitEventIdRef.current,
        currentFunctionId: lastHitFunctionIdRef.current,
      });
    },
    [previewDebuggerServer, notifyBreakpointsUnsupported]
  );

  return { togglePauseExecution, stepNextEvent };
};

export default useBreakpointDebugger;
