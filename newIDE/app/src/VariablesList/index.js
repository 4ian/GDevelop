import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { mapFor } from '../Utils/MapFor';
import newNameGenerator from '../Utils/NewNameGenerator';
import VariableRow from './VariableRow';
import AddVariableRow from './AddVariableRow';
import flatten from 'lodash/flatten';
const gd = global.gd;

export default class VariablesList extends Component {
  constructor() {
    super();

    this.state = {
      nameErrors: {},
    };
  }

  _renderVariableChildren(name, parentVariable, depth, index) {
    const children = parentVariable.getAllChildren();
    const names = children.keys().toJSArray();

    return flatten(
      names.map(name => {
        const variable = children.get(name);
        return this._renderVariableAndChildrenRows(
          name,
          variable,
          depth + 1,
          undefined,
          parentVariable
        );
      })
    );
  }

  _renderVariableAndChildrenRows(name, variable, depth, index, parentVariable) {
    const { variablesContainer } = this.props;
    const isStructure = variable.isStructure();
    const key = '' + depth + name;

    const variableRow = (
      <VariableRow
        name={name}
        variable={variable}
        depth={depth}
        index={index}
        key={key}
        parentVariable={parentVariable}
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
            variable.hasChild(name));
          variable.getChild(name).setString('');
          this.forceUpdate();
        }}
      />
    );

    return !isStructure
      ? [variableRow]
      : [
          variableRow,
          this._renderVariableChildren(name, variable, depth, index),
        ];
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
      <AddVariableRow
        key={'add-variable-row'}
        onAdd={() => {
          const variable = new gd.Variable();
          variable.setString('');
          const name = newNameGenerator('Variable', name =>
            variablesContainer.has(name));
          variablesContainer.insert(name, variable, variablesContainer.count());
          this.forceUpdate();
        }}
      />
    );

    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>
              Value
            </TableHeaderColumn>
            <TableRowColumn />
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          style={{
            backgroundColor: 'white',
          }}
        >
          {flatten(containerVariablesTree).concat(addRow)}
        </TableBody>
      </Table>
    );
  }
}
