// @flow
import * as React from 'react';
import Measure from 'react-measure';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { ClickAwayListener } from '@material-ui/core';

import Add from '../UI/CustomSvgIcons/Add';
import Edit from '../UI/CustomSvgIcons/Edit';
import Undo from '../UI/CustomSvgIcons/Undo';
import ChevronRight from '../UI/CustomSvgIcons/ChevronArrowRight';
import ChevronBottom from '../UI/CustomSvgIcons/ChevronArrowBottom';
import ButtonBase from '@material-ui/core/ButtonBase';

import { Column, Line, Spacer } from '../UI/Grid';
import IconButton from '../UI/IconButton';
import { DragHandleIcon } from '../UI/DragHandle';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from '../UI/SortableVirtualizedItemList/DropIndicator';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import ScrollView from '../UI/ScrollView';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type GDevelopTheme } from '../UI/Theme';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';

import useForceUpdate from '../Utils/UseForceUpdate';
import { mapFor } from '../Utils/MapFor';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
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
  getVariableContextFromNodeId,
  inheritedPrefix,
  isAnAncestryOf,
  separator,
  updateListOfNodesFollowingChangeName,
} from './VariableToTreeNodeHandling';

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
const gd: libGDevelop = global.gd;

const DragSourceAndDropTarget = makeDragSourceAndDropTarget('variable-editor');

const stopEventPropagation = (event: SyntheticPointerEvent<HTMLInputElement>) =>
  event.stopPropagation();

const styles = { inlineIcon: { padding: 0 }, handlePlaceholder: { width: 24 } };

export type HistoryHandler = {|
  saveToHistory: () => void,
  undo: () => void,
  redo: () => void,
  canUndo: () => boolean,
  canRedo: () => boolean,
|};

type Props = {|
  variablesContainer: gdVariablesContainer,
  inheritedVariablesContainer?: gdVariablesContainer,
  /** Callback executed at mount to compute suggestions. */
  onComputeAllVariableNames?: () => Array<string>,
  /** To specify if history should be handled by parent. */
  historyHandler?: HistoryHandler,
  emptyPlaceholderTitle?: React.Node,
  emptyPlaceholderDescription?: React.Node,
  helpPagePath?: ?string,
  /** If set to true, it will commit changes to variables on each input change. It can be expensive, but useful when VariablesList can be unmounted at any time. */
  directlyStoreValueChangesWhileEditing?: boolean,
  /** If set to small, will collapse variable row by default. */
  size?: 'small',
  onVariablesUpdated?: () => void,
  toolbarIconStyle?: any,
|};

const variableRowStyles = {
  chevron: { width: 15, alignSelf: 'stretch' },
};

