// @flow
import * as React from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Add from '@material-ui/icons/Add';
import SwapHorizontal from '@material-ui/icons/SwapHoriz';
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
import Background from '../UI/Background';
import IconButton from '../UI/IconButton';
import { makeStyles } from '@material-ui/styles';
import styles from './styles';
import newNameGenerator from '../Utils/NewNameGenerator';
import Toggle from '../UI/Toggle';
import Measure from 'react-measure';
const gd: libGDevelop = global.gd;

const useStyles = makeStyles({
  group: {
    borderLeft: `1px solid black`,
    marginLeft: 7,
    paddingLeft: 15,
  },
  label: { padding: 0 },
});

const stopEventPropagation = (event: Event) => event.stopPropagation();
const preventEventDefaultEffect = (event: Event) => event.preventDefault();

type Props = {
  variablesContainer: gdVariablesContainer,
};

const getVariableFromNodeId = (
  nodeId: string,
  variablesContainer: gdVariablesContainer
) => {
  const nodes = nodeId.split('.');
  let currentVariable = null;
  let parents = [];
  let name = null;
  let depth = -1;

  while (depth < nodes.length - 1) {
    depth++;
    const variableName = nodes[depth];
    if (!currentVariable) {
      currentVariable = variablesContainer.get(variableName);
    } else {
      parents.push(currentVariable);
      if (currentVariable.getType() === gd.Variable.Array) {
        const index = parseInt(variableName, 10);
        if (index >= currentVariable.getChildrenCount()) {
          return { variable: null, parents, depth, name };
        }
        currentVariable = currentVariable.getAtIndex(index);
      } else {
        if (!currentVariable.hasChild(variableName)) {
          return { variable: null, parents, depth, name };
        }
        currentVariable = currentVariable.getChild(variableName);
      }
    }
    name = variableName;
  }
  return { variable: currentVariable, depth, parents, name };
};

const isCollection = (variable: gdVariable): boolean =>
  !gd.Variable.isPrimitive(variable.getType());

