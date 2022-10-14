// @flow
import * as React from 'react';
import Measure from 'react-measure';
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { ClickAwayListener } from '@material-ui/core';
import { TreeView, TreeItem } from '@material-ui/lab';
import { makeStyles, withStyles } from '@material-ui/styles';

import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import Replay from '@material-ui/icons/Replay';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ExpandMore from '@material-ui/icons/ExpandMore';
import SwapHorizontal from '@material-ui/icons/SwapHoriz';

import { Column, Line, Spacer } from '../UI/Grid';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import IconButton from '../UI/IconButton';
import { DragHandleIcon } from '../UI/DragHandle';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from '../UI/SortableVirtualizedItemList/DropIndicator';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import ScrollView from '../UI/ScrollView';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
import { ResponsiveLineStackLayout } from '../UI/Layout';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import SemiControlledAutoComplete, {
  type SemiControlledAutoCompleteInterface,
} from '../UI/SemiControlledAutoComplete';

import useForceUpdate from '../Utils/UseForceUpdate';
import { mapFor } from '../Utils/MapFor';
import newNameGenerator from '../Utils/NewNameGenerator';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  type HistoryState,
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
  foldNodesVariables,
  generateListOfNodesMatchingSearchInVariablesContainer,
  getDirectParentNodeId,
  getDirectParentVariable,
  getExpandedNodeIdsFromVariablesContainer,
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
const gd: libGDevelop = global.gd;

const stopEventPropagation = (event: SyntheticPointerEvent<HTMLInputElement>) =>
  event.stopPropagation();
const preventEventDefaultEffect = (
  event: SyntheticPointerEvent<HTMLInputElement>
) => event.preventDefault();

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
  /** If set to false, it will commit changes to variables on each input change. It can be expensive, but useful when VariablesList can be unmounted at any time. */
  commitChangesOnBlur: boolean,
  /** If set to small, will collapse variable row by default. */
  size?: 'small',
|};

const StyledTreeItem = withStyles(theme => ({
  group: {
    marginLeft: 7,
    paddingLeft: 15,
  },
  iconContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
    color: 'white',
  },
  root: {
    '&:focus:not(.Mui-selected)': {
      '& > .MuiTreeItem-content': {
        filter: 'brightness(1.15)',
      },
      '& > .MuiTreeItem-content > .MuiTreeItem-label': {
        backgroundColor: 'unset',
      },
    },
    '&:hover:not(:focus)': {
      '& > .MuiTreeItem-content:hover': {
        filter: 'brightness(1.07)',
      },
    },
    '&.Mui-selected:hover': {
      '& > .MuiTreeItem-content:hover': {
        filter: 'brightness(1.07)',
      },
    },
  },
  label: {
    padding: 0,
    '&:hover': {
      backgroundColor: 'unset',
    },
  },
  content: { marginTop: 5 },
}))(props => <TreeItem {...props} TransitionProps={{ timeout: 0 }} />);

