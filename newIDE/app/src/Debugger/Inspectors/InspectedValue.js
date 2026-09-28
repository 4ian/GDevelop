// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import EmptyMessage from '../../UI/EmptyMessage';
import RawContentInspector from './RawContentInspector';
import {
  type GameData,
  type InspectorDescription,
  type EditFunction,
  type CallFunction,
  type ReadValuesFunction,
} from '../GDJSInspectorDescriptions';
import { getAtInspectorPath } from '../inspectorPath';
import { usePollingRequest } from '../../Utils/UsePollingRequest';

/**
 * How often the selected element is read again in the running game. Fast
 * enough to follow a value that changes every frame, without asking more than
 * the game can answer.
 */
const LIVE_INSPECTOR_INTERVAL_MS = 250;

/**
 * How often it is read while the game is paused: the values only change when
 * a frame is advanced by hand or a value is edited, so a slow pace is enough.
 */
const PAUSED_INSPECTOR_INTERVAL_MS = 1000;

type Props = {|
  selectedInspector: InspectorDescription,
  selectedInspectorFullPath: Array<string>,
  /** The last snapshot of the game (the refresh button). */
  gameData: GameData,
  /** Read what is at the given path in the running game. */
  onInspectPath: (path: Array<string>) => Promise<Object | null>,
  /** The values are followed as long as the game is connected. */
  isLive: boolean,
  isGamePaused: boolean,
  rawMode: boolean,
  onCall: CallFunction,
  onEdit: EditFunction,
  onReadValues: ReadValuesFunction,
|};

/**
 * What the inspector shows for the selected element: the values of the running
 * game while it is connected, or else those of the last snapshot.
 *
 * It keeps the live values on its own so that reading them again several
 * times per second only renders this part of the debugger, and not the other
 * panels (profiler, performance, resources...).
 */
const InspectedValue = ({
  selectedInspector,
  selectedInspectorFullPath,
  gameData,
  onInspectPath,
  isLive,
  isGamePaused,
  rawMode,
  onCall,
  onEdit,
  onReadValues,
}: Props): React.Node => {
  const [liveValue, setLiveValue] = React.useState<Object | void>(undefined);
  const pathKey = selectedInspectorFullPath.join('.');

  React.useEffect(
    () => {
      // Only when what is watched changes: what was read for another element
      // must not be shown for this one.
      setLiveValue(undefined);
    },
    [pathKey, isLive]
  );

  // The debugger renders again for everything the recording brings in (the
  // profiler chunks, the logs, the clock of the toolbar...), and gives a new
  // function each time: the polling reads the last one without restarting,
  // otherwise the values were dropped and asked again on every render.
  const pathKeyRef = React.useRef(pathKey);
  pathKeyRef.current = pathKey;
  const refreshNow = usePollingRequest(
    async () => {
      const requestedPathKey = pathKey;
      const value = await onInspectPath(selectedInspectorFullPath);
      // What was read for another element must not be shown for this one.
      if (value !== null && pathKeyRef.current === requestedPathKey)
        setLiveValue(value);
    },
    isLive && pathKey
      ? isGamePaused
        ? PAUSED_INSPECTOR_INTERVAL_MS
        : LIVE_INSPECTOR_INTERVAL_MS
      : null,
    pathKey
  );

  // The game handles the messages in the order they are sent: what is read
  // right after an edit already has the new value.
  const editAndRefresh = (path: Array<string>, newValue: any): boolean => {
    const isSent = onEdit(selectedInspectorFullPath.concat(path), newValue);
    refreshNow();
    return isSent;
  };
  const callAndRefresh = (path: Array<string>, args: Array<any>): boolean => {
    const isSent = onCall(selectedInspectorFullPath.concat(path), args);
    refreshNow();
    return isSent;
  };

  const value =
    liveValue !== undefined
      ? liveValue
      : getAtInspectorPath(gameData, selectedInspectorFullPath);

  if (rawMode) {
    return <RawContentInspector gameData={value} onEdit={editAndRefresh} />;
  }

  let renderedInspector = null;
  try {
    renderedInspector = selectedInspector.renderInspector(value, {
      onCall: callAndRefresh,
      onEdit: editAndRefresh,
      onReadValues: (path, calls) =>
        onReadValues(selectedInspectorFullPath.concat(path), calls),
    });
  } catch (error) {
    console.error(
      `Unable to inspect "${selectedInspectorFullPath.join('.')}":`,
      error
    );
    return (
      <EmptyMessage>
        <Trans>
          This element could not be inspected (see the console for details).
        </Trans>
      </EmptyMessage>
    );
  }

  return (
    renderedInspector || (
      <EmptyMessage>
        <Trans>
          No inspector, choose another element in the list or toggle the raw
          data view.
        </Trans>
      </EmptyMessage>
    )
  );
};

export default InspectedValue;
