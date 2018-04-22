// @flow
import * as React from 'react';
import ReactJsonView from 'react-json-view';
import {
  type GameData,
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';

type Props = {|
  variablesContainer: GameData,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

const styles = {
  container: {
    flex: 1,
    overflowY: 'scroll',
  },
};

const transformVariable = variable => {
  if (!variable._isStructure) {
    return variable._stringDirty ? variable._value : variable._str;
  } else {
    if (!variable._children) return null;

    const content = {};
    Object.keys(variable._children).forEach(
      variableName =>
        (content[variableName] = transformVariable(
          variable._children[variableName]
        ))
    );
    return content;
  }
};

const transform = variablesContainer => {
  if (!variablesContainer._variables || !variablesContainer._variables.items)
    return null;

  const content = {};
  Object.keys(variablesContainer._variables.items).forEach(
    variableName =>
      (content[variableName] = transformVariable(
        variablesContainer._variables.items[variableName]
      ))
  );
  return content;
};

const handleEdit = (edit, { onCall, onEdit }: Props) => {
  // Reconstruct the path to the variable to edit
  const path = ['_variables', 'items'];
  edit.namespace.forEach(variableName => {
    path.push(variableName);
    path.push('_children');
  });
  path.push(edit.name);

  // Guess the type of the new value (number or string)
  if (parseFloat(edit.new_value).toString() === edit.new_value) {
    path.push('setNumber');
    onCall(path, [parseFloat(edit.new_value)]);
  } else {
    path.push('setString');
    onCall(path, ['' + edit.new_value]);
  }

  return true;
};

export default (props: Props) => (
  <div style={styles.container}>
    <ReactJsonView
      collapsed={false}
      name={false}
      src={
        props.variablesContainer ? transform(props.variablesContainer) : null
      }
      enableClipboard={false}
      displayDataTypes={false}
      displayObjectSize={false}
      onEdit={edit => handleEdit(edit, props)}
      groupArraysAfterLength={50}
      theme="monokai"
    />
  </div>
);
