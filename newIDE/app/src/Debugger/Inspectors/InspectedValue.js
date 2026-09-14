// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import get from 'lodash/get';
import EmptyMessage from '../../UI/EmptyMessage';
import RawContentInspector from './RawContentInspector';
import {
  type GameData,
  type InspectorDescription,
  type EditFunction,
  type CallFunction,
  type ReadValuesFunction,
} from '../GDJSInspectorDescriptions';

/**
 * How often the selected element is read again in the running game, while
 * recording. Fast enough to follow a value that changes every frame, without
 * asking more than the game can answer.
 */
const LIVE_INSPECTOR_INTERVAL_MS = 250;

type Props = {|
  selectedInspector: InspectorDescription,
  selectedInspectorFullPath: Array<string>,
  /** The last snapshot of the game (the refresh button). */
  gameData: GameData,
  /** Read what is at the given path in the running game. */
  onInspectPath: (path: Array<string>) => Promise<Object | null>,
  /** The values are only followed while recording. */
  isLive: boolean,
  rawMode: boolean,
  onCall: CallFunction,
  onEdit: EditFunction,
  onReadValues: ReadValuesFunction,
|};

/**
 * What the inspector shows for the selected element: the values of the last
 * snapshot, or those of the running game while it is being recorded.
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
  rawMode,
  onCall,
  onEdit,
  onReadValues,
}: Props): React.Node => {
  const [liveValue, setLiveValue] = React.useState<Object | void>(undefined);
  const pathKey = selectedInspectorFullPath.join('.');

  React.useEffect(
    () => {
      setLiveValue(undefined);
      if (!isLive || !selectedInspectorFullPath.length) return;

      let isCancelled = false;
      let isInFlight = false;
      const refresh = async () => {
        // Never ask again while the game is answering.
        if (isInFlight) return;
        isInFlight = true;
        try {
          const value = await onInspectPath(selectedInspectorFullPath);
          if (!isCancelled && value !== null) setLiveValue(value);
        } finally {
          isInFlight = false;
        }
      };
      refresh();
      const intervalId = setInterval(refresh, LIVE_INSPECTOR_INTERVAL_MS);

      return () => {
        isCancelled = true;
        clearInterval(intervalId);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isLive, pathKey, onInspectPath]
  );

  const value =
    liveValue !== undefined
      ? liveValue
      : get(gameData, selectedInspectorFullPath, null);

  if (rawMode) {
    return (
      <RawContentInspector
        gameData={value}
        onEdit={(path, newValue) =>
          onEdit(selectedInspectorFullPath.concat(path), newValue)
        }
      />
    );
  }

  let renderedInspector = null;
  try {
    renderedInspector = selectedInspector.renderInspector(value, {
      onCall: (path, args) =>
        onCall(selectedInspectorFullPath.concat(path), args),
      onEdit: (path, newValue) =>
        onEdit(selectedInspectorFullPath.concat(path), newValue),
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
