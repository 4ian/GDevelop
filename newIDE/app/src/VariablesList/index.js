import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import ArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward';
import ArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward';
import Delete from 'material-ui/svg-icons/action/delete';
import Add from 'material-ui/svg-icons/content/add';
import AddCircle from 'material-ui/svg-icons/content/add-circle';
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import mapFor from '../Utils/MapFor';
import newNameGenerator from '../Utils/NewNameGenerator';
import flatten from 'lodash/flatten';
const gd = global.gd;

const styles = {
  toolColumn: {
    width: 192,
    textAlign: 'right',
  },
  tableChildIndentation: 24,
};

export default class VariablesList extends Component {
  constructor() {
    super();

    this.state = {
      nameErrors: {},
    };
  }

  _renderToolColumn(name, variable, depth, index, parentVariable) {
    const { variablesContainer } = this.props;

    return [
      (
        <TableRowColumn key="move" style={styles.toolColumn}>
          {depth === 0 &&
            <IconButton
              disabled={index === 0}
              onTouchTap={() => {
                variablesContainer.swap(index, index - 1);
                this.forceUpdate();
              }}
            >
              <ArrowUpward />
            </IconButton>}
          {depth === 0 &&
            <IconButton
              disabled={index === variablesContainer.count() - 1}
              onTouchTap={() => {
                variablesContainer.swap(index, index + 1);
                this.forceUpdate();
              }}
            >
              <ArrowDownward />
            </IconButton>}
          <IconButton
            onTouchTap={() => {
              if (!parentVariable) {
                variablesContainer.remove(name);
              } else {
                parentVariable.removeChild(name);
              }
              this.forceUpdate();
            }}
          >
            <Delete />
          </IconButton>
          <IconButton
            onTouchTap={() => {
              const name = newNameGenerator(
                'ChildVariable',
                name => variable.hasChild(name)
              );
              variable.getChild(name).setString('');
              this.forceUpdate();
            }}
          >
            <AddCircle />
          </IconButton>
        </TableRowColumn>
      ),
    ];
  }

  _renderVariableRow(name, variable, depth, index, parentVariable) {
    const isStructure = variable.isStructure();
    const key = '' + depth + name;

    const columns = [
      (
        <TableRowColumn
          key="name"
          style={{ paddingLeft: (depth + 1) * styles.tableChildIndentation }}
        >
          <TextField
            name={key + 'name'}
            defaultValue={name}
            errorText={
              this.state.nameErrors[variable.ptr]
                ? 'This name is already taken'
                : undefined
            }
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
          />
        </TableRowColumn>
      ),
    ];
    if (!isStructure) {
      columns.push(
        <TableRowColumn key="value">
          <TextField
            name={key + 'value'}
            value={variable.getString()}
            onChange={(event, text) => {
              variable.setString(text);
              this.forceUpdate();
            }}
            multiLine
          />
        </TableRowColumn>
      );
    } else {
      columns.push(<TableRowColumn key="value">(Structure)</TableRowColumn>);
    }
    columns.push(
      this._renderToolColumn(name, variable, depth, index, parentVariable)
    );

    return (
      <TableRow key={key}>
        {columns}
      </TableRow>
    );
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
    const isStructure = variable.isStructure();
    const variableRow = this._renderVariableRow(
      name,
      variable,
      depth,
      index,
      parentVariable
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
      <TableRow key="add-row">
        <TableRowColumn />
        <TableRowColumn />
        <TableRowColumn style={styles.toolColumn}>
          <IconButton
            onTouchTap={() => {
              const variable = new gd.Variable();
              variable.setString('');
              const name = newNameGenerator(
                'Variable',
                name => variablesContainer.has(name)
              );
              variablesContainer.insert(
                name,
                variable,
                variablesContainer.count()
              );
              this.forceUpdate();
            }}
          >
            <Add />
          </IconButton>
        </TableRowColumn>
      </TableRow>
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
