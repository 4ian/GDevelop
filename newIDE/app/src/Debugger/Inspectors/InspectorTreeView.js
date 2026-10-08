// @flow
import { Trans, t } from '@lingui/macro';
import * as React from 'react';
import SearchableReadOnlyTreeView from '../../UI/TreeView/SearchableReadOnlyTreeView';
import InspectedValueField from './InspectedValueField';
import WarningIcon from '../../UI/CustomSvgIcons/Warning';
import { isTruncated, tooDeeplyNestedMessage } from './variablesContainerData';
import EmptyMessage from '../../UI/EmptyMessage';
import Text from '../../UI/Text';
import { getVariableTypeToIcon } from '../../VariablesList/VariableTypeSelector';
import { IconContainer } from '../../UI/IconContainer';
import classes from './InspectorTreeView.module.css';

const gd: libGDevelop = global.gd;

const ITEM_HEIGHT = 24;
const ROOT_ITEM_HEIGHT = 32;
const noSelection = [];

/**
 * A row of the inspector: a named section holding other rows, a value read in
 * the game, or a hint (something that cannot be read, an empty section...).
 *
 * The identifiers are paths: they stay the same from one refresh of the
 * values to the next, so that what the user unfolded stays unfolded.
 */
export type InspectorItem = {|
  +isRoot?: boolean,
  +isPlaceholder?: boolean,
  +openWithSingleClick?: boolean,
  id: string,
  name: string,
  kind: 'section' | 'value' | 'hint',
  /**
   * For a value: what the game holds. For a hint: the text to show. For an
   * empty section: what to say instead of children.
   */
  value?: any,
  /** Sections only: unfolded when the inspector is shown. */
  openByDefault?: boolean,
  /** An icon of the editor, shown before the name. */
  icon?: React.Node,
  /** The icon of an extension (a behavior...), shown before the name. */
  iconUrl?: string,
  /**
   * Values only: set when the value can be changed in the running game. It is
   * then shown in a field instead of a text.
   */
  onEditValue?: (newValue: any) => void,
  children: ?Array<InspectorItem>,
|};

/** Changes, in the running game, what is at a path of a value shown. */
export type EditValueAtPath = (path: Array<string>, newValue: any) => void;

/** A named value of the game, shown in the order given. */
export type InspectedProperty = {|
  name: string,
  value: any,
  /** Set when the value can be changed in the running game. */
  onEdit?: (newValue: any) => void,
|};

/** Only these can be changed in a field: not a structure, not `null`. */
const isEditableValue = (value: any): boolean =>
  typeof value === 'number' ||
  typeof value === 'string' ||
  typeof value === 'boolean';

export const isTree = (value: any): boolean =>
  typeof value === 'object' && value !== null;

const summarizeTree = (value: any): string =>
  Array.isArray(value) ? `[${value.length}]` : `{${Object.keys(value).length}}`;

const getValueType = (value: any): Variable_Type => {
  if (value === undefined || value === null) return gd.Variable.Number;
  if (Array.isArray(value)) return gd.Variable.Array;
  if (typeof value === 'object') return gd.Variable.Structure;
  if (typeof value === 'boolean') return gd.Variable.Boolean;
  if (typeof value === 'string') return gd.Variable.String;
  return gd.Variable.Number;
};

export const formatValue = (value: any): string => {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
};

const namesSort = (first: string, second: string) =>
  first.toLowerCase().localeCompare(second.toLowerCase());

type ValueItemsOptions = {|
  sorted?: boolean,
  /** Makes the values editable: called with the path of the edited value. */
  editAt?: ?EditValueAtPath,
  /** Where `value` is, in what `editAt` receives. */
  path?: Array<string>,
|};

/** A row for a value: a leaf, or a folder holding its children. */
export const makeValueItem = (
  id: string,
  name: string,
  value: any,
  { editAt, path = [] }: ValueItemsOptions = {}
): InspectorItem => ({
  id,
  name,
  kind: 'value',
  value,
  openWithSingleClick: true,
  onEditValue:
    editAt && isEditableValue(value)
      ? newValue => editAt(path, newValue)
      : undefined,
  children: buildValueItems(id, value, { editAt, path }),
});

/**
 * The children of a structure or of an array, as rows. Objects keep the order
 * of their keys sorted, arrays the order of their elements.
 */
