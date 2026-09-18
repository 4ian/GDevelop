// @flow
import * as React from 'react';
import {
  getPlainVariables,
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

/** The variables of a container, one row each (a folder for a collection). */
export const buildVariablesItems = (
  parentId: string,
  variablesContainer: ?VariablesContainer
): ?Array<InspectorItem> => {
  const variables = getPlainVariables(variablesContainer);
  if (!variables) return null;

  return buildValueItems(parentId, variables);
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