type VariableRowProps = {|
  // Context:
  depth: number,
  isNarrow: boolean,
  containerWidth: ?number,
  shouldHideExpandIcons: boolean,
  isExpanded: boolean,
  onExpand: (shouldExpand: boolean, nodeId: string) => void,
  draggedNodeId: { current: ?string },
  nodeId: string,
  isInherited: boolean,
  canDrop: string => boolean,
  dropNode: string => void,
  isSelected: boolean,
  onSelect: (shouldMultiselect: boolean, nodeId: string) => void,
  topLevelVariableNameInputRefs: {|
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
  onChangeName: (string, string) => void,
  overwritesInheritedVariable: boolean | void,
  name: string,
  index: number,
  isTopLevel: boolean,
  type: Variable_Type,
  onChangeType: (string, nodeId: string) => void,
  valueAsString: string | null,
  valueAsBool: boolean | null,
  onChangeValue: (string, nodeId: string) => void,
  isCollection: boolean,
  variablePointer: number,
  onAddChild: string => void,
  editInheritedVariable: string => void,
  deleteNode: string => void,
|};

const VariableRow = React.memo<VariableRowProps>(
  ({
    depth,
    isNarrow,
    containerWidth,
    shouldHideExpandIcons,
    isExpanded,
    onExpand,
    draggedNodeId,
    nodeId,
    isInherited,
    canDrop,
    dropNode,
    isSelected,
    onSelect,
    gdevelopTheme,
    topLevelVariableNameInputRefs,
    topLevelVariableValueInputRefs,
    parentType,
    onChangeName,
    overwritesInheritedVariable,
    name,
    index,
    rowRightSideStyle,
    isTopLevel,
    type,
    onChangeType,
    valueAsString,
    valueAsBool,
    onChangeValue,
    isCollection,
    variablePointer,
    onAddChild,
    editInheritedVariable,
    deleteNode,
    directlyStoreValueChangesWhileEditing,
  }: VariableRowProps) => {
    const shouldWrap =
      isNarrow ||
      (!containerWidth
        ? false
        : containerWidth <= 750
        ? depth >= 5
        : containerWidth <= 850
        ? depth >= 6
        : containerWidth <= 950
        ? depth >= 7
        : depth >= 8);
    const [editInMultilineEditor, setEditInMultilineEditor] = React.useState(
      false
    );
    const forceUpdate = useForceUpdate();
    const hasLineBreaks = valueAsString
      ? valueAsString.indexOf('\n') !== -1
      : false;

    return (
      <DragSourceAndDropTarget
        beginDrag={() => {
          draggedNodeId.current = nodeId;
          return {};
        }}
        canDrag={() => !isInherited}
        canDrop={() => canDrop(nodeId)}
        drop={() => {
          dropNode(nodeId);
        }}
      >
        {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
          connectDropTarget(
            <div
              style={{
                marginLeft: (isNarrow ? 16 : 32) * depth,
                backgroundColor: isSelected
                  ? gdevelopTheme.listItem.selectedBackgroundColor
                  : gdevelopTheme.list.itemsBackgroundColor,
                marginBottom: 1,
              }}
              aria-selected={isSelected}
              aria-expanded={isExpanded}
              onPointerUp={event => {
                const shouldMultiSelect = event.metaKey || event.ctrlKey;
                onSelect(shouldMultiSelect, nodeId);
              }}
            >
              {isOver && <DropIndicator canDrop={canDrop} />}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: isNarrow ? '4px 4px 4px 0px' : '6px 30px 6px 6px',
                }}
              >
                {shouldHideExpandIcons ? null : isCollection ? (
                  <ButtonBase
                    onClick={() => onExpand(!isExpanded, nodeId)}
                    focusRipple
                    style={variableRowStyles.chevron}
                  >
                    {isExpanded ? <ChevronBottom /> : <ChevronRight />}
                  </ButtonBase>
                ) : (
                  <div style={variableRowStyles.chevron} />
                )}

                {isInherited ? (
                  <span style={styles.handlePlaceholder} />
                ) : (
                  connectDragSource(
                    <span>
                      <DragHandleIcon
                        color={
                          isSelected
                            ? gdevelopTheme.listItem.selectedTextColor
                            : '#AAA'
                        }
                      />
                    </span>
                  )
                )}
                <ResponsiveLineStackLayout
                  expand
                  noMargin
                  forceMobileLayout={shouldWrap}
                >
                  <Line alignItems="center" noMargin expand>
                    {shouldWrap ? null : <Spacer />}
                    <SimpleTextField
                      type="text"
                      ref={element => {
                        if (depth === 0 && element) {
                          topLevelVariableNameInputRefs.current[
                            variablePointer
                          ] = element;
                        }
                      }}
                      directlyStoreValueChangesWhileEditing={
                        directlyStoreValueChangesWhileEditing
                      }
                      disabled={isInherited || parentType === gd.Variable.Array}
                      onChange={onChangeName}
                      additionalContext={JSON.stringify({ nodeId, depth })}
                      italic={!!overwritesInheritedVariable}
                      value={name}
                      id={`variable-${index}-name`}
                    />
                    <Spacer />
                  </Line>
                  <div style={shouldWrap ? undefined : rowRightSideStyle}>
                    <Line noMargin alignItems="center">
                      <Column noMargin>
                        <VariableTypeSelector
                          variableType={type}
                          onChange={onChangeType}
                          nodeId={nodeId}
                          isHighlighted={isSelected}
                          readOnlyWithIcon={
                            isInherited || overwritesInheritedVariable
                          }
                          id={`variable-${index}-type`}
                        />
                      </Column>
                      <Column expand>
                        {type === gd.Variable.Boolean ? (
                          <Line noMargin alignItems="center">
                            <span
                              style={
                                isSelected
                                  ? {
                                      color:
                                        gdevelopTheme.listItem
                                          .selectedTextColor,
                                    }
                                  : undefined
                              }
                            >
                              <Text
                                displayInlineAsSpan
                                noMargin
                                color="inherit"
                              >
                                {valueAsBool ? (
                                  <Trans>True</Trans>
                                ) : (
                                  <Trans>False</Trans>
                                )}
                              </Text>
                            </span>
                            {isInherited && !isTopLevel ? null : (
                              <>
                                <Spacer />
                                <IconButton
                                  size="small"
                                  style={styles.inlineIcon}
                                  onClick={() => {
                                    onChangeValue(
                                      !valueAsBool ? 'true' : 'false',
                                      nodeId
                                    );
                                    forceUpdate();
                                  }}
                                  tooltip={
                                    !valueAsBool
                                      ? t`Set to true`
                                      : t`Set to false`
                                  }
                                >
                                  <SwitchHorizontal
                                    htmlColor={
                                      isSelected
                                        ? gdevelopTheme.listItem
                                            .selectedTextColor
                                        : undefined
                                    }
                                  />
                                </IconButton>
                              </>
                            )}
                          </Line>
                        ) : (
                          <SimpleTextField
                            ref={element => {
                              if (depth === 0 && element) {
                                topLevelVariableValueInputRefs.current[
                                  variablePointer
                                ] = element;
                              }
                            }}
                            type={
                              type === gd.Variable.Number ? 'number' : 'text'
                            }
                            directlyStoreValueChangesWhileEditing={
                              directlyStoreValueChangesWhileEditing
                            }
                            key="value"
                            disabled={
                              isCollection ||
                              (isInherited && !isTopLevel) ||
                              hasLineBreaks
                            }
                            onChange={onChangeValue}
                            value={
                              // If line breaks are present, disable the field (as it's
                              // single line only) and make line breaks visible.
                              hasLineBreaks
                                ? (valueAsString || '').replace(/\n/g, '↵')
                                : valueAsString || ''
                            }
                            additionalContext={nodeId}
                            id={`variable-${index}-text-value`}
                          />
                        )}
                      </Column>
                      {// Only show the large edit button for string variables,
                      // and not for those who are in an inherited structure or array.
                      type === gd.Variable.String &&
                      !(isInherited && !isTopLevel) ? (
                        <IconButton
                          size="small"
                          style={styles.inlineIcon}
                          tooltip={t`Open in a larger editor`}
                          onClick={event => {
                            stopEventPropagation(event);
                            setEditInMultilineEditor(true);
                          }}
                        >
                          <Edit
                            htmlColor={
                              isSelected
                                ? gdevelopTheme.listItem.selectedTextColor
                                : undefined
                            }
                          />
                        </IconButton>
                      ) : null}
                      {isCollection && !isInherited ? (
                        <IconButton
                          size="small"
                          style={styles.inlineIcon}
                          tooltip={t`Add child`}
                          onClick={event => {
                            stopEventPropagation(event);
                            onAddChild(nodeId);
                          }}
                        >
                          <Add
                            htmlColor={
                              isSelected
                                ? gdevelopTheme.listItem.selectedTextColor
                                : undefined
                            }
                          />
                        </IconButton>
                      ) : null}
                      {isCollection && isInherited && isTopLevel ? (
                        <IconButton
                          size="small"
                          tooltip={t`Edit`}
                          style={styles.inlineIcon}
                          onClick={event => {
                            stopEventPropagation(event);
                            editInheritedVariable(nodeId);
                          }}
                        >
                          <Edit
                            htmlColor={
                              isSelected
                                ? gdevelopTheme.listItem.selectedTextColor
                                : undefined
                            }
                          />
                        </IconButton>
                      ) : null}
                      {overwritesInheritedVariable && isTopLevel ? (
                        <IconButton
                          size="small"
                          tooltip={t`Reset`}
                          style={styles.inlineIcon}
                          onClick={event => {
                            stopEventPropagation(event);
                            deleteNode(nodeId);
                          }}
                        >
                          <Undo
                            htmlColor={
                              isSelected
                                ? gdevelopTheme.listItem.selectedTextColor
                                : undefined
                            }
                          />
                        </IconButton>
                      ) : null}
                    </Line>
                  </div>
                </ResponsiveLineStackLayout>
              </div>
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
            </div>
          )
        }
      </DragSourceAndDropTarget>
    );
  }
);

