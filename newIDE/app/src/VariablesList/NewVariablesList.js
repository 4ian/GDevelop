// @flow
import * as React from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Add from '@material-ui/icons/Add';
import SwapHorizontal from '@material-ui/icons/SwapHoriz';
import Copy from '../UI/CustomSvgIcons/Copy';
import Paste from '../UI/CustomSvgIcons/Paste';
import Delete from '@material-ui/icons/Delete';
import { mapFor } from '../Utils/MapFor';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { Column, Line, Spacer } from '../UI/Grid';
import Checkbox from '../UI/Checkbox';
import DragHandle from '../UI/DragHandle';
import useForceUpdate from '../Utils/UseForceUpdate';
import { Trans } from '@lingui/macro';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import DropIndicator from '../UI/SortableVirtualizedItemList/DropIndicator';
import VariableTypeSelector from './VariableTypeSelector';
import IconButton from '../UI/IconButton';
import { makeStyles, withStyles } from '@material-ui/styles';
import styles from './styles';
import newNameGenerator from '../Utils/NewNameGenerator';
import Toggle from '../UI/Toggle';
import Measure from 'react-measure';
import RaisedButton from '../UI/RaisedButton';
import FlatButton from '../UI/FlatButton';
import Clipboard, { SafeExtractor } from '../Utils/Clipboard';
import { CLIPBOARD_KIND } from './ClipboardKind';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import ScrollView from '../UI/ScrollView';
import GDevelopThemeContext from '../UI/Theme/ThemeContext';
const gd: libGDevelop = global.gd;

const stopEventPropagation = (event: Event) => event.stopPropagation();
const preventEventDefaultEffect = (event: Event) => event.preventDefault();

type Props = {
  variablesContainer: gdVariablesContainer,
};
const getExpandedNodeIdsFromVariables = (
  variables: { name: string, variable: gdVariable }[],
  accumulator: string[],
  parentNodeId: string = ''
): string[] => {
  let newAccumulator = [];
  for (const { name, variable } of variables) {
    const nodeId = parentNodeId ? `${parentNodeId}.${name}` : name;
    if (!variable.isFolded() && variable.getChildrenCount() > 0) {
      newAccumulator.push(nodeId);
    }
    if (variable.getType() === gd.Variable.Array) {
      const children = mapFor(0, variable.getChildrenCount(), index => ({
        name: index.toString(),
        variable: variable.getAtIndex(index),
      }));
      newAccumulator = [
        ...newAccumulator,
        ...getExpandedNodeIdsFromVariables(children, newAccumulator, nodeId),
      ];
    } else if (variable.getType() === gd.Variable.Structure) {
      const children = variable
        .getAllChildrenNames()
        .toJSArray()
        .map((childName, index) => ({
          variable: variable.getChild(childName),
          name: childName,
        }));
      newAccumulator = [
        ...newAccumulator,
        ...getExpandedNodeIdsFromVariables(children, newAccumulator, nodeId),
      ];
    }
  }
  return newAccumulator;
};

const getExpandedNodeIdsFromVariablesContainer = (
  variablesContainer: gdVariablesContainer
): string[] => {
  const variables = [];
  for (let index = 0; index < variablesContainer.count(); index += 1) {
    variables.push({
      name: variablesContainer.getNameAt(index),
      variable: variablesContainer.getAt(index),
    });
  }
  return getExpandedNodeIdsFromVariables(variables, []);
};

const foldNodesVariables = (
  variablesContainer: gdVariablesContainer,
  nodes: string[],
  fold: boolean
) => {
  nodes.forEach(nodeId => {
    const { variable } = getVariableContextFromNodeId(
      nodeId,
      variablesContainer
    );
    if (variable) {
      variable.setFolded(fold);
    }
  });
};

const StyledTreeItem = withStyles(() => ({
  group: {
    borderLeft: `1px solid black`,
    marginLeft: 7,
    paddingLeft: 15,
  },
  label: { padding: 0 },
}))(props => <TreeItem {...props} TransitionProps={{ timeout: 0 }} />);