export const buildValueItems = (
  parentId: string,
  value: any,
  { sorted = true, editAt, path = [] }: ValueItemsOptions = {}
): ?Array<InspectorItem> => {
  if (!isTree(value)) return null;
  const childrenNames = Array.isArray(value)
    ? value.map((_, index) => String(index))
    : sorted
    ? Object.keys(value).sort(namesSort)
    : Object.keys(value);
  if (childrenNames.length === 0) return null;

  return childrenNames.map(childName =>
    makeValueItem(`${parentId}/${childName}`, childName, value[childName], {
      editAt,
      path: [...path, childName],
    })
  );
};

/**
 * Named values as rows, in the order given, each one editable when it says
 * how to change it in the game.
 */
export const buildPropertiesItems = (
  parentId: string,
  properties: ?Array<InspectedProperty>
): ?Array<InspectorItem> => {
  if (!properties || properties.length === 0) return null;
  return properties.map(({ name, value, onEdit }) => ({
    ...makeValueItem(`${parentId}/${name}`, name, value),
    onEditValue: onEdit && isEditableValue(value) ? onEdit : undefined,
  }));
};

/**
 * A folder of named values (the properties of a layer...), summarized by its
 * number of values like any other structure.
 */
export const makePropertiesFolderItem = (
  id: string,
  name: string,
  properties: Array<InspectedProperty>
): InspectorItem => {
  const summarizedValue = {};
  properties.forEach(property => {
    summarizedValue[property.name] = property.value;
  });
  return {
    ...makeValueItem(id, name, summarizedValue),
    children: buildPropertiesItems(id, properties),
  };
};

/** A named, foldable group of rows. */
export const makeSection = (
  id: string,
  name: string,
  children: ?Array<InspectorItem>,
  {
    isRoot = false,
    openByDefault = true,
    emptyHint,
    icon,
    iconUrl,
  }: {|
    isRoot?: boolean,
    openByDefault?: boolean,
    emptyHint?: string,
    icon?: React.Node,
    iconUrl?: string,
  |} = {}
): InspectorItem => ({
  id,
  name,
  kind: 'section',
  isRoot,
  openWithSingleClick: true,
  openByDefault,
  icon,
  iconUrl,
  // An empty section cannot be opened: it says on its own row that it is empty.
  value: children && children.length ? undefined : emptyHint,
  children: children && children.length ? children : null,
});

/** A row that only carries a text: what cannot be read, an empty group... */
export const makeHintItem = (
  id: string,
  hint: string,
  name: string = ''
): InspectorItem => ({
  id,
  name,
  kind: 'hint',
  value: hint,
  children: null,
});

const getItemHeight = (item: InspectorItem) =>
  item.isRoot ? ROOT_ITEM_HEIGHT : ITEM_HEIGHT;
const getItemId = (item: InspectorItem) => item.id;
const getItemChildren = (item: InspectorItem) => item.children;

/**
 * The rows are rendered nodes: the search is done on the name, and on the
 * value of a leaf.
 */
const getItemSearchedTexts = (item: InspectorItem) => [
  item.name,
  item.kind === 'value' && !isTree(item.value) ? formatValue(item.value) : null,
];

const collectOpenedIds = (
  items: Array<InspectorItem>,
  openedIds: Array<string>
): Array<string> => {
  items.forEach(item => {
    if (item.kind === 'section' && item.openByDefault) openedIds.push(item.id);
    if (item.children) collectOpenedIds(item.children, openedIds);
  });
  return openedIds;
};

type Props = {|
  /** The rows to show. Exclusive with `src`. */
  items?: ?Array<InspectorItem>,
  /** A value to show as rows, for the raw data. Exclusive with `items`. */
  src?: any,
  /** Makes the values of `src` editable. */
  onEditSrc?: ?EditValueAtPath,
  missingValueLabel?: React.Node,
|};

/**
 * One tree for the whole inspector: sections are folders, values are leaves.
 * It takes all the space it is given and scrolls on its own, so that a long
 * list of behaviors or a structure of hundreds of children is read by
 * scrolling and folding, not in a stack of small boxes.
 */
