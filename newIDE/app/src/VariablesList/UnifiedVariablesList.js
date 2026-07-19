// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { AutoSizer } from 'react-virtualized';
import { FixedSizeList } from 'react-window';
import {
  Checkbox,
  Divider,
  Menu,
  MenuItem,
  Popover,
  Switch,
  Tooltip,
} from '@material-ui/core';

import VariablesListToolbar from './VariablesListToolbar';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import FlatButton from '../UI/FlatButton';
import Link from '../UI/Link';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import { CLIPBOARD_KIND } from './ClipboardKind';
import newNameGenerator from '../Utils/NewNameGenerator';
import { normalizeString } from '../Utils/Search';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  insertInVariableChildren,
  insertInVariableChildrenArray,
  insertInVariablesContainer,
  isCollectionVariable,
} from '../Utils/VariablesUtils';
import {
  getDirectParentVariable,
  getNodeIdFromVariableName,
  getVariableContextFromNodeId,
  separator,
} from './VariableToTreeNodeHandling';

import styles from './UnifiedVariablesList.module.css';

const gd: libGDevelop = global.gd;
const GLOBAL_KEY_SEPARATOR = '\u0000';
const ROW_HEIGHT = 40;

export type UnifiedVariablesScope = {|
  id: string,
  label: React.Node,
  variablesContainer: gdVariablesContainer,
  scopeLabel?: string,
  groupLabel?: React.Node,
  objectName?: ?string,
  initialInstances?: ?gdInitialInstancesContainer,
  loopIndexVariableName?: string,
  onRenameLoopIndexVariable?: (newName: string) => void,
  onRemoveLoopIndexVariable?: () => void,
  emptyPlaceholderTitle?: React.Node,
  emptyPlaceholderDescription?: React.Node,
  onComputeAllVariableNames: () => Array<string>,
|};

type Props = {|
  scopes: Array<UnifiedVariablesScope>,
  primaryScopeId?: string,
  initiallyOpenScopeId?: string,
  initiallySelectedVariableName?: ?string,
  isListLocked: boolean,
  helpPagePath?: ?string,
  onVariablesUpdated?: () => void,
  onSelectedVariableChange?: (scopeId: string, nodeId: string) => void,
|};

type VariableRowData = {|
  kind: 'variable',
  key: string,
  scope: UnifiedVariablesScope,
  nodeId: string,
  name: string,
  variable: gdVariable,
  parentVariable: gdVariable | null,
  parentNodeId: string,
  parentType: Variable_Type | null,
  depth: number,
  index: number,
  path: Array<string>,
  isCollection: boolean,
  isExpanded: boolean,
  directSearchMatch: boolean,
|};

type GroupRowData = {|
  kind: 'group',
  key: string,
  scope: UnifiedVariablesScope,
  count: number,
|};

type EmptyGroupRowData = {|
  kind: 'empty-group',
  key: string,
  scope: UnifiedVariablesScope,
|};

type VisibleRow = VariableRowData | GroupRowData | EmptyGroupRowData;

type VisibleRowsResult = {|
  rows: Array<VisibleRow>,
  matchCount: number,
|};

type HistorySnapshot = Array<{| id: string, content: any |}>;

type HistoryState = {|
  past: Array<HistorySnapshot>,
  current: HistorySnapshot,
  future: Array<HistorySnapshot>,
|};

const getGlobalKey = (scopeId: string, nodeId: string): string =>
  `${scopeId}${GLOBAL_KEY_SEPARATOR}${nodeId}`;

const splitGlobalKey = (key: string): {| scopeId: string, nodeId: string |} => {
  const splitIndex = key.indexOf(GLOBAL_KEY_SEPARATOR);
  return splitIndex === -1
    ? { scopeId: '', nodeId: key }
    : {
        scopeId: key.slice(0, splitIndex),
        nodeId: key.slice(splitIndex + GLOBAL_KEY_SEPARATOR.length),
      };
};

export const getScopeLabel = (scope: UnifiedVariablesScope): string => {
  if (scope.scopeLabel) return scope.scopeLabel;
  if (scope.objectName) return scope.objectName;
  if (scope.id.includes('behavior')) return 'Behavior';
  if (scope.id.includes('prefab')) return 'Prefab';
  if (scope.id.includes('scene')) return 'Scene';
  if (scope.id.includes('global')) return 'Global';
  if (scope.id.includes('instance')) return 'Instance';
  if (scope.id.includes('local')) return 'Local';
  if (scope.id.includes('object')) return 'Object';
  return 'Variable';
};

const getScopeGroupLabel = (scope: UnifiedVariablesScope): React.Node =>
  scope.groupLabel || scope.label || getScopeLabel(scope);

export const getVariableScalarValue = (variable: gdVariable): string => {
  switch (variable.getType()) {
    case gd.Variable.String:
    case gd.Variable.Enum:
      return variable.getString();
    case gd.Variable.Number:
      return variable.getValue().toString();
    case gd.Variable.Boolean:
      return variable.getBool() ? 'true' : 'false';
    default:
      return '';
  }
};

const getTypeDefinition = (
  variableType: Variable_Type
): {| glyph: string, label: string, castType: string |} => {
  switch (variableType) {
    case gd.Variable.String:
      return { glyph: 'T', label: t`Text`, castType: 'string' };
    case gd.Variable.Enum:
      return { glyph: '≡', label: t`Enum`, castType: 'enum' };
    case gd.Variable.Number:
      return { glyph: '#', label: t`Number`, castType: 'number' };
    case gd.Variable.Boolean:
      return { glyph: '●', label: t`Boolean`, castType: 'boolean' };
    case gd.Variable.Array:
      return { glyph: '[]', label: t`Array`, castType: 'array' };
    case gd.Variable.Structure:
      return { glyph: '{}', label: t`Structure`, castType: 'structure' };
    default:
      return { glyph: '×', label: t`Mixed`, castType: 'string' };
  }
};

const getTypeOptions = () => [
  getTypeDefinition(gd.Variable.String),
  getTypeDefinition(gd.Variable.Enum),
  getTypeDefinition(gd.Variable.Number),
  getTypeDefinition(gd.Variable.Boolean),
  getTypeDefinition(gd.Variable.Array),
  getTypeDefinition(gd.Variable.Structure),
];

const getChildren = (
  variable: gdVariable
): Array<{| name: string, variable: gdVariable, index: number |}> => {
  if (variable.getType() === gd.Variable.Structure) {
    return variable
      .getAllChildrenNames()
      .toJSArray()
      .map((name, index) => ({
        name,
        variable: variable.getChild(name),
        index,
      }));
  }
  if (variable.getType() === gd.Variable.Array) {
    const children = [];
    for (let index = 0; index < variable.getChildrenCount(); index++) {
      children.push({
        name: index.toString(),
        variable: variable.getAtIndex(index),
        index,
      });
    }
    return children;
  }
  return [];
};

