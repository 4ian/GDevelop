// @flow
import * as React from 'react';
import Measure from 'react-measure';
import memoizeOne from 'memoize-one';
import classNames from 'classnames';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { ClickAwayListener } from '@material-ui/core';

import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import Add from '../UI/CustomSvgIcons/Add';
import Edit from '../UI/CustomSvgIcons/Edit';
import Undo from '../UI/CustomSvgIcons/Undo';
import ChevronArrowRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronArrowBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ButtonBase from '@material-ui/core/ButtonBase';

import { Column, Line } from '../UI/Grid';
import IconButton from '../UI/IconButton';
import { DragHandleIcon } from '../UI/DragHandle';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import ScrollView from '../UI/ScrollView';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { useVisibleRowsRange } from '../UI/useVisibleRowsRange';

import useForceUpdate from '../Utils/UseForceUpdate';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard from '../Utils/Clipboard';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  undo,
  redo,
  canUndo,
  canRedo,
  getHistoryInitialState,
  saveToHistory,
} from '../Utils/History';
import {
  hasVariablesContainerSubChildren,
  insertInVariableChildren,
  insertInVariableChildrenArray,
  insertInVariablesContainer,
  isCollectionVariable,
} from '../Utils/VariablesUtils';
import {
  generateListOfNodesMatchingSearchInVariablesContainer,
  getDirectParentNodeId,
  getDirectParentVariable,
  getMovementTypeWithinVariablesContainer,
  getOldestAncestryVariable,
  getNodeIdFromVariableName,
  getNodeIdFromVariableContext,
  getVariableContextFromNodeId,
  getParentVariableContext,
  inheritedPrefix,
  isAnAncestryOf,
  separator,
  updateListOfNodesFollowingChangeName,
} from './VariableToTreeNodeHandling';
import {
  flattenVariablesContainers,
  type FlattenedVariable,
} from './FlattenVariables';

import VariableTypeSelector from './VariableTypeSelector';
import { CLIPBOARD_KIND } from './ClipboardKind';
import VariablesListToolbar from './VariablesListToolbar';
import { normalizeString } from '../Utils/Search';
import { I18n } from '@lingui/react';
import SwitchHorizontal from '../UI/CustomSvgIcons/SwitchHorizontal';
import useRefocusField from './useRefocusField';
import {
  SimpleTextField,
  type SimpleTextFieldInterface,
} from '../UI/SimpleTextField';
import { useRefWithInit } from '../Utils/UseRefInitHook';
import ErrorBoundary from '../UI/ErrorBoundary';
import Text from '../UI/Text';
import { MultilineVariableEditorDialog } from './MultilineVariableEditorDialog';
import { MarkdownText } from '../UI/MarkdownText';
import Paper from '../UI/Paper';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import { exceptionallyGuardAgainstDeadObject } from '../Utils/IsNullPtr';
import classes from './VariablesList.module.css';

const gd: libGDevelop = global.gd;

// $FlowFixMe[underconstrained-implicit-instantiation]
const DragSourceAndDropTarget = makeDragSourceAndDropTarget('variable-editor');

const stopEventPropagation = (event: SyntheticPointerEvent<HTMLInputElement>) =>
  event.stopPropagation();

// $FlowFixMe[missing-local-annot]
const memoized = memoizeOne((initialValue, callback) => callback());

/**
 * Every row has this exact height, which is what allows to render only the rows
 * that are visible on screen: the position of a row is `index * this height`.
 */
const VARIABLE_ROW_HEIGHT = 30;
const actionButtonStyle = { padding: 2 };

/**
 * Below this width, the rows are laid out more tightly: a smaller indentation,
 * and the type of a variable displayed as its icon only.
 */
const MIN_WIDTH_FOR_WIDE_ROWS = 450;
/** Below this width, the toolbar shows icons instead of labelled buttons. */
const MIN_WIDTH_FOR_TOOLBAR_LABELS = 650;

const getIndent = ({
  depth,
  hasNarrowRows,
  containerWidth,
}: {|
  depth: number,
  hasNarrowRows: boolean,
  containerWidth: ?number,
|}): number =>
  Math.min(
    depth * (hasNarrowRows ? 12 : 20),
    // Never let the indentation eat too much of the available width.
    containerWidth ? Math.round(0.3 * containerWidth) : 200
  );

export type HistoryHandler = {|
  saveToHistory: () => void,
  undo: () => void,
  redo: () => void,
  canUndo: () => boolean,
  canRedo: () => boolean,
|};

type PlaceholderProps =
  | {|
      compactEmptyPlaceholderText: React.Node,
    |}
  | {|
      emptyPlaceholderTitle: React.Node,
      emptyPlaceholderDescription: React.Node,
    |}
  | {||};

type Props = {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  variablesContainer: gdVariablesContainer,
  loopIndexVariableName?: string,
  onRenameLoopIndexVariable?: (newName: string) => void,
  onRemoveLoopIndexVariable?: () => void,
  areObjectVariables?: boolean,
  inheritedVariablesContainer?: gdVariablesContainer,
  initiallySelectedVariableName?: ?string,
  /** Callback executed at mount to compute suggestions. */
  onComputeAllVariableNames?: () => Array<string>,
  /** To specify if history should be handled by parent. */
  historyHandler?: HistoryHandler,
  ...PlaceholderProps,
  helpPagePath?: ?string,
  /** If set to true, it will commit changes to variables on each input change. It can be expensive, but useful when VariablesList can be unmounted at any time. */
  directlyStoreValueChangesWhileEditing?: boolean,
  /** If set to compact, will collapse variable row by default and show compact fields. */
  size?: 'compact',
  onVariablesUpdated?: () => void,
  toolbarIconStyle?: any,
  onSelectedVariableChange?: (Array<string>) => void,
  isListLocked: boolean,
|};

type VariableRowProps = {|
  // Context:
  depth: number,
  indent: number,
  /** Position of the row in the container holding all of them. */
  top: number,
  hideTypeName: boolean,
  shouldHideExpandIcons: boolean,
  isExpanded: boolean,
  onExpand: (shouldExpand: boolean, nodeId: string) => void,
  draggedNodeId: { current: ?string },
  nodeId: string,
  isInherited: boolean,
  isNameLocked: boolean,
  isTypeLocked: boolean,
  canDrop: string => boolean,
  dropNode: (string, where: 'after' | 'before') => void,
  isSelected: boolean,
  onSelect: (shouldMultiselect: boolean, nodeId: string) => void,
  variableNameInputRefs: {|
    current: { [number]: SimpleTextFieldInterface },
  |},
  topLevelVariableValueInputRefs: {|
    current: { [number]: SimpleTextFieldInterface },
  |},
  parentType: Variable_Type | null,
  directlyStoreValueChangesWhileEditing: boolean,

  // Styling
  gdevelopTheme: GDevelopTheme,
  rowRightSideStyle: any,

  // Variable information:
  onChangeName: (string, string, reason: 'blur' | 'change') => void,
  overwritesInheritedVariable: boolean,
  name: string,
  index: number,
  isTopLevel: boolean,
  type: Variable_Type,
  typeErrorMessage: MessageDescriptor | null,
  onChangeType: (string, nodeId: string) => void,
  isLoopIndexVariable: boolean,
  removeLoopIndexVariable: (nodeId: string) => void,
  hasMixedValues: boolean,
  valueAsString: string | null,
  valueAsBool: boolean | null,
  onChangeValue: (string, nodeId: string) => void,
  isCollection: boolean,
  variablePointer: number,
  onAddChild: string => void,
  editInheritedVariable: string => void,
  deleteNode: string => void,
  i18n: I18nType,
|};

