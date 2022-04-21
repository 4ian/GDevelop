// @flow
import * as React from 'react';
import { TreeView, TreeItem } from '@material-ui/lab';
import ChevronRight from '@material-ui/icons/ChevronRight';
import ExpandLess from '@material-ui/icons/ExpandLess';
import { mapFor } from '../Utils/MapFor';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import { Column, Line } from '../UI/Grid';
import Checkbox from '../UI/Checkbox';
import useForceUpdate from '../Utils/UseForceUpdate';
import { Trans } from '@lingui/macro';
const gd: libGDevelop = global.gd;

type Props = {
  variablesContainer: gdVariablesContainer,
};

const variableTypeToLabel = {
  [gd.Variable.String]: <Trans>String</Trans>,
  [gd.Variable.Number]: <Trans>Number</Trans>,
  [gd.Variable.Boolean]: <Trans>Boolean</Trans>,
  [gd.Variable.Structure]: <Trans>Structure</Trans>,
  [gd.Variable.Array]: <Trans>Array</Trans>,
};

const NewVariablesList = (props: Props) => {
  const [expandedNodes, setExpandedNodes] = React.useState<Array<string>>([]);
  const [selectedNodes, setSelectedNodes] = React.useState<Array<string>>([]);
  const forceUpdate = useForceUpdate();

  const renderVariableAndChildrenRows = (name, variable, depth) => {
    const type = variable.getType();
    const isCollection = !gd.Variable.isPrimitive(variable.getType());

    const nodeId = name;
    return (
      <TreeItem
        label={
          <Line>
            <Column>
              <SemiControlledTextField
                onClick={event => {
                  event.stopPropagation();
                }}
                value={name}
                onChange={name => {
                  onChangeName(nodeId, name);
                  forceUpdate();
                }}
              />
            </Column>
            <Column>{variableTypeToLabel[variable.getType()]}</Column>
            <Column>
              <SemiControlledTextField
                onClick={event => {
                  event.stopPropagation();
                }}
                value={
                  isCollection
                    ? ''
                    : type === gd.Variable.String
                    ? variable.getString()
                    : type === gd.Variable.Number
                    ? '' + variable.getValue()
                    : variable.getBool().toString()
                }
                onChange={() => {}}
              />
            </Column>
          </Line>
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
                  depth + 1
                );
              })
          : mapFor(0, variable.getChildrenCount(), index => {
              const childVariable = variable.getAtIndex(index);
              return renderVariableAndChildrenRows(
                '' + index,
                childVariable,
                depth + 1
              );
            })}
      </TreeItem>
    );
  };

  const onChangeName = (nodeId, newName) => {
    console.log(nodeId, newName)
    props.variablesContainer.rename(nodeId, newName);
  };

  const renderTree = variablesContainer => {
    const containerVariablesTree = mapFor(
      0,
      variablesContainer.count(),
      index => {
        const variable = variablesContainer.getAt(index);
        const name = variablesContainer.getNameAt(index);

        return renderVariableAndChildrenRows(name, variable, 0);
      }
    );
    return containerVariablesTree;
  };

  console.log(selectedNodes);
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