const NewVariablesList = (props: Props) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Array<string>>([]);
  const [selectedNodes, setSelectedNodes] = React.useState<Array<string>>([]);
  const [containerWidth, setContainerWidth] = React.useState<?number>(null);
  const [nameErrors, setNameErrors] = React.useState<{ [number]: React.Node }>(
    {}
  );
  const draggedNodeId = React.useRef<?string>(null);
  const forceUpdate = useForceUpdate();
  const classes = useStyles();

  const rowRightSideStyle = React.useMemo(
    () => ({
      minWidth: containerWidth ? Math.round(0.6 * containerWidth) : 600,
      flexShrink: 0,
    }),
    [containerWidth]
  );

  React.useEffect(
    () => {
      setExpandedNodes(
        mapFor(0, props.variablesContainer.count(), index =>
          props.variablesContainer.getNameAt(index)
        )
      );
    },
    [props.variablesContainer.ptr]
  );

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
    const {
      variable: targetVariable,
      parents: targetVariableParents,
    } = getVariableFromNodeId(nodeId, props.variablesContainer);
    const targetVariableParent =
      targetVariableParents[targetVariableParents.length - 1];

    const {
      variable: draggedVariable,
      parents: draggedVariableParents,
    } = getVariableFromNodeId(current, props.variablesContainer);
    const draggedVariableParent =
      draggedVariableParents[draggedVariableParents.length - 1];

    if (
      draggedVariableParent &&
      targetVariableParent &&
      draggedVariableParent.getType() !== targetVariableParent.getType()
    ) {
      return false;
    }
    if (
      !draggedVariableParent &&
      targetVariableParent &&
      targetVariableParent.getType() === gd.Variable.Array
    ) {
      return false;
    }
    if (
      !targetVariableParent &&
      draggedVariableParent &&
      draggedVariableParent.getType() === gd.Variable.Array
    ) {
      return false;
    }
    if (targetVariableParents.includes(draggedVariable)) return false;
    return true;
  };

  const dropNode = (nodeId: string): void => {
    const { current } = draggedNodeId;
    if (!current) return;
    const {
      variable: targetVariable,
      parents: targetVariableParents,
      name: targetName,
    } = getVariableFromNodeId(nodeId, props.variablesContainer);
    const targetVariableParent =
      targetVariableParents[targetVariableParents.length - 1];
    if (!targetVariable || !targetName) return;

    const {
      variable: draggedVariable,
      parents: draggedVariableParents,
      name: draggedName,
    } = getVariableFromNodeId(current, props.variablesContainer);
    const draggedVariableParent =
      draggedVariableParents[draggedVariableParents.length - 1];
    if (!draggedVariable || !draggedName) return;

    if (targetVariableParents.includes(draggedVariable)) return;

    if (!draggedVariableParent && !targetVariableParent) {
      const draggedIndex = props.variablesContainer.getPosition(draggedName);
      const targetIndex = props.variablesContainer.getPosition(targetName);
      props.variablesContainer.move(
        draggedIndex,
        targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
      );
    } else if (
      !!draggedVariableParent &&
      !!targetVariableParent &&
      targetVariableParent === draggedVariableParent
    ) {
      if (targetVariableParent.getType() === gd.Variable.Array) {
        const draggedIndex = parseInt(draggedName, 10);
        const targetIndex = parseInt(targetName, 10);
        targetVariableParent.moveChildInArray(
          draggedIndex,
          targetIndex > draggedIndex ? targetIndex - 1 : targetIndex
        );
      }
    } else if (
      !!draggedVariableParent &&
      !!targetVariableParent &&
      targetVariableParent.getType() === gd.Variable.Array &&
      draggedVariableParent.getType() === gd.Variable.Array
    ) {
      const draggedIndex = parseInt(draggedName, 10);
      const targetIndex = parseInt(targetName, 10);

      targetVariableParent.insertInArray(draggedVariable, targetIndex);

      draggedVariableParent.removeAtIndex(draggedIndex);
    } else if (
      !!draggedVariableParent &&
      !!targetVariableParent &&
      targetVariableParent.getType() === gd.Variable.Structure &&
      draggedVariableParent.getType() === gd.Variable.Structure
    ) {
      if (draggedVariableParent !== targetVariableParent) {
        const newName = newNameGenerator(
          draggedName,
          name => targetVariableParent.hasChild(name),
          'CopyOf'
        );
        targetVariableParent.insertChild(newName, draggedVariable);

        draggedVariableParent.removeChild(draggedName);
      }
    } else if (
      !draggedVariableParent &&
      !!targetVariableParent &&
      targetVariableParent.getType() === gd.Variable.Structure
    ) {
      const newName = newNameGenerator(
        draggedName,
        name => targetVariableParent.hasChild(name),
        'CopyOf'
      );

      targetVariableParent.insertChild(newName, draggedVariable);

      props.variablesContainer.remove(draggedName);
    } else if (
      !!draggedVariableParent &&
      !targetVariableParent &&
      draggedVariableParent.getType() === gd.Variable.Structure
    ) {
      const newName = newNameGenerator(
        draggedName,
        name => props.variablesContainer.has(name),
        'CopyOf'
      );
      props.variablesContainer.insert(
        newName,
        draggedVariable,
        props.variablesContainer.getPosition(targetName)
      );

      draggedVariableParent.removeChild(draggedName);
    }
    forceUpdate();
  };

  const onAddChild = (nodeId: string) => {
    const { variable } = getVariableFromNodeId(
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
              <TreeItem
                classes={classes}
                nodeId={nodeId}
                label={
                  <div>
                    {isOver && <DropIndicator canDrop={canDrop} />}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px',
                      }}
                    >
                      {connectDragSource(
                        <span>
                          <DragHandle color="#AAA" />
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
                            />
                          </Column>
                          <Column expand>
                            {type === gd.Variable.Boolean ? (
                              <Line noMargin>
                                {variable.getBool() ? (
                                  <Trans>True</Trans>
                                ) : (
                                  <Trans>False</Trans>
                                )}
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
                                  <SwapHorizontal />
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
                                inputStyle={
                                  type === gd.Variable.String
                                    ? styles.noPaddingMultilineTextField
                                    : undefined
                                }
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
                              <Add />
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
              </TreeItem>
            </div>
          )
        }
      </DragSourceAndDropTarget>
    );
  };

  const onChangeName = (nodeId: string, newName: ?string) => {
    const { variable, parents, name } = getVariableFromNodeId(
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
    if (parents.length > 0) {
      const parentVariable = parents[parents.length - 1];
      hasBeenRenamed = parentVariable.renameChild(name, newName);
    } else {
      hasBeenRenamed = props.variablesContainer.rename(name, newName);
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
    const { variable } = getVariableFromNodeId(
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
        <TreeView
          multiSelect
          defaultExpandIcon={<ChevronRight />}
          defaultCollapseIcon={<ExpandMore />}
          onNodeSelect={(event, values) => setSelectedNodes(values)}
          onNodeToggle={(event, values) => setExpandedNodes(values)}
          selected={selectedNodes}
          ref={measureRef}
          expanded={expandedNodes}
        >
          {renderTree(props.variablesContainer)}
        </TreeView>
      )}
    </Measure>
  );
};

export default NewVariablesList;
