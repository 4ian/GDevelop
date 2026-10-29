// @flow
import * as React from 'react';
import { type I18n as I18nType } from '@lingui/core';
import {
  makeMcpMessagesQueue,
  type CliMcpServerHandlers,
} from '../CliMcpServer';
import { type CliProjectCreationCallbacks } from '../CliEditorFunctions';
import {
  type RunEditorFunctionCalls,
  type SaveProject,
} from '../LocalCliCommandRunner';
import { type McpOpenedProject } from './McpServerTool';
import { useMcpServerTools } from './UseMcpServerTools';
import { cloudStorageProviderInternalName } from '../../ProjectsStorage/CloudStorageProvider/CloudStoageProviderInternalName';
import { sendMcpToolCalled } from '../../Utils/Analytics/EventSender';
import { getIDEVersion } from '../../Version';
import Window from '../../Utils/Window';
import optionalRequire from '../../Utils/OptionalRequire';

const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

const makeProjectReady = (): {|
  promise: Promise<void>,
  resolve: () => void,
|} => {
  let resolve: () => void = () => {};
  const promise: Promise<void> = new Promise(resolvePromise => {
    resolve = () => resolvePromise();
  });
  return { promise, resolve };
};

/**
 * Serves the MCP server (see `CliMcpServer.js`) on its two transports:
 * - "stdio" (`--mcp`): an editor instance launched by the agent on the project
 *   given in the arguments, talking on stdin/stdout (see `CliMcpServerPipe.js`
 *   in the Electron app). The project can't change during the session.
 * - "live": the server of the editor opened by the user (see
 *   `LiveMcpServer.js` in the Electron app), one queue per agent session. The
 *   tools act on the project opened in the window, or create one.
 */
export const useMcpServers = ({
  i18n,
  project,
  fileIdentifier,
  storageProviderName,
  projectCreationCallbacks,
  runEditorFunctionCalls,
  saveProject,
}: {|
  i18n: I18nType,
  project: ?gdProject,
  fileIdentifier: ?string,
  storageProviderName: ?string,
  projectCreationCallbacks: CliProjectCreationCallbacks,
  // Stable: they must call the latest callbacks of the editor.
  runEditorFunctionCalls: RunEditorFunctionCalls,
  saveProject: SaveProject,
|}): {|
  // Called by the `--mcp` command once the project is loaded.
  onMcpProjectReady: () => void,
|} => {
  const { resourceStoreTools, projectCreationTools } = useMcpServerTools({
    i18n,
    projectCreationCallbacks,
  });
  const makeHandlers = React.useCallback(
    (transport: 'stdio' | 'http'): CliMcpServerHandlers => ({
      getServerVersion: getIDEVersion,
      isReadOnly: false,
      onToolCalled: report => sendMcpToolCalled({ ...report, transport }),
      runEditorFunctionCalls,
      saveProject: async () =>
        !!(await saveProject({ skipNewVersionWarning: true })),
    }),
    [runEditorFunctionCalls, saveProject]
  );

  // The stdio server answers the handshake of the client as soon as the
  // editor is loaded (a client gives up after ~30s, and would start another
  // instance), and makes the tool calls wait for the project.
  const projectReadyRef = React.useRef(makeProjectReady());
  React.useEffect(
    () => {
      if (!ipcRenderer) return;
      const appArguments = Window.getArguments();
      if (!appArguments['mcp']) return;
      const projectReady = projectReadyRef.current;
      const handlers = makeHandlers('stdio');
      const onMcpMessage = makeMcpMessagesQueue({
        handlers: {
          ...handlers,
          isReadOnly: !!appArguments['read-only'],
          serverTools: resourceStoreTools,
          runEditorFunctionCalls: async (functionCalls, options) => {
            await projectReady.promise;
            return handlers.runEditorFunctionCalls(functionCalls, options);
          },
          saveProject: async () => {
            await projectReady.promise;
            return handlers.saveProject();
          },
        },
        send: text => {
          if (ipcRenderer) ipcRenderer.send('mcp-send', text);
        },
      });
      const onMcpMessageEvent = (event: any, line: string) =>
        onMcpMessage(line);
      ipcRenderer.on('mcp-message', onMcpMessageEvent);
      ipcRenderer.send('mcp-ready');
      return () => ipcRenderer.removeListener('mcp-message', onMcpMessageEvent);
    },
    [makeHandlers, resourceStoreTools]
  );
  const onMcpProjectReady = React.useCallback(
    () => projectReadyRef.current.resolve(),
    []
  );

  const openedProjectRef = React.useRef<?McpOpenedProject>(null);
  openedProjectRef.current = project
    ? {
        name: project.getName(),
        location: fileIdentifier || null,
        isCloudProject:
          storageProviderName === cloudStorageProviderInternalName,
      }
    : null;

  React.useEffect(
    () => {
      if (!ipcRenderer) return;
      const sessionQueues: Map<string, (line: string) => void> = new Map();
      const onLiveMcpMessage = (
        event: any,
        { sessionId, line }: {| sessionId: string, line: string |}
      ) => {
        let onMessage = sessionQueues.get(sessionId);
        if (!onMessage) {
          onMessage = makeMcpMessagesQueue({
            handlers: {
              ...makeHandlers('http'),
              getOpenedProject: () => openedProjectRef.current,
              serverTools: [...resourceStoreTools, ...projectCreationTools],
            },
            send: text => {
              if (ipcRenderer)
                ipcRenderer.send('mcp-live-send', { sessionId, text });
            },
          });
          sessionQueues.set(sessionId, onMessage);
        }
        onMessage(line);
      };
      const onLiveMcpSessionClosed = (
        event: any,
        { sessionId }: {| sessionId: string |}
      ) => {
        sessionQueues.delete(sessionId);
      };
      ipcRenderer.on('mcp-live-message', onLiveMcpMessage);
      ipcRenderer.on('mcp-live-session-closed', onLiveMcpSessionClosed);
      return () => {
        if (!ipcRenderer) return;
        ipcRenderer.removeListener('mcp-live-message', onLiveMcpMessage);
        ipcRenderer.removeListener(
          'mcp-live-session-closed',
          onLiveMcpSessionClosed
        );
      };
    },
    [makeHandlers, resourceStoreTools, projectCreationTools]
  );

  return { onMcpProjectReady };
};