const buildVariableRows = ({
  scope,
  name,
  variable,
  index,
  parentNodeId,
  parentVariable,
  path,
  normalizedSearchText,
}: {|
  scope: UnifiedVariablesScope,
  name: string,
  variable: gdVariable,
  index: number,
  parentNodeId: string,
  parentVariable: gdVariable | null,
  path: Array<string>,
  normalizedSearchText: string,
|}): {| rows: Array<VariableRowData>, matches: number, subtreeMatches: boolean |} => {
  const nodeId = parentNodeId
    ? `${parentNodeId}${separator}${name}`
    : getNodeIdFromVariableName(name);
  const nextPath = [...path, name];
  const isCollection = isCollectionVariable(variable);
  const value = getVariableScalarValue(variable);
  const directSearchMatch = !!normalizedSearchText &&
    [name, nextPath.join('.'), value]
      .map(normalizeString)
      .some(text => text.includes(normalizedSearchText));

  let childRows = [];
  let childMatches = 0;
  let hasMatchingChild = false;
  const shouldVisitChildren =
    isCollection && (!!normalizedSearchText || !variable.isFolded());
  if (shouldVisitChildren) {
    getChildren(variable).forEach(child => {
      const childResult = buildVariableRows({
        scope,
        name: child.name,
        variable: child.variable,
        index: child.index,
        parentNodeId: nodeId,
        parentVariable: variable,
        path: nextPath,
        normalizedSearchText,
      });
      if (childResult.subtreeMatches) hasMatchingChild = true;
      childMatches += childResult.matches;
      childRows.push(...childResult.rows);
    });
  }

  const subtreeMatches = directSearchMatch || hasMatchingChild;
  if (normalizedSearchText && !subtreeMatches) {
    return { rows: [], matches: 0, subtreeMatches: false };
  }

  const row = {
    kind: 'variable',
    key: getGlobalKey(scope.id, nodeId),
    scope,
    nodeId,
    name,
    variable,
    parentVariable,
    parentNodeId,
    parentType: parentVariable ? parentVariable.getType() : null,
    depth: nextPath.length - 1,
    index,
    path: nextPath,
    isCollection,
    isExpanded: normalizedSearchText ? hasMatchingChild : !variable.isFolded(),
    directSearchMatch,
  };
  return {
    rows: [row, ...childRows],
    matches: childMatches + (directSearchMatch ? 1 : 0),
    subtreeMatches,
  };
};

export const buildVisibleRows = (
  scopes: Array<UnifiedVariablesScope>,
  visibleScopeIds: Set<string>,
  searchText: string
): VisibleRowsResult => {
  const normalizedSearchText = normalizeString(searchText.trim());
  const rows = [];
  let matchCount = 0;

  scopes.forEach(scope => {
    if (!visibleScopeIds.has(scope.id)) return;
    const scopeRows = [];
    let scopeMatchCount = 0;
    for (let index = 0; index < scope.variablesContainer.count(); index++) {
      const result = buildVariableRows({
        scope,
        name: scope.variablesContainer.getNameAt(index),
        variable: scope.variablesContainer.getAt(index),
        index,
        parentNodeId: '',
        parentVariable: null,
        path: [],
        normalizedSearchText,
      });
      scopeRows.push(...result.rows);
      scopeMatchCount += result.matches;
    }

    if (!normalizedSearchText || scopeRows.length > 0) {
      rows.push({
        kind: 'group',
        key: `${scope.id}-group`,
        scope,
        count: scope.variablesContainer.count(),
      });
      if (!normalizedSearchText && scopeRows.length === 0) {
        rows.push({
          kind: 'empty-group',
          key: `${scope.id}-empty`,
          scope,
        });
      } else {
        rows.push(...scopeRows);
      }
    }
    matchCount += scopeMatchCount;
  });

  return { rows, matchCount };
};

const getSnapshot = (
  scopes: Array<UnifiedVariablesScope>
): HistorySnapshot =>
  scopes.map(scope => ({
    id: scope.id,
    content: serializeToJSObject(scope.variablesContainer),
  }));

const applySnapshot = (
  scopes: Array<UnifiedVariablesScope>,
  snapshot: HistorySnapshot
) => {
  snapshot.forEach(({ id, content }) => {
    const scope = scopes.find(scope => scope.id === id);
    if (scope) unserializeFromJSObject(scope.variablesContainer, content);
  });
};

const HighlightedName = ({
  name,
  searchText,
}: {|
  name: string,
  searchText: string,
|}): React.Node => {
  if (!searchText) return name;
  const normalizedName = normalizeString(name);
  const normalizedNeedle = normalizeString(searchText);
  const index = normalizedName.indexOf(normalizedNeedle);
  if (index === -1) return name;
  return (
    <>
      {name.slice(0, index)}
      <mark className={styles.match}>
        {name.slice(index, index + searchText.length)}
      </mark>
      {name.slice(index + searchText.length)}
    </>
  );
};

type EnumPopoverProps = {|
  anchorEl: HTMLElement,
  row: VariableRowData,
  onClose: () => void,
  onApply: (row: VariableRowData, values: Array<string>, value: string) => void,
|};

const EnumPopover = ({
  anchorEl,
  row,
  onClose,
  onApply,
}: EnumPopoverProps): React.Node => {
  const initialValues = row.variable.getEnumValues().toJSArray();
  const [values, setValues] = React.useState<Array<string>>(
    initialValues.length ? initialValues : [row.variable.getString() || 'New Option']
  );
  const [value, setValue] = React.useState(row.variable.getString());

  const apply = React.useCallback(
    () => {
      const uniqueValues = [];
      values.forEach(option => {
        const trimmedOption = option.trim();
        if (trimmedOption && !uniqueValues.includes(trimmedOption)) {
          uniqueValues.push(trimmedOption);
        }
      });
      onApply(
        row,
        uniqueValues,
        uniqueValues.includes(value) ? value : uniqueValues[0] || ''
      );
      onClose();
    },
    [onApply, onClose, row, value, values]
  );

  return (
    <Popover
      open
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      onClose={(event, reason) => {
        if (reason === 'escapeKeyDown') onClose();
        else apply();
      }}
    >
      <div className={styles.popover} role="dialog" aria-label={t`Enum values`}>
        <h3 className={styles.popoverTitle}>
          <Trans>Enum values</Trans>
        </h3>
        {values.map((option, index) => (
          <div className={styles.enumOption} key={index}>
            <input
              type="radio"
              checked={value === option}
              onChange={() => setValue(option)}
              aria-label={t`Use ${option} as the current value`}
            />
            <input
              className={styles.valueInput}
              value={option}
              autoFocus={index === values.length - 1 && !option}
              onChange={event => {
                const oldOption = values[index];
                const newOption = event.currentTarget.value;
                setValues(values =>
                  values.map((value, valueIndex) =>
                    valueIndex === index ? newOption : value
                  )
                );
                if (value === oldOption) setValue(newOption);
              }}
            />
            <button
              className={styles.iconButton}
              disabled={index === 0}
              onClick={() => {
                const nextValues = [...values];
                [nextValues[index - 1], nextValues[index]] = [
                  nextValues[index],
                  nextValues[index - 1],
                ];
                setValues(nextValues);
              }}
              aria-label={t`Move option up`}
            >
              ↑
            </button>
            <button
              className={styles.iconButton}
              disabled={index === values.length - 1}
              onClick={() => {
                const nextValues = [...values];
                [nextValues[index + 1], nextValues[index]] = [
                  nextValues[index],
                  nextValues[index + 1],
                ];
                setValues(nextValues);
              }}
              aria-label={t`Move option down`}
            >
              ↓
            </button>
            <button
              className={styles.iconButton}
              onClick={() => {
                const nextValues = values.filter(
                  (unusedOption, optionIndex) => optionIndex !== index
                );
                setValues(nextValues);
                if (value === option) setValue(nextValues[0] || '');
              }}
              aria-label={t`Remove option`}
            >
              ×
            </button>
          </div>
        ))}
        <FlatButton
          label={<Trans>Add option</Trans>}
          onClick={() => setValues(values => [...values, ''])}
        />
        <div className={styles.popoverActions}>
          <FlatButton label={<Trans>Cancel</Trans>} onClick={onClose} />
          <FlatButton primary label={<Trans>Apply</Trans>} onClick={apply} />
        </div>
      </div>
    </Popover>
  );
};

type TextPopoverProps = {|
  anchorEl: HTMLElement,
  row: VariableRowData,
  onClose: () => void,
  onApply: (row: VariableRowData, value: string) => void,
|};