const InspectorTreeView = ({
  items: givenItems,
  src,
  onEditSrc,
  missingValueLabel,
}: Props): React.Node => {
  const items: Array<InspectorItem> = React.useMemo(
    () => {
      if (givenItems) return givenItems;
      return buildValueItems('root', src, { editAt: onEditSrc }) || [];
    },
    [givenItems, src, onEditSrc]
  );

  // The sections asked to be open are unfolded when the inspector is shown,
  // and the user is then free to fold them: the tree is created again when
  // another element is inspected (see `key` below).
  const initiallyOpenedNodeIds = React.useMemo(
    () => collectOpenedIds(items, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.map(item => item.id).join('|')]
  );

  const renderItemName = React.useCallback((item: InspectorItem) => {
    if (item.kind === 'section') {
      return (
        <div className={classes.row}>
          {item.iconUrl ? (
            <span className={classes.rowIcon}>
              <IconContainer src={item.iconUrl} alt={item.name} size={16} />
            </span>
          ) : item.icon ? (
            <span className={classes.rowIcon}>{item.icon}</span>
          ) : null}
          <span className={classes.rowName} title={item.name}>
            <Text noMargin size="body2">
              {item.name}
            </Text>
          </span>
          {!item.isRoot && item.children && (
            <span className={classes.rowCount}>
              <Text noMargin size="body2" color="secondary">
                {item.children.length}
              </Text>
            </span>
          )}
          {!item.children && item.value && (
            <React.Fragment>
              <span className={classes.rowSeparator} />
              <span className={classes.rowHint}>
                <Text noMargin size="body2" color="secondary">
                  {item.value}
                </Text>
              </span>
            </React.Fragment>
          )}
        </div>
      );
    }
    if (item.kind === 'hint') {
      return (
        <div className={classes.row}>
          {item.name && (
            <span className={classes.rowName} title={item.name}>
              <Text noMargin size="body2">
                {item.name}
              </Text>
            </span>
          )}
          <span className={classes.rowSeparator} />
          <span className={classes.rowHint}>
            <Text noMargin size="body2" color="secondary">
              {item.value}
            </Text>
          </span>
        </div>
      );
    }
    const TypeIcon = getVariableTypeToIcon()[getValueType(item.value)];
    const isFolder = isTree(item.value);
    return (
      <div className={classes.row}>
        <span className={classes.rowIcon} title={item.name}>
          <TypeIcon fontSize="small" />
        </span>
        <span className={classes.rowName} title={item.name}>
          <Text noMargin size="body2" allowSelection>
            {item.name}
          </Text>
        </span>
        <span className={classes.rowSeparator} />
        {(isTruncated(item.value) || item.value === tooDeeplyNestedMessage) && (
          // Never shown as if it were the value: the game could not send it.
          <span className={classes.rowIcon} title={item.value}>
            <WarningIcon fontSize="small" />
          </span>
        )}
        {item.onEditValue ? (
          <InspectedValueField value={item.value} onEdit={item.onEditValue} />
        ) : (
          <span
            className={classes.rowValue}
            title={isFolder ? undefined : formatValue(item.value)}
          >
            <Text noMargin size="body2" color="secondary" allowSelection>
              {isFolder ? summarizeTree(item.value) : formatValue(item.value)}
            </Text>
          </span>
        )}
      </div>
    );
  }, []);

  if (!givenItems && (src === undefined || src === null)) {
    return (
      <EmptyMessage>
        {missingValueLabel || (
          <Trans>
            This is not available anymore in the running game. Select something
            else, or refresh the debugger.
          </Trans>
        )}
      </EmptyMessage>
    );
  }

  if (!givenItems && !isTree(src)) {
    return <Text allowSelection>{formatValue(src)}</Text>;
  }

  return (
    <SearchableReadOnlyTreeView
      searchPlaceholder={t`Search a property, a variable, a value...`}
      getItemSearchedTexts={getItemSearchedTexts}
      items={items}
      estimatedItemSize={ITEM_HEIGHT}
      getItemHeight={getItemHeight}
      getItemName={renderItemName}
      getItemId={getItemId}
      getItemChildren={getItemChildren}
      initiallyOpenedNodeIds={initiallyOpenedNodeIds}
      selectedItems={noSelection}
      onSelectItems={() => {}}
      multiSelect={false}
      fullWidthRows
    />
  );
};

export default InspectorTreeView;
