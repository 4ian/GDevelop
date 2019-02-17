// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ReactJsonView from 'react-json-view';
import {
  type GameData,
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';
import { Line } from '../../UI/Grid';
import mapValues from 'lodash/mapValues';
import AutoComplete from 'material-ui/AutoComplete';
import RaisedButton from 'material-ui/RaisedButton';
import { defaultAutocompleteProps } from '../../UI/AutocompleteProps';

type Props = {|
  runtimeScene: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

type State = {|
  newObjectName: string,
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

export default class RuntimeSceneInspector extends React.Component<
  Props,
  State
> {
  state = {
    newObjectName: '',
  };

  render() {
    const { runtimeScene, onCall } = this.props;
    if (!runtimeScene) return null;

    return (
      <div style={styles.container}>
        <p>
          <Trans>Layers:</Trans>
        </p>
        <ReactJsonView
          collapsed={false}
          name={false}
          src={transform(runtimeScene)}
          enableClipboard={false}
          displayDataTypes={false}
          displayObjectSize={false}
          onEdit={edit => handleEdit(edit, this.props)}
          groupArraysAfterLength={50}
          theme="monokai"
        />
        <p>
          <Trans>
            Create a new instance on the scene (will be at position 0;0):
          </Trans>
        </p>
        {runtimeScene._objects && runtimeScene._objects.items && (
          <Line noMargin alignItems="baseline">
            <AutoComplete
              {...defaultAutocompleteProps}
              hintText={<Trans>Enter the name of the object</Trans>}
              searchText={this.state.newObjectName}
              onUpdateInput={value => {
                this.setState({
                  newObjectName: value,
                });
              }}
              onNewRequest={data => {
                // Note that data may be a string or a {text, value} object.
                if (typeof data === 'string') {
                  this.setState({
                    newObjectName: data,
                  });
                } else if (typeof data.value === 'string') {
                  this.setState({
                    newObjectName: data.value,
                  });
                }
              }}
              dataSource={Object.keys(runtimeScene._objects.items).map(
                objectName => ({
                  text: objectName,
                  value: objectName,
                })
              )}
            />
            <RaisedButton
              label={<Trans>Create</Trans>}
              primary
              onClick={() =>
                onCall(['createObject'], [this.state.newObjectName])
              }
            />
          </Line>
        )}
      </div>
    );
  }
}
