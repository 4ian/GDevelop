// @flow
import * as React from 'react';
import {
  type DebuggerPlaySpeed,
  type LaunchDebuggerAndPreviewOptions,
} from '../EventsExecutionTracking/EventsExecutionTrackingStore';

/**
 * What the debugger shares with the rest of the editor (the speed the game
 * plays at, the panel of the watched variables, the previews), provided by
 * the main frame rather than passed down through every editor.
 */
export type DebuggerSession = {|
  debuggerPlaySpeed: DebuggerPlaySpeed,
  setDebuggerPlaySpeed: DebuggerPlaySpeed => void,
  isWatchedVariablesPanelOpen: boolean,
  onToggleWatchedVariablesPanel: () => void,
  onLaunchDebuggerAndPreview: (?LaunchDebuggerAndPreviewOptions) => void,
  onClosePreviews: () => void,
|};

const initialDebuggerSession: DebuggerSession = {
  debuggerPlaySpeed: 'normal',
  setDebuggerPlaySpeed: () => {},
  isWatchedVariablesPanelOpen: false,
  onToggleWatchedVariablesPanel: () => {},
  onLaunchDebuggerAndPreview: () => {},
  onClosePreviews: () => {},
};

const DebuggerSessionContext: React.Context<DebuggerSession> = React.createContext<DebuggerSession>(
  initialDebuggerSession
);

export default DebuggerSessionContext;