const VariablesList = ({ onComputeAllVariableNames, ...props }: Props) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Array<string>>(
    getExpandedNodeIdsFromVariablesContainer(props.variablesContainer).concat(
      props.inheritedVariablesContainer
        ? getExpandedNodeIdsFromVariablesContainer(
            props.inheritedVariablesContainer,
            true
          )
        : []
    )
  );
  const [history, setHistory] = React.useState<HistoryState>(
    getHistoryInitialState(props.variablesContainer, {
      historyMaxSize: 50,
    })
  );
  const [searchText, setSearchText] = React.useState<string>('');
  const allVariablesNames = React.useMemo<?Array<string>>(
    () => (onComputeAllVariableNames ? onComputeAllVariableNames() : null),
    [onComputeAllVariableNames]
  );
  const [selectedNodes, setSelectedNodes] = React.useState<Array<string>>([]);
  const [searchMatchingNodes, setSearchMatchingNodes] = React.useState<
    Array<string>
  >([]);
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );
  const topLevelVariableNameInputRefs = React.useRef<{
    [number]: SemiControlledAutoCompleteInterface,
  }>({});
  const [variablePtrToFocus, setVariablePtrToFocus] = React.useState<?number>(
    null
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const draggedNodeId = React.useRef<?string>(null);
  const forceUpdate = useForceUpdate();

  const DragSourceAndDropTarget = React.useMemo(
    () => makeDragSourceAndDropTarget('variable-editor'),
    []
  );

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

  React.useEffect(
    () => {
      if (variablePtrToFocus) {
        const inputRef =
          topLevelVariableNameInputRefs.current[variablePtrToFocus];
        if (inputRef) {
          inputRef.focus();
          setVariablePtrToFocus(null);
        }
      }
    },
    [variablePtrToFocus]
  );

  const shouldHideExpandIcons =
    !hasVariablesContainerSubChildren(props.variablesContainer) &&
    (props.inheritedVariablesContainer
      ? !hasVariablesContainerSubChildren(props.inheritedVariablesContainer)
      : true);
  const useStylesForSelectedTreeItem = makeStyles(() => ({
    root: {
      '& > .MuiTreeItem-content': {
        backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
      },
      '&.Mui-selected > .MuiTreeItem-content': {
        marginTop: 5,
        backgroundColor: gdevelopTheme.listItem.selectedBackgroundColor,
      },
      '&.Mui-selected > .MuiTreeItem-content > .MuiTreeItem-label': {
        backgroundColor: 'unset',
      },
      '&.isCollection > .MuiTreeItem-content > .MuiTreeItem-iconContainer': {
        backgroundColor: gdevelopTheme.listItem.selectedBackgroundColor,
      },
      '& > .MuiTreeItem-content > .MuiTreeItem-iconContainer': shouldHideExpandIcons
        ? {
            display: 'none',
          }
        : undefined,
    },
    group: {
      borderLeft: `1px solid ${gdevelopTheme.listItem.groupTextColor}`,
    },
  }));
  const selectedTreeItemClasses = useStylesForSelectedTreeItem();

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
    ? allVariablesNames
        .map(variableName => {
          if (!props.variablesContainer.has(variableName)) {
            return { text: variableName, value: variableName };
          }
          return null;
        })
        .filter(Boolean)
    : [];

  const _saveToHistory = () => {
    props.historyHandler
      ? props.historyHandler.saveToHistory()
      : setHistory(saveToHistory(history, props.variablesContainer));
  };

  const _undo = () => {
    props.historyHandler
      ? props.historyHandler.undo()
      : setHistory(undo(history, props.variablesContainer));
  };

  const _redo = () => {
    props.historyHandler
      ? props.historyHandler.redo()
      : setHistory(redo(history, props.variablesContainer));
  };
  const _canUndo = (): boolean =>
    props.historyHandler ? props.historyHandler.canUndo() : canUndo(history);

  const _canRedo = (): boolean =>
    props.historyHandler ? props.historyHandler.canRedo() : canRedo(history);

  const keyboardShortcuts = new KeyboardShortcuts({
    isActive: () => true,
    shortcutCallbacks: { onUndo: _undo, onRedo: _redo },
  });

  const copySelection = () => {
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
  };

  const pasteClipboardContent = () => {
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
          name,
          serializedVariable
        );
        newSelectedNodes.push(newName);
      } else {
        const targetNode = selectedNodes[0];
        if (targetNode.startsWith(inheritedPrefix)) return;

        const {
          name: targetVariableName,
          lineage: targetVariableLineage,
        } = getVariableContextFromNodeId(targetNode, props.variablesContainer);
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
            props.variablesContainer.getPosition(targetVariableName) + 1
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
    _saveToHistory();
    setSelectedNodes(newSelectedNodes);
  };

  const _deleteNode = (nodeId: string): boolean => {
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
  };

  const deleteNode = (nodeId: string): void => {
    const success = _deleteNode(nodeId);
    if (success) {
      _saveToHistory();
    }
  };

  const deleteSelection = () => {
    const deleteSuccesses = selectedNodes.map(_deleteNode);
    if (deleteSuccesses.some(Boolean)) {
      setSelectedNodes([]);
    }
  };

  const updateExpandedAndSelectedNodesFollowingNameChange = (
    oldNodeId: string,
    newName: string
  ) => {
    setExpandedNodes(
      updateListOfNodesFollowingChangeName(expandedNodes, oldNodeId, newName)
    );
    setSelectedNodes(
      updateListOfNodesFollowingChangeName(selectedNodes, oldNodeId, newName)
    );
    if (!!searchText) {
      setSearchMatchingNodes(
        updateListOfNodesFollowingChangeName(
          searchMatchingNodes,
          oldNodeId,
          newName
        )
      );
    }
  };

  const updateExpandedAndSelectedNodesFollowingNodeMove = (
    oldNodeId: string,
    newParentNodeId: string,
    newName: string
  ) => {
    // TODO: Recompute list of selected nodes following a node move that changes all the values of an array.
    setSelectedNodes([]);
    const inheritedExpandedNodes = expandedNodes.filter(nodeId =>
      nodeId.startsWith(inheritedPrefix)
    );
    setExpandedNodes([
      ...inheritedExpandedNodes,
      ...getExpandedNodeIdsFromVariablesContainer(props.variablesContainer),
    ]);
    if (!!searchText) {
      triggerSearch();
      forceUpdate();
    }
  };

  const canDrop = (nodeId: string): boolean => {
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
  };

  const dropNode = (nodeId: string): void => {
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
    const { lineage: targetLineage, name: targetName } = targetVariableContext;
    const targetVariableParentVariable = getDirectParentVariable(targetLineage);
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
          draggedName,
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
      _saveToHistory();
      forceUpdate();
    }
  };

  const onAddChild = (nodeId: string) => {
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
    _saveToHistory();
    if (variable.isFolded()) variable.setFolded(false);
    setExpandedNodes([...expandedNodes, nodeId]);
  };

  const editInheritedVariable = (nodeId: string): void => {
    if (!props.inheritedVariablesContainer) return;
    const {
      variable: inheritedVariable,
      name: inheritedVariableName,
    } = getVariableContextFromNodeId(nodeId, props.inheritedVariablesContainer);
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
    _saveToHistory();
    setSelectedNodes([inheritedVariableName]);
    setExpandedNodes([...expandedNodes, inheritedVariableName]);
    newVariable.delete();
  };

  const onAdd = () => {
    const addAtTopLevel =
      selectedNodes.length === 0 ||
      selectedNodes.some(node => node.startsWith(inheritedPrefix));

    if (addAtTopLevel) {
      const { name: newName, variable } = insertInVariablesContainer(
        props.variablesContainer,
        'Variable',
        null,
        props.variablesContainer.count()
      );
      _saveToHistory();
      setSelectedNodes([newName]);
      setVariablePtrToFocus(variable.ptr);
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
      position = props.variablesContainer.getPosition(oldestAncestry.name) + 1;
    }
    const { name: newName, variable } = insertInVariablesContainer(
      props.variablesContainer,
      'Variable',
      null,
      position
    );
    _saveToHistory();
    setSelectedNodes([newName]);
    setVariablePtrToFocus(variable.ptr);
  };

  const renderVariableAndChildrenRows = (
    {
      name,
      variable,
      parentNodeId,
      parentVariable,
      isInherited,
    }: {|
      name: string,
      variable: gdVariable,
      parentNodeId?: string,
      parentVariable?: gdVariable,
      isInherited: boolean,
    |},
    i18n: I18nType
  ) => {
    const isCollection = isCollectionVariable(variable);
    const type = variable.getType();

    const depth = parentNodeId ? parentNodeId.split(separator).length : 0;
    const isTopLevel = depth === 0;
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

    let parentType = null;
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
    if (!!parentVariable) {
      parentType = parentVariable.getType();
    }
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
        return null;
      }
    }

    const valueInputStyle = {};
    if (type === gd.Variable.String) {
      // By default, Material-UI adds some padding on top and bottom of a multiline text field.
      // Avoid this to prevent extra spaces that would make single line strings
      // (for variable values) not aligned with the variable name
      valueInputStyle.padding = 0;
    }
    if (isSelected) {
      valueInputStyle.color = gdevelopTheme.listItem.selectedTextColor;
    }

    return (
      <DragSourceAndDropTarget
        key={variable.ptr}
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
        {({ connectDragSource, connectDropTarget, isOver, canDrop }) => (
          <StyledTreeItem
            tabIndex={-1} // necessary because MUI sets tabindex=0 on selected li, adding unnecessary additional step for tab nav
            nodeId={nodeId}
            className={
              isCollection && variable.getChildrenCount() > 0
                ? 'isCollection'
                : ''
            }
            classes={selectedTreeItemClasses}
            label={connectDropTarget(
              <div>
                {isOver && <DropIndicator canDrop={canDrop} />}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: isNarrow ? '4px 4px 4px 0px' : '6px 30px 6px 6px',
                  }}
                >
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
                    width={shouldWrap ? 'small' : undefined}
                  >
                    <Line alignItems="center" noMargin expand>
                      {shouldWrap ? null : <Spacer />}
                      <SemiControlledAutoComplete
                        fullWidth
                        ref={element => {
                          if (depth === 0 && element) {
                            topLevelVariableNameInputRefs.current[
                              variable.ptr
                            ] = element;
                          }
                        }}
                        commitOnInputChange={!props.commitChangesOnBlur}
                        dataSource={isTopLevel ? undefinedVariableNames : []}
                        margin="none"
                        key="name"
                        disabled={
                          isInherited || parentType === gd.Variable.Array
                        }
                        onClick={stopEventPropagation}
                        errorText={nameErrors[variable.ptr]}
                        onChange={newValue => {
                          onChangeName(nodeId, newValue, depth);
                          if (nameErrors[variable.ptr]) {
                            const newNameErrors = { ...nameErrors };
                            delete newNameErrors[variable.ptr];
                            setNameErrors(newNameErrors);
                          }
                          forceUpdate();
                        }}
                        inputStyle={{
                          color: isSelected
                            ? gdevelopTheme.listItem.selectedTextColor
                            : gdevelopTheme.listItem.textColor,
                          fontStyle: overwritesInheritedVariable
                            ? 'italic'
                            : undefined,
                        }}
                        value={name}
                        onBlur={event => {
                          onChangeName(
                            nodeId,
                            event.currentTarget.value,
                            depth
                          );
                          if (nameErrors[variable.ptr]) {
                            const newNameErrors = { ...nameErrors };
                            delete newNameErrors[variable.ptr];
                            setNameErrors(newNameErrors);
                          }
                          forceUpdate();
                        }}
                      />
                      <Spacer />
                    </Line>
                    <div style={shouldWrap ? undefined : rowRightSideStyle}>
                      <Line noMargin alignItems="center">
                        <Column noMargin>
                          <VariableTypeSelector
                            variableType={type}
                            onChange={newType => {
                              onChangeType(nodeId, newType);
                              forceUpdate();
                            }}
                            isHighlighted={isSelected}
                            disabled={isInherited}
                          />
                        </Column>
                        <Column expand>
                          {type === gd.Variable.Boolean ? (
                            <Line noMargin>
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
                                {variable.getBool() ? (
                                  <Trans>True</Trans>
                                ) : (
                                  <Trans>False</Trans>
                                )}
                              </span>
                              {isInherited && !isTopLevel ? null : (
                                <>
                                  <Spacer />
                                  <IconButton
                                    size="small"
                                    style={styles.inlineIcon}
                                    onClick={() => {
                                      onChangeValue(
                                        nodeId,
                                        !variable.getBool() ? 'true' : 'false'
                                      );
                                    }}
                                    tooltip={
                                      !variable.getBool()
                                        ? t`Set to true`
                                        : t`Set to false`
                                    }
                                  >
                                    <SwapHorizontal
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
                            <SemiControlledTextField
                              margin="none"
                              type={
                                type === gd.Variable.Number ? 'number' : 'text'
                              }
                              key="value"
                              onClick={stopEventPropagation}
                              multiline={type === gd.Variable.String}
                              inputStyle={valueInputStyle}
                              disabled={
                                isCollection || (isInherited && !isTopLevel)
                              }
                              onChange={newValue => {
                                onChangeValue(nodeId, newValue);
                                forceUpdate();
                              }}
                              value={
                                isCollection
                                  ? i18n._(
                                      t`${variable.getChildrenCount()} children`
                                    )
                                  : type === gd.Variable.String
                                  ? variable.getString()
                                  : variable.getValue().toString()
                              }
                              commitOnBlur={props.commitChangesOnBlur}
                            />
                          )}
                        </Column>
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
                            <Replay
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
              </div>
            )}
            onLabelClick={preventEventDefaultEffect}
          >
            {!isCollection
              ? null
              : type === gd.Variable.Structure
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
                      },
                      i18n
                    );
                  })
              : mapFor(0, variable.getChildrenCount(), index => {
                  const childVariable = variable.getAtIndex(index);
                  return renderVariableAndChildrenRows(
                    {
                      name: index.toString(),
                      variable: childVariable,
                      parentNodeId: nodeId,
                      parentVariable: variable,
                      isInherited,
                    },
                    i18n
                  );
                })}
          </StyledTreeItem>
        )}
      </DragSourceAndDropTarget>
    );
  };

  const onNodeToggle = (event, values) => {
    // Inherited variables should not be modified
    const instanceExpandedNodes = expandedNodes.filter(
      node => !node.startsWith(inheritedPrefix)
    );
    const instanceNewExpandedNodes = values.filter(
      node => !node.startsWith(inheritedPrefix)
    );
    const foldedNodes = instanceExpandedNodes.filter(
      node => !instanceNewExpandedNodes.includes(node)
    );
    const unfoldedNodes = instanceNewExpandedNodes.filter(
      node => !instanceExpandedNodes.includes(node)
    );
    foldNodesVariables(props.variablesContainer, foldedNodes, true);
    foldNodesVariables(props.variablesContainer, unfoldedNodes, false);
    setExpandedNodes(values);
  };

  const onChangeName = (nodeId: string, newName: ?string, depth: number) => {
    const { variable, lineage, name } = getVariableContextFromNodeId(
      nodeId,
      props.variablesContainer
    );
    if (name === null) return;
    if (!!variable && !!newName) {
      if (newName.startsWith(inheritedPrefix) || newName.includes(separator)) {
        setNameErrors({
          ...nameErrors,
          [variable.ptr]: (
            <Trans>
              Variables cannot have a name that includes {inheritedPrefix} or{' '}
              {separator}
            </Trans>
          ),
        });
        return;
      }
      if (depth === 0 && !newName.match(/[\p{L}_][\p{L}0-9_]*$/u)) {
        setNameErrors({
          ...nameErrors,
          [variable.ptr]: (
            <Trans>
              Top variable names can contain letters from any alphabet, digits
              and "_" character and cannot start with a digit.
            </Trans>
          ),
        });
        return;
      }
    }
    if (!newName) {
      if (!!variable) {
        setNameErrors({
          ...nameErrors,
          [variable.ptr]: <Trans>Variables cannot have empty names</Trans>,
        });
      }
      return;
    }

    if (newName === name) return;

    let hasBeenRenamed = false;
    const parentVariable = getDirectParentVariable(lineage);
    if (!parentVariable) {
      hasBeenRenamed = props.variablesContainer.rename(name, newName);
    } else {
      hasBeenRenamed = parentVariable.renameChild(name, newName);
    }
    if (hasBeenRenamed) {
      _saveToHistory();
      updateExpandedAndSelectedNodesFollowingNameChange(nodeId, newName);
    } else {
      if (variable)
        setNameErrors({
          ...nameErrors,
          [variable.ptr]: (
            <Trans>The variable name {newName} is already taken</Trans>
          ),
        });
    }
  };

  const onChangeType = (nodeId: string, newType: string) => {
    const { variable } = getVariableContextFromNodeId(
      nodeId,
      props.variablesContainer
    );
    if (!variable) return;
    variable.castTo(newType);
    _saveToHistory();
  };

  const onChangeValue = (nodeId: string, newValue: string) => {
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
      const newSelectedNodes = [...selectedNodes];
      const isVariableSelected = newSelectedNodes.indexOf(nodeId) !== -1;
      if (isVariableSelected) {
        newSelectedNodes.splice(newSelectedNodes.indexOf(nodeId), 1, name);
        setSelectedNodes(newSelectedNodes);
      } else {
        setSelectedNodes([...newSelectedNodes, name]);
      }
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
    _saveToHistory();
    forceUpdate();
  };

  const renderTree = (i18n: I18nType, isInherited: boolean = false) => {
    const variablesContainer =
      isInherited && props.inheritedVariablesContainer
        ? props.inheritedVariablesContainer
        : props.variablesContainer;
    const containerVariablesTree = mapFor(
      0,
      variablesContainer.count(),
      index => {
        const variable = variablesContainer.getAt(index);
        const name = variablesContainer.getNameAt(index);
        if (isInherited) {
          if (props.variablesContainer.has(name)) {
            return null;
          }
        }

        return renderVariableAndChildrenRows(
          {
            name,
            variable,
            isInherited,
          },
          i18n
        );
      }
    );
    return containerVariablesTree;
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
    />
  );

  return (
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
                <Column expand useFullHeight>
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
                        />
                      ) : null}
                    </Column>
                  ) : (
                    <ScrollView autoHideScrollbar>
                      <TreeView
                        multiSelect
                        defaultExpandIcon={<ChevronRight />}
                        defaultCollapseIcon={<ExpandMore />}
                        onNodeSelect={(event, values) =>
                          setSelectedNodes(values)
                        }
                        onNodeToggle={onNodeToggle}
                        selected={selectedNodes}
                        expanded={expandedNodes}
                      >
                        {props.inheritedVariablesContainer
                          ? renderTree(i18n, true)
                          : null}
                        {renderTree(i18n)}
                      </TreeView>
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
  );
};

export default VariablesList;
