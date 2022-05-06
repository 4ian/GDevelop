// @flow
import * as React from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ExpandLess from '@material-ui/icons/ExpandLess';
import Add from '@material-ui/icons/Add';
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
const gd: libGDevelop = global.gd;

const useStyles = makeStyles({
  group: {
    borderLeft: `1px solid black`,
    marginLeft: 7,
    paddingLeft: 15,
  },
  label: { padding: 0 },
});

type Props = {
  variablesContainer: gdVariablesContainer,
};

const getVariableFromNodeId = (
  nodeId: string,
  variablesContainer: gdVariablesContainer
) => {
  const nodes = nodeId.split('.');
  let currentVariable = null;
  let depth = -1;

  while (depth < nodes.length - 1) {
    depth++;
    const variableName = nodes[depth];
    if (!currentVariable) {
      currentVariable = variablesContainer.get(variableName);
    } else if (currentVariable.getType() === gd.Variable.Array)
      currentVariable = currentVariable.getAtIndex(parseInt(variableName, 10));
    else {
      currentVariable = currentVariable.getChild(variableName);
    }
  }
  return { variable: currentVariable, depth };
};

const NewVariablesList = (props: Props) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Array<string>>([]);
  const [selectedNodes, setSelectedNodes] = React.useState<Array<string>>([]);
  const draggedNode = React.useRef<any>(null);
  const forceUpdate = useForceUpdate();

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
  console.log(expandedNodes);

  const dropNode = nodeId => {
    const { variable, depth } = getVariableFromNodeId(
      nodeId,
      props.variablesContainer
    );
    if (!variable) return;
    console.log(variable.getString());
    if (depth === 0 && props.variablesContainer.has(nodeId)) {
      console.log(nodeId);
      console.log(draggedNode);
      props.variablesContainer.swap(
        props.variablesContainer.getPosition(nodeId),
        props.variablesContainer.getPosition(draggedNode.current)
      );
      draggedNode.current = null;
      forceUpdate();
    }
  };

  const renderVariableAndChildrenRows = (
    name,
    variable,
    depth,
    parentNodeId: string
  ) => {
    const type = variable.getType();
    const isCollection = !gd.Variable.isPrimitive(variable.getType());

    const nodeId = !!parentNodeId ? `${parentNodeId}.${name}` : name;

    const classes = useStyles();

    return (
      <DragSourceAndDropTarget
        key={variable.ptr}
        beginDrag={() => {
          draggedNode.current = nodeId;
          return {};
        }}
        canDrag={() => true}
        canDrop={() => true}
        drop={() => {
          dropNode(nodeId);
        }}
      >
        {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
          connectDropTarget(
            <div>
              <TreeItem
                classes={classes}
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
                      <div style={{ flex: 1 }}>
                        <SemiControlledTextField
                          fullWidth
                          margin="none"
                          key="name"
                          onClick={event => {
                            event.stopPropagation();
                          }}
                          value={name}
                          onChange={name => {
                            onChangeName(nodeId, name);
                            forceUpdate();
                          }}
                        />
                      </div>
                      <Spacer />
                      <div
                        style={{
                          minWidth: 600, // TODO - See if this value should depend on the container width
                          flexShrink: 0,
                        }}
                      >
                        <Line noMargin>
                          <Column noMargin>
                            <VariableTypeSelector
                              variableType={variable.getType()}
                            />
                          </Column>
                          <Column expand>
                            <SemiControlledTextField
                              margin="none"
                              key="value"
                              onClick={event => {
                                event.stopPropagation();
                              }}
                              disabled={isCollection}
                              value={
                                isCollection
                                  ? `${variable.getChildrenCount()} children`
                                  : type === gd.Variable.String
                                  ? variable.getString()
                                  : type === gd.Variable.Number
                                  ? '' + variable.getValue()
                                  : variable.getBool().toString()
                              }
                              onChange={value => {
                                onChangeValue(nodeId, value);
                                forceUpdate();
                              }}
                            />
                          </Column>
                          {isCollection ? (
                            <IconButton size="small" style={{ padding: 0 }}>
                              <Add />
                            </IconButton>
                          ) : null}
                        </Line>
                      </div>
                    </div>
                  </div>
                }
                onLabelClick={event => {
                  event.preventDefault();
                }}
                nodeId={nodeId}
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
                          childName,
                          childVariable,
                          depth + 1,
                          nodeId
                        );
                      })
                  : mapFor(0, variable.getChildrenCount(), index => {
                      const childVariable = variable.getAtIndex(index);
                      return renderVariableAndChildrenRows(
                        '' + index,
                        childVariable,
                        depth + 1,
                        nodeId
                      );
                    })}
              </TreeItem>
            </div>
          )
        }
      </DragSourceAndDropTarget>
    );
  };

  const onChangeName = (nodeId, newName) => {
    props.variablesContainer.rename(nodeId, newName);
  };
  const onChangeValue = (nodeId, newValue) => {
    console.log(nodeId);
    const { variable } = getVariableFromNodeId(
      nodeId,
      props.variablesContainer
    );
    if (!variable) return;
    console.log(variable.getValue());
    switch (variable.getType()) {
      case gd.Variable.String:
        variable.setString(newValue);
        break;
      case gd.Variable.Number:
        variable.setValue(parseFloat(newValue));
        break;
      case gd.Variable.Boolean:
        variable.setBool(newValue === 'true');
        break;
      default:
        console.error(
          `Cannot set variable with type ${variable.getType()} - are you sure it's a primitive type?`
        );
    }
  };

  const renderTree = variablesContainer => {
    const containerVariablesTree = mapFor(
      0,
      variablesContainer.count(),
      index => {
        const variable = variablesContainer.getAt(index);
        const name = variablesContainer.getNameAt(index);

        return renderVariableAndChildrenRows(name, variable, 0, '');
      }
    );
    return containerVariablesTree;
  };

  return (
    <TreeView
      multiSelect
      defaultExpandIcon={<ChevronRight />}
      defaultCollapseIcon={<ExpandLess />}
      onNodeSelect={(event, values) => setSelectedNodes(values)}
      onNodeToggle={(event, values) => setExpandedNodes(values)}
      selected={selectedNodes}
      expanded={expandedNodes}
    >
      {renderTree(props.variablesContainer)}
    </TreeView>
  );
};

export default NewVariablesList;