const insertInVariablesContainer = (
  variablesContainer: gdVariablesContainer,
  name: string,
  serializedVariable: ?any,
  index: ?number
): string => {
  const newName = newNameGenerator(
    name,
    name => variablesContainer.has(name),
    serializedVariable ? 'CopyOf' : undefined
  );
  const newVariable = new gd.Variable();
  if (serializedVariable) {
    unserializeFromJSObject(newVariable, serializedVariable);
  } else {
    newVariable.setString('');
  }
  variablesContainer.insert(
    newName,
    newVariable,
    index || variablesContainer.count()
  );
  newVariable.delete();
  return newName;
};

const insertInVariableChildrenArray = (
  targetParentVariable: gdVariable,
  serializedVariable: any,
  index: number
) => {
  const newVariable = new gd.Variable();
  unserializeFromJSObject(newVariable, serializedVariable);
  targetParentVariable.insertInArray(newVariable, index);
  newVariable.delete();
};

const insertInVariableChildren = (
  targetParentVariable: gdVariable,
  name: string,
  serializedVariable: any
): string => {
  const newName = newNameGenerator(
    name,
    _name => targetParentVariable.hasChild(_name),
    'CopyOf'
  );
  const newVariable = new gd.Variable();
  unserializeFromJSObject(newVariable, serializedVariable);
  targetParentVariable.insertChild(newName, newVariable);
  newVariable.delete();
  return newName;
};

const getDirectParentVariable = lineage =>
  lineage[lineage.length - 1] ? lineage[lineage.length - 1].variable : null;
const getOldestAncestryVariable = lineage =>
  lineage.length ? lineage[0] : null;

const getVariableContextFromNodeId = (
  nodeId: string,
  variablesContainer: gdVariablesContainer
) => {
  const nodes = nodeId.split('.');
  let parentVariable = null;
  let currentVariable = null;
  let currentVariableName = null;
  let lineage = [];
  let name = null;
  let depth = -1;

  while (depth < nodes.length - 1) {
    depth += 1;
    currentVariableName = nodes[depth];
    if (!parentVariable) {
      currentVariable = variablesContainer.get(currentVariableName);
    } else {
      if (parentVariable.getType() === gd.Variable.Array) {
        const index = parseInt(currentVariableName, 10);
        if (index >= parentVariable.getChildrenCount()) {
          return { variable: null, lineage, depth, name };
        }
        currentVariable = parentVariable.getAtIndex(index);
      } else {
        if (!parentVariable.hasChild(currentVariableName)) {
          return { variable: null, lineage, depth, name };
        }
        currentVariable = parentVariable.getChild(currentVariableName);
      }
    }
    if (depth < nodes.length - 1) {
      lineage.push({
        nodeId: nodes.slice(0, depth + 1).join('.'),
        name: currentVariableName,
        variable: currentVariable,
      });
    }
    parentVariable = currentVariable;
  }
  return {
    variable: currentVariable,
    name: currentVariableName,
    depth,
    lineage,
  };
};

type MovementType =
  | 'TopLevelToStructure'
  | 'InsideTopLevel'
  | 'StructureToTopLevel'
  | 'ArrayToTopLevel'
  | 'FromStructureToAnotherStructure'
  | 'InsideSameStructure'
  | 'FromArrayToAnotherArray'
  | 'InsideSameArray'
  | 'FromStructureToArray'
  | 'FromArrayToStructure';

const getMovementType = (
  draggedVariableContext,
  targetVariableContext
): ?MovementType => {
  const { lineage: targetVariableLineage } = targetVariableContext;
  const targetVariableParentVariable = getDirectParentVariable(
    targetVariableLineage
  );

  const { lineage: draggedVariableLineage } = draggedVariableContext;
  const draggedVariableParentVariable = getDirectParentVariable(
    draggedVariableLineage
  );

  if (!!draggedVariableParentVariable && !!targetVariableParentVariable) {
    if (
      targetVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable !== targetVariableParentVariable
    )
      return 'FromStructureToAnotherStructure';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable === targetVariableParentVariable
    )
      return 'InsideSameStructure';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable !== targetVariableParentVariable
    )
      return 'FromArrayToAnotherArray';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable === targetVariableParentVariable
    )
      return 'InsideSameArray';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Array &&
      draggedVariableParentVariable.getType() === gd.Variable.Structure
    )
      return 'FromStructureToArray';
    if (
      targetVariableParentVariable.getType() === gd.Variable.Structure &&
      draggedVariableParentVariable.getType() === gd.Variable.Array
    )
      return 'FromArrayToStructure';
  }

  if (!draggedVariableParentVariable && !targetVariableParentVariable)
    return 'InsideTopLevel';
  if (
    !draggedVariableParentVariable &&
    !!targetVariableParentVariable &&
    targetVariableParentVariable.getType() === gd.Variable.Structure
  )
    return 'TopLevelToStructure';
  if (
    !!draggedVariableParentVariable &&
    !targetVariableParentVariable &&
    draggedVariableParentVariable.getType() === gd.Variable.Structure
  )
    return 'StructureToTopLevel';
  if (
    !!draggedVariableParentVariable &&
    !targetVariableParentVariable &&
    draggedVariableParentVariable.getType() === gd.Variable.Array
  )
    return 'ArrayToTopLevel';

  return null;
};

