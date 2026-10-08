// @flow
import * as React from 'react';
import {
  getPlainVariables,
  getVariablePathInGame,
  type VariablesContainer,
} from './variablesContainerData';
import {
  type EditFunction,
  type CallFunction,
} from '../GDJSInspectorDescriptions';
import InspectorTreeView, {
  buildValueItems,
  type InspectorItem,
} from './InspectorTreeView';

export type { VariablesContainer };

/**
 * The variables of a container, one row each (a folder for a collection).
 *
 * With `onCall`, their values can be edited: `setValue` is called on the
 * variable in the game. `pathToContainer` is where the container is, from the
 * element `onCall` is relative to (`['_variables']` for an instance).
 */
export const buildVariablesItems = (
  parentId: string,
  variablesContainer: ?VariablesContainer,
  onCall?: ?CallFunction,
  pathToContainer: Array<string> = []
): ?Array<InspectorItem> => {
  const variables = getPlainVariables(variablesContainer);
  if (!variables) return null;

  return buildValueItems(parentId, variables, {
    editAt: onCall
      ? (valuePath, newValue) => {
          const variablePath = getVariablePathInGame(
            variablesContainer,
            valuePath
          );
          if (!variablePath) return;
          onCall([...pathToContainer, ...variablePath, 'setValue'], [newValue]);
        }
      : null,
  });
};

type Props = {|
  variablesContainer: ?VariablesContainer,
  onCall?: CallFunction,
  onEdit?: EditFunction,
|};

const VariablesContainerInspector = ({
  variablesContainer,
  onCall,
}: Props): React.Node => {
  const items = React.useMemo(
    () => buildVariablesItems('variables', variablesContainer, onCall),
    [variablesContainer, onCall]
  );
  return variablesContainer ? (
    <InspectorTreeView items={items || []} />
  ) : (
    <InspectorTreeView src={null} />
  );
};

export default VariablesContainerInspector;
