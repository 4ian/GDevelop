// @flow
import * as React from 'react';
import ReactJsonView from 'react-json-view';
import {
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';
import mapValues from 'lodash/mapValues';

// This mirrors the internals of gdjs.Variable.
type Variable = {|
  _type: 'string' | 'number' | 'boolean' | 'structure' | 'array',
  _str: string,
  _value: number,
  _bool: boolean,
  _children: { [string]: Variable },
  _childrenArray: Array<Variable>,
|};

// This mirrors the internals of gdjs.VariablesContainer.
type VariablesContainer = {|
  _variables: { items: { [string]: Variable } },
|};

const transformVariable = (variable: Variable) => {
  if (!variable) return null;

  const transformedVariable: any = {
    type: variable._type,
    value: null,
  };

  if (variable._type === 'string') transformedVariable.value = variable._str;
  else if (variable._type === 'number')
    transformedVariable.value = variable._value;
  else if (variable._type === 'boolean')
    transformedVariable.value = variable._bool;
  else if (variable._type === 'structure')
    transformedVariable.value = mapValues(
      variable._children,
      transformVariable
    );
  else if (variable._type === 'array')
    transformedVariable.value = variable._childrenArray.map(transformVariable);

  return transformedVariable;
};

const transform = (variablesContainer: VariablesContainer) => {
  if (
    !variablesContainer ||
    !variablesContainer._variables ||
    !variablesContainer._variables.items
  )
    return null;

  return mapValues(variablesContainer._variables.items, transformVariable);
};

/**
 * Returns the list of properties to access the variable at the specified path in the specified variables container.
 * Also returns the variable already living there.
 */
const constructPathToVariable = (
  editPath: Array<string>,
  variablesContainer: VariablesContainer
): {| path: ?Array<string>, variable: ?Variable |} => {
  const variableInContainerName = editPath.shift();
  const path = ['_variables', 'items', variableInContainerName];
  let variable = variablesContainer._variables.items[variableInContainerName];
  let skip = false;

  for (const variableName of editPath) {
    // Skip every second key as it is the "value"
    // key which is displayed only for better user
    // experience but doesn't really exists
    skip = !skip;
    if (skip) continue;

    // Walk down in the children of the collection.
    if (variable._type === 'structure') {
      path.push('_children', variableName);
      variable = variable._children[variableName];
    } else if (variable._type === 'array') {
      path.push('_childrenArray', variableName);
      variable = variable._childrenArray[parseInt(variableName, 10)];
    }
    // Bad path: abort.
    else return { path: null, variable: null };
  }

  return { path, variable };
};

const handleEdit = (edit, { onCall, onEdit, variablesContainer }: Props) => {
  if (!variablesContainer) return;

  // Reconstruct the variable to edit from the path
  const { path, variable } = constructPathToVariable(
    edit.namespace,
    variablesContainer
  );
  if (!path) {
    console.error('Invalid path passed to the debugger: ', edit);
    return false;
  }
  if (!variable) {
    console.error("Variable doesn't exist: ", edit);
    return false;
  }

  if (edit.name === 'type') {
    path.push('castTo');
    if (
      edit.new_value === 'string' ||
      edit.new_value === 'number' ||
      edit.new_value === 'boolean' ||
      edit.new_value === 'structure' ||
      edit.new_value === 'array'
    ) {
      if (edit.new_value !== variable._type) onCall(path, [edit.new_value]);
    } else {
      console.error('Invalid type name: ' + edit.new_value);
      return false;
    }
  } else if (edit.name === 'value') {
    // Validate data type
    if (variable._type === 'string' && typeof edit.new_value !== 'string')
      edit.new_value = '' + edit.new_value;
    else if (
      variable._type === 'number' &&
      typeof edit.new_value !== 'number'
    ) {
      edit.new_value = parseFloat(edit.new_value);
      if (isNaN(edit.new_value)) {
        console.error(`Cannot set variable of type number to NaN!`);
        return false;
      }
    } else if (
      variable._type === 'boolean' &&
      typeof edit.new_value !== 'boolean'
    )
      edit.new_value =
        typeof edit.new_value === 'string'
          ? edit.new_value.toLowerCase() !== 'false' && edit.new_value !== '0'
          : !!edit.new_value;
    else if (variable._type === 'structure' || variable._type === 'array') {
      console.error('Cannot set the value of a collection.');
      return false;
    }

    path.push('setValue');
    onCall(path, [edit.new_value]);
  }

  return true;
};

type Props = {|
  variablesContainer: ?VariablesContainer,
  onCall: CallFunction,
  onEdit: EditFunction,
|};

const VariablesContainerInspector = (props: Props) => (
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
    validationMessage="Invalid value"
  />
);

export default VariablesContainerInspector;