const VariableRow = React.memo<VariableRowProps>(
  ({
    depth,
    indent,
    top,
    hideTypeName,
    shouldHideExpandIcons,
    isExpanded,
    onExpand,
    draggedNodeId,
    nodeId,
    isInherited,
    isNameLocked,
    isTypeLocked,
    canDrop,
    dropNode,
    isSelected,
    onSelect,
    gdevelopTheme,
    variableNameInputRefs,
    topLevelVariableValueInputRefs,
    parentType,
    onChangeName,
    overwritesInheritedVariable,
    name,
    index,
    rowRightSideStyle,
    isTopLevel,
    type,
    typeErrorMessage,
    isLoopIndexVariable,
    removeLoopIndexVariable,
    onChangeType,
    hasMixedValues,
    valueAsString,
    valueAsBool,
    onChangeValue,
    isCollection,
    variablePointer,
    onAddChild,
    editInheritedVariable,
    deleteNode,
    directlyStoreValueChangesWhileEditing,
    i18n,
  }: VariableRowProps) => {
    const containerRef = React.useRef<?HTMLDivElement>(null);
    const [whereToDrop, setWhereToDrop] = React.useState<'before' | 'after'>(
      'before'
    );
    const [editInMultilineEditor, setEditInMultilineEditor] = React.useState(
      false
    );
    const forceUpdate = useForceUpdate();
    const hasLineBreaks = valueAsString
      ? valueAsString.indexOf('\n') !== -1
      : false;
    const contextMenu = React.useRef<?ContextMenuInterface>(null);

    const getContainerYPosition = React.useCallback(() => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        return { y: containerRect.top, height: containerRect.height };
      }
    }, []);

    return (
      <div
        ref={containerRef}
        className={classes.rowContainer}
        style={{ top, height: VARIABLE_ROW_HEIGHT }}
      >
        <DragSourceAndDropTarget
          beginDrag={() => {
            draggedNodeId.current = nodeId;
            return {};
          }}
          canDrag={() => !isInherited && !isLoopIndexVariable}
          canDrop={() => canDrop(nodeId)}
          drop={() => {
            dropNode(nodeId, whereToDrop);
          }}
          hover={monitor => {
            const { y } = monitor.getClientOffset();
            // Use a cached version of container position to avoid recomputing bounding rectangle.
            // Doing this, the position is computed every second the user hovers the target.
            const containerYPosition = memoized(
              Math.floor(Date.now() / 1000),
              getContainerYPosition
            );
            if (containerYPosition) {
              setWhereToDrop(
                y - containerYPosition.y <= containerYPosition.height / 2
                  ? 'before'
                  : 'after'
              );
            }
          }}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
            connectDropTarget(
              <div
                className={classNames({
                  [classes.row]: true,
                  [classes.selected]: isSelected,
                })}
                style={{ marginLeft: indent }}
                aria-selected={isSelected}
                aria-expanded={isExpanded}
                onPointerUp={event => {
                  const shouldMultiSelect = event.metaKey || event.ctrlKey;
                  onSelect(shouldMultiSelect, nodeId);
                }}
                onContextMenu={event => {
                  if (!isLoopIndexVariable) return;
                  event.preventDefault();
                  event.stopPropagation();
                  if (contextMenu.current) {
                    contextMenu.current.open(event.clientX, event.clientY);
                  }
                }}
              >
                {shouldHideExpandIcons ? null : isCollection ? (
                  <ButtonBase
                    onClick={() => onExpand(!isExpanded, nodeId)}
                    focusRipple
                    className={classes.chevron}
                  >
                    {isExpanded ? (
                      <ChevronArrowBottom />
                    ) : (
                      <ChevronArrowRight />
                    )}
                  </ButtonBase>
                ) : (
                  <span className={classes.chevron} />
                )}
                {isInherited || isLoopIndexVariable ? (
                  <span className={classes.dragHandle} />
                ) : (
                  connectDragSource(
                    <span className={classes.dragHandle}>
                      <DragHandleIcon color="inherit" />
                    </span>
                  )
                )}
                <div className={classes.nameField}>
                  <SimpleTextField
                    type="text"
                    ref={element => {
                      // The pointers of deleted variables get reused, so an
                      // unmounted field must not be left behind.
                      if (element)
                        variableNameInputRefs.current[
                          variablePointer
                        ] = element;
                      else
                        delete variableNameInputRefs.current[variablePointer];
                    }}
                    directlyStoreValueChangesWhileEditing={
                      directlyStoreValueChangesWhileEditing
                    }
                    disabled={
                      isNameLocked ||
                      isInherited ||
                      parentType === gd.Variable.Array
                    }
                    onChange={onChangeName}
                    additionalContext={JSON.stringify({ nodeId, depth })}
                    italic={overwritesInheritedVariable}
                    value={name}
                    id={`variable-${index}-name`}
                  />
                </div>
                <div className={classes.rowRightSide} style={rowRightSideStyle}>
                  <div
                    className={classNames({
                      [classes.typeSelector]: true,
                      [classes.withTypeName]: !hideTypeName,
                    })}
                  >
                    <VariableTypeSelector
                      variableType={
                        isLoopIndexVariable ? gd.Variable.Number : type
                      }
                      onChange={onChangeType}
                      nodeId={nodeId}
                      hideTypeName={hideTypeName}
                      readOnlyWithIcon={
                        isInherited || overwritesInheritedVariable
                      }
                      id={`variable-${index}-type`}
                      errorMessage={typeErrorMessage}
                      disabled={isTypeLocked || isLoopIndexVariable}
                    />
                  </div>
                  {isLoopIndexVariable ? (
                    <span className={classes.valueLabel}>
                      <Trans>Counter of the loop</Trans>
                    </span>
                  ) : type === gd.Variable.Boolean ? (
                    <>
                      <span className={classes.valueLabel}>
                        {hasMixedValues ? (
                          <Trans>Mixed values</Trans>
                        ) : valueAsBool ? (
                          <Trans>True</Trans>
                        ) : (
                          <Trans>False</Trans>
                        )}
                      </span>
                      {isInherited && !isTopLevel ? null : (
                        // $FlowFixMe[incompatible-type]
                        <IconButton
                          size="small"
                          color="inherit"
                          className={classes.actionButton}
                          style={actionButtonStyle}
                          onClick={() => {
                            onChangeValue(
                              !valueAsBool ? 'true' : 'false',
                              nodeId
                            );
                            forceUpdate();
                          }}
                          tooltip={
                            !valueAsBool ? t`Set to true` : t`Set to false`
                          }
                        >
                          <SwitchHorizontal />
                        </IconButton>
                      )}
                    </>
                  ) : (
                    <div className={classes.valueField}>
                      <SimpleTextField
                        ref={element => {
                          if (depth !== 0) return;
                          if (element)
                            topLevelVariableValueInputRefs.current[
                              variablePointer
                            ] = element;
                          else
                            delete topLevelVariableValueInputRefs.current[
                              variablePointer
                            ];
                        }}
                        type={type === gd.Variable.Number ? 'number' : 'text'}
                        directlyStoreValueChangesWhileEditing={
                          directlyStoreValueChangesWhileEditing
                        }
                        key="value"
                        disabled={
                          type === gd.Variable.MixedTypes ||
                          isCollection ||
                          (isInherited && !isTopLevel) ||
                          hasLineBreaks
                        }
                        hint={hasMixedValues ? i18n._(t`Mixed values`) : ''}
                        onChange={onChangeValue}
                        value={
                          hasMixedValues
                            ? ''
                            : // If line breaks are present, disable the field (as it's
                            // single line only) and make line breaks visible.
                            hasLineBreaks
                            ? (valueAsString || '').replace(/\n/g, '↵')
                            : valueAsString || ''
                        }
                        additionalContext={nodeId}
                        id={`variable-${index}-text-value`}
                      />
                    </div>
                  )}
                  {// Only show the large edit button for string variables,
                  // and not for those who are in an inherited structure or array.
                  type === gd.Variable.String &&
                  !(isInherited && !isTopLevel) ? (
                    // $FlowFixMe[incompatible-type]
                    <IconButton
                      size="small"
                      color="inherit"
                      className={classes.actionButton}
                      style={actionButtonStyle}
                      tooltip={t`Open in a larger editor`}
                      onClick={event => {
                        stopEventPropagation(event);
                        setEditInMultilineEditor(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  ) : null}
                  {isCollection && !isInherited ? (
                    // $FlowFixMe[incompatible-type]
                    <IconButton
                      size="small"
                      color="inherit"
                      className={classes.actionButton}
                      style={actionButtonStyle}
                      tooltip={t`Add child`}
                      onClick={event => {
                        stopEventPropagation(event);
                        onAddChild(nodeId);
                      }}
                    >
                      <Add />
                    </IconButton>
                  ) : null}
                  {isCollection && isInherited && isTopLevel ? (
                    // $FlowFixMe[incompatible-type]
                    <IconButton
                      size="small"
                      color="inherit"
                      className={classes.actionButton}
                      style={actionButtonStyle}
                      tooltip={t`Edit`}
                      onClick={event => {
                        stopEventPropagation(event);
                        editInheritedVariable(nodeId);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  ) : null}
                  {overwritesInheritedVariable && isTopLevel ? (
                    // $FlowFixMe[incompatible-type]
                    <IconButton
                      size="small"
                      color="inherit"
                      className={classes.actionButton}
                      style={actionButtonStyle}
                      tooltip={t`Reset`}
                      onClick={event => {
                        stopEventPropagation(event);
                        deleteNode(nodeId);
                      }}
                    >
                      <Undo />
                    </IconButton>
                  ) : null}
                </div>
                {isOver && (
                  <div
                    className={classNames({
                      [classes.dropIndicator]: true,
                      [classes.dropIndicatorBefore]: whereToDrop === 'before',
                      [classes.dropIndicatorAfter]: whereToDrop === 'after',
                    })}
                    style={{
                      backgroundColor: canDrop
                        ? gdevelopTheme.dropIndicator.canDrop
                        : gdevelopTheme.dropIndicator.cannotDrop,
                    }}
                  />
                )}
                {editInMultilineEditor && (
                  <MultilineVariableEditorDialog
                    initialValue={valueAsString || ''}
                    onClose={(newValue: string) => {
                      onChangeValue(newValue, nodeId);
                      setEditInMultilineEditor(false);
                      forceUpdate();
                    }}
                  />
                )}
                {isLoopIndexVariable && (
                  <ContextMenu
                    ref={contextMenu}
                    buildMenuTemplate={i18n => [
                      {
                        label: i18n._(t`Remove this counter of the loop`),
                        click: () => removeLoopIndexVariable(nodeId),
                      },
                    ]}
                  />
                )}
              </div>
            )
          }
        </DragSourceAndDropTarget>
      </div>
    );
  }
);

export type VariablesListInterface = {|
  addVariable: () => void,
|};

const VariablesList: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<VariablesListInterface>,
}> = React.forwardRef<Props, VariablesListInterface>((props, ref) => {
  // The variables containers can be destroyed on the C++ side while this
  // component is still mounted (e.g. when the object owning them is deleted
  // or re-created by a change made outside the editor). Guard them once here:
  // the nullable typing forces every usage to handle the dead case - in which
  // case the component renders nothing (the parent editor is responsible for
  // re-rendering or unmounting it).
  const aliveVariablesContainer = exceptionallyGuardAgainstDeadObject(
    props.variablesContainer
  );
  const aliveInheritedVariablesContainer = props.inheritedVariablesContainer
    ? exceptionallyGuardAgainstDeadObject(props.inheritedVariablesContainer)
    : null;

  const historyRef = useRefWithInit(() =>
    aliveVariablesContainer
      ? getHistoryInitialState(aliveVariablesContainer, {
          historyMaxSize: 50,
        })
      : null
  );

  const {
    historyHandler,
    onVariablesUpdated,
    variablesContainer,
    onRemoveLoopIndexVariable,
    onRenameLoopIndexVariable,
    areObjectVariables,
    projectScopedContainersAccessor,
  } = props;

  const [searchMatchingNodes, setSearchMatchingNodes] = React.useState<
    Array<string>
  >([]);
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const variableNameInputRefs = React.useRef<{|
    // All the variable name inputs must be stored because the React key
    // for the row contains the variable name (this could be changed) so
    // if you change the name, you need the reference to the input
    // in order to refocus the field when the name is changed.
    [number]: SimpleTextFieldInterface,
  |}>({});
  const topLevelVariableValueInputRefs = React.useRef<{|
    // All the variable value inputs must be stored at the top level
    // in the case the user wants to modify the value at the instance level
    // of an object's variable: in that case, a new variable is created and
    // the new variable value field needs to be focused.
    [number]: SimpleTextFieldInterface,
  |}>({});
  // $FlowFixMe[incompatible-type] - Hard to fix issue regarding strict checking with interface.
  const refocusNameField = useRefocusField(variableNameInputRefs);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const draggedNodeId = React.useRef<?string>(null);
  const forceUpdate = useForceUpdate();
  const [
    currentIndexVariableName,
    setCurrentIndexVariableName,
  ] = React.useState(props.loopIndexVariableName || '');

  React.useEffect(
    () => {
      setCurrentIndexVariableName(props.loopIndexVariableName || '');
    },
    [props.loopIndexVariableName]
  );

  const [searchText, setSearchText] = React.useState<string>('');
  const { onComputeAllVariableNames, onSelectedVariableChange } = props;
  const allVariablesNames = React.useMemo<?Array<string>>(
    () => (onComputeAllVariableNames ? onComputeAllVariableNames() : null),
    [onComputeAllVariableNames]
  );
  const [selectedNodes, doSetSelectedNodes] = React.useState<Array<string>>(
    () => {
      if (!props.initiallySelectedVariableName || !aliveVariablesContainer) {
        return [];
      }
      let variableContext = getVariableContextFromNodeId(
        getNodeIdFromVariableName(props.initiallySelectedVariableName),
        aliveVariablesContainer
      );
      // When a child-variable is not declared, its direct parent is used.
      if (!variableContext.variable) {
        variableContext = getParentVariableContext(variableContext);
      }
      const initialSelectedNodeId = variableContext.variable
        ? getNodeIdFromVariableContext(variableContext)
        : null;
      return initialSelectedNodeId ? [initialSelectedNodeId] : [];
    }
  );
  // A variable that must be scrolled to - because it was just added, or is the
  // one the editor was opened on - and the field of it to focus once it's
  // displayed. Only the rows visible on screen are rendered, so the focus can
  // only be given after the list scrolled to the variable.
  const [variableToReveal, setVariableToReveal] = React.useState<?{|
    nodeId: string,
    fieldToFocus: 'name' | 'value' | null,
    caretPosition?: ?number,
  |}>(() =>
    selectedNodes[0] ? { nodeId: selectedNodes[0], fieldToFocus: 'name' } : null
  );
  const setSelectedNodes = React.useCallback(
    (nodes: Array<string> | ((nodes: Array<string>) => Array<string>)) => {
      doSetSelectedNodes(selectedNodes => {
        const newNodes = Array.isArray(nodes) ? nodes : nodes(selectedNodes);
        if (onSelectedVariableChange) {
          onSelectedVariableChange(newNodes);
        }
        return newNodes;
      });
    },
    [onSelectedVariableChange]
  );

  const triggerSearch = React.useCallback(
    () => {
      let matchingInheritedNodes: Array<string> = [];
      const matchingNodes = generateListOfNodesMatchingSearchInVariablesContainer(
        props.variablesContainer,
        normalizeString(searchText)
      );
      if (props.inheritedVariablesContainer) {
        matchingInheritedNodes = generateListOfNodesMatchingSearchInVariablesContainer(
          props.inheritedVariablesContainer,
          normalizeString(searchText),
          inheritedPrefix
        );
      }
      setSearchMatchingNodes([...matchingNodes, ...matchingInheritedNodes]);
    },
    [props.inheritedVariablesContainer, props.variablesContainer, searchText]
  );

  React.useEffect(
    () => {
      if (!!searchText) {
        triggerSearch();
      } else {
        setSearchMatchingNodes([]);
      }
    },
    [searchText, triggerSearch]
  );

  const shouldHideExpandIcons =
    !!aliveVariablesContainer &&
    !hasVariablesContainerSubChildren(aliveVariablesContainer) &&
    (aliveInheritedVariablesContainer
      ? !hasVariablesContainerSubChildren(aliveInheritedVariablesContainer)
      : true);

  const isToolbarNarrow =
    props.size === 'compact' ||
    (containerWidth ? containerWidth < MIN_WIDTH_FOR_TOOLBAR_LABELS : false);
  // The properties panel can be resized, so how the rows are laid out is based
  // on the width the list actually has, not on it being a compact one.
  const hasNarrowRows = containerWidth
    ? containerWidth < MIN_WIDTH_FOR_WIDE_ROWS
    : props.size === 'compact';
  const rowRightSideStyle = React.useMemo(
    () => ({
      // A fixed width keeps the types and the values aligned, whatever the
      // indentation of the row is.
      width: containerWidth
        ? Math.round((hasNarrowRows ? 0.5 : 0.6) * containerWidth)
        : 400,
      flexShrink: 0,
    }),
    [containerWidth, hasNarrowRows]
  );

  const undefinedVariableNames =
    allVariablesNames && aliveVariablesContainer
      ? allVariablesNames.filter(variableName => {
          return (
            !aliveVariablesContainer.has(variableName) &&
            (!aliveInheritedVariablesContainer ||
              !aliveInheritedVariablesContainer.has(variableName))
          );
        })
      : [];

  const _onChange = React.useCallback(
    () => {
      if (historyHandler) historyHandler.saveToHistory();
      else if (historyRef.current)
        historyRef.current = saveToHistory(
          historyRef.current,
          variablesContainer
        );
      if (onVariablesUpdated) onVariablesUpdated();
    },
    [historyRef, historyHandler, onVariablesUpdated, variablesContainer]
  );

  const _undo = React.useCallback(
    () => {
      if (historyHandler) historyHandler.undo();
      else if (historyRef.current)
        historyRef.current = undo(historyRef.current, props.variablesContainer);
      setSelectedNodes([]);
    },
    [historyHandler, historyRef, props.variablesContainer, setSelectedNodes]
  );

  const _redo = React.useCallback(
    () => {
      if (historyHandler) historyHandler.redo();
      else if (historyRef.current)
        historyRef.current = redo(historyRef.current, props.variablesContainer);
      setSelectedNodes([]);
    },
    [historyHandler, historyRef, props.variablesContainer, setSelectedNodes]
  );

  const _canUndo = (): boolean =>
    props.historyHandler
      ? props.historyHandler.canUndo()
      : !!historyRef.current && canUndo(historyRef.current);

  const _canRedo = (): boolean =>
    props.historyHandler
      ? props.historyHandler.canRedo()
      : !!historyRef.current && canRedo(historyRef.current);

  const copySelection = React.useCallback(
    () => {
      Clipboard.set(
        CLIPBOARD_KIND,
        selectedNodes
          .map(nodeId => {
            const { variable, name, lineage } = getVariableContextFromNodeId(
              nodeId,
              nodeId.startsWith(inheritedPrefix) &&
                props.inheritedVariablesContainer
                ? props.inheritedVariablesContainer
                : props.variablesContainer
            );
            if (!variable || !name) return null;

            let hasName = false;
            const parentVariable = getDirectParentVariable(lineage);
            if (
              !parentVariable ||
              parentVariable.getType() === gd.Variable.Structure
            ) {
              hasName = true;
            }
            return {
              nameOrIndex: name,
              serializedVariable: serializeToJSObject(variable),
              hasName,
            };
          })
          .filter(Boolean)
      );
      forceUpdate();
    },
    [
      forceUpdate,
      props.inheritedVariablesContainer,
      props.variablesContainer,
      selectedNodes,
    ]
  );

  const pasteClipboardContent = React.useCallback(
    () => {
      if (!Clipboard.has(CLIPBOARD_KIND)) return;
      const variablesContainer = exceptionallyGuardAgainstDeadObject(
        props.variablesContainer
      );
      if (!variablesContainer) {
        return;
      }
      const newSelectedNodes = [];

      const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
      const variablesContent = SafeExtractor.extractArray(clipboardContent);
      if (!variablesContent) return;

      let pastedElementOffsetIndex = 0;

      variablesContent.forEach(variableContent => {
        const nameOrIndex = SafeExtractor.extractStringProperty(
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
        if (!nameOrIndex || !serializedVariable || hasName === null) return;

        const pasteAtTopLevel =
          selectedNodes.length === 0 ||
          selectedNodes.some(nodeId => nodeId.startsWith(inheritedPrefix));

        const name = hasName ? nameOrIndex : null;

        if (pasteAtTopLevel) {
          if (props.isListLocked) return;
          if (!name) return;
          const { name: newName } = insertInVariablesContainer(
            variablesContainer,
            gd.Project.getSafeName(name),
            serializedVariable,
            variablesContainer.count(),
            props.inheritedVariablesContainer
          );
          newSelectedNodes.push(newName);
        } else {
          const targetNode = selectedNodes[0];
          if (targetNode.startsWith(inheritedPrefix)) return;

          const {
            name: targetVariableName,
            lineage: targetVariableLineage,
          } = getVariableContextFromNodeId(targetNode, variablesContainer);
          if (!targetVariableName) return;

          const targetParentVariable = getDirectParentVariable(
            targetVariableLineage
          );
          if (!targetParentVariable) {
            if (props.isListLocked) return;
            if (!name) return;
            const { name: newName } = insertInVariablesContainer(
              variablesContainer,
              name,
              serializedVariable,
              variablesContainer.getPosition(targetVariableName) + 1,
              props.inheritedVariablesContainer
            );
            newSelectedNodes.push(newName);
          } else {
            const targetParentType = targetParentVariable.getType();

            if (
              (targetParentType === gd.Variable.Structure && !name) ||
              (targetParentType === gd.Variable.Array && !!name)
            ) {
              // Early return if trying to paste array element in structure or vice versa
              return;
            }
            if (targetParentType === gd.Variable.Array) {
              const index = parseInt(targetVariableName, 10) + 1;
              insertInVariableChildrenArray(
                targetParentVariable,
                serializedVariable,
                index
              );
              const bits = targetNode.split(separator);
              bits.splice(
                bits.length - 1,
                1,
                (index + pastedElementOffsetIndex).toString()
              );

              newSelectedNodes.push(bits.join(separator));
              pastedElementOffsetIndex += 1;
            } else {
              if (!name) return;
              const newName = insertInVariableChildren(
                targetParentVariable,
                name,
                serializedVariable
              );
              const bits = targetNode.split(separator);
              bits.splice(bits.length - 1, 1, newName);
              newSelectedNodes.push(bits.join(separator));
            }
          }
        }
      });
      _onChange();
      setSelectedNodes(newSelectedNodes);
    },
    [
      _onChange,
      props.inheritedVariablesContainer,
      props.isListLocked,
      props.variablesContainer,
      selectedNodes,
      setSelectedNodes,
    ]
  );

  const _deleteNode = React.useCallback(
    (nodeId: string): boolean => {
      if (nodeId.startsWith(inheritedPrefix)) return false;
      const { name, lineage } = getVariableContextFromNodeId(
        nodeId,
        variablesContainer
      );
      if (!name) return false;
      const parentVariable = getDirectParentVariable(lineage);
      if (!parentVariable) {
        variablesContainer.remove(name);
        if (name === currentIndexVariableName) {
          if (onRemoveLoopIndexVariable) {
            onRemoveLoopIndexVariable();
          }
          setCurrentIndexVariableName('');
        }
      } else {
        if (parentVariable.getType() === gd.Variable.Array) {
          parentVariable.removeAtIndex(parseInt(name, 10));
        } else {
          parentVariable.removeChild(name);
        }
      }
      return true;
    },
    [currentIndexVariableName, onRemoveLoopIndexVariable, variablesContainer]
  );

  const deleteNode = React.useCallback(
    (nodeId: string): void => {
      const success = _deleteNode(nodeId);
      if (success) {
        _onChange();
        forceUpdate();
      }
    },
    [_onChange, forceUpdate, _deleteNode]
  );

  const removeLoopIndexVariable = React.useCallback(
    (nodeId: string): void => {
      if (!currentIndexVariableName) return;
      const { name, depth } = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      if (depth !== 0 || !name || name !== currentIndexVariableName) return;

      const success = _deleteNode(nodeId);
      if (!success) return;

      _onChange();
      setSelectedNodes([]);
      forceUpdate();
    },
    [
      currentIndexVariableName,
      forceUpdate,
      _deleteNode,
      _onChange,
      props.variablesContainer,
      setSelectedNodes,
    ]
  );

  const deleteSelection = React.useCallback(
    () => {
      const nodesToDelete = selectedNodes
        .filter(
          // An inherited variable can never be deleted:
          nodeId => !nodeId.startsWith(inheritedPrefix)
        )
        .filter(nodeId => {
          // If the list is locked, only allow deleting children of overriden variables:
          if (props.isListLocked) {
            return nodeId.includes(separator);
          }
          return true;
        });
      if (nodesToDelete.length === 0) return;

      // Take advantage of the node ids notation to sort them in
      // descending lexicographical order, so we delete from "last"
      // to "first". In the case of arrays, this avoids to change
      // the index of the variables while deleting them, which would
      // result in the wrong variables to be deleted if multiple of them
      // are removed.
      const deleteSuccesses = nodesToDelete
        .sort()
        .reverse()
        .map(_deleteNode);
      if (deleteSuccesses.some(Boolean)) {
        _onChange();
        setSelectedNodes([]);
      }
    },
    [
      selectedNodes,
      _deleteNode,
      _onChange,
      setSelectedNodes,
      props.isListLocked,
    ]
  );

  const canCopySelection = selectedNodes.length > 0;
  const canPasteSelection =
    Clipboard.has(CLIPBOARD_KIND) &&
    (!props.isListLocked ||
      // If the list is locked, only allow pasting in the children of overriden variables:
      (selectedNodes.length > 0 &&
        selectedNodes.every(nodeId => !nodeId.startsWith(inheritedPrefix)) &&
        selectedNodes.every(nodeId => {
          return nodeId.includes(separator);
        })));
  const canDeleteSelection =
    selectedNodes.length > 0 &&
    // An inherited variable can never be deleted:
    selectedNodes.every(nodeId => !nodeId.startsWith(inheritedPrefix)) &&
    // If the list is locked, only allow deleting children of overriden variables:
    selectedNodes.every(nodeId => {
      if (props.isListLocked) {
        return nodeId.includes(separator);
      }
      return true;
    });

  const cutSelection = React.useCallback(
    () => {
      if (!canDeleteSelection) return;

      copySelection();
      deleteSelection();
    },
    [canDeleteSelection, copySelection, deleteSelection]
  );

  const keyboardShortcuts = new KeyboardShortcuts({
    isActive: () => true,
    shortcutCallbacks: {
      onUndo: _undo,
      onRedo: _redo,
      onDelete: () => {
        if (canDeleteSelection) deleteSelection();
      },
      onCopy: () => {
        if (canCopySelection) copySelection();
      },
      onCut: cutSelection,
      onPaste: () => {
        if (canPasteSelection) pasteClipboardContent();
      },
    },
  });

  const updateExpandedAndSelectedNodesFollowingNameChange = React.useCallback(
    (oldNodeId: string, newName: string) => {
      setSelectedNodes(selectedNodes =>
        updateListOfNodesFollowingChangeName(selectedNodes, oldNodeId, newName)
      );
      if (!!searchText) {
        setSearchMatchingNodes(searchMatchingNodes =>
          updateListOfNodesFollowingChangeName(
            searchMatchingNodes,
            oldNodeId,
            newName
          )
        );
      }
    },
    [searchText, setSelectedNodes]
  );

  const updateExpandedAndSelectedNodesFollowingNodeMove = React.useCallback(
    (oldNodeId: string, newParentNodeId: string, newName: string) => {
      // TODO: Recompute list of selected nodes following a node move that changes all the values of an array.
      setSelectedNodes([]);
      if (!!searchText) {
        triggerSearch();
        forceUpdate();
      }
    },
    [forceUpdate, searchText, setSelectedNodes, triggerSearch]
  );

  const canDrop = React.useCallback(
    (nodeId: string): boolean => {
      if (nodeId.startsWith(inheritedPrefix)) return false;
      const { current } = draggedNodeId;
      if (!current) return false;

      const targetVariableContext = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      const { lineage: targetLineage } = targetVariableContext;

      const draggedVariableContext = getVariableContextFromNodeId(
        current,
        props.variablesContainer
      );
      const {
        variable: draggedVariable,
        lineage: draggedLineage,
      } = draggedVariableContext;
      if (!draggedVariable) return false;

      if (isAnAncestryOf(draggedVariable, targetLineage)) return false;

      const targetVariableParentVariable = getDirectParentVariable(
        targetLineage
      );
      const draggedVariableParentVariable = getDirectParentVariable(
        draggedLineage
      );
      if (
        props.isListLocked &&
        (!targetVariableParentVariable || !draggedVariableParentVariable)
      ) {
        return false;
      }

      const movementType = getMovementTypeWithinVariablesContainer(
        draggedVariableContext,
        targetVariableContext
      );

      switch (movementType) {
        case 'InsideTopLevel':
        case 'TopLevelToStructure':
        case 'StructureToTopLevel':
        case 'FromStructureToAnotherStructure':
        case 'FromArrayToAnotherArray':
        case 'InsideSameArray':
          return true;
        case 'FromStructureToArray':
        case 'FromArrayToStructure':
        case 'ArrayToTopLevel':
        case 'InsideSameStructure':
        case 'TopLevelToArray':
        default:
          return false;
      }
    },
    [props.isListLocked, props.variablesContainer]
  );

  const dropNode = React.useCallback(
    (nodeId: string, where: 'after' | 'before'): void => {
      if (nodeId.startsWith(inheritedPrefix)) return;
      const { current } = draggedNodeId;
      if (!current) return;

      // TODO: Add logic to copy dragged variable instead of moving it if Alt/Opt key is pressed
      // React-dnd keeps the focus when user is dragging so keyboard shortcut instance
      // cannot detect if the key is pressed while dragging. React-dnd has issues to
      // return event data about pressed keys when mouse is up.

      const targetVariableContext = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      const {
        lineage: targetLineage,
        name: targetName,
      } = targetVariableContext;
      const targetVariableParentVariable = getDirectParentVariable(
        targetLineage
      );
      if (!targetName) return;

      const draggedVariableContext = getVariableContextFromNodeId(
        current,
        props.variablesContainer
      );
      const {
        variable: draggedVariable,
        lineage: draggedLineage,
        name: draggedName,
      } = draggedVariableContext;
      const draggedVariableParentVariable = getDirectParentVariable(
        draggedLineage
      );
      if (!draggedVariable || !draggedName) return;

      if (isAnAncestryOf(draggedVariable, targetLineage)) return;

      const movementType = getMovementTypeWithinVariablesContainer(
        draggedVariableContext,
        targetVariableContext
      );
      let newName;
      let draggedIndex;
      let targetIndex;
      let correctedTargetIndex;
      let movementHasBeenMade = true;
      let parentNodeId;
      let targetParentNodeId;

      switch (movementType) {
        case 'InsideTopLevel':
          draggedIndex = props.variablesContainer.getPosition(draggedName);
          targetIndex = props.variablesContainer.getPosition(targetName);
          correctedTargetIndex =
            (targetIndex > draggedIndex ? targetIndex - 1 : targetIndex) +
            (where === 'after' ? 1 : 0);
          props.variablesContainer.move(draggedIndex, correctedTargetIndex);
          break;
        case 'TopLevelToStructure':
          newName = newNameGenerator(
            draggedName,
            // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
            // $FlowFixMe[incompatible-use]
            name => targetVariableParentVariable.hasChild(name),
            'CopyOf'
          );

          // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
          // $FlowFixMe[incompatible-use]
          targetVariableParentVariable.insertChild(newName, draggedVariable);

          props.variablesContainer.remove(draggedName);
          parentNodeId = getDirectParentNodeId(targetLineage);
          if (parentNodeId)
            updateExpandedAndSelectedNodesFollowingNodeMove(
              current,
              parentNodeId,
              newName
            );
          break;
        case 'StructureToTopLevel':
          newName = newNameGenerator(
            gd.Project.getSafeName(draggedName),
            name => props.variablesContainer.has(name),
            'CopyOf'
          );
          props.variablesContainer.insert(
            newName,
            draggedVariable,
            props.variablesContainer.getPosition(targetName)
          );

          // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
          // $FlowFixMe[incompatible-use]
          draggedVariableParentVariable.removeChild(draggedName);
          updateExpandedAndSelectedNodesFollowingNodeMove(current, '', newName);
          break;
        case 'FromStructureToAnotherStructure':
          newName = newNameGenerator(
            draggedName,
            // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
            // $FlowFixMe[incompatible-use]
            name => targetVariableParentVariable.hasChild(name),
            'CopyOf'
          );
          // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
          // $FlowFixMe[incompatible-use]
          targetVariableParentVariable.insertChild(newName, draggedVariable);

          // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
          // $FlowFixMe[incompatible-use]
          draggedVariableParentVariable.removeChild(draggedName);
          parentNodeId = getDirectParentNodeId(targetLineage);
          if (parentNodeId)
            updateExpandedAndSelectedNodesFollowingNodeMove(
              current,
              parentNodeId,
              newName
            );
          break;
        case 'FromArrayToAnotherArray':
          draggedIndex = parseInt(draggedName, 10);
          targetIndex = parseInt(targetName, 10);
          correctedTargetIndex = targetIndex + (where === 'after' ? 1 : 0);
          // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
          // $FlowFixMe[incompatible-use]
          targetVariableParentVariable.insertAtIndex(
            draggedVariable,
            correctedTargetIndex
          );

          // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
          // $FlowFixMe[incompatible-use]
          draggedVariableParentVariable.removeAtIndex(draggedIndex);
          targetParentNodeId = getDirectParentNodeId(targetLineage);
          if (targetParentNodeId)
            updateExpandedAndSelectedNodesFollowingNodeMove(
              current,
              targetParentNodeId,
              correctedTargetIndex.toString()
            );
          break;
        case 'InsideSameArray':
          draggedIndex = parseInt(draggedName, 10);
          targetIndex = parseInt(targetName, 10);
          correctedTargetIndex =
            (targetIndex > draggedIndex ? targetIndex - 1 : targetIndex) +
            (where === 'after' ? 1 : 0);
          // $FlowFixMe[incompatible-type] - Regarding movement type, we are confident that the variable will exist
          // $FlowFixMe[incompatible-use]
          targetVariableParentVariable.moveChildInArray(
            draggedIndex,
            correctedTargetIndex
          );
          parentNodeId = getDirectParentNodeId(targetLineage);
          if (parentNodeId) {
            updateExpandedAndSelectedNodesFollowingNodeMove(
              current,
              parentNodeId,
              correctedTargetIndex.toString()
            );
          }
          break;
        case 'FromStructureToArray':
        case 'FromArrayToStructure':
        case 'ArrayToTopLevel':
        case 'InsideSameStructure':
        default:
          movementHasBeenMade = false;
      }
      if (movementHasBeenMade) {
        _onChange();
        forceUpdate();
      }
    },
    [
      _onChange,
      forceUpdate,
      props.variablesContainer,
      updateExpandedAndSelectedNodesFollowingNodeMove,
    ]
  );

  const onAddChild = React.useCallback(
    (nodeId: string) => {
      if (nodeId.startsWith(inheritedPrefix)) return;
      const { variable } = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      if (!variable || !isCollectionVariable(variable)) return;
      const type = variable.getType();

      if (type === gd.Variable.Structure) {
        const name = newNameGenerator('ChildVariable', name =>
          variable.hasChild(name)
        );
        variable.getChild(name);
      } else if (type === gd.Variable.Array) {
        variable.pushNew();
      }
      if (variable.isFolded()) variable.setFolded(false);
      _onChange();
      forceUpdate();
    },
    [_onChange, forceUpdate, props.variablesContainer]
  );

  const editInheritedVariable = React.useCallback(
    (nodeId: string): void => {
      if (!props.inheritedVariablesContainer) return;
      const {
        variable: inheritedVariable,
        name: inheritedVariableName,
      } = getVariableContextFromNodeId(
        nodeId,
        props.inheritedVariablesContainer
      );
      if (!inheritedVariable || !inheritedVariableName) return;
      if (props.variablesContainer.has(inheritedVariableName)) return;
      const newVariable = new gd.Variable();
      unserializeFromJSObject(
        newVariable,
        serializeToJSObject(inheritedVariable)
      );
      props.variablesContainer.insert(
        inheritedVariableName,
        newVariable,
        props.variablesContainer.count()
      );
      _onChange();
      setSelectedNodes([inheritedVariableName]);
      setVariableToReveal({
        nodeId: inheritedVariableName,
        fieldToFocus: null,
      });
      newVariable.delete();
    },
    [
      _onChange,
      props.inheritedVariablesContainer,
      props.variablesContainer,
      setSelectedNodes,
    ]
  );

  const addVariable = React.useCallback(
    () => {
      const variablesContainer = exceptionallyGuardAgainstDeadObject(
        props.variablesContainer
      );
      if (!variablesContainer) {
        return;
      }
      const addAtTopLevel =
        selectedNodes.length === 0 ||
        selectedNodes.some(node => node.startsWith(inheritedPrefix));

      if (addAtTopLevel) {
        const { name: newName } = insertInVariablesContainer(
          variablesContainer,
          'Variable',
          null,
          variablesContainer.count(),
          props.inheritedVariablesContainer
        );
        _onChange();
        setSelectedNodes([newName]);
        setVariableToReveal({ nodeId: newName, fieldToFocus: 'name' });
        return;
      }

      const targetNode = selectedNodes[0];
      const {
        name: targetVariableName,
        lineage: targetLineage,
      } = getVariableContextFromNodeId(targetNode, props.variablesContainer);
      if (!targetVariableName) return;
      const oldestAncestry = getOldestAncestryVariable(targetLineage);
      let position;
      if (!oldestAncestry) {
        position = variablesContainer.getPosition(targetVariableName) + 1;
      } else {
        position = variablesContainer.getPosition(oldestAncestry.name) + 1;
      }
      const { name: newName } = insertInVariablesContainer(
        props.variablesContainer,
        'Variable',
        null,
        position,
        props.inheritedVariablesContainer
      );
      _onChange();
      setSelectedNodes([newName]);
      setVariableToReveal({ nodeId: newName, fieldToFocus: 'name' });
    },
    [
      _onChange,
      props.inheritedVariablesContainer,
      props.variablesContainer,
      selectedNodes,
      setSelectedNodes,
    ]
  );

  const onSelect = React.useCallback(
    (shouldMultiSelect: boolean, nodeId: string) => {
      setSelectedNodes(selectedNodes => {
        const isAlreadySelected = selectedNodes.indexOf(nodeId) !== -1;

        if (shouldMultiSelect) {
          if (isAlreadySelected) {
            return selectedNodes.filter(
              selectedNodeId => selectedNodeId !== nodeId
            );
          } else {
            return [...selectedNodes, nodeId];
          }
        } else {
          if (isAlreadySelected) {
            return selectedNodes;
          } else {
            return [nodeId];
          }
        }
      });
    },
    [setSelectedNodes]
  );

  const onChangeName = React.useCallback(
    (newName: string, additionalContext: any, reason: 'blur' | 'change') => {
      if (!newName && reason === 'change') {
        // Allows user to erase the whole field without the below logic
        // filling the field with "Unnamed".
        return;
      }
      const parsedContext = JSON.parse(additionalContext);
      const nodeId: string = parsedContext.nodeId;
      const depth: number = parsedContext.depth;

      const { variable, lineage, name } = getVariableContextFromNodeId(
        nodeId,
        variablesContainer
      );
      if (name === null || !variable || newName === name) return;

      const currentlyFocusedNameField =
        variableNameInputRefs.current[variable.ptr];
      const caretPosition = currentlyFocusedNameField
        ? currentlyFocusedNameField.getCaretPosition()
        : null;

      const parentVariable = getDirectParentVariable(lineage);

      // In theory this cleaning is not necessary (a "safe name" is mandatory for root variables,
      // but others should be able to have any name). In practice,
      // this editor uses specific separator that we forbid in names.
      let cleanedName = newName.replace(inheritedPrefix, '');

      while (cleanedName.includes(separator)) {
        cleanedName = cleanedName.replace(separator, '');
      }

      const safeAndUniqueNewName = newNameGenerator(
        depth === 0
          ? // Root variables always use identifier safe names.
            gd.Project.getSafeName(cleanedName)
          : // Child variables of structures must "just" be not empty.
            cleanedName || 'Unnamed',
        tentativeNewName =>
          (parentVariable && parentVariable.hasChild(tentativeNewName)) ||
          (!parentVariable &&
            (variablesContainer.has(tentativeNewName) ||
              (!areObjectVariables &&
                projectScopedContainersAccessor
                  .get()
                  .getObjectsContainersList()
                  .hasObjectOrGroupNamed(tentativeNewName))))
      );

      if (!parentVariable) {
        variablesContainer.rename(name, safeAndUniqueNewName);
      } else {
        parentVariable.renameChild(name, safeAndUniqueNewName);
      }

      if (!parentVariable && name === currentIndexVariableName) {
        setCurrentIndexVariableName(safeAndUniqueNewName);
        if (onRenameLoopIndexVariable) {
          onRenameLoopIndexVariable(safeAndUniqueNewName);
        }
      }

      _onChange();
      updateExpandedAndSelectedNodesFollowingNameChange(
        nodeId,
        safeAndUniqueNewName
      );
      refocusNameField({ identifier: variable.ptr, caretPosition });
    },
    [
      variablesContainer,
      areObjectVariables,
      projectScopedContainersAccessor,
      currentIndexVariableName,
      _onChange,
      onRenameLoopIndexVariable,
      updateExpandedAndSelectedNodesFollowingNameChange,
      refocusNameField,
    ]
  );

  const onChangeType = React.useCallback(
    (newType: string, nodeId: string) => {
      const { variable } = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      if (!variable) return;
      const oldType = variable.getType();
      variable.castTo(newType);
      // When changing type to String, reset to an empty string.
      if (newType === 'string' && oldType === gd.Variable.Number) {
        variable.setString('');
      }
      // When changing type to Number, reset to 0.
      if (newType === 'number' && oldType === gd.Variable.String) {
        variable.setValue(0);
      }
      _onChange();
      forceUpdate();
    },
    [_onChange, forceUpdate, props.variablesContainer]
  );

  const onExpand = React.useCallback(
    (expand: boolean, nodeId: string) => {
      const isInherited = nodeId.startsWith(inheritedPrefix);
      const { variable } = getVariableContextFromNodeId(
        nodeId,
        isInherited && props.inheritedVariablesContainer
          ? props.inheritedVariablesContainer
          : variablesContainer
      );
      if (variable) {
        variable.setFolded(!expand);
        forceUpdate();
      }
    },
    [props.inheritedVariablesContainer, variablesContainer, forceUpdate]
  );

  const onChangeValue = React.useCallback(
    (newValue: string, nodeId: string) => {
      const isInherited = nodeId.startsWith(inheritedPrefix);
      let variable;
      if (isInherited && props.inheritedVariablesContainer) {
        // If user changes inherited variable, check if value is truly modified before
        // duplicating the variable into the variables container
        const {
          variable: changedInheritedVariable,
          name,
          depth,
        } = getVariableContextFromNodeId(
          nodeId,
          props.inheritedVariablesContainer
        );
        if (!name || !changedInheritedVariable || depth > 0) return;
        switch (changedInheritedVariable.getType()) {
          case gd.Variable.String:
            if (changedInheritedVariable.getString() === newValue) return;
            break;
          case gd.Variable.Number:
            const newValueAsFloat = parseFloat(newValue);
            if (newValueAsFloat === changedInheritedVariable.getValue()) return;
            break;
          case gd.Variable.Boolean:
            const newBool = newValue === 'true';
            if (newBool === changedInheritedVariable.getBool()) return;
            break;
          default:
        }
        const newVariable = new gd.Variable();
        unserializeFromJSObject(
          newVariable,
          serializeToJSObject(changedInheritedVariable)
        );
        const variablesContainer = exceptionallyGuardAgainstDeadObject(
          props.variablesContainer
        );
        if (!variablesContainer) {
          return;
        }
        variable = variablesContainer.insert(name, newVariable, 0);

        setSelectedNodes(selectedNodes => {
          const newSelectedNodes = [...selectedNodes];
          const isVariableSelected = newSelectedNodes.indexOf(nodeId) !== -1;
          if (isVariableSelected) {
            newSelectedNodes.splice(newSelectedNodes.indexOf(nodeId), 1, name);
            return newSelectedNodes;
          } else {
            return [...newSelectedNodes, name];
          }
        });
        const currentlyFocusedValueField =
          topLevelVariableValueInputRefs.current[changedInheritedVariable.ptr];
        setVariableToReveal({
          nodeId: name,
          fieldToFocus: 'value',
          caretPosition: currentlyFocusedValueField
            ? currentlyFocusedValueField.getCaretPosition()
            : null,
        });
        newVariable.delete();
      } else {
        const { variable: changedVariable } = getVariableContextFromNodeId(
          nodeId,
          props.variablesContainer
        );
        variable = changedVariable;
      }
      if (!variable) return;
      if (variable.hasMixedValues() && newValue.length === 0) {
        // Keep mixed values if nothing was typed.
        return;
      }
      switch (variable.getType()) {
        case gd.Variable.String:
          if (variable.getString() === newValue) return;
          variable.setString(newValue);
          break;
        case gd.Variable.Number:
          const newValueAsFloat = parseFloat(newValue);
          if (newValueAsFloat === variable.getValue()) return;
          variable.setValue(newValueAsFloat);
          break;
        case gd.Variable.Boolean:
          const newBool = newValue === 'true';
          if (newBool === variable.getBool()) return;
          variable.setBool(newBool);
          break;
        default:
          console.error(
            `Cannot set variable with type ${variable.getType()} - are you sure it's a primitive type?`
          );
      }
      _onChange();
      forceUpdate();
    },
    [
      _onChange,
      forceUpdate,
      props.inheritedVariablesContainer,
      props.variablesContainer,
      setSelectedNodes,
    ]
  );

  React.useImperativeHandle(ref, () => ({
    addVariable,
  }));

  // The whole tree of variables is flattened into the list of rows to display,
  // so that only the rows visible on screen have to be rendered. This is done
  // at every render because the variables are mutated in place (in the C++
  // objects), so the result can't be memoized.
  const flattenedVariables = aliveVariablesContainer
    ? flattenVariablesContainers({
        variablesContainer: aliveVariablesContainer,
        inheritedVariablesContainer: aliveInheritedVariablesContainer,
        searchMatchingNodeIds: searchText ? searchMatchingNodes : null,
      })
    : [];

  const rowsContainerRef = React.useRef<?HTMLDivElement>(null);
  const { visibleRowsRange, scrollRowIntoView } = useVisibleRowsRange({
    containerRef: rowsContainerRef,
    rowCount: flattenedVariables.length,
    rowHeight: VARIABLE_ROW_HEIGHT,
  });
  const { firstRowIndex, afterLastRowIndex } = visibleRowsRange;

  const rowIndexToReveal = variableToReveal
    ? flattenedVariables.findIndex(
        ({ nodeId }) => nodeId === variableToReveal.nodeId
      )
    : -1;
  const variablePointerToReveal =
    rowIndexToReveal >= 0
      ? flattenedVariables[rowIndexToReveal].variable.ptr
      : 0;

  // Scroll to the variable to reveal, then - once its row is rendered, which
  // only happens after the scroll - focus the field of it to focus.
  React.useLayoutEffect(
    () => {
      if (!variableToReveal) return;
      if (rowIndexToReveal < 0) {
        // The variable is gone (renamed, deleted, filtered out by a search...).
        setVariableToReveal(null);
        return;
      }

      scrollRowIntoView(rowIndexToReveal);
      if (
        rowIndexToReveal < firstRowIndex ||
        rowIndexToReveal >= afterLastRowIndex
      ) {
        // Not rendered yet: wait for the scroll to be taken into account.
        return;
      }

      const { fieldToFocus, caretPosition } = variableToReveal;
      if (fieldToFocus) {
        const fieldRefs =
          fieldToFocus === 'name'
            ? variableNameInputRefs
            : topLevelVariableValueInputRefs;
        const field = fieldRefs.current[variablePointerToReveal];
        if (field) {
          field.focus(
            caretPosition === null || caretPosition === undefined
              ? null
              : { caretPosition }
          );
        }
      }
      setVariableToReveal(null);
    },
    [
      variableToReveal,
      rowIndexToReveal,
      variablePointerToReveal,
      scrollRowIntoView,
      firstRowIndex,
      afterLastRowIndex,
    ]
  );

  const selectedNodesSet = React.useMemo(() => new Set(selectedNodes), [
    selectedNodes,
  ]);

  const renderRow = (
    flattenedVariable: FlattenedVariable,
    rowIndex: number,
    i18n: I18nType
  ): React.Node => {
    const {
      nodeId,
      name,
      index,
      depth,
      variable,
      parentVariable,
      isInherited,
      type,
      isCollection,
      isExpanded,
    } = flattenedVariable;
    const isTopLevel = depth === 0;
    const parentType = parentVariable ? parentVariable.getType() : null;
    const isLoopIndexVariable =
      !isInherited &&
      isTopLevel &&
      !!currentIndexVariableName &&
      name === currentIndexVariableName;
    const overwritesInheritedVariable =
      isTopLevel &&
      !isInherited &&
      !!aliveInheritedVariablesContainer &&
      aliveInheritedVariablesContainer.has(name);

    const typeErrorMessage =
      parentType === gd.Variable.Array &&
      parentVariable &&
      parentVariable.getChildrenCount() > 1 &&
      parentVariable.getAtIndex(0).getType() !== type
        ? i18n._(t`Every child of an array must be the same type.`)
        : null;

    const hasMixedValues = variable.hasMixedValues();
    const valueAsString = isCollection
      ? i18n._(
          variable.getChildrenCount() === 0
            ? t`No children`
            : variable.getChildrenCount() === 1
            ? t`1 child`
            : t`${variable.getChildrenCount()} children`
        )
      : type === gd.Variable.String
      ? variable.getString()
      : type === gd.Variable.Number
      ? variable.getValue().toString()
      : null;
    const valueAsBool =
      type === gd.Variable.Boolean ? variable.getBool() : null;

    return (
      <VariableRow
        key={nodeId}
        depth={depth}
        indent={getIndent({ depth, hasNarrowRows, containerWidth })}
        top={rowIndex * VARIABLE_ROW_HEIGHT}
        hideTypeName={hasNarrowRows}
        shouldHideExpandIcons={shouldHideExpandIcons}
        isExpanded={isExpanded}
        onExpand={onExpand}
        draggedNodeId={draggedNodeId}
        nodeId={nodeId}
        isInherited={isInherited}
        isNameLocked={props.isListLocked && isTopLevel}
        isTypeLocked={props.isListLocked && isTopLevel}
        canDrop={canDrop}
        dropNode={dropNode}
        isSelected={selectedNodesSet.has(nodeId)}
        onSelect={onSelect}
        gdevelopTheme={gdevelopTheme}
        variableNameInputRefs={variableNameInputRefs}
        topLevelVariableValueInputRefs={topLevelVariableValueInputRefs}
        parentType={parentType}
        onChangeName={onChangeName}
        overwritesInheritedVariable={overwritesInheritedVariable}
        name={name}
        index={index}
        rowRightSideStyle={rowRightSideStyle}
        isTopLevel={isTopLevel}
        type={type}
        typeErrorMessage={typeErrorMessage}
        isLoopIndexVariable={isLoopIndexVariable}
        removeLoopIndexVariable={removeLoopIndexVariable}
        variablePointer={variable.ptr}
        onChangeType={onChangeType}
        hasMixedValues={hasMixedValues}
        valueAsString={valueAsString}
        valueAsBool={valueAsBool}
        onChangeValue={onChangeValue}
        isCollection={isCollection}
        onAddChild={onAddChild}
        editInheritedVariable={editInheritedVariable}
        deleteNode={deleteNode}
        directlyStoreValueChangesWhileEditing={
          !!props.directlyStoreValueChangesWhileEditing
        }
        i18n={i18n}
      />
    );
  };

  if (
    !aliveVariablesContainer ||
    (props.inheritedVariablesContainer && !aliveInheritedVariablesContainer)
  ) {
    return null;
  }

  const toolbar = (
    <VariablesListToolbar
      isNarrow={isToolbarNarrow}
      isCompact={props.size === 'compact'}
      onCopy={copySelection}
      onPaste={pasteClipboardContent}
      onDelete={deleteSelection}
      canCopy={canCopySelection}
      canPaste={canPasteSelection}
      canDelete={canDeleteSelection}
      canAdd={!props.isListLocked}
      onUndo={_undo}
      onRedo={_redo}
      canUndo={_canUndo()}
      canRedo={_canRedo()}
      hideHistoryChangeButtons={!!props.historyHandler}
      onAdd={addVariable}
      searchText={searchText}
      onChangeSearchText={setSearchText}
      iconStyle={props.toolbarIconStyle}
    />
  );

  return (
    <ErrorBoundary
      componentTitle={<Trans>Variables list</Trans>}
      scope="variables-list"
    >
      <I18n>
        {({ i18n }) => (
          <ClickAwayListener
            onClickAway={() =>
              setSelectedNodes(selectedNodes =>
                selectedNodes.length === 0 ? selectedNodes : []
              )
            }
          >
            <Measure
              bounds
              onResize={contentRect => {
                setContainerWidth(contentRect.bounds.width);
              }}
            >
              {({ contentRect, measureRef }) => (
                <div
                  ref={measureRef}
                  style={{
                    flex: 1,
                    display: 'flex',
                    minHeight: 0,
                    outline: 'none',
                  }}
                  onKeyDown={keyboardShortcuts.onKeyDown}
                  onKeyUp={keyboardShortcuts.onKeyUp}
                  tabIndex={0}
                >
                  <Column expand useFullHeight noOverflowParent noMargin>
                    {props.size === 'compact' ? (
                      <Column>{toolbar}</Column>
                    ) : (
                      toolbar
                    )}
                    {aliveVariablesContainer.count() === 0 &&
                    (!aliveInheritedVariablesContainer ||
                      aliveInheritedVariablesContainer.count() === 0) ? (
                      <Column noMargin expand justifyContent="center">
                        {props.emptyPlaceholderTitle &&
                        props.emptyPlaceholderDescription ? (
                          props.isListLocked ? (
                            <Column>
                              <Text size="block-title" align="center">
                                {<Trans>No variable</Trans>}
                              </Text>
                              <Text align="center" noMargin>
                                {<Trans>There is no variable to set up.</Trans>}
                              </Text>
                            </Column>
                          ) : (
                            <EmptyPlaceholder
                              title={props.emptyPlaceholderTitle}
                              description={props.emptyPlaceholderDescription}
                              actionLabel={<Trans>Add a variable</Trans>}
                              helpPagePath={props.helpPagePath || undefined}
                              tutorialId="intermediate-advanced-variables"
                              onAction={addVariable}
                              actionButtonId="add-variable"
                            />
                          )
                        ) : null}
                        {props.compactEmptyPlaceholderText && (
                          <Line justifyContent="center">
                            <Text
                              size="body2"
                              color="secondary"
                              align="center"
                              noMargin
                            >
                              {props.isListLocked ? (
                                <Trans>There is no variable to set up.</Trans>
                              ) : (
                                props.compactEmptyPlaceholderText
                              )}
                            </Text>
                          </Line>
                        )}
                      </Column>
                    ) : (
                      <ScrollView autoHideScrollbar>
                        <div
                          ref={rowsContainerRef}
                          className={classes.rowsContainer}
                          style={{
                            height:
                              flattenedVariables.length * VARIABLE_ROW_HEIGHT,
                          }}
                        >
                          {flattenedVariables
                            .slice(firstRowIndex, afterLastRowIndex)
                            .map((flattenedVariable, index) =>
                              renderRow(
                                flattenedVariable,
                                firstRowIndex + index,
                                i18n
                              )
                            )}
                        </div>
                        {!!undefinedVariableNames.length && (
                          <Paper background="dark" variant="outlined">
                            <Column>
                              <Text>
                                <MarkdownText
                                  translatableSource={t`There are variables used in events but not declared in this list: ${'`' +
                                    undefinedVariableNames.join('`, `') +
                                    '`'}.`}
                                />
                              </Text>
                            </Column>
                          </Paper>
                        )}
                      </ScrollView>
                    )}
                  </Column>
                </div>
              )}
            </Measure>
          </ClickAwayListener>
        )}
      </I18n>
    </ErrorBoundary>
  );
});

export default VariablesList;
