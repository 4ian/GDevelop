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

type Props = {|
  runtimeObject: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

const transform = runtimeObject => {
  if (!runtimeObject) return null;
  return {
    'X position': runtimeObject.x,
    'Y position': runtimeObject.y,
    Angle: runtimeObject.angle,
    Layer: runtimeObject.layer,
    'Z order': runtimeObject.zOrder,
    'Is hidden?': runtimeObject.hidden,
  };
};

const handleEdit = (edit, { onCall, onEdit }: Props) => {
  if (edit.name === 'X position') {
    onCall(['setX'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Y position') {
    onCall(['setY'], [parseFloat(edit.new_value)]);
  } else if (edit.name === 'Angle') {
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
  </React.Fragment>
);

export default RuntimeObjectInspector;
