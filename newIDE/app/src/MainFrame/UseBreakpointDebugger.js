// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { isElectronCDPBridgeAvailable } from '../Debugger/ElectronCDPBridge';
import {
  subscribeToBreakpointDebuggerSession,
  resetBreakpointDebuggerSession,
  getBreakpointDebuggerSessionState,
  resumeBreakpointDebugger,
  stepBreakpointDebugger,
  scheduleBreakpointDebuggerPauseAtNextEvent,
  type BreakpointDebuggerSessionState,
} from '../Debugger/BreakpointDebuggerSession';
import { isExtensionFunctionId } from '../EventsSheet/BreakpointSessionController';
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
  // Stable ref to the hit handler so the session listener never needs to re-subscribe.
  type BreakpointHitHandler = (
    functionId: string,
    eventId: string,
    sceneName: string
  ) => void;
  const handleBreakpointHitRef = React.useRef<?BreakpointHitHandler>(null);

  React.useEffect(
    () => {
      handleBreakpointHitRef.current = (
        functionId: string,
        eventId: string,
        sceneName: string
      ) => {
        // Behavior object methods are compiled with compilationForRuntime=true
        // and never appear as extension function hits; skip them.
        if (isExtensionFunctionId(functionId) && currentProject) {
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
    },
    [currentProject, previewLayoutName, openLayout, focusOnExtensionFunction]
  );

  React.useEffect(() => {
    return subscribeToBreakpointDebuggerSession(
      (sessionState: BreakpointDebuggerSessionState) => {
        if (
          sessionState.isPaused &&
          sessionState.hit &&
          handleBreakpointHitRef.current
        ) {
          handleBreakpointHitRef.current(
            sessionState.hit.functionId,
            sessionState.hit.eventId,
            sessionState.hit.sceneName
          );
        }
      }
    );
  }, []);

  React.useEffect(
    () => {
      if (!previewDebuggerServer) return;
      // Safety net: CDP detach doesn't emit a synthetic `Debugger.resumed`
      // for the WebSocket debugger client, so reset the shared session when
      // that connection changes too.
      const unregister = previewDebuggerServer.registerCallbacks({
        onErrorReceived: () => {},
        onServerStateChanged: () => {},
        onConnectionClosed: resetBreakpointDebuggerSession,
        onConnectionOpened: resetBreakpointDebuggerSession,
        onConnectionErrored: () => {},
        onHandleParsedMessage: () => {},
      });
      return unregister;
    },
    [previewDebuggerServer]
  );

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
      if (getBreakpointDebuggerSessionState().isPaused) {
        resumeBreakpointDebugger();
      } else {
        // Pause fires in the next checkBreakpoint call inside the running preview.
        scheduleBreakpointDebuggerPauseAtNextEvent();
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
      if (!getBreakpointDebuggerSessionState().isPaused) return;
      stepBreakpointDebugger();
    },
    [previewDebuggerServer, notifyBreakpointsUnsupported]
  );

  return { togglePauseExecution, stepNextEvent };
};

export default useBreakpointDebugger;
