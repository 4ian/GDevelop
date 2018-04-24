// @flow
import * as React from 'react';
import ReactJsonView from 'react-json-view';
import {
  type GameData,
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';
import mapValues from 'lodash/mapValues';

type Props = {|
  runtimeScene: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

const styles = {
  container: {
    flex: 1,
    overflowY: 'scroll',
  },
};

const transformLayer = layer => {
  if (!layer) return null;
  return {
    'Camera rotation (in deg)': layer._cameraRotation,
    'Camera zoom': layer._zoomFactor,
    'Layer is hidden': !!layer._hidden,
    'Camera X position': layer._cameraX,
    'Camera Y position': layer._cameraY,
    'Time scale': layer._timeScale,
  };
};

const transform = runtimeScene => {
  if (!runtimeScene) return null;

  return {
    'Time scale': runtimeScene._timeManager
      ? runtimeScene._timeManager._timeScale
      : null,
    Layers:
      runtimeScene._layers && runtimeScene._layers.items
        ? mapValues(runtimeScene._layers.items, transformLayer)
        : null,
  };
};

const handleEdit = (edit, { onCall, onEdit }: Props) => {
  if (edit.namespace.length === 0 && edit.name === 'Time scale') {
    onCall(['_timeManager', 'setTimeScale'], [parseFloat(edit.new_value)]);
  } else if (edit.namespace.length >= 2) {
    if (edit.namespace[0] === 'Layers') {
      if (edit.name === 'Camera rotation (in deg)') {
        onCall(
          ['_layers', 'items', edit.namespace[1], 'setCameraRotation'],
          [parseFloat(edit.new_value)]
        );
      } else if (edit.name === 'Camera zoom') {
        onCall(
          ['_layers', 'items', edit.namespace[1], 'setCameraZoom'],
          [parseFloat(edit.new_value)]
        );
      } else if (edit.name === 'Layer is hidden') {
        onCall(
          ['_layers', 'items', edit.namespace[1], 'show'],
          [!edit.new_value]
        );
      } else if (edit.name === 'Camera X position') {
        onCall(
          ['_layers', 'items', edit.namespace[1], 'setCameraX'],
          [parseFloat(edit.new_value)]
        );
      } else if (edit.name === 'Camera Y position') {
        onCall(
          ['_layers', 'items', edit.namespace[1], 'setCameraY'],
          [parseFloat(edit.new_value)]
        );
      } else if (edit.name === 'Time scale') {
        onCall(
          ['_layers', 'items', edit.namespace[1], 'setTimeScale'],
          [parseFloat(edit.new_value)]
        );
      }
    }
  } else return false;

  return true;
};

export default (props: Props) => (
  <div style={styles.container}>
    <p>Layers:</p>
    <ReactJsonView
      collapsed={false}
      name={false}
      src={transform(props.runtimeScene)}
      enableClipboard={false}
      displayDataTypes={false}
      displayObjectSize={false}
      onEdit={edit => handleEdit(edit, props)}
      groupArraysAfterLength={50}
      theme="monokai"
    />
  </div>
);