const TextPopover = ({
  anchorEl,
  row,
  onClose,
  onApply,
}: TextPopoverProps): React.Node => {
  const [value, setValue] = React.useState(row.variable.getString());
  const apply = React.useCallback(
    () => {
      onApply(row, value);
      onClose();
    },
    [onApply, onClose, row, value]
  );
  return (
    <Popover
      open
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      onClose={(event, reason) => {
        if (reason === 'escapeKeyDown') onClose();
        else apply();
      }}
    >
      <div className={styles.popover} role="dialog" aria-label={t`Edit long text`}>
        <h3 className={styles.popoverTitle}>
          <Trans>Edit long text</Trans>
        </h3>
        <textarea
          className={styles.multilineInput}
          autoFocus
          value={value}
          onChange={event => setValue(event.currentTarget.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
              event.preventDefault();
              apply();
            }
          }}
        />
        <div className={styles.popoverActions}>
          <FlatButton label={<Trans>Cancel</Trans>} onClick={onClose} />
          <FlatButton primary label={<Trans>Apply</Trans>} onClick={apply} />
        </div>
      </div>
    </Popover>
  );
};

type VariableRowProps = {|
  row: VariableRowData,
  style: any,
  isSelected: boolean,
  searchText: string,
  isListLocked: boolean,
  scopes: Array<UnifiedVariablesScope>,
  pendingFocusKey: string | null,
  draggedRow: ?{| row: VariableRowData, copy: boolean |},
  dropTarget: ?{| key: string, where: 'before' | 'after' |},
  onFocusConsumed: () => void,
  onSelect: (row: VariableRowData, event: any) => void,
  onToggleExpanded: VariableRowData => void,
  onCommitName: (VariableRowData, string) => void,
  isNameAvailable: (VariableRowData, string) => boolean,
  onChangeType: (VariableRowData, string) => void,
  onCommitValue: (VariableRowData, string) => void,
  onApplyEnum: (VariableRowData, Array<string>, string) => void,
  onAddChild: VariableRowData => void,
  onDuplicate: VariableRowData => void,
  onDelete: VariableRowData => void,
  onMoveToScope: (VariableRowData, UnifiedVariablesScope) => void,
  onDragStart: (VariableRowData, boolean) => void,
  onDragEnd: () => void,
  onDragOver: (VariableRowData, 'before' | 'after') => void,
  onDrop: VariableRowData => void,
|};

