// @flow
import { formatEvaluationValue } from './formatting';
import {
  type ExpressionEvaluation,
  type InstanceEvaluation,
} from './EventsExecutionTrackingStore';

const gd: libGDevelop = global.gd;

/**
 * How many instances are listed at most. The game already caps what it sends;
 * this second cap keeps the panel readable when the filter matches hundreds
 * of them.
 */
export const MAX_SHOWN_INSTANCES_COUNT = 50;

/** A watched variable, or one of the children of its value. */
export type WatchedItem = {|
  +isRoot?: boolean,
  +isPlaceholder?: boolean,
  /** One instance of the object read by a watched expression. */
  +isInstance?: boolean,
  /** The row standing for the instances left out by the cap or the filter. */
  +isMoreRow?: boolean,
  /** Unique and stable across refreshes, so that folding is not lost. */
  id: string,
  name: string,
  /** Only a root: the watched expression, which can be stopped being watched. */
  expression: ?string,
  sourceType: VariablesContainer_SourceType,
  error: ?string,
  /** False while the game has not answered yet. */
  hasValue: boolean,
  value: any,
  isMissing: boolean,
  /** How many instances the object read has, when it reads one. */
  instancesCount?: ?number,
  /** On the last row: how many instances are not listed. */
  hiddenInstancesCount?: number,
  /** How deep the tree view indents the row: 0 for a watched variable. */
  depth: number,
  children: ?Array<WatchedItem>,
|};

/** What is known of a watched expression before the game answers. */
export type AnalyzedWatchedExpression = {|
  expression: string,
  /** Where the variable comes from (Unknown for an expression). */
  sourceType: VariablesContainer_SourceType,
  /** Whether the platform can read it at all (see isWatchedExpressionValid). */
  isValid: boolean,
|};

export const isTree = (value: any): boolean =>
  typeof value === 'object' && value !== null;

/** What a structure or an array shows on its own row, folded. */
export const summarizeTree = (value: any): string =>
  Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`;

/** Maps a JavaScript value to the corresponding GDevelop variable type. */
export const getValueType = (value: any): Variable_Type => {
  if (value === undefined || value === null) return gd.Variable.Number;
  if (Array.isArray(value)) return gd.Variable.Array;
  if (typeof value === 'object') return gd.Variable.Structure;
  if (typeof value === 'boolean') return gd.Variable.Boolean;
  if (typeof value === 'string') return gd.Variable.String;
  return gd.Variable.Number;
};

export const variableNamesSort = (first: string, second: string): number =>
  first.toLowerCase().localeCompare(second.toLowerCase());

/**
 * The children of a structure or of an array, as rows. Built at each refresh:
 * the identifiers are the path of the child, so that what is unfolded stays
 * unfolded even though the values change every frame.
 */
export const buildChildrenItems = (
  parentId: string,
  value: any,
  isMissing: boolean,
  depth: number
): ?Array<WatchedItem> => {
  if (!isTree(value)) return null;
  const childrenNames = Array.isArray(value)
    ? value.map((child, index) => String(index))
    : Object.keys(value).sort(variableNamesSort);
  if (childrenNames.length === 0) return null;

  return childrenNames.map(childName => {
    const childValue = value[childName];
    // Use "/" separator to avoid id collision with watched expressions that
    // use "." (e.g., "Player.Life" as expression vs "Life" child of "Player").
    const id = `${parentId}/${childName}`;
    return {
      id,
      name: childName,
      expression: null,
      sourceType: gd.VariablesContainer.Unknown,
      error: null,
      hasValue: true,
      value: childValue,
      isMissing,
      depth,
      children: buildChildrenItems(id, childValue, isMissing, depth + 1),
    };
  });
};

/**
 * One row per instance of the object read by a watched expression, each with
 * the children of its own value. Filtered and capped: a scene can hold
 * thousands of instances, and a list that long says nothing.
 */
export const buildInstanceItems = (
  rootId: string,
  instances: Array<InstanceEvaluation>,
  sourceType: VariablesContainer_SourceType,
  isMissing: boolean,
  filter: string,
  depth: number
): Array<WatchedItem> => {
  const lowerCaseFilter = filter.trim().toLowerCase();
  // A group reads several objects: its instances are named after theirs.
  const isOfSeveralObjects = instances.some(
    instance =>
      !!instance.objectName && instance.objectName !== instances[0].objectName
  );
  const getInstanceName = (instance: InstanceEvaluation): string =>
    isOfSeveralObjects && instance.objectName
      ? `${instance.objectName} #${instance.id}`
      : `#${instance.id}`;
  const matchingInstances = lowerCaseFilter
    ? instances.filter(
        instance =>
          getInstanceName(instance)
            .toLowerCase()
            .includes(lowerCaseFilter) ||
          formatEvaluationValue(instance.result, 200, false)
            .toLowerCase()
            .includes(lowerCaseFilter)
      )
    : instances;

  const items = matchingInstances
    .slice(0, MAX_SHOWN_INSTANCES_COUNT)
    .map(instance => {
      const id = `${rootId}/#${instance.id}`;
      return {
        isInstance: true,
        id,
        name: getInstanceName(instance),
        expression: null,
        sourceType,
        error: null,
        hasValue: true,
        value: instance.result,
        isMissing,
        depth,
        children: buildChildrenItems(id, instance.result, isMissing, depth + 1),
      };
    });

  const hiddenCount = matchingInstances.length - items.length;
  if (hiddenCount > 0) {
    items.push({
      isMoreRow: true,
      hiddenInstancesCount: hiddenCount,
      id: `${rootId}/more`,
      name: '',
      expression: null,
      sourceType,
      error: null,
      hasValue: false,
      value: undefined,
      isMissing: false,
      depth,
      children: null,
    });
  }
  return items;
};