const isCollection = (variable: gdVariable): boolean =>
  !gd.Variable.isPrimitive(variable.getType());

const NewVariablesList = (props: Props) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Array<string>>(
    getExpandedNodeIdsFromVariablesContainer(props.variablesContainer)
  );
  const [selectedNodes, setSelectedNodes] = React.useState<Array<string>>([]);
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const draggedNodeId = React.useRef<?string>(null);
  const forceUpdate = useForceUpdate();

  const rowRightSideStyle = React.useMemo(
    () => ({
      minWidth: containerWidth ? Math.round(0.6 * containerWidth) : 600,
      flexShrink: 0,
    }),
    [containerWidth]
  );

  const copySelection = () => {
    Clipboard.set(
      CLIPBOARD_KIND,
      selectedNodes
        .map(nodeId => {
          const { variable, name, lineage } = getVariableContextFromNodeId(
            nodeId,
            props.variablesContainer
          );
          if (!variable || !name) return;
          let parentType;

          const parentVariable = getDirectParentVariable(lineage);
          if (!parentVariable) {
            parentType = gd.Variable.Structure;
          } else {
            parentType = parentVariable.getType();
          }
          return {
            name,
            serializedVariable: serializeToJSObject(variable),
            parentType,
          };
        })
        .filter(Boolean)
    );
    forceUpdate();
  };

  const pasteSelection = () => {
    if (!Clipboard.has(CLIPBOARD_KIND)) return;
    const newSelectedNodes = [];

    const clipboardContent = Clipboard.get(CLIPBOARD_KIND);
    const variablesContent = SafeExtractor.extractArray(clipboardContent);
    if (!variablesContent) return;

    let pastedElementOffsetIndex = 0;

    variablesContent.forEach(variableContent => {
      const name = SafeExtractor.extractStringProperty(variableContent, 'name');
      const serializedVariable = SafeExtractor.extractObjectProperty(
        variableContent,
        'serializedVariable'
      );
      const parentType = SafeExtractor.extractNumberProperty(
        variableContent,
        'parentType'
      );
      if (!name || !serializedVariable || !parentType) return;

      const pasteAtTopLevel = selectedNodes.length === 0;

      if (pasteAtTopLevel) {
        if (parentType === gd.Variable.Array) return;
        const newName = insertInVariablesContainer(
          props.variablesContainer,
          name,
          serializedVariable
        );
        newSelectedNodes.push(newName);
      } else {
        const targetNode = selectedNodes[0];
        const {
          name: targetVariableName,
          lineage: targetVariableLineage,
        } = getVariableContextFromNodeId(targetNode, props.variablesContainer);
        if (!targetVariableName) return;
        const targetParentVariable = getDirectParentVariable(
          targetVariableLineage
        );
        if (!targetParentVariable) {
          if (parentType === gd.Variable.Array) return;
          const newName = insertInVariablesContainer(
            props.variablesContainer,
            name,
            serializedVariable,
            props.variablesContainer.getPosition(targetVariableName) + 1
          );
          newSelectedNodes.push(newName);
        } else {
          const targetParentType = targetParentVariable.getType();
          if (targetParentType !== parentType) return;
          if (targetParentType === gd.Variable.Array) {
            const index = parseInt(targetVariableName, 10) + 1;
            insertInVariableChildrenArray(
              targetParentVariable,
              serializedVariable,
              index
            );
            const nodes = targetNode.split('.');
            nodes.splice(
              nodes.length - 1,
              1,
              (index + pastedElementOffsetIndex).toString()
            );

            newSelectedNodes.push(nodes.join('.'));
            pastedElementOffsetIndex += 1;
          } else {
            const newName = insertInVariableChildren(
              targetParentVariable,
              name,
              serializedVariable
            );
            const nodes = targetNode.split('.');
            nodes.splice(nodes.length - 1, 1, newName);
            newSelectedNodes.push(nodes.join('.'));
          }
        }
      }
    });
    setSelectedNodes(newSelectedNodes);
  };

  const deleteSelection = () => {
    selectedNodes.forEach(nodeId => {
      const { name, lineage } = getVariableContextFromNodeId(
        nodeId,
        props.variablesContainer
      );
      if (!name) return;
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
    });
    setSelectedNodes([]);
  };

  const renameExpandedNode = (nodeId: string, newName: string) => {
    const newExpandedNodes: Array<string> = [...expandedNodes];
    const index = newExpandedNodes.indexOf(nodeId);
    if (index === -1) return;
    const oldNodeId = newExpandedNodes.splice(index, 1)[0];
    const nodes = oldNodeId.split('.');
    nodes[nodes.length - 1] = newName;
    setExpandedNodes([...newExpandedNodes, nodes.join('.')]);
  };

  const DragSourceAndDropTarget = React.useMemo(
    () => makeDragSourceAndDropTarget('variable-editor'),
    []
  );

  const variableTypeToLabel = {
    [gd.Variable.String]: <Trans>String</Trans>,
    [gd.Variable.Number]: <Trans>Number</Trans>,
    [gd.Variable.Boolean]: <Trans>Boolean</Trans>,
    [gd.Variable.Structure]: <Trans>Structure</Trans>,
    [gd.Variable.Array]: <Trans>Array</Trans>,
  };

  const canDrop = (nodeId: string): boolean => {
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

    const targetLineageVariables = targetLineage.map(
      context => context.variable
    );
    if (targetLineageVariables.includes(draggedVariable)) return false;

    const movementType = getMovementType(
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
      default:
        return false;
    }
  };

  const dropNode = (nodeId: string): void => {
    const { current } = draggedNodeId;
    if (!current) return;

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

    const targetLineageVariables = targetLineage.map(
      context => context.variable
    );
    if (targetLineageVariables.includes(draggedVariable)) return;

    const movementType = getMovementType(
      draggedVariableContext,
      targetVariableContext
    );
    let newName;
    let draggedIndex;
    let targetIndex;

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
        break;
      case 'FromArrayToAnotherArray':
        draggedIndex = parseInt(draggedName, 10);
        targetIndex = parseInt(targetName, 10);

        // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
        targetVariableParentVariable.insertInArray(
          draggedVariable,
          targetIndex
        );

        // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
        draggedVariableParentVariable.removeAtIndex(draggedIndex);
        break;
      case 'InsideSameArray':
        draggedIndex = parseInt(draggedName, 10);
        targetIndex = parseInt(targetName, 10);
        // $FlowFixMe - Regarding movement type, we are confident that the variable will exist
        targetVariableParentVariable.moveChildInArray(
          draggedIndex,
          targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
        );
        break;
      case 'FromStructureToArray':
      case 'FromArrayToStructure':
      case 'ArrayToTopLevel':
      case 'InsideSameStructure':
      default:
        return;
    }

    forceUpdate();
  };

  const onAddChild = (nodeId: string) => {
    const { variable } = getVariableContextFromNodeId(
      nodeId,
      props.variablesContainer
    );
    if (!variable || !isCollection(variable)) return;
    const type = variable.getType();

    if (type === gd.Variable.Structure) {
      const name = newNameGenerator('ChildVariable', name =>
        variable.hasChild(name)
      );
      variable.getChild(name).setString('');
    } else if (type === gd.Variable.Array) variable.pushNew();
    setExpandedNodes([...expandedNodes, nodeId]);
  };

  const onAdd = () => {
    const addAtTopLevel = selectedNodes.length === 0;

    if (addAtTopLevel) {
      const newName = insertInVariablesContainer(
        props.variablesContainer,
        'Variable',
        null,
        props.variablesContainer.count()
      );
      setSelectedNodes([newName]);
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
    const newName = insertInVariablesContainer(
      props.variablesContainer,
      'Variable',
      null,
      position
    );
    setSelectedNodes([newName]);
  };

  const renderVariableAndChildrenRows = ({
    name,
    variable,
    parentNodeId,
    parentVariable,
  }: {|
    name: string,
    variable: gdVariable,
    parentNodeId?: string,
    parentVariable?: gdVariable,
  |}) => {
    const type = variable.getType();
    const isCollection = !gd.Variable.isPrimitive(type);

    let parentType = null;
    let nodeId = name;

    if (!!parentNodeId) {
      nodeId = `${parentNodeId}.${name}`;
    }
    if (!!parentVariable) {
      parentType = parentVariable.getType();
    }
    const isSelected = selectedNodes.includes(nodeId);

    return (
      <DragSourceAndDropTarget
        key={variable.ptr}
        beginDrag={() => {
          draggedNodeId.current = nodeId;
          return {};
        }}
        canDrag={() => true}
        canDrop={() => canDrop(nodeId)}
        drop={() => {
          dropNode(nodeId);
        }}
      >
        {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
          connectDropTarget(
            <div>
              <StyledTreeItem
                nodeId={nodeId}
                label={
                  <div
                    style={
                      isSelected
                        ? {
                            backgroundColor:
                              gdevelopTheme.listItem.selectedBackgroundColor,
                          }
                        : undefined
                    }
                  >
                    {isOver && <DropIndicator canDrop={canDrop} />}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px 30px 6px 6px',
                      }}
                    >
                      {connectDragSource(
                        <span>
                          <DragHandle
                            color={
                              isSelected
                                ? gdevelopTheme.listItem.selectedTextColor
                                : '#AAA'
                            }
                          />
                        </span>
                      )}
                      <Spacer />
                      <SemiControlledTextField
                        fullWidth
                        margin="none"
                        key="name"
                        disabled={parentType === gd.Variable.Array}
                        commitOnBlur
                        onClick={stopEventPropagation}
                        errorText={nameErrors[variable.ptr]}
                        onChange={() => {
                          if (nameErrors[variable.ptr]) {
                            const newNameErrors = { ...nameErrors };
                            delete newNameErrors[variable.ptr];
                            setNameErrors(newNameErrors);
                          }
                        }}
                        inputStyle={
                          isSelected
                            ? {
                                color: gdevelopTheme.listItem.selectedTextColor,
                              }
                            : undefined
                        }
                        value={name}
                        onBlur={event => {
                          onChangeName(nodeId, event.currentTarget.value);
                          forceUpdate();
                        }}
                      />
                      <Spacer />
                      <Spacer />
                      <div style={rowRightSideStyle}>
                        <Line noMargin alignItems="center">
                          <Column noMargin>
                            <VariableTypeSelector
                              variableType={type}
                              onChange={newType => {
                                variable.castTo(newType);
                                forceUpdate();
                              }}
                              isHighlighted={isSelected}
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
                                <Spacer />
                                <IconButton
                                  size="small"
                                  style={{ padding: 0 }}
                                  onClick={() => {
                                    onChangeValue(
                                      nodeId,
                                      !variable.getBool() ? 'true' : 'false'
                                    );
                                  }}
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
                              </Line>
                            ) : (
                              <SemiControlledTextField
                                margin="none"
                                type={
                                  type === gd.Variable.Number
                                    ? 'number'
                                    : 'text'
                                }
                                key="value"
                                onClick={stopEventPropagation}
                                multiline={type === gd.Variable.String}
                                inputStyle={{
                                  ...(type === gd.Variable.String
                                    ? styles.noPaddingMultilineTextField
                                    : undefined),
                                  ...(isSelected
                                    ? {
                                        color:
                                          gdevelopTheme.listItem
                                            .selectedTextColor,
                                      }
                                    : undefined),
                                }}
                                disabled={isCollection}
                                value={
                                  isCollection
                                    ? `${variable.getChildrenCount()} children`
                                    : type === gd.Variable.String
                                    ? variable.getString()
                                    : variable.getValue().toString()
                                }
                                onChange={value => {
                                  onChangeValue(nodeId, value);
                                  forceUpdate();
                                }}
                              />
                            )}
                          </Column>
                          {isCollection ? (
                            <IconButton
                              size="small"
                              style={{ padding: 0 }}
                              onClick={() => onAddChild(nodeId)}
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
                        </Line>
                      </div>
                    </div>
                  </div>
                }
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
                        return renderVariableAndChildrenRows({
                          name: childName,
                          variable: childVariable,
                          parentNodeId: nodeId,
                          parentVariable: variable,
                        });
                      })
                  : mapFor(0, variable.getChildrenCount(), index => {
                      const childVariable = variable.getAtIndex(index);
                      return renderVariableAndChildrenRows({
                        name: index.toString(),
                        variable: childVariable,
                        parentNodeId: nodeId,
                        parentVariable: variable,
                      });
                    })}
              </StyledTreeItem>
            </div>
          )
        }
      </DragSourceAndDropTarget>
    );
  };

  const onChangeName = (nodeId: string, newName: ?string) => {
    const { variable, lineage, name } = getVariableContextFromNodeId(
      nodeId,
      props.variablesContainer
    );
    if (name === null) return;
    if (!newName) {
      if (variable) {
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
      renameExpandedNode(nodeId, newName);
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

  const onChangeValue = (nodeId: string, newValue: string) => {
    const { variable } = getVariableContextFromNodeId(
      nodeId,
      props.variablesContainer
    );
    if (!variable) return;
    switch (variable.getType()) {
      case gd.Variable.String:
        variable.setString(newValue);
        break;
      case gd.Variable.Number:
        variable.setValue(parseFloat(newValue));
        break;
      case gd.Variable.Boolean:
        variable.setBool(newValue === 'true');
        forceUpdate();
        break;
      default:
        console.error(
          `Cannot set variable with type ${variable.getType()} - are you sure it's a primitive type?`
        );
    }
  };

  const renderTree = (variablesContainer: gdVariablesContainer) => {
    const containerVariablesTree = mapFor(
      0,
      variablesContainer.count(),
      index => {
        const variable = variablesContainer.getAt(index);
        const name = variablesContainer.getNameAt(index);

        return renderVariableAndChildrenRows({ name, variable });
      }
    );
    return containerVariablesTree;
  };

  return (
    <Measure
      bounds
      onResize={contentRect => {
        setContainerWidth(contentRect.bounds.width);
      }}
    >
      {({ contentRect, measureRef }) => (
        <>
          <Column expand noMargin>
            <Line noMargin justifyContent="space-between">
              <Column noMargin>
                <Line noMargin>
                  <FlatButton
                    icon={<Copy />}
                    label={<Trans>Copy</Trans>}
                    onClick={copySelection}
                  />
                  <Spacer />
                  <FlatButton
                    icon={<Paste />}
                    label={<Trans>Paste</Trans>}
                    disabled={!Clipboard.has(CLIPBOARD_KIND)}
                    onClick={pasteSelection}
                  />
                  <Spacer />
                  <FlatButton
                    icon={<Delete />}
                    label={<Trans>Delete</Trans>}
                    disabled={selectedNodes.length === 0}
                    onClick={deleteSelection}
                  />
                </Line>
              </Column>
              <Column>
                <FlatButton
                  primary
                  onClick={onAdd}
                  label={<Trans>Add variable</Trans>}
                  icon={<Add />}
                />
              </Column>
            </Line>
            <ScrollView autoHideScrollbar>
              <TreeView
                ref={measureRef}
                multiSelect
                defaultExpandIcon={<ChevronRight />}
                defaultCollapseIcon={<ExpandMore />}
                onNodeSelect={(event, values) => setSelectedNodes(values)}
                onNodeToggle={(event, values) => {
                  const foldedNodes = expandedNodes.filter(
                    node => !values.includes(node)
                  );
                  const unfoldedNodes = values.filter(
                    node => !expandedNodes.includes(node)
                  );
                  foldNodesVariables(
                    props.variablesContainer,
                    foldedNodes,
                    true
                  );
                  foldNodesVariables(
                    props.variablesContainer,
                    unfoldedNodes,
                    false
                  );
                  setExpandedNodes(values);
                }}
                selected={selectedNodes}
                expanded={expandedNodes}
              >
                {renderTree(props.variablesContainer)}
              </TreeView>
            </ScrollView>
          </Column>
        </>
      )}
    </Measure>
  );
};

export default NewVariablesList;