const VariableRow = React.memo<VariableRowProps>(
  ({
    row,
    style,
    isSelected,
    searchText,
    isListLocked,
    scopes,
    pendingFocusKey,
    draggedRow,
    dropTarget,
    onFocusConsumed,
    onSelect,
    onToggleExpanded,
    onCommitName,
    isNameAvailable,
    onChangeType,
    onCommitValue,
    onApplyEnum,
    onAddChild,
    onDuplicate,
    onDelete,
    onMoveToScope,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDrop,
  }) => {
    const [nameDraft, setNameDraft] = React.useState(row.name);
    const [valueDraft, setValueDraft] = React.useState(() =>
      getVariableScalarValue(row.variable)
    );
    const [typeAnchor, setTypeAnchor] = React.useState<?HTMLElement>(null);
    const [valueAnchor, setValueAnchor] = React.useState<?HTMLElement>(null);
    const [menuAnchor, setMenuAnchor] = React.useState<?HTMLElement>(null);
    const nameInputRef = React.useRef<?HTMLInputElement>(null);
    const typeDefinition = getTypeDefinition(row.variable.getType());
    const nameIsValid = isNameAvailable(row, nameDraft);
    const isArrayChild = row.parentType === gd.Variable.Array;
    const isTopLevelLocked = isListLocked && row.depth === 0;

    React.useEffect(() => setNameDraft(row.name), [row.name]);
    React.useEffect(
      () => setValueDraft(getVariableScalarValue(row.variable)),
      [row.variable]
    );
    React.useEffect(
      () => {
        if (pendingFocusKey === row.key && nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
          onFocusConsumed();
        }
      },
      [onFocusConsumed, pendingFocusKey, row.key]
    );

    const hasLargeTextValue =
      row.variable.getType() === gd.Variable.String &&
      (valueDraft.includes('\n') || valueDraft.length > 48);
    const canDropHere =
      draggedRow &&
      draggedRow.row.key !== row.key &&
      draggedRow.row.scope.id === row.scope.id &&
      draggedRow.row.parentNodeId === row.parentNodeId &&
      (!row.parentVariable || row.parentType === gd.Variable.Array);

    const rowClassNames = [styles.row];
    if (isSelected) rowClassNames.push(styles.rowSelected);
    if (dropTarget && dropTarget.key === row.key) {
      rowClassNames.push(
        dropTarget.where === 'before' ? styles.dropBefore : styles.dropAfter
      );
    }

    return (
      <div
        className={rowClassNames.join(' ')}
        style={style}
        role="row"
        aria-level={row.depth + 1}
        aria-selected={isSelected}
        aria-expanded={row.isCollection ? row.isExpanded : undefined}
        onPointerDown={event => {
          if (event.button === 0 && event.currentTarget === event.target) {
            onSelect(row, event);
          }
        }}
        onClick={event => onSelect(row, event)}
        onDragOver={event => {
          if (!canDropHere) return;
          event.preventDefault();
          const bounds = event.currentTarget.getBoundingClientRect();
          onDragOver(
            row,
            event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after'
          );
        }}
        onDrop={event => {
          if (!canDropHere) return;
          event.preventDefault();
          onDrop(row);
        }}
      >
        <div className={styles.scopeCell} role="gridcell">
          {row.depth === 0 ? (
            <Tooltip title={getScopeGroupLabel(row.scope)}>
              <span className={styles.scopeBadge}>
                {getScopeLabel(row.scope)}
              </span>
            </Tooltip>
          ) : (
            <span className={styles.scopeInherited}>
              {getScopeLabel(row.scope)}
            </span>
          )}
        </div>
        <div className={styles.nameCell} role="gridcell">
          <div
            className={styles.nameContent}
            style={{ paddingLeft: Math.min(row.depth, 8) * 16 }}
            title={row.path.join('.')}
          >
            {row.depth > 0 ? <span className={styles.depthGuide} /> : null}
            <span
              className={styles.dragHandle}
              draggable={!isTopLevelLocked}
              onDragStart={event => {
                event.stopPropagation();
                event.dataTransfer.effectAllowed = event.altKey ? 'copy' : 'move';
                onDragStart(row, event.altKey);
              }}
              onDragEnd={onDragEnd}
              onClick={event => event.stopPropagation()}
              aria-label={t`Drag to reorder`}
              role="button"
              tabIndex={-1}
            >
              ⠿
            </span>
            {row.isCollection ? (
              <button
                className={styles.chevron}
                onClick={event => {
                  event.stopPropagation();
                  onToggleExpanded(row);
                }}
                aria-label={row.isExpanded ? t`Collapse` : t`Expand`}
              >
                {row.isExpanded ? '▾' : '▸'}
              </button>
            ) : (
              <span className={styles.chevronPlaceholder} />
            )}
            {isArrayChild ? (
              <span className={styles.arrayIndex}>{row.name}</span>
            ) : row.directSearchMatch && searchText ? (
              <span className={styles.arrayIndex}>
                <HighlightedName name={row.name} searchText={searchText} />
              </span>
            ) : (
              <input
                ref={nameInputRef}
                id={`unified-variable-name-${row.variable.ptr}`}
                className={`${styles.nameInput} ${
                  nameIsValid ? '' : styles.nameInputInvalid
                }`}
                value={nameDraft}
                disabled={isTopLevelLocked}
                aria-invalid={!nameIsValid}
                aria-label={t`Variable name`}
                onClick={event => event.stopPropagation()}
                onChange={event => setNameDraft(event.currentTarget.value)}
                onBlur={() => {
                  if (nameDraft !== row.name) onCommitName(row, nameDraft);
                }}
                onKeyDown={event => {
                  if (event.key === 'Enter') event.currentTarget.blur();
                  if (event.key === 'Escape') {
                    setNameDraft(row.name);
                    event.currentTarget.blur();
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className={styles.typeCell} role="gridcell">
          <Tooltip title={typeDefinition.label}>
            <button
              className={styles.typeChip}
              aria-label={t`Change variable type. Current type: ${typeDefinition.label}`}
              aria-haspopup="menu"
              disabled={isTopLevelLocked}
              onClick={event => {
                event.stopPropagation();
                setTypeAnchor(event.currentTarget);
              }}
            >
              {typeDefinition.glyph}
            </button>
          </Tooltip>
          <Menu
            anchorEl={typeAnchor}
            open={!!typeAnchor}
            onClose={() => setTypeAnchor(null)}
          >
            {getTypeOptions().map(typeOption => (
              <MenuItem
                key={typeOption.castType}
                selected={typeOption.castType === typeDefinition.castType}
                onClick={() => {
                  onChangeType(row, typeOption.castType);
                  setTypeAnchor(null);
                }}
              >
                <span className={styles.typeChip} style={{ marginRight: 10 }}>
                  {typeOption.glyph}
                </span>
                {typeOption.label}
              </MenuItem>
            ))}
          </Menu>
        </div>
        <div className={styles.valueCell} role="gridcell">
          {row.isCollection ? (
            <>
              <span className={styles.valuePreview}>
                {row.variable.getChildrenCount() === 1
                  ? t`1 item`
                  : t`${row.variable.getChildrenCount()} items`}
              </span>
              <button
                className={`${styles.iconButton} ${styles.addChildButton}`}
                onClick={event => {
                  event.stopPropagation();
                  onAddChild(row);
                }}
                disabled={isTopLevelLocked}
                aria-label={t`Add a child variable`}
              >
                +
              </button>
            </>
          ) : row.variable.getType() === gd.Variable.Boolean ? (
            <Switch
              checked={row.variable.getBool()}
              disabled={isTopLevelLocked}
              color="primary"
              onClick={event => event.stopPropagation()}
              onChange={event =>
                onCommitValue(row, event.currentTarget.checked ? 'true' : 'false')
              }
              inputProps={{ 'aria-label': t`Variable value` }}
            />
          ) : row.variable.getType() === gd.Variable.Enum ? (
            <button
              className={styles.enumValueButton}
              onClick={event => {
                event.stopPropagation();
                setValueAnchor(event.currentTarget);
              }}
              disabled={isTopLevelLocked}
              aria-label={t`Edit enum value and options`}
            >
              {valueDraft || t`No value`}
            </button>
          ) : (
            <input
              className={styles.valueInput}
              type={
                row.variable.getType() === gd.Variable.Number ? 'number' : 'text'
              }
              value={valueDraft}
              disabled={isTopLevelLocked}
              aria-label={t`Variable value`}
              onClick={event => event.stopPropagation()}
              onChange={event => setValueDraft(event.currentTarget.value)}
              onBlur={() => {
                if (valueDraft !== getVariableScalarValue(row.variable)) {
                  onCommitValue(row, valueDraft);
                }
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') event.currentTarget.blur();
                if (event.key === 'Escape') {
                  setValueDraft(getVariableScalarValue(row.variable));
                  event.currentTarget.blur();
                }
              }}
            />
          )}
          <span className={styles.rowActions}>
            {hasLargeTextValue ? (
              <Tooltip title={t`Edit long text`}>
                <button
                  className={styles.iconButton}
                  onClick={event => {
                    event.stopPropagation();
                    setValueAnchor(event.currentTarget);
                  }}
                  aria-label={t`Edit long text`}
                >
                  ↗
                </button>
              </Tooltip>
            ) : null}
            <Tooltip title={t`More actions`}>
              <button
                className={styles.rowMenuButton}
                onClick={event => {
                  event.stopPropagation();
                  setMenuAnchor(event.currentTarget);
                }}
                aria-label={t`Variable actions`}
                aria-haspopup="menu"
              >
                ⋮
              </button>
            </Tooltip>
          </span>
          {valueAnchor && row.variable.getType() === gd.Variable.Enum ? (
            <EnumPopover
              anchorEl={valueAnchor}
              row={row}
              onClose={() => setValueAnchor(null)}
              onApply={onApplyEnum}
            />
          ) : valueAnchor ? (
            <TextPopover
              anchorEl={valueAnchor}
              row={row}
              onClose={() => setValueAnchor(null)}
              onApply={onCommitValue}
            />
          ) : null}
          <Menu
            anchorEl={menuAnchor}
            open={!!menuAnchor}
            onClose={() => setMenuAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                onDuplicate(row);
                setMenuAnchor(null);
              }}
            >
              <Trans>Duplicate</Trans>
            </MenuItem>
            {row.depth === 0 && scopes.length > 1
              ? scopes
                  .filter(scope => scope.id !== row.scope.id)
                  .map(scope => (
                    <MenuItem
                      key={scope.id}
                      onClick={() => {
                        onMoveToScope(row, scope);
                        setMenuAnchor(null);
                      }}
                    >
                      <Trans>Move to {getScopeLabel(scope)}</Trans>
                    </MenuItem>
                  ))
              : null}
            <Divider />
            <MenuItem
              disabled={isTopLevelLocked}
              onClick={() => {
                onDelete(row);
                setMenuAnchor(null);
              }}
            >
              <Trans>Delete</Trans>
            </MenuItem>
          </Menu>
        </div>
      </div>
    );
  }
);

type ListItemData = {|
  rows: Array<VisibleRow>,
  selectedKeys: Array<string>,
  searchText: string,
  isListLocked: boolean,
  scopes: Array<UnifiedVariablesScope>,
  pendingFocusKey: string | null,
  draggedRow: ?{| row: VariableRowData, copy: boolean |},
  dropTarget: ?{| key: string, where: 'before' | 'after' |},
  onFocusConsumed: () => void,
  onSelect: (VariableRowData, any) => void,
  onToggleExpanded: VariableRowData => void,
  onCommitName: (VariableRowData, string) => void,
  isNameAvailable: (VariableRowData, string) => boolean,
  onChangeType: (VariableRowData, string) => void,
  onCommitValue: (VariableRowData, string) => void,
  onApplyEnum: (VariableRowData, Array<string>, string) => void,
  onAddChild: VariableRowData => void,
  onDuplicate: VariableRowData => void,
  onDelete: VariableRowData => void,
  onMoveToScope: (VariableRowData, UnifiedVariablesScope) => void,
  onDragStart: (VariableRowData, boolean) => void,
  onDragEnd: () => void,
  onDragOver: (VariableRowData, 'before' | 'after') => void,
  onDrop: VariableRowData => void,
|};

const VirtualizedRow = ({
  index,
  style,
  data,
}: {|
  index: number,
  style: any,
  data: ListItemData,
|}): React.Node => {
  const row = data.rows[index];
  if (row.kind === 'group') {
    return (
      <div className={styles.groupRow} style={style} role="row">
        <span>{getScopeGroupLabel(row.scope)}</span>
        <span className={styles.groupCount}>
          {row.count === 1 ? t`1 variable` : t`${row.count} variables`}
        </span>
      </div>
    );
  }
  if (row.kind === 'empty-group') {
    return (
      <div className={styles.emptyGroupRow} style={style} role="row">
        {row.scope.emptyPlaceholderDescription || (
          <Trans>No variables in this scope yet.</Trans>
        )}
      </div>
    );
  }
  return (
    <VariableRow
      {...data}
      row={row}
      style={style}
      isSelected={data.selectedKeys.includes(row.key)}
    />
  );
};

const UnifiedVariablesList = ({
  scopes,
  primaryScopeId,
  initiallyOpenScopeId,
  initiallySelectedVariableName,
  isListLocked,
  helpPagePath,
  onVariablesUpdated,
  onSelectedVariableChange,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [, setRenderVersion] = React.useState(0);
  const forceUpdate = React.useCallback(
    () => setRenderVersion(version => version + 1),
    []
  );
  const primaryScope =
    scopes.find(scope => scope.id === primaryScopeId) || scopes[0];
  const initialScope =
    scopes.find(scope => scope.id === initiallyOpenScopeId) || primaryScope;
  const [visibleScopeIds, setVisibleScopeIds] = React.useState<Set<string>>(
    () => new Set(scopes.map(scope => scope.id))
  );
  const [searchText, setSearchText] = React.useState('');
  const [selectedKeys, setSelectedKeys] = React.useState<Array<string>>(() => {
    if (!initialScope || !initiallySelectedVariableName) return [];
    return [
      getGlobalKey(
        initialScope.id,
        getNodeIdFromVariableName(initiallySelectedVariableName)
      ),
    ];
  });
  const [pendingFocusKey, setPendingFocusKey] = React.useState<string | null>(
    null
  );
  const [scopeFilterAnchor, setScopeFilterAnchor] = React.useState<?HTMLElement>(
    null
  );
  const [draggedRow, setDraggedRow] = React.useState<?{
    row: VariableRowData,
    copy: boolean,
  }>(null);
  const [dropTarget, setDropTarget] = React.useState<?{
    key: string,
    where: 'before' | 'after',
  }>(null);
  const searchBarRef = React.useRef<any>(null);
  const listRef = React.useRef<any>(null);
  const lastSelectionAnchor = React.useRef<string | null>(null);
  const selectionBeforeSearch = React.useRef<Array<string>>([]);
  const historyRef = React.useRef<?HistoryState>(null);
  if (!historyRef.current) {
    historyRef.current = {
      past: [],
      current: getSnapshot(scopes),
      future: [],
    };
  }

  React.useEffect(
    () => {
      setVisibleScopeIds(previousVisibleScopeIds => {
        const availableScopeIds = new Set(scopes.map(scope => scope.id));
        const nextVisibleScopeIds = new Set(
          [...previousVisibleScopeIds].filter(id => availableScopeIds.has(id))
        );
        scopes.forEach(scope => {
          if (!previousVisibleScopeIds.has(scope.id)) {
            nextVisibleScopeIds.add(scope.id);
          }
        });
        return nextVisibleScopeIds;
      });
    },
    [scopes]
  );

  const visibleRowsResult = React.useMemo(
    () => buildVisibleRows(scopes, visibleScopeIds, searchText),
    // forceUpdate makes the component render again after mutating gd objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopes, visibleScopeIds, searchText, forceUpdate]
  );
  const rows = visibleRowsResult.rows;
  const variableRows = rows.filter(row => row.kind === 'variable');
  const rowByKey = new Map(
    variableRows.map(row => [row.key, row.kind === 'variable' ? row : null])
  );
  const totalVariableCount = scopes.reduce(
    (count, scope) => count + scope.variablesContainer.count(),
    0
  );

  const notifyChange = React.useCallback(
    () => {
      const history = historyRef.current;
      if (history) {
        history.past = [...history.past.slice(-49), history.current];
        history.current = getSnapshot(scopes);
        history.future = [];
      }
      if (onVariablesUpdated) onVariablesUpdated();
      forceUpdate();
    },
    [forceUpdate, onVariablesUpdated, scopes]
  );

  const notifySelection = React.useCallback(
    (keys: Array<string>) => {
      setSelectedKeys(keys);
      const lastKey = keys[keys.length - 1];
      if (lastKey && onSelectedVariableChange) {
        const { scopeId, nodeId } = splitGlobalKey(lastKey);
        onSelectedVariableChange(scopeId, nodeId);
      }
    },
    [onSelectedVariableChange]
  );

  const getRowContextFromKey = React.useCallback(
    (key: string): ?VariableRowData => {
      const visibleRow = rowByKey.get(key);
      if (visibleRow) return visibleRow;
      const { scopeId, nodeId } = splitGlobalKey(key);
      const scope = scopes.find(scope => scope.id === scopeId);
      if (!scope) return null;
      const context = getVariableContextFromNodeId(
        nodeId,
        scope.variablesContainer
      );
      if (!context.variable || context.name === null) return null;
      const parentVariable = getDirectParentVariable(context.lineage);
      const path = nodeId.split(separator);
      return {
        kind: 'variable',
        key,
        scope,
        nodeId,
        name: context.name,
        variable: context.variable,
        parentVariable: parentVariable || null,
        parentNodeId: path.slice(0, -1).join(separator),
        parentType: parentVariable ? parentVariable.getType() : null,
        depth: context.depth,
        index: 0,
        path,
        isCollection: isCollectionVariable(context.variable),
        isExpanded: !context.variable.isFolded(),
        directSearchMatch: false,
      };
    },
    [rowByKey, scopes]
  );

  const selectRow = React.useCallback(
    (row: VariableRowData, event: any) => {
      event.stopPropagation();
      if (event.shiftKey && lastSelectionAnchor.current) {
        const rowKeys = variableRows.map(variableRow => variableRow.key);
        const startIndex = rowKeys.indexOf(lastSelectionAnchor.current);
        const endIndex = rowKeys.indexOf(row.key);
        if (startIndex !== -1 && endIndex !== -1) {
          const from = Math.min(startIndex, endIndex);
          const to = Math.max(startIndex, endIndex);
          notifySelection(rowKeys.slice(from, to + 1));
          return;
        }
      }
      if (event.ctrlKey || event.metaKey) {
        notifySelection(
          selectedKeys.includes(row.key)
            ? selectedKeys.filter(key => key !== row.key)
            : [...selectedKeys, row.key]
        );
      } else {
        notifySelection([row.key]);
      }
      lastSelectionAnchor.current = row.key;
    },
    [notifySelection, selectedKeys, variableRows]
  );

  const isNameAvailable = React.useCallback(
    (row: VariableRowData, name: string): boolean => {
      if (!name.trim()) return false;
      if (name === row.name) return true;
      return row.parentVariable
        ? !row.parentVariable.hasChild(name)
        : !row.scope.variablesContainer.has(name);
    },
    []
  );

  const commitName = React.useCallback(
    (row: VariableRowData, newName: string) => {
      if (row.parentType === gd.Variable.Array) return;
      let cleanedName = newName.trim();
      while (cleanedName.includes(separator)) {
        cleanedName = cleanedName.replace(separator, '');
      }
      cleanedName = row.depth === 0
        ? gd.Project.getSafeName(cleanedName || 'Variable')
        : cleanedName || 'Unnamed';
      const uniqueName = newNameGenerator(cleanedName, tentativeName =>
        row.parentVariable
          ? row.parentVariable.hasChild(tentativeName) && tentativeName !== row.name
          : row.scope.variablesContainer.has(tentativeName) &&
            tentativeName !== row.name
      );
      if (uniqueName === row.name) return;
      if (row.parentVariable) row.parentVariable.renameChild(row.name, uniqueName);
      else row.scope.variablesContainer.rename(row.name, uniqueName);
      if (
        row.depth === 0 &&
        row.scope.loopIndexVariableName === row.name &&
        row.scope.onRenameLoopIndexVariable
      ) {
        row.scope.onRenameLoopIndexVariable(uniqueName);
      }
      const nodeParts = row.nodeId.split(separator);
      nodeParts[nodeParts.length - 1] = uniqueName;
      const newKey = getGlobalKey(row.scope.id, nodeParts.join(separator));
      notifySelection(
        selectedKeys.map(selectedKey =>
          selectedKey === row.key ? newKey : selectedKey
        )
      );
      setPendingFocusKey(newKey);
      notifyChange();
    },
    [notifyChange, notifySelection, selectedKeys]
  );

  const changeType = React.useCallback(
    (row: VariableRowData, newType: string) => {
      const oldType = row.variable.getType();
      if (getTypeDefinition(oldType).castType === newType) return;
      row.variable.castTo(newType);
      if (
        (newType === 'string' || newType === 'enum') &&
        oldType === gd.Variable.Number
      ) {
        row.variable.setString('');
        row.variable.castTo(newType);
      }
      if (newType === 'enum' && oldType !== gd.Variable.Enum) {
        const defaultValue = row.variable.getString() || 'New Option';
        const enumValues = new gd.VectorString();
        enumValues.push_back(defaultValue);
        row.variable.setEnumValues(enumValues);
        enumValues.delete();
        row.variable.setString(defaultValue);
      }
      if (
        newType === 'number' &&
        (oldType === gd.Variable.String || oldType === gd.Variable.Enum)
      ) {
        row.variable.setValue(0);
      }
      notifyChange();
    },
    [notifyChange]
  );

  const commitValue = React.useCallback(
    (row: VariableRowData, newValue: string) => {
      switch (row.variable.getType()) {
        case gd.Variable.String:
        case gd.Variable.Enum:
          if (row.variable.getString() === newValue) return;
          row.variable.setString(newValue);
          break;
        case gd.Variable.Number:
          const numberValue = parseFloat(newValue);
          if (!Number.isFinite(numberValue) || row.variable.getValue() === numberValue)
            return;
          row.variable.setValue(numberValue);
          break;
        case gd.Variable.Boolean:
          const booleanValue = newValue === 'true';
          if (row.variable.getBool() === booleanValue) return;
          row.variable.setBool(booleanValue);
          break;
        default:
          return;
      }
      notifyChange();
    },
    [notifyChange]
  );

  const applyEnum = React.useCallback(
    (row: VariableRowData, values: Array<string>, value: string) => {
      const enumValues = new gd.VectorString();
      values.forEach(enumValue => enumValues.push_back(enumValue));
      row.variable.setEnumValues(enumValues);
      enumValues.delete();
      row.variable.setString(value);
      notifyChange();
    },
    [notifyChange]
  );

  const toggleExpanded = React.useCallback(
    (row: VariableRowData) => {
      row.variable.setFolded(row.isExpanded);
      forceUpdate();
    },
    [forceUpdate]
  );

  const addChild = React.useCallback(
    (row: VariableRowData) => {
      if (!row.isCollection) return;
      let childName;
      if (row.variable.getType() === gd.Variable.Structure) {
        childName = newNameGenerator('ChildVariable', name =>
          row.variable.hasChild(name)
        );
        row.variable.getChild(childName);
      } else {
        childName = row.variable.getChildrenCount().toString();
        row.variable.pushNew();
      }
      row.variable.setFolded(false);
      const childNodeId = `${row.nodeId}${separator}${childName}`;
      const childKey = getGlobalKey(row.scope.id, childNodeId);
      notifySelection([childKey]);
      setPendingFocusKey(childKey);
      notifyChange();
    },
    [notifyChange, notifySelection]
  );

  const addVariable = React.useCallback(
    () => {
      if (!primaryScope || isListLocked) return;
      const { name } = insertInVariablesContainer(
        primaryScope.variablesContainer,
        'Variable',
        null,
        primaryScope.variablesContainer.count(),
        null
      );
      const key = getGlobalKey(primaryScope.id, getNodeIdFromVariableName(name));
      setVisibleScopeIds(ids => new Set([...ids, primaryScope.id]));
      notifySelection([key]);
      setPendingFocusKey(key);
      notifyChange();
      setTimeout(() => {
        const nextRows = buildVisibleRows(
          scopes,
          new Set(scopes.map(scope => scope.id)),
          ''
        ).rows;
        const index = nextRows.findIndex(row => row.key === key);
        if (index !== -1 && listRef.current) listRef.current.scrollToItem(index, 'smart');
      }, 0);
    },
    [isListLocked, notifyChange, notifySelection, primaryScope, scopes]
  );

  const deleteRow = React.useCallback(
    (row: VariableRowData, shouldNotify: boolean = true): boolean => {
      if (isListLocked && row.depth === 0) return false;
      if (row.parentVariable) {
        if (row.parentType === gd.Variable.Array) {
          row.parentVariable.removeAtIndex(parseInt(row.name, 10));
        } else {
          row.parentVariable.removeChild(row.name);
        }
      } else {
        row.scope.variablesContainer.remove(row.name);
        if (
          row.scope.loopIndexVariableName === row.name &&
          row.scope.onRemoveLoopIndexVariable
        ) {
          row.scope.onRemoveLoopIndexVariable();
        }
      }
      if (shouldNotify) {
        notifySelection(selectedKeys.filter(key => key !== row.key));
        notifyChange();
      }
      return true;
    },
    [isListLocked, notifyChange, notifySelection, selectedKeys]
  );

  const deleteSelection = React.useCallback(
    () => {
      const rowsToDelete = selectedKeys
        .map(getRowContextFromKey)
        .filter(Boolean)
        .sort((firstRow, secondRow) => {
          if (!firstRow || !secondRow) return 0;
          return secondRow.nodeId.localeCompare(firstRow.nodeId);
        });
      if (!rowsToDelete.length) return;
      const didDelete = rowsToDelete.some(row => row && deleteRow(row, false));
      if (didDelete) {
        notifySelection([]);
        notifyChange();
      }
    },
    [deleteRow, getRowContextFromKey, notifyChange, notifySelection, selectedKeys]
  );

  const copySelection = React.useCallback(
    () => {
      const content = selectedKeys
        .map(getRowContextFromKey)
        .filter(Boolean)
        .map(row => {
          if (!row) return null;
          return {
            nameOrIndex: row.name,
            serializedVariable: serializeToJSObject(row.variable),
            hasName: row.parentType !== gd.Variable.Array,
          };
        })
        .filter(Boolean);
      if (content.length) Clipboard.set(CLIPBOARD_KIND, content);
      forceUpdate();
    },
    [forceUpdate, getRowContextFromKey, selectedKeys]
  );

  const pasteClipboardContent = React.useCallback(
    () => {
      if (!Clipboard.has(CLIPBOARD_KIND) || !primaryScope) return;
      const content = SafeExtractor.extractArray(Clipboard.get(CLIPBOARD_KIND));
      if (!content) return;
      const targetRow = selectedKeys.length
        ? getRowContextFromKey(selectedKeys[selectedKeys.length - 1])
        : null;
      const targetScope = targetRow ? targetRow.scope : primaryScope;
      const newKeys = [];
      let arrayOffset = 0;
      content.forEach(variableContent => {
        const name = SafeExtractor.extractStringProperty(
          variableContent,
          'nameOrIndex'
        );
        const serializedVariable = SafeExtractor.extractObjectProperty(
          variableContent,
          'serializedVariable'
        );
        const hasName = SafeExtractor.extractBooleanProperty(
          variableContent,
          'hasName'
        );
        if (!name || !serializedVariable || hasName === null) return;
        if (targetRow && targetRow.parentVariable) {
          if (targetRow.parentType === gd.Variable.Array && !hasName) {
            const index = parseInt(targetRow.name, 10) + 1 + arrayOffset;
            insertInVariableChildrenArray(
              targetRow.parentVariable,
              serializedVariable,
              index
            );
            newKeys.push(
              getGlobalKey(
                targetScope.id,
                `${targetRow.parentNodeId}${separator}${index}`
              )
            );
            arrayOffset++;
          } else if (targetRow.parentType === gd.Variable.Structure && hasName) {
            const newName = insertInVariableChildren(
              targetRow.parentVariable,
              name,
              serializedVariable
            );
            newKeys.push(
              getGlobalKey(
                targetScope.id,
                `${targetRow.parentNodeId}${separator}${newName}`
              )
            );
          }
        } else if (hasName && !isListLocked) {
          const position = targetRow
            ? targetScope.variablesContainer.getPosition(targetRow.name) + 1
            : targetScope.variablesContainer.count();
          const { name: newName } = insertInVariablesContainer(
            targetScope.variablesContainer,
            gd.Project.getSafeName(name),
            serializedVariable,
            position,
            null
          );
          newKeys.push(
            getGlobalKey(targetScope.id, getNodeIdFromVariableName(newName))
          );
        }
      });
      if (newKeys.length) {
        notifySelection(newKeys);
        notifyChange();
      }
    },
    [
      getRowContextFromKey,
      isListLocked,
      notifyChange,
      notifySelection,
      primaryScope,
      selectedKeys,
    ]
  );

  const duplicateRow = React.useCallback(
    (row: VariableRowData) => {
      const serializedVariable = serializeToJSObject(row.variable);
      let newKey = '';
      if (!row.parentVariable) {
        const { name } = insertInVariablesContainer(
          row.scope.variablesContainer,
          row.name,
          serializedVariable,
          row.scope.variablesContainer.getPosition(row.name) + 1,
          null
        );
        newKey = getGlobalKey(row.scope.id, getNodeIdFromVariableName(name));
      } else if (row.parentType === gd.Variable.Array) {
        const index = parseInt(row.name, 10) + 1;
        insertInVariableChildrenArray(row.parentVariable, serializedVariable, index);
        newKey = getGlobalKey(
          row.scope.id,
          `${row.parentNodeId}${separator}${index}`
        );
      } else {
        const name = insertInVariableChildren(
          row.parentVariable,
          row.name,
          serializedVariable
        );
        newKey = getGlobalKey(
          row.scope.id,
          `${row.parentNodeId}${separator}${name}`
        );
      }
      notifySelection([newKey]);
      setPendingFocusKey(newKey);
      notifyChange();
    },
    [notifyChange, notifySelection]
  );

  const moveToScope = React.useCallback(
    (row: VariableRowData, targetScope: UnifiedVariablesScope) => {
      if (row.depth !== 0 || row.scope.id === targetScope.id) return;
      const { name } = insertInVariablesContainer(
        targetScope.variablesContainer,
        row.name,
        serializeToJSObject(row.variable),
        targetScope.variablesContainer.count(),
        null
      );
      row.scope.variablesContainer.remove(row.name);
      const key = getGlobalKey(targetScope.id, getNodeIdFromVariableName(name));
      notifySelection([key]);
      setVisibleScopeIds(ids => new Set([...ids, targetScope.id]));
      notifyChange();
    },
    [notifyChange, notifySelection]
  );

  const dropRow = React.useCallback(
    (targetRow: VariableRowData) => {
      if (!draggedRow || !dropTarget) return;
      const sourceRow = draggedRow.row;
      if (
        sourceRow.scope.id !== targetRow.scope.id ||
        sourceRow.parentNodeId !== targetRow.parentNodeId
      )
        return;
      if (draggedRow.copy) {
        duplicateRow(sourceRow);
        setDraggedRow(null);
        setDropTarget(null);
        return;
      }
      const afterOffset = dropTarget.where === 'after' ? 1 : 0;
      if (!sourceRow.parentVariable && !targetRow.parentVariable) {
        const from = sourceRow.scope.variablesContainer.getPosition(sourceRow.name);
        const target = targetRow.scope.variablesContainer.getPosition(targetRow.name);
        const to = (target > from ? target - 1 : target) + afterOffset;
        sourceRow.scope.variablesContainer.move(from, to);
      } else if (
        sourceRow.parentVariable &&
        targetRow.parentVariable === sourceRow.parentVariable &&
        sourceRow.parentType === gd.Variable.Array
      ) {
        const from = parseInt(sourceRow.name, 10);
        const target = parseInt(targetRow.name, 10);
        const to = (target > from ? target - 1 : target) + afterOffset;
        sourceRow.parentVariable.moveChildInArray(from, to);
      } else {
        setDraggedRow(null);
        setDropTarget(null);
        return;
      }
      setDraggedRow(null);
      setDropTarget(null);
      notifyChange();
    },
    [draggedRow, dropTarget, duplicateRow, notifyChange]
  );

  const undo = React.useCallback(
    () => {
      const history = historyRef.current;
      if (!history || history.past.length === 0) return;
      const previous = history.past[history.past.length - 1];
      history.past = history.past.slice(0, -1);
      history.future = [history.current, ...history.future];
      history.current = previous;
      applySnapshot(scopes, previous);
      notifySelection([]);
      if (onVariablesUpdated) onVariablesUpdated();
      forceUpdate();
    },
    [forceUpdate, notifySelection, onVariablesUpdated, scopes]
  );

  const redo = React.useCallback(
    () => {
      const history = historyRef.current;
      if (!history || history.future.length === 0) return;
      const next = history.future[0];
      history.future = history.future.slice(1);
      history.past = [...history.past, history.current];
      history.current = next;
      applySnapshot(scopes, next);
      notifySelection([]);
      if (onVariablesUpdated) onVariablesUpdated();
      forceUpdate();
    },
    [forceUpdate, notifySelection, onVariablesUpdated, scopes]
  );

  const handleSearchChange = React.useCallback(
    (newSearchText: string) => {
      if (!searchText && newSearchText) {
        selectionBeforeSearch.current = selectedKeys;
      }
      setSearchText(newSearchText);
    },
    [searchText, selectedKeys]
  );

  const handleKeyDown = React.useCallback(
    (event: SyntheticKeyboardEvent<HTMLDivElement>) => {
      const target = event.target;
      const isEditing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;
      const commandKey = event.ctrlKey || event.metaKey;
      if (commandKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        if (searchBarRef.current) searchBarRef.current.focus();
        return;
      }
      if (isEditing) return;
      if (event.key === 'Escape' && searchText) {
        event.preventDefault();
        setSearchText('');
        notifySelection(selectionBeforeSearch.current);
        return;
      }
      if (commandKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        copySelection();
        return;
      }
      if (commandKey && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        pasteClipboardContent();
        return;
      }
      if (commandKey && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        copySelection();
        deleteSelection();
        return;
      }
      if (commandKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        const row = selectedKeys.length
          ? getRowContextFromKey(selectedKeys[selectedKeys.length - 1])
          : null;
        if (row) duplicateRow(row);
        return;
      }
      if (commandKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      if (commandKey && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        deleteSelection();
        return;
      }
      const selectedKey = selectedKeys[selectedKeys.length - 1];
      const selectedRowIndex = variableRows.findIndex(row => row.key === selectedKey);
      const selectedRow =
        selectedRowIndex === -1 ? null : variableRows[selectedRowIndex];
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        const nextIndex = Math.max(
          0,
          Math.min(
            variableRows.length - 1,
            selectedRowIndex === -1 ? 0 : selectedRowIndex + direction
          )
        );
        const nextRow = variableRows[nextIndex];
        if (nextRow) {
          notifySelection([nextRow.key]);
          const fullIndex = rows.findIndex(row => row.key === nextRow.key);
          if (fullIndex !== -1 && listRef.current) {
            listRef.current.scrollToItem(fullIndex, 'smart');
          }
        }
      } else if (selectedRow && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (selectedRow.isCollection && selectedRow.isExpanded) {
          toggleExpanded(selectedRow);
        } else if (selectedRow.parentNodeId) {
          notifySelection([
            getGlobalKey(selectedRow.scope.id, selectedRow.parentNodeId),
          ]);
        }
      } else if (selectedRow && event.key === 'ArrowRight') {
        event.preventDefault();
        if (selectedRow.isCollection && !selectedRow.isExpanded) {
          toggleExpanded(selectedRow);
        }
      } else if (
        selectedRow &&
        (event.key === 'Enter' || event.key === 'F2') &&
        selectedRow.parentType !== gd.Variable.Array
      ) {
        event.preventDefault();
        setPendingFocusKey(selectedRow.key);
      }
    },
    [
      copySelection,
      deleteSelection,
      duplicateRow,
      getRowContextFromKey,
      notifySelection,
      pasteClipboardContent,
      redo,
      rows,
      searchText,
      selectedKeys,
      toggleExpanded,
      undo,
      variableRows,
    ]
  );

  const themeVariables = {
    '--variables-separator': gdevelopTheme.listItem.separatorColor,
    '--variables-primary-text': gdevelopTheme.text.color.primary,
    '--variables-secondary-text': gdevelopTheme.text.color.secondary,
    '--variables-header-background': gdevelopTheme.toolbar.backgroundColor,
    '--variables-list-background': gdevelopTheme.list.itemsBackgroundColor,
    '--variables-group-background': gdevelopTheme.listItem.groupBackgroundColor,
    '--variables-hover-background': gdevelopTheme.list.hover.backgroundColor,
    '--variables-selected-background':
      gdevelopTheme.listItem.selectedBackgroundColor,
    '--variables-focus': gdevelopTheme.palette.secondary,
    '--variables-field-background': gdevelopTheme.paper.backgroundColor.medium,
    '--variables-scope-background': gdevelopTheme.paper.backgroundColor.medium,
    '--variables-scope-border': gdevelopTheme.listItem.separatorColor,
    '--variables-scope-text': gdevelopTheme.text.color.primary,
    '--variables-type-background': gdevelopTheme.paper.backgroundColor.medium,
    '--variables-type-text': gdevelopTheme.palette.secondary,
    '--variables-match-background': gdevelopTheme.text.highlighted.backgroundColor,
    '--variables-error': gdevelopTheme.message.error,
  };

  const itemData: ListItemData = {
    rows,
    selectedKeys,
    searchText,
    isListLocked,
    scopes,
    pendingFocusKey,
    draggedRow,
    dropTarget,
    onFocusConsumed: () => setPendingFocusKey(null),
    onSelect: selectRow,
    onToggleExpanded: toggleExpanded,
    onCommitName: commitName,
    isNameAvailable,
    onChangeType: changeType,
    onCommitValue: commitValue,
    onApplyEnum: applyEnum,
    onAddChild: addChild,
    onDuplicate: duplicateRow,
    onDelete: deleteRow,
    onMoveToScope: moveToScope,
    onDragStart: (row, copy) => setDraggedRow({ row, copy }),
    onDragEnd: () => {
      setDraggedRow(null);
      setDropTarget(null);
    },
    onDragOver: (row, where) => setDropTarget({ key: row.key, where }),
    onDrop: dropRow,
  };

  return (
    <div
      className={styles.root}
      style={themeVariables}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => notifySelection([])}
      role="treegrid"
      aria-label={t`Variables`}
      aria-multiselectable="true"
    >
      <div className={styles.toolbar}>
        <VariablesListToolbar
          isNarrow={false}
          isCompact={false}
          onCopy={copySelection}
          onPaste={pasteClipboardContent}
          onDelete={deleteSelection}
          canCopy={selectedKeys.length > 0}
          canPaste={Clipboard.has(CLIPBOARD_KIND)}
          canDelete={selectedKeys.length > 0 && !isListLocked}
          canAdd={!isListLocked && !!primaryScope}
          hideHistoryChangeButtons={false}
          onUndo={undo}
          onRedo={redo}
          canUndo={!!historyRef.current && historyRef.current.past.length > 0}
          canRedo={!!historyRef.current && historyRef.current.future.length > 0}
          onAdd={addVariable}
          searchText={searchText}
          onChangeSearchText={handleSearchChange}
          searchBarRef={searchBarRef}
          searchResultCount={visibleRowsResult.matchCount}
        />
      </div>
      <div className={styles.header} role="row">
        <div role="columnheader">
          <button
            className={styles.headerButton}
            onClick={event => {
              event.stopPropagation();
              setScopeFilterAnchor(event.currentTarget);
            }}
            aria-haspopup="menu"
            aria-expanded={!!scopeFilterAnchor}
          >
            <Trans>Scope</Trans> <span aria-hidden>⌄</span>
          </button>
          <Menu
            anchorEl={scopeFilterAnchor}
            open={!!scopeFilterAnchor}
            onClose={() => setScopeFilterAnchor(null)}
          >
            <MenuItem
              onClick={() =>
                setVisibleScopeIds(new Set(scopes.map(scope => scope.id)))
              }
            >
              <Checkbox
                checked={visibleScopeIds.size === scopes.length}
                indeterminate={
                  visibleScopeIds.size > 0 && visibleScopeIds.size < scopes.length
                }
              />
              <Trans>All scopes</Trans>
            </MenuItem>
            <Divider />
            {scopes.map(scope => (
              <MenuItem
                key={scope.id}
                onClick={() => {
                  setVisibleScopeIds(ids => {
                    const nextIds = new Set(ids);
                    if (nextIds.has(scope.id) && nextIds.size > 1) {
                      nextIds.delete(scope.id);
                    } else {
                      nextIds.add(scope.id);
                    }
                    return nextIds;
                  });
                }}
              >
                <Checkbox checked={visibleScopeIds.has(scope.id)} />
                {getScopeLabel(scope)}
              </MenuItem>
            ))}
          </Menu>
        </div>
        <div role="columnheader">
          <Trans>Name</Trans>
        </div>
        <div role="columnheader">
          <Trans>Type</Trans>
        </div>
        <div role="columnheader">
          <Trans>Value</Trans>
        </div>
      </div>
      <div className={styles.listViewport}>
        {totalVariableCount === 0 && !searchText ? (
          <div className={styles.emptyState}>
            <span>
              {(primaryScope && primaryScope.emptyPlaceholderDescription) || (
                <Trans>Variables store information used by your game.</Trans>
              )}
            </span>
            <div className={styles.exampleRow} aria-hidden="true">
              <span>score</span>
              <strong>#</strong>
              <span>0</span>
            </div>
            {!isListLocked ? (
              <FlatButton
                primary
                label={<Trans>Add a variable</Trans>}
                onClick={addVariable}
              />
            ) : null}
            {helpPagePath ? (
              <Link
                href={getHelpLink(helpPagePath)}
                onClick={() => Window.openExternalURL(getHelpLink(helpPagePath))}
              >
                <Trans>Read the doc</Trans>
              </Link>
            ) : null}
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                ref={listRef}
                height={height}
                width={width}
                itemCount={rows.length}
                itemSize={ROW_HEIGHT}
                itemData={itemData}
                itemKey={(index, data) => data.rows[index].key}
                overscanCount={8}
              >
                {VirtualizedRow}
              </FixedSizeList>
            )}
          </AutoSizer>
        )}
      </div>
    </div>
  );
};

export default UnifiedVariablesList;
