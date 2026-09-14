// @flow
import * as React from 'react';
import mapValues from 'lodash/mapValues';
import {
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';
import InspectorTreeView, {
  buildValueItems,
  type InspectorItem,
} from './InspectorTreeView';
import {
  tooDeeplyNestedMessage,
  type DebuggerVariable as Variable,
  type DebuggerVariablesContainer,
} from './DebuggerVariable';

export type VariablesContainer = DebuggerVariablesContainer;

// The runtime debugger client replaces anything nested too deeply by this string.
const maxDepthReachedPlaceholder = '[Max depth reached]';

/** A variable of the game as a plain value: the shape the inspector reads. */
// $FlowFixMe[recursive-definition]
// $FlowFixMe[definition-cycle]
const toPlainValue = (variable: Variable | string): any => {
  if (!variable) return null;
  if (
    typeof variable !== 'object' ||
    variable._type === maxDepthReachedPlaceholder
  )
    return tooDeeplyNestedMessage;
  if (variable._type === 'string') return variable._str;
  if (variable._type === 'number') return variable._value;
  if (variable._type === 'boolean') return variable._bool;
  if (variable._type === 'structure')
    return variable._children === maxDepthReachedPlaceholder
      ? tooDeeplyNestedMessage
      : mapValues(variable._children, toPlainValue);
  if (variable._type === 'array')
    return variable._childrenArray === maxDepthReachedPlaceholder
      ? tooDeeplyNestedMessage
      : variable._childrenArray.map(toPlainValue);
  return null;
};

/** The variables of a container, one row each (a folder for a collection). */
export const buildVariablesItems = (
  parentId: string,
  variablesContainer: ?VariablesContainer
): ?Array<InspectorItem> => {
  if (
    !variablesContainer ||
    !variablesContainer._variables ||
    !variablesContainer._variables.items
  )
    return null;

  return buildValueItems(
    parentId,
    mapValues(variablesContainer._variables.items, toPlainValue)
  );
};

type Props = {|
  variablesContainer: ?VariablesContainer,
  // Kept for the callers: the rows are read-only for now.
  onCall?: CallFunction,
  onEdit?: EditFunction,
|};

const VariablesContainerInspector = ({
  variablesContainer,
}: Props): React.Node => {
  const items = React.useMemo(
    () => buildVariablesItems('variables', variablesContainer),
    [variablesContainer]
  );
  return variablesContainer ? (
    <InspectorTreeView items={items || []} />
  ) : (
    <InspectorTreeView src={null} />
  );
};

export default VariablesContainerInspector;
