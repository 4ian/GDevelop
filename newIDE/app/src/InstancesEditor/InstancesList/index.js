import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
const gd = global.gd;

const styles = {
  smallMarginsColumn: {
    paddingLeft: 8,
    paddingRight: 8,
  },
};

export default class InstancesList extends Component {
  shouldComponentUpdate() {
    // Rendering the component can be costly as it iterates over
    // every instances, so the prop freezeUpdate allow to ask the component to stop
    // updating, for example when hidden.
    return !this.props.freezeUpdate;
  }

  componentWillMount() {
    this.renderedRows = [];

    // Functor used to display an instance row
    this.instanceRowRenderer = new gd.InitialInstanceJSFunctor();
    this.instanceRowRenderer.invoke = instancePtr => {
      const instance = gd.wrapPointer(instancePtr, gd.InitialInstance);

      this.renderedRows.push({
        instance,
        element: (
          <TableRow
            key={instancePtr}
            selected={this.props.selectedInstances.indexOf(instance) !== -1}
          >
            <TableRowColumn style={styles.smallMarginsColumn}>
              {instance.getObjectName()}
            </TableRowColumn>
            <TableRowColumn style={styles.smallMarginsColumn}>
              {instance.getX().toFixed(2)}
            </TableRowColumn>
            <TableRowColumn style={styles.smallMarginsColumn}>
              {instance.getY().toFixed(2)}
            </TableRowColumn>
            <TableRowColumn style={styles.smallMarginsColumn}>
              {instance.getAngle()}
            </TableRowColumn>
            <TableRowColumn style={styles.smallMarginsColumn}>
              {instance.getLayer()}
            </TableRowColumn>
            <TableRowColumn style={styles.smallMarginsColumn}>
              {instance.getZOrder()}
            </TableRowColumn>
          </TableRow>
        ),
      });
    };
  }

  componentWillUnmount() {
    this.instanceRowRenderer.delete();
  }

  onRowSelection(selection) {
    this.props.onSelectInstances(
      selection.map(i => this.renderedRows[i].instance)
    );
  }

  render() {
    const { instances } = this.props;

    this.renderedRows.length = 0;
    instances.iterateOverInstances(this.instanceRowRenderer);

    return (
      <Table
        selectable={true}
        multiSelectable={true}
        onRowSelection={selection => this.onRowSelection(selection)}
      >
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={styles.smallMarginsColumn}>
              Object name
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.smallMarginsColumn}>
              X
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.smallMarginsColumn}>
              Y
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.smallMarginsColumn}>
              Angle
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.smallMarginsColumn}>
              Layer
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.smallMarginsColumn}>
              Z Order
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          deselectOnClickaway={false}
          showRowHover={true}
        >
          {this.renderedRows.map(row => row.element)}
        </TableBody>
      </Table>
    );
  }
}
