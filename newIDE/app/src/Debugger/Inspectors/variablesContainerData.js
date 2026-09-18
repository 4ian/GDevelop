// @flow
import mapValues from 'lodash/mapValues';

// This mirrors the internals of gdjs.Variable.
export type Variable = {|
  _type: 'string' | 'number' | 'boolean' | 'structure' | 'array',
  _str: string,
  _value: number,
  _bool: boolean,
  _children: { [string]: Variable },
  _childrenArray: Array<Variable>,
|};

// This mirrors the internals of gdjs.VariablesContainer.
export type VariablesContainer = {|
  _variables: { items: { [string]: Variable } },
|};

/**
 * What the runtime puts in place of a value it could not send: too deep,
 * circular, or past the size the dump is allowed to reach.
 */
const isTruncated = (value: any): boolean =>
  typeof value === 'string' &&
  (value === '[Max depth reached]' ||
    value.startsWith('[Circular ') ||
    value.startsWith('[Dump too large') ||
    value === '[Removed from the debugger]');

/** Shown in place of a variable the game could not send. */
export const tooDeeplyNestedMessage =
  '[Too deeply nested to be displayed in the debugger]';

/**
 * A variable of the game as a plain value: the shape the inspector reads.
 *
 * The dump the game sends is cut short where it is too deep, circular or too
 * large: the missing parts come back as placeholder strings, replaced here by
 * a sentence the user can act on. Reading them as variables used to crash the
 * whole debugger panel.
 */
// $FlowFixMe[recursive-definition]
// $FlowFixMe[definition-cycle]
export const toPlainValue = (variable: Variable): any => {
  if (!variable) return null;
  if (typeof variable !== 'object' || isTruncated(variable._type))
    return tooDeeplyNestedMessage;
  if (variable._type === 'string') return variable._str;
  if (variable._type === 'number') return variable._value;
  if (variable._type === 'boolean') return variable._bool;
  if (variable._type === 'structure')
    return variable._children && typeof variable._children === 'object'
      ? mapValues(variable._children, toPlainValue)
      : tooDeeplyNestedMessage;
  if (variable._type === 'array')
    return Array.isArray(variable._childrenArray)
      ? variable._childrenArray.map(toPlainValue)
      : tooDeeplyNestedMessage;
  return null;
};

/**
 * Every variable of a container as plain values, or null when the container
 * itself is not what the inspector expects.
 */
export const getPlainVariables = (
  variablesContainer: ?VariablesContainer
): ?{ [string]: any } => {
  if (
    !variablesContainer ||
    typeof variablesContainer !== 'object' ||
    !variablesContainer._variables ||
    typeof variablesContainer._variables !== 'object' ||
    !variablesContainer._variables.items ||
    typeof variablesContainer._variables.items !== 'object'
  )
    return null;

  return mapValues(variablesContainer._variables.items, toPlainValue);
};
