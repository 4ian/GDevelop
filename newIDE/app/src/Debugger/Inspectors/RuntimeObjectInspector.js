// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import ReactJsonView from 'react-json-view';
import {
  type GameData,
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';
import VariablesContainerInspector from './VariablesContainerInspector';
import Text from '../../UI/Text';
import TimersInspector from './TimersInspector';

type Props = {|
  runtimeObject: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

type RuntimeObjectData = {|
  'X position': number,
  'Y position': number,
  'Z position'?: number,
  Angle?: number,
  'Rotation around X axis'?: number,
  'Rotation around Y axis'?: number,
  'Rotation around Z axis (Angle)'?: number,
  Layer: string,
  'Z order': number,
  'Is hidden?': boolean,
|};

const transform = runtimeObject => {
  if (!runtimeObject) return null;
  const runtimeObjectData: RuntimeObjectData = {
    'X position': runtimeObject.x,
    'Y position': runtimeObject.y,
    Angle: runtimeObject.angle,
    Layer: runtimeObject.layer,
    'Z order': runtimeObject.zOrder,
    'Is hidden?': runtimeObject.hidden,
  };
  // TODO: Improve check to have more robust type checking
  if (typeof runtimeObject._z !== 'undefined') {
    // 3D object
    runtimeObjectData['Z position'] = runtimeObject._z;
    runtimeObjectData['Rotation around X axis'] = runtimeObject._rotationX;
    runtimeObjectData['Rotation around Y axis'] = runtimeObject._rotationY;
    runtimeObjectData['Rotation around Z axis (Angle)'] =
      runtimeObjectData['Angle'];
    delete runtimeObjectData['Angle'];
  }
  return runtimeObjectData;
};

const handleEdit = (edit, { onCall, onEdit }: Props) => {
  if (edit.name === 'X position') {
    onCall(['setX'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Y position') {
    onCall(['setY'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Z position') {
    onCall(['setZ'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Rotation around X axis') {
    onCall(['setRotationX'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Rotation around Y axis') {
    onCall(['setRotationY'], [parseFloat(edit.new_value)]);
  } else if (
    edit.name === 'Angle' ||
    edit.name === 'Rotation around Z axis (Angle)'
  ) {
    onCall(['setAngle'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Layer') {
    onCall(['setLayer'], [edit.new_value]);
  } else if (edit.name === 'Z order') {
    onCall(['setZOrder'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Is hidden?') {
    onCall(['hide'], [!!edit.new_value]);
  } else return false;

  return true;
};

const RuntimeObjectInspector = (props: Props) => (
  <React.Fragment>
    <Text>
      <Trans>General:</Trans>
    </Text>
    <ReactJsonView
      collapsed={false}
      name={false}
      src={transform(props.runtimeObject)}
      enableClipboard={false}
      displayDataTypes={false}
      displayObjectSize={false}
      onEdit={edit => handleEdit(edit, props)}
      groupArraysAfterLength={50}
      theme="monokai"
    />
    <Text>
      <Trans>Instance variables:</Trans>
    </Text>
    <VariablesContainerInspector
      variablesContainer={
        props.runtimeObject ? props.runtimeObject._variables : null
      }
      // TODO: onEdit and onCall could benefit from a "forward" utility function
      // (can also be applied in DebuggerContent.js)
      onEdit={(path, newValue) =>
        props.onEdit(['_variables'].concat(path), newValue)
      }
      onCall={(path, args) => props.onCall(['_variables'].concat(path), args)}
    />
    <Text>
      <Trans>Timers:</Trans>
    </Text>
    <TimersInspector
      timers={props.runtimeObject ? props.runtimeObject._timers : null}
    />
  </React.Fragment>
);

export default RuntimeObjectInspector;