const VariablesList = (props: Props) => {
  const historyRef = useRefWithInit(() =>
    getHistoryInitialState(props.variablesContainer, {
      historyMaxSize: 50,
    })
  );

  const [searchText, setSearchText] = React.useState<string>('');
  const { onComputeAllVariableNames } = props;
  const allVariablesNames = React.useMemo<?Array<string>>(
    () => (onComputeAllVariableNames ? onComputeAllVariableNames() : null),
    [onComputeAllVariableNames]
  );
  const [selectedNodes, setSelectedNodes] = React.useState<Array<string>>([]);
  const [searchMatchingNodes, setSearchMatchingNodes] = React.useState<
    Array<string>
  >([]);
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const topLevelVariableNameInputRefs = React.useRef<{|
    [number]: SimpleTextFieldInterface,
  |}>({});
  const topLevelVariableValueInputRefs = React.useRef<{|
    [number]: SimpleTextFieldInterface,
  |}>({});
  // $FlowFixMe - Hard to fix issue regarding strict checking with interface.
  const refocusNameField = useRefocusField(topLevelVariableNameInputRefs);
  // $FlowFixMe - Hard to fix issue regarding strict checking with interface.
  const refocusValueField = useRefocusField(topLevelVariableValueInputRefs);
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const draggedNodeId = React.useRef<?string>(null);
  const forceUpdate = useForceUpdate();

  const triggerSearch = React.useCallback(
    () => {
      let matchingInheritedNodes = [];
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
    !hasVariablesContainerSubChildren(props.variablesContainer) &&
    (props.inheritedVariablesContainer
      ? !hasVariablesContainerSubChildren(props.inheritedVariablesContainer)
      : true);

  const rowRightSideStyle = React.useMemo(
    () => ({
      minWidth: containerWidth ? Math.round(0.6 * containerWidth) : 600,
      flexShrink: 0,
    }),
    [containerWidth]
  );
  const isNarrow = React.useMemo(
    () =>
      props.size === 'small' || (containerWidth ? containerWidth < 650 : false),
    [containerWidth, props.size]
  );

  const undefinedVariableNames = allVariablesNames
    ? allVariablesNames.filter(variableName => {
        return (
          !props.variablesContainer.has(variableName) &&
          (!props.inheritedVariablesContainer ||
            !props.inheritedVariablesContainer.has(variableName))
        );
      })
    : [];

  const { historyHandler, onVariablesUpdated, variablesContainer } = props;
  const _onChange = React.useCallback(
    () => {
      if (historyHandler) historyHandler.saveToHistory();
      else
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
      else
        historyRef.current = undo(historyRef.current, props.variablesContainer);
      setSelectedNodes([]);
    },
    [historyRef, historyHandler, props.variablesContainer]
  );

  const _redo = React.useCallback(
    () => {
      if (historyHandler) historyHandler.redo();
      else
        historyRef.current = redo(historyRef.current, props.variablesContainer);
      setSelectedNodes([]);
    },
    [historyRef, historyHandler, props.variablesContainer]
  );

  const _canUndo = (): boolean =>
    props.historyHandler
      ? props.historyHandler.canUndo()
      : canUndo(historyRef.current);

  const _canRedo = (): boolean =>
    props.historyHandler
      ? props.historyHandler.canRedo()
      : canRedo(historyRef.current);

  const keyboardShortcuts = new KeyboardShortcuts({
    isActive: () => true,
    shortcutCallbacks: { onUndo: _undo, onRedo: _redo },
  });

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
          if (!name) return;
          const { name: newName } = insertInVariablesContainer(
            props.variablesContainer,
            gd.Project.getSafeName(name),
            serializedVariable,
            props.variablesContainer.count(),
            props.inheritedVariablesContainer
          );
          newSelectedNodes.push(newName);
        } else {
          const targetNode = selectedNodes[0];
          if (targetNode.startsWith(inheritedPrefix)) return;

          const {
            name: targetVariableName,
            lineage: targetVariableLineage,
          } = getVariableContextFromNodeId(
            targetNode,
            props.variablesContainer
          );
          if (!targetVariableName) return;

          const targetParentVariable = getDirectParentVariable(
            targetVariableLineage
          );
          if (!targetParentVariable) {
            if (!name) return;
            const { name: newName } = insertInVariablesContainer(
              props.variablesContainer,
              name,
              serializedVariable,
              props.variablesContainer.getPosition(targetVariableName) + 1,
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
      props.variablesContainer,
      selectedNodes,
    ]
  );

  const _deleteNode = React.useCallback(
    (nodeId: string): boolean => {
      if (nodeId.startsWith(inheritedPrefix)) return false;
      const { name, lineage } = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      if (!name) return false;
      const parentVariable = getDirectParentVariable(lineage);
      if (!parentVariable) {
        props.variablesContainer.remove(name);
      } else {
        if (parentVariable.getType() === gd.Variable.Array) {
          parentVariable.removeAtIndex(parseInt(name, 10));
        } else {
          parentVariable.removeChild(name);
        }
      }
      return true;
    },
    [props.variablesContainer]
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

  const deleteSelection = React.useCallback(
    () => {
      // Take advantage of the node ids notation to sort them in
      // descending lexicographical order, so we delete from "last"
      // to "first". In the case of arrays, this avoids to change
      // the index of the variables while deleting them, which would
      // result in the wrong variables to be deleted if multiple of them
      // are removed.
      const deleteSuccesses = selectedNodes
        .sort()
        .reverse()
        .map(_deleteNode);
      if (deleteSuccesses.some(Boolean)) {
        _onChange();
        setSelectedNodes([]);
      }
    },
    [_onChange, _deleteNode, selectedNodes]
  );

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
    [searchText]
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
    [forceUpdate, searchText, triggerSearch]
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
      const { variable: draggedVariable } = draggedVariableContext;
      if (!draggedVariable) return false;

      if (isAnAncestryOf(draggedVariable, targetLineage)) return false;

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
    [props.variablesContainer]
  );

  const dropNode = React.useCallback(
    (nodeId: string): void => {
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
      let movementHasBeenMade = true;
      let parentNodeId;
      let targetParentNodeId;

      switch (movementType) {
        case 'InsideTopLevel':
          draggedIndex = props.variablesContainer.getPosition(draggedName);
          targetIndex = props.variablesContainer.getPosition(targetName);
          props.variablesContainer.move(
            draggedIndex,
            targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
          );
          break;
        case 'TopLevelToStructure':
          newName = newNameGenerator(
            draggedName,
            // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
            name => targetVariableParentVariable.hasChild(name),
            'CopyOf'
          );

          // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
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

          // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
          draggedVariableParentVariable.removeChild(draggedName);
          updateExpandedAndSelectedNodesFollowingNodeMove(current, '', newName);
          break;
        case 'FromStructureToAnotherStructure':
          newName = newNameGenerator(
            draggedName,
            // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
            name => targetVariableParentVariable.hasChild(name),
            'CopyOf'
          );
          // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
          targetVariableParentVariable.insertChild(newName, draggedVariable);

          // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
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

          // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
          targetVariableParentVariable.insertAtIndex(
            draggedVariable,
            targetIndex
          );

          // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
          draggedVariableParentVariable.removeAtIndex(draggedIndex);
          targetParentNodeId = getDirectParentNodeId(targetLineage);
          if (targetParentNodeId)
            updateExpandedAndSelectedNodesFollowingNodeMove(
              current,
              targetParentNodeId,
              targetIndex.toString()
            );
          break;
        case 'InsideSameArray':
          draggedIndex = parseInt(draggedName, 10);
          targetIndex = parseInt(targetName, 10);
          const correctedTargetIndex =
            targetIndex > draggedIndex ? targetIndex - 1 : targetIndex;
          // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
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
        variable.getChild(name).setString('');
      } else if (type === gd.Variable.Array) variable.pushNew();
      _onChange();
      if (variable.isFolded()) variable.setFolded(false);
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
      newVariable.delete();
    },
    [_onChange, props.inheritedVariablesContainer, props.variablesContainer]
  );

  const onAdd = React.useCallback(
    () => {
      const addAtTopLevel =
        selectedNodes.length === 0 ||
        selectedNodes.some(node => node.startsWith(inheritedPrefix));

      if (addAtTopLevel) {
        const { name: newName, variable } = insertInVariablesContainer(
          props.variablesContainer,
          'Variable',
          null,
          props.variablesContainer.count(),
          props.inheritedVariablesContainer
        );
        _onChange();
        setSelectedNodes([newName]);
        refocusNameField({ identifier: variable.ptr });
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
        position = props.variablesContainer.getPosition(targetVariableName) + 1;
      } else {
        position =
          props.variablesContainer.getPosition(oldestAncestry.name) + 1;
      }
      const { name: newName, variable } = insertInVariablesContainer(
        props.variablesContainer,
        'Variable',
        null,
        position,
        props.inheritedVariablesContainer
      );
      _onChange();
      setSelectedNodes([newName]);
      refocusNameField({ identifier: variable.ptr });
    },
    [
      _onChange,
      props.inheritedVariablesContainer,
      props.variablesContainer,
      refocusNameField,
      selectedNodes,
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
    []
  );

  const renderVariableAndChildrenRows = (
    {
      name,
      variable,
      parentNodeId,
      parentVariable,
      isInherited,
      index,
    }: {|
      name: string,
      variable: gdVariable,
      parentNodeId?: string,
      parentVariable?: gdVariable,
      isInherited: boolean,
      index: number,
    |},
    i18n: I18nType
  ): Array<React.Node> => {
    const isCollection = isCollectionVariable(variable);
    const type = variable.getType();
    const isExpanded = !variable.isFolded();
    const variablePointer = variable.ptr;

    const depth = parentNodeId ? parentNodeId.split(separator).length : 0;
    const isTopLevel = depth === 0;

    let nodeId;
    if (!parentNodeId) {
      if (isInherited) {
        nodeId = `${inheritedPrefix}${name}`;
      } else {
        nodeId = name;
      }
    } else {
      nodeId = `${parentNodeId}${separator}${name}`;
    }
    const parentType = parentVariable ? parentVariable.getType() : null;
    const isSelected = selectedNodes.includes(nodeId);
    const overwritesInheritedVariable =
      isTopLevel &&
      !isInherited &&
      props.inheritedVariablesContainer &&
      props.inheritedVariablesContainer.has(name);

    if (!!searchText) {
      if (
        !(
          searchMatchingNodes.includes(nodeId) ||
          searchMatchingNodes.includes(parentNodeId) ||
          searchMatchingNodes.some(matchingNodeId =>
            matchingNodeId.startsWith(nodeId)
          )
        )
      ) {
        // Display node if one of these is true:
        // - node is in the list of nodes matching search
        // - parent node is in the list of nodes matching search (to be able to edit direct children of searched structure)
        // - node is an ancestry of a node in the list of nodes matching search
        return [];
      }
    }

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

    const variableRow = (
      <VariableRow
        key={nodeId}
        depth={depth}
        isNarrow={isNarrow}
        containerWidth={containerWidth}
        shouldHideExpandIcons={shouldHideExpandIcons}
        isExpanded={isExpanded}
        onExpand={onExpand}
        draggedNodeId={draggedNodeId}
        nodeId={nodeId}
        isInherited={isInherited}
        canDrop={canDrop}
        dropNode={dropNode}
        isSelected={isSelected}
        onSelect={onSelect}
        gdevelopTheme={gdevelopTheme}
        topLevelVariableNameInputRefs={topLevelVariableNameInputRefs}
        topLevelVariableValueInputRefs={topLevelVariableValueInputRefs}
        parentType={parentType}
        onChangeName={onChangeName}
        overwritesInheritedVariable={overwritesInheritedVariable}
        name={name}
        index={index}
        rowRightSideStyle={rowRightSideStyle}
        isTopLevel={isTopLevel}
        type={type}
        variablePointer={variablePointer}
        onChangeType={onChangeType}
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
      />
    );

    if (type === gd.Variable.Structure) {
      return [
        variableRow,
        ...(isExpanded
          ? variable
              .getAllChildrenNames()
              .toJSArray()
              .map((childName, index) => {
                const childVariable = variable.getChild(childName);
                return renderVariableAndChildrenRows(
                  {
                    name: childName,
                    variable: childVariable,
                    parentNodeId: nodeId,
                    parentVariable: variable,
                    isInherited,
                    index,
                  },
                  i18n
                );
              })
          : []),
      ];
    } else if (type === gd.Variable.Array) {
      return [
        variableRow,
        ...(isExpanded
          ? mapFor(0, variable.getChildrenCount(), index => {
              const childVariable = variable.getAtIndex(index);
              return renderVariableAndChildrenRows(
                {
                  name: index.toString(),
                  variable: childVariable,
                  parentNodeId: nodeId,
                  parentVariable: variable,
                  isInherited,
                  index,
                },
                i18n
              );
            })
          : []),
      ];
    } else {
      return [variableRow];
    }
  };

  const onChangeName = React.useCallback(
    (newName: string, additionalContext: any) => {
      const parsedContext = JSON.parse(additionalContext);
      const nodeId: string = parsedContext.nodeId;
      const depth: number = parsedContext.depth;

      const { variable, lineage, name } = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      if (name === null || !variable || newName === name) return;

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
        tentativeNewName => {
          if (
            (parentVariable && parentVariable.hasChild(tentativeNewName)) ||
            (!parentVariable && props.variablesContainer.has(tentativeNewName))
          ) {
            return true;
          }

          return false;
        }
      );

      if (!parentVariable) {
        props.variablesContainer.rename(name, safeAndUniqueNewName);
      } else {
        parentVariable.renameChild(name, safeAndUniqueNewName);
      }

      _onChange();
      updateExpandedAndSelectedNodesFollowingNameChange(
        nodeId,
        safeAndUniqueNewName
      );
      refocusNameField({ identifier: variable.ptr });
    },
    [
      _onChange,
      props.variablesContainer,
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
      variable.castTo(newType);
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
        variable = props.variablesContainer.insert(name, newVariable, 0);

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
        refocusValueField({
          identifier: variable.ptr,
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
      refocusValueField,
    ]
  );

  const renderTree = (i18n: I18nType, isInherited: boolean = false) => {
    const variablesContainer =
      isInherited && props.inheritedVariablesContainer
        ? props.inheritedVariablesContainer
        : props.variablesContainer;
    const allRows = [];
    mapFor(0, variablesContainer.count(), index => {
      const variable = variablesContainer.getAt(index);
      const name = variablesContainer.getNameAt(index);
      if (isInherited) {
        if (props.variablesContainer.has(name)) {
          return null;
        }
      }

      allRows.push(
        ...renderVariableAndChildrenRows(
          {
            name,
            variable,
            isInherited,
            index,
          },
          i18n
        )
      );
    });
    return allRows;
  };

  const toolbar = (
    <VariablesListToolbar
      isNarrow={isNarrow}
      onCopy={copySelection}
      onPaste={pasteClipboardContent}
      onDelete={deleteSelection}
      canCopy={selectedNodes.length > 0}
      canPaste={Clipboard.has(CLIPBOARD_KIND)}
      canDelete={
        selectedNodes.length > 0 &&
        selectedNodes.every(nodeId => !nodeId.startsWith(inheritedPrefix))
      }
      onUndo={_undo}
      onRedo={_redo}
      canUndo={_canUndo()}
      canRedo={_canRedo()}
      hideHistoryChangeButtons={!!props.historyHandler}
      onAdd={onAdd}
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
          <ClickAwayListener onClickAway={() => setSelectedNodes([])}>
            <Measure
              bounds
              onResize={contentRect => {
                setContainerWidth(contentRect.bounds.width);
              }}
            >
              {({ contentRect, measureRef }) => (
                <div
                  ref={measureRef}
                  style={{ flex: 1, display: 'flex', minHeight: 0 }}
                  onKeyDown={keyboardShortcuts.onKeyDown}
                  onKeyUp={keyboardShortcuts.onKeyUp}
                >
                  <Column expand useFullHeight noMargin>
                    {isNarrow ? null : toolbar}
                    {props.variablesContainer.count() === 0 &&
                    (!props.inheritedVariablesContainer ||
                      props.inheritedVariablesContainer.count() === 0) ? (
                      <Column noMargin expand justifyContent="center">
                        {props.emptyPlaceholderTitle &&
                        props.emptyPlaceholderDescription ? (
                          <EmptyPlaceholder
                            title={props.emptyPlaceholderTitle}
                            description={props.emptyPlaceholderDescription}
                            actionLabel={<Trans>Add a variable</Trans>}
                            helpPagePath={props.helpPagePath || undefined}
                            tutorialId="intermediate-advanced-variables"
                            onAction={onAdd}
                            actionButtonId="add-variable"
                          />
                        ) : null}
                      </Column>
                    ) : (
                      <ScrollView autoHideScrollbar>
                        {props.inheritedVariablesContainer
                          ? renderTree(i18n, true)
                          : null}
                        {renderTree(i18n)}
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
                    {isNarrow ? toolbar : null}
                  </Column>
                </div>
              )}
            </Measure>
          </ClickAwayListener>
        )}
      </I18n>
    </ErrorBoundary>
  );
};

export default VariablesList;
