import React, { Component } from 'react';
import {
  Table,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import flatten from 'lodash/flatten';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { mapFor } from '../Utils/MapFor';
import EmptyMessage from '../UI/EmptyMessage';
import newNameGenerator from '../Utils/NewNameGenerator';
import VariableRow from './VariableRow';
import AddVariableRow from './AddVariableRow';
import styles from './styles';
const gd = global.gd;

const SortableVariableRow = SortableElement(VariableRow);
const SortableAddVariableRow = SortableElement(AddVariableRow);

class VariablesListBody extends Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

const SortableVariablesListBody = SortableContainer(VariablesListBody);
SortableVariablesListBody.muiName = 'TableBody';

export default class VariablesList extends Component {
  constructor() {
    super();

    this.state = {
      nameErrors: {},
    };
  }

  _renderVariableChildren(name, parentVariable, depth) {
    const children = parentVariable.getAllChildren();
    const names = children.keys().toJSArray();

    return flatten(
      names.map((name, index) => {
        const variable = children.get(name);
        return this._renderVariableAndChildrenRows(
          name,
          variable,
          depth + 1,
          index,
          parentVariable
        );
      })
    );
  }

  _renderVariableAndChildrenRows(name, variable, depth, index, parentVariable) {
    const { variablesContainer } = this.props;
    const isStructure = variable.isStructure();

    return (
      <SortableVariableRow
        name={name}
        index={index}
        key={'variable-' + name}
        variable={variable}
        disabled={depth !== 0}
        depth={depth}
        errorText={
          this.state.nameErrors[variable.ptr]
            ? 'This name is already taken'
            : undefined
        }
        onChangeValue={(event, text) => {
          variable.setString(text);
          this.forceUpdate();
        }}
        onBlur={event => {
          const text = event.target.value;
          if (name === text) return;

          let success = true;
          if (!parentVariable) {
            success = this.props.variablesContainer.rename(name, text);
          } else {
            success = parentVariable.renameChild(name, text);
          }

          this.setState({
            nameErrors: {
              ...this.state.nameErrors,
              [variable.ptr]: !success,
            },
          });
        }}
        onRemove={() => {
          if (!parentVariable) {
            variablesContainer.remove(name);
          } else {
            parentVariable.removeChild(name);
          }
          this.forceUpdate();
        }}
        onAddChild={() => {
          const name = newNameGenerator('ChildVariable', name =>
            variable.hasChild(name)
          );
          variable.getChild(name).setString('');
          this.forceUpdate();
        }}
        children={
          isStructure
            ? this._renderVariableChildren(name, variable, depth)
            : null
        }
      />
    );
  }

  _renderEmpty() {
    return (
      <div>
        <EmptyMessage
          style={styles.emptyExplanation}
          messageStyle={styles.emptyExplanationMessage}
        >
          {this.props.emptyExplanationMessage}
        </EmptyMessage>
        <EmptyMessage
          style={styles.emptyExplanation}
          messageStyle={styles.emptyExplanationMessage}
        >
          {this.props.emptyExplanationSecondMessage}
        </EmptyMessage>
      </div>
    );
  }

  render() {
    const { variablesContainer } = this.props;
    if (!variablesContainer) return;

    const containerVariablesTree = mapFor(
      0,
      variablesContainer.count(),
      index => {
        const nameAndVariable = variablesContainer.getAt(index);
        const variable = nameAndVariable.getVariable();
        const name = nameAndVariable.getName();

        return this._renderVariableAndChildrenRows(
          name,
          variable,
          0,
          index,
          undefined
        );
      }
    );

    const addRow = (
      <SortableAddVariableRow
        index={0}
        key={'add-variable-row'}
        disabled
        onAdd={() => {
          const variable = new gd.Variable();
          variable.setString('');
          const name = newNameGenerator('Variable', name =>
            variablesContainer.has(name)
          );
          variablesContainer.insert(name, variable, variablesContainer.count());
          this.forceUpdate();
        }}
      />
    );

    return (
      <div>
        <Table selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Value</TableHeaderColumn>
              <TableRowColumn />
            </TableRow>
          </TableHeader>
        </Table>
        <SortableVariablesListBody
          variablesContainer={this.props.variablesContainer}
          onSortEnd={({ oldIndex, newIndex }) => {
            this.props.variablesContainer.move(oldIndex, newIndex);
            this.forceUpdate();
          }}
          helperClass="sortable-helper"
          useDragHandle
          lockToContainerEdges
        >
          {!containerVariablesTree.length && this._renderEmpty()}
          {!!containerVariablesTree.length && containerVariablesTree}
          {addRow}
        </SortableVariablesListBody>
      </div>
    );
  }
}