/**
 * One item per watched variable, then one per child of a structure or of an
 * array, built again at each refresh from the values of the game.
 * Root items are prefixed with "root:" to avoid id collisions with children
 * (e.g., watching "Player" and "Player.Life" would conflict without prefix).
 */
export const buildWatchedItems = ({
  watchedExpressions,
  evaluations,
  searchText,
}: {|
  watchedExpressions: Array<AnalyzedWatchedExpression>,
  evaluations: { [expression: string]: ExpressionEvaluation | null },
  searchText: string,
|}): Array<WatchedItem> =>
  watchedExpressions.map(({ expression, sourceType, isValid }) => {
    const evaluation = evaluations[expression];
    // Struck through when the variable is not declared in the project,
    // or not found in the running game.
    const isMissing =
      (sourceType === gd.VariablesContainer.Unknown &&
        !expression.includes('(')) ||
      !isValid ||
      (!!evaluation && !evaluation.error && evaluation.result === undefined);
    const rootId = `root:${expression}`;
    // A search naming the variable itself leaves its instances alone: it
    // asks for that variable, not for some of its instances.
    const doesNameMatchSearch = expression
      .toLowerCase()
      .includes(searchText.trim().toLowerCase());
    const instanceItems =
      evaluation && evaluation.instances
        ? buildInstanceItems(
            rootId,
            evaluation.instances,
            sourceType,
            isMissing,
            doesNameMatchSearch ? '' : searchText,
            1
          )
        : null;
    return {
      id: rootId,
      name: expression,
      expression,
      sourceType,
      error: evaluation ? evaluation.error : null,
      hasValue: !!evaluation,
      value: evaluation ? evaluation.result : undefined,
      instancesCount: evaluation ? evaluation.instancesCount : undefined,
      isMissing,
      depth: 0,
      // Asked instance by instance: the instances replace the children of
      // the first one, which are shown under each of them instead. While
      // they are on their way, a placeholder stands for them: a row with
      // no child at all cannot be unfolded, and unfolding it is what asks
      // the game for the instances in the first place.
      children:
        instanceItems ||
        (evaluation && (evaluation.instancesCount || 0) > 1
          ? [
              {
                isPlaceholder: true,
                id: `${rootId}/loading-instances`,
                name: '',
                expression: null,
                sourceType,
                error: null,
                hasValue: false,
                value: undefined,
                isMissing: false,
                depth: 1,
                children: null,
              },
            ]
          : evaluation
          ? buildChildrenItems(rootId, evaluation.result, isMissing, 1)
          : null),
    };
  });

/**
 * What the search keeps: a watched variable whose name matches, or one whose
 * instances still have a row matching, so that searching an id or a value
 * finds the variable that holds it.
 */
export const filterWatchedItems = (
  items: Array<WatchedItem>,
  searchText: string
): Array<WatchedItem> => {
  const lowerCaseSearchText = searchText.trim().toLowerCase();
  if (!lowerCaseSearchText) return items;
  return items.filter(
    item =>
      item.name.toLowerCase().includes(lowerCaseSearchText) ||
      (item.children || []).length > 0
  );
};
