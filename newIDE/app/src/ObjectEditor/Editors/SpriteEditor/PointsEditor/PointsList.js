import React, { Component } from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import newNameGenerator from '../../../../Utils/NewNameGenerator';
import { mapVector } from '../../../../Utils/MapFor';
import styles from './styles';
import PointRow from './PointRow';
import AddPointRow from './AddPointRow';
const gd = global.gd;

const SortableAddPointRow = SortableElement(AddPointRow);
const SortablePointRow = SortableElement(PointRow);

class PointsListBody extends Component {
  constructor() {
    super();
    this.state = {
      nameErrors: {},
    };
  }

  updateOriginPointX = newValue => {
    this.props.pointsContainer.getOrigin().setX(newValue);
    this.forceUpdate();
  };

  updateOriginPointY = newValue => {
    this.props.pointsContainer.getOrigin().setY(newValue);
    this.forceUpdate();
  };

  updateCenterPointX = newValue => {
    this.props.pointsContainer.getCenter().setX(newValue);
    this.forceUpdate();
  };

  updateCenterPointY = newValue => {
    this.props.pointsContainer.getCenter().setY(newValue);
    this.forceUpdate();
  };

  updatePointX = (point, newValue) => {
    point.setX(newValue);
    this.forceUpdate();
  };

  updatePointY = (point, newValue) => {
    point.setY(newValue);
    this.forceUpdate();
  };

  render() {
    const { pointsContainer } = this.props;

    const nonDefaultPoints = pointsContainer.getAllNonDefaultPoints();
    const pointsRows = mapVector(nonDefaultPoints, (point, i) => {
      const pointName = point.getName();

      return (
        <SortablePointRow
          index={i}
          disabled
          key={'point-' + pointName}
          pointX={point.getX()}
          pointY={point.getY()}
          onChangePointX={newValue => this.updatePointX(point, newValue)}
          onChangePointY={newValue => this.updatePointY(point, newValue)}
          pointName={pointName}
          nameError={this.state.nameErrors[pointName]}
          onBlur={event => {
            const newName = event.target.value;
            if (pointName === newName) return;

            let success = true;
            if (pointsContainer.hasPoint(newName)) {
              success = false;
            } else {
              point.setName(newName);
            }

            this.setState({
              nameErrors: {
                ...this.state.nameErrors,
                [pointName]: !success,
              },
            });
          }}
          onRemove={() => {
            //eslint-disable-next-line
            const answer = confirm(
              "Are you sure you want to remove this point? This can't be undone."
            );
            if (!answer) return;

            pointsContainer.delPoint(pointName);
            this.forceUpdate();
          }}
        />
      );
    });

    const originPoint = pointsContainer.getOrigin();
    const centerPoint = pointsContainer.getCenter();

    const originRow = (
      <SortablePointRow
        index={0}
        key={'origin-point-row'}
        pointName="Origin"
        pointX={originPoint.getX()}
        pointY={originPoint.getY()}
        onChangePointX={this.updateOriginPointX}
        onChangePointY={this.updateOriginPointY}
        disabled
      />
    );
    const centerRow = (
      <SortablePointRow
        index={1}
        key={'center-point-row'}
        pointName="Center"
        pointX={centerPoint.getX()}
        pointY={centerPoint.getY()}
        onChangePointX={this.updateCenterPointX}
        onChangePointY={this.updateCenterPointY}
        disabled
      />
    );

    const addRow = (
      <SortableAddPointRow
        index={0}
        key={'add-point-row'}
        disabled
        onAdd={() => {
          const name = newNameGenerator('Point', name =>
            pointsContainer.hasPoint(name)
          );
          const point = new gd.Point(name);
          pointsContainer.addPoint(point);
          point.delete();
          this.forceUpdate();
        }}
      />
    );

    return (
      <TableBody
        displayRowCheckbox={false}
        deselectOnClickaway={true}
        showRowHover={true}
      >
        {[originRow, centerRow, ...pointsRows, addRow]}
      </TableBody>
    );
  }
}

const SortablePointsListBody = SortableContainer(PointsListBody);
SortablePointsListBody.muiName = 'TableBody';

export default class PointsList extends Component {
  render() {
    return (
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn style={styles.handleColumn} />
            <TableHeaderColumn>Point name</TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn}>
              X
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn}>
              Y
            </TableHeaderColumn>
            <TableRowColumn style={styles.toolColumn} />
          </TableRow>
        </TableHeader>
        <SortablePointsListBody
          pointsContainer={this.props.pointsContainer}
          onSortEnd={({ oldIndex, newIndex }) => {
              //TODO
            // const pointsCount = this.props.pointsContainer.getPointsCount();
            // this.props.pointsContainer.movePoint(oldIndex, newIndex);
            // this.forceUpdate();
          }}
          helperClass="sortable-helper"
          useDragHandle
          lockToContainerEdges
        />
      </Table>
    );
  }
}
