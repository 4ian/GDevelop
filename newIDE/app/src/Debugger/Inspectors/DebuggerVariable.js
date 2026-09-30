// @flow
import mapValues from 'lodash/mapValues';

// This mirrors the internals of gdjs.Variable.
export type DebuggerVariable = {|
  _type: 'string' | 'number' | 'boolean' | 'structure' | 'array',
  _str: string,
  _value: number,
  _bool: boolean,
  _children: { [string]: DebuggerVariable },
  _childrenArray: Array<DebuggerVariable>,
|};

// This mirrors the internals of gdjs.VariablesContainer.
export type DebuggerVariablesContainer = {|
  _variables: { items: { [string]: DebuggerVariable } },
|};

type TransformedVariableObject = {| type: string, value: any |};
export type TransformedVariable = null | string | TransformedVariableObject;

// The runtime debugger client replaces anything nested too deeply by this string.
const maxDepthReachedPlaceholder = '[Max depth reached]';
export const tooDeeplyNestedMessage =
  '[Too deeply nested to be displayed in the debugger]';

const isTruncated = (value: any): boolean =>
  value === maxDepthReachedPlaceholder;

export const transformVariable = (
  variable: DebuggerVariable | string
): TransformedVariable => {
  if (!variable) return null;
  if (typeof variable !== 'object' || isTruncated(variable._type))
    return tooDeeplyNestedMessage;

  const transformedVariable: TransformedVariableObject = {
    type: variable._type,
    value: null,
  };

  if (variable._type === 'string') transformedVariable.value = variable._str;
  else if (variable._type === 'number')
    transformedVariable.value = variable._value;
  else if (variable._type === 'boolean')
    transformedVariable.value = variable._bool;
  else if (variable._type === 'structure')
    transformedVariable.value = isTruncated(variable._children)
      ? tooDeeplyNestedMessage
      : mapValues(variable._children, transformVariable);
  else if (variable._type === 'array')
    transformedVariable.value = isTruncated(variable._childrenArray)
      ? tooDeeplyNestedMessage
      : variable._childrenArray.map(transformVariable);

  return transformedVariable;
};

export const transformVariablesContainer = (
  variablesContainer: DebuggerVariablesContainer
): null | { [string]: TransformedVariable } => {
  if (
    !variablesContainer ||
    !variablesContainer._variables ||
    !variablesContainer._variables.items
  )
    return null;

  return mapValues(variablesContainer._variables.items, transformVariable);
};
