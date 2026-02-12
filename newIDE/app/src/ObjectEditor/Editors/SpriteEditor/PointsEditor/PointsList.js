// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
} from '../../../../UI/Table';
import newNameGenerator from '../../../../Utils/NewNameGenerator';
import { mapVector } from '../../../../Utils/MapFor';
import Window from '../../../../Utils/Window';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import RaisedButton from '../../../../UI/RaisedButton';
import PointRow from './PointRow';
import styles from './styles';
import Add from '../../../../UI/CustomSvgIcons/Add';
const gd: libGDevelop = global.gd;

type PointsListBodyProps = {|
  pointsContainer: gdSprite,
  onPointsUpdated: () => void,
  onHoverPoint: (pointName: ?string) => void,
  onSelectPoint: (pointName: string) => void,
  onRenamedPoint: (oldName: string, newName: string) => void,
  selectedPointName: ?string,
  spriteSize: [number, number],
|};

const PointsListBody = (props: PointsListBodyProps) => {
  const [nameErrors, setNameErrors] = React.useState({});
  const { pointsContainer, onHoverPoint } = props;
  const forceUpdate = useForceUpdate();

  const onPointsUpdated = () => {
    forceUpdate();
    props.onPointsUpdated();
  };

  const updateOriginPointX = newValue => {
    pointsContainer.getOrigin().setX(newValue);
    onPointsUpdated();
  };

  const updateOriginPointY = newValue => {
    pointsContainer.getOrigin().setY(newValue);
    onPointsUpdated();
  };

  const updateCenterPointX = newValue => {
    pointsContainer.getCenter().setX(newValue);
    onPointsUpdated();
  };

  const updateCenterPointY = newValue => {
    pointsContainer.getCenter().setY(newValue);
    onPointsUpdated();
  };

  const updatePointX = (point, newValue) => {
    point.setX(newValue);
    onPointsUpdated();
  };

  const updatePointY = (point, newValue) => {
    point.setY(newValue);
    onPointsUpdated();
  };

  const onPointerLeave = React.useCallback(() => onHoverPoint(null), [
    onHoverPoint,
  ]);

  const nonDefaultPoints = pointsContainer.getAllNonDefaultPoints();
  const pointsRows = mapVector(nonDefaultPoints, (point, i) => {
    const pointName = point.getName();

    return (
      <PointRow
        key={`point-${point.ptr}`}
        pointX={point.getX()}
        pointY={point.getY()}
        onChangePointX={newValue => updatePointX(point, newValue)}
        onChangePointY={newValue => updatePointY(point, newValue)}
        pointName={pointName}
        selected={pointName === props.selectedPointName}
        nameError={nameErrors[pointName]}
        onChangePointName={(newName: string) => {
          if (pointName === newName) return;
          if (!newName) return;

          let success = true;
          if (pointsContainer.hasPoint(newName)) {
            success = false;
          } else {
            const oldName = point.getName();
            point.setName(newName);
            props.onRenamedPoint(oldName, newName);
            if (props.selectedPointName === pointName) {
              props.onSelectPoint(newName);
            }
            onPointsUpdated();
          }

          setNameErrors(old => ({ ...old, [pointName]: !success }));
        }}
        onPointerEnter={props.onHoverPoint}
        onPointerLeave={onPointerLeave}
        onClick={props.onSelectPoint}
        onRemove={() => {
          const answer = Window.showConfirmDialog(
            "Are you sure you want to remove this point? This can't be undone."
          );
          if (!answer) return;

          pointsContainer.delPoint(pointName);
          onPointsUpdated();
        }}
      />
    );
  });

  const originPoint = pointsContainer.getOrigin();
  const centerPoint = pointsContainer.getCenter();

  const originRow = (
    <PointRow
      key={'origin-point-row'}
      pointName="Origin"
      pointX={originPoint.getX()}
      pointY={originPoint.getY()}
      onChangePointX={updateOriginPointX}
      onChangePointY={updateOriginPointY}
      onPointerEnter={props.onHoverPoint}
      onPointerLeave={onPointerLeave}
      onClick={props.onSelectPoint}
      selected={'Origin' === props.selectedPointName}
    />
  );

  const isDefaultCenterPoint = pointsContainer.isDefaultCenterPoint();
  const centerRow = (
    <PointRow
      key={'center-point-row'}
      pointName="Center"
      isAutomatic={isDefaultCenterPoint}
      pointX={
        isDefaultCenterPoint ? props.spriteSize[0] / 2 : centerPoint.getX()
      }
      pointY={
        isDefaultCenterPoint ? props.spriteSize[1] / 2 : centerPoint.getY()
      }
      onChangePointX={updateCenterPointX}
      onChangePointY={updateCenterPointY}
      onPointerEnter={props.onHoverPoint}
      onPointerLeave={onPointerLeave}
      onClick={props.onSelectPoint}
      selected={'Center' === props.selectedPointName}
      onEdit={
        pointsContainer.isDefaultCenterPoint()
          ? () => {
              pointsContainer.setDefaultCenterPoint(false);
              onPointsUpdated();
            }
          : null
      }
      onRemove={
        !pointsContainer.isDefaultCenterPoint()
          ? () => {
              pointsContainer.setDefaultCenterPoint(true);
              onPointsUpdated();
            }
          : null
      }
    />
  );

  return <TableBody>{[originRow, centerRow, ...pointsRows]}</TableBody>;
};

type PointsListProps = {|
  pointsContainer: gdSprite,
  onPointsUpdated: () => void,
  onHoverPoint: (pointName: ?string) => void,
  onSelectPoint: (pointName: ?string) => void,
  onRenamedPoint: (oldName: string, newName: string) => void,
  selectedPointName: ?string,
  spriteSize: [number, number],
|};

const PointsList = (props: PointsListProps) => {
  return (
    <Column expand>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={styles.nameColumn}>
              <Trans>Point name</Trans>
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn} padding="none">
              <Column>X</Column>
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn} padding="none">
              <Column>Y</Column>
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.toolColumn} />
          </TableRow>
        </TableHeader>
        <PointsListBody
          pointsContainer={props.pointsContainer}
          onHoverPoint={props.onHoverPoint}
          onSelectPoint={props.onSelectPoint}
          selectedPointName={props.selectedPointName}
          onPointsUpdated={props.onPointsUpdated}
          onRenamedPoint={props.onRenamedPoint}
          spriteSize={props.spriteSize}
        />
      </Table>
      <Spacer />
      <Line alignItems="center" justifyContent="center">
        <RaisedButton
          primary
          icon={<Add />}
          label={<Trans>Add a point</Trans>}
          onClick={() => {
            const name = newNameGenerator('Point', name =>
              props.pointsContainer.hasPoint(name)
            );
            const point = new gd.Point(name);
            props.pointsContainer.addPoint(point);
            point.delete();
            props.onSelectPoint(name);
            props.onPointsUpdated();
          }}
        />
      </Line>
    </Column>
  );
};

export default PointsList;
