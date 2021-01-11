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
  variablesContainer: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

const transformVariable = variable => {
  if (!variable) return null;

  const adaptedVariable = {
    type: variable._type,
    value: null,
  };

  if (variable._type === 'string') adaptedVariable.value = variable._str;
  else if (variable._type === 'number') adaptedVariable.value = variable._value;
  else if (variable._type === 'boolean') adaptedVariable.value = variable._bool;
  else if (variable._type === 'structure')
    adaptedVariable.value = mapValues(variable._children, transformVariable);
  else if (variable._type === 'array')
    adaptedVariable.value = variable._childrenList.map(transformVariable);

  return adaptedVariable;
};

const transform = variablesContainer => {
  if (
    !variablesContainer ||
    !variablesContainer._variables ||
    !variablesContainer._variables.items
  )
    return null;

  return mapValues(variablesContainer._variables.items, transformVariable);
};

const constructPath = (editPath: string[]) => {
  const path = [`get(${editPath.shift()})`];

  let skip = false;
  for (const variableName of editPath) {
    // Skip every second key as it is the "value"
    // key which is displayed only for better user
    // experience but doesn't really exists
    skip = !skip;
    if (skip) continue;

    path.push(`getChild(${variableName})`);
  }

  return path;
};

const handleEdit = (edit, { onCall, onEdit, variablesContainer }: Props) => {
  // Reconstruct the path to the variable to edit
  const path = constructPath(edit.namespace);

  if (edit.name === 'type') {
    path.push('castTo');
    onCall(path, [edit.new_value]);
  } else if (edit.name === 'value') {
    path.push('setValue');
    onCall(path, [edit.new_value]);
  }

  return true;
};

export default (props: Props) => (
  <ReactJsonView
    collapsed={false}
    name={false}
    src={props.variablesContainer ? transform(props.variablesContainer) : null}
    enableClipboard={false}
    displayDataTypes={false}
    displayObjectSize={false}
    onEdit={edit => handleEdit(edit, props)}
    groupArraysAfterLength={50}
    theme="monokai"
  />
);
