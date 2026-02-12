// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../../../../UI/Table';
import { mapVector } from '../../../../Utils/MapFor';
import styles from './styles';
import VerticeRow from './VerticeRow';
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
} from '../../../../UI/Accordion';
import Text from '../../../../UI/Text';
import IconButton from '../../../../UI/IconButton';
import FlatButton from '../../../../UI/FlatButton';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import RaisedButtonWithSplitMenu from '../../../../UI/RaisedButtonWithSplitMenu';
import AlertMessage from '../../../../UI/AlertMessage';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import ScrollView from '../../../../UI/ScrollView';
import { addVertexOnLongestEdge } from './PolygonHelper';
import Add from '../../../../UI/CustomSvgIcons/Add';
import Trash from '../../../../UI/CustomSvgIcons/Trash';
import Warning from '../../../../UI/CustomSvgIcons/Warning';

const gd = global.gd;

type VerticesTableProps = {|
  vertices: gdVectorVector2f,
  hasWarning: boolean,
  onUpdated: () => void,
  onHoverVertice: (ptr: ?number) => void,
  onClickVertice: (ptr: ?number) => void,
  selectedVerticePtr: ?number,

  // Sprite size is useful to make sure polygon vertices
  // are not put outside the sprite bounding box, which is not supported:
  spriteWidth: number,
  spriteHeight: number,
|};

const VerticesTable = (props: VerticesTableProps) => {
  const updateVerticeX = (vertice: gdVector2f, newValue: number) => {
    // Ensure the vertex stays inside the sprite bounding box.
    vertice.set_x(Math.min(props.spriteWidth, Math.max(newValue, 0)));
    props.onUpdated();
  };

  const updateVerticeY = (vertice: gdVector2f, newValue: number) => {
    // Ensure the vertex stays inside the sprite bounding box.
    vertice.set_y(Math.min(props.spriteHeight, Math.max(newValue, 0)));
    props.onUpdated();
  };

  return (
    <Column expand>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={styles.coordinateColumn}>
              X
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn}>
              Y
            </TableHeaderColumn>
            <TableRowColumn style={styles.toolColumn} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {mapVector(props.vertices, (vertice, verticeIndex) => (
            <VerticeRow
              key={vertice.ptr}
              parentVerticeId={props.vertices.ptr.toString()}
              onPointerEnter={() => props.onHoverVertice(vertice.ptr)}
              onPointerLeave={props.onHoverVertice}
              selected={props.selectedVerticePtr === vertice.ptr}
              onClick={() => props.onClickVertice(vertice.ptr)}
              verticeX={vertice.get_x()}
              verticeY={vertice.get_y()}
              onChangeVerticeX={newValue => updateVerticeX(vertice, newValue)}
              onChangeVerticeY={newValue => updateVerticeY(vertice, newValue)}
              onRemove={() => {
                gd.removeFromVectorVector2f(props.vertices, verticeIndex);
                props.onUpdated();
              }}
              canRemove={props.vertices.size() > 3}
            />
          ))}
        </TableBody>
      </Table>
      <Spacer />
      {props.hasWarning && (
        <AlertMessage kind="warning">
          <Trans>
            The polygon is not convex. Ensure it is, otherwise the collision
            mask won't work.
          </Trans>
        </AlertMessage>
      )}
      <Line justifyContent="center">
        <FlatButton
          leftIcon={<Add />}
          label={<Trans>Add a vertex</Trans>}
          onClick={() => {
            addVertexOnLongestEdge(props.vertices);
            props.onUpdated();
          }}
        />
      </Line>
    </Column>
  );
};

type PolygonSectionProps = {|
  polygon: gdPolygon2d,
  onUpdated: () => void,
  onRemove: () => void,
  onHoverVertice: (ptr: ?number) => void,
  onClickVertice: (ptr: ?number) => void,
  selectedVerticePtr: ?number,

  // Sprite size is useful to make sure polygon vertices
  // are not put outside the sprite bounding box, which is not supported:
  spriteWidth: number,
  spriteHeight: number,
|};

const PolygonSection = (props: PolygonSectionProps) => {
  const theme = React.useContext(GDevelopThemeContext);
  const warningColor = theme.message.warning;

  const vertices = props.polygon.getVertices();
  const verticesCount = vertices.size();
  const isConvex = props.polygon.isConvex();

  const polygonActions = [
    isConvex ? null : (
      <IconButton
        key="not-convex"
        size="small"
        tooltip={t`Polygon is not convex!`}
      >
        <Warning style={{ color: warningColor }} />
      </IconButton>
    ),
    <IconButton
      key="delete-mask"
      size="small"
      onClick={ev => {
        ev.stopPropagation();
        props.onRemove();
      }}
      tooltip={t`Delete collision mask`}
    >
      <Trash />
    </IconButton>,
  ];

  return (
    <Accordion defaultExpanded>
      <AccordionHeader actions={polygonActions}>
        <Text displayInlineAsSpan>
          {verticesCount === 3 && <Trans>Triangle</Trans>}
          {verticesCount === 4 && <Trans>Quadrilateral</Trans>}
          {verticesCount >= 5 && (
            <Trans>Polygon with {verticesCount} vertices</Trans>
          )}
        </Text>
      </AccordionHeader>
      <AccordionBody disableGutters>
        <VerticesTable
          vertices={vertices}
          hasWarning={!isConvex}
          onHoverVertice={props.onHoverVertice}
          onClickVertice={props.onClickVertice}
          selectedVerticePtr={props.selectedVerticePtr}
          onUpdated={props.onUpdated}
          spriteWidth={props.spriteWidth}
          spriteHeight={props.spriteHeight}
        />
      </AccordionBody>
    </Accordion>
  );
};

type PolygonsListProps = {|
  polygons: gdVectorPolygon2d,
  onPolygonsUpdated: () => void,
  onSetFullImageCollisionMask: () => Promise<void>,
  onSetAutomaticallyAdaptCollisionMasks: () => Promise<void>,
  onHoverVertice: (ptr: ?number) => void,
  onClickVertice: (ptr: ?number) => void,
  selectedVerticePtr: ?number,

  // Sprite size is useful to make sure polygon vertices
  // are not put outside the sprite bounding box, which is not supported:
  spriteSize: [number, number],
|};

const PolygonsList = (props: PolygonsListProps) => {
  const {
    polygons,
    spriteSize,
    onPolygonsUpdated,
    onSetFullImageCollisionMask,
    onSetAutomaticallyAdaptCollisionMasks,
    onHoverVertice,
    onClickVertice,
    selectedVerticePtr,
  } = props;

  const [spriteWidth, spriteHeight] = spriteSize;
  const addCollisionMask = React.useCallback(
    () => {
      const newPolygon = gd.Polygon2d.createRectangle(
        spriteWidth,
        spriteHeight
      );
      newPolygon.move(spriteWidth / 2, spriteHeight / 2);
      polygons.push_back(newPolygon);
      onPolygonsUpdated();
    },
    [spriteHeight, spriteWidth, polygons, onPolygonsUpdated]
  );

  const onRemovePolygon = React.useCallback(
    (index: number) => {
      gd.removeFromVectorPolygon2d(polygons, index);
      if (polygons.size() === 0) {
        onSetFullImageCollisionMask();
      }
      onPolygonsUpdated();
    },
    [polygons, onPolygonsUpdated, onSetFullImageCollisionMask]
  );

  React.useEffect(
    () => {
      if (polygons.size() === 0) {
        addCollisionMask();
      }
    },
    [polygons, addCollisionMask]
  );

  return (
    <React.Fragment>
      <Column noMargin expand useFullHeight>
        <ScrollView>
          {mapVector(polygons, (polygon, i) => (
            <PolygonSection
              key={`polygon-${i}`}
              polygon={polygon}
              onUpdated={onPolygonsUpdated}
              onRemove={() => onRemovePolygon(i)}
              onHoverVertice={onHoverVertice}
              onClickVertice={onClickVertice}
              selectedVerticePtr={selectedVerticePtr}
              spriteWidth={spriteWidth}
              spriteHeight={spriteHeight}
            />
          ))}
        </ScrollView>
        <Column>
          <Line alignItems="center" justifyContent="center">
            <RaisedButtonWithSplitMenu
              primary
              icon={<Add />}
              label={<Trans>Add collision mask</Trans>}
              onClick={addCollisionMask}
              buildMenuTemplate={i18n => [
                {
                  label: i18n._(t`Reset to automatic collision mask`),
                  click: onSetAutomaticallyAdaptCollisionMasks,
                },
                {
                  label: i18n._(t`Use full image as collision mask`),
                  click: onSetFullImageCollisionMask,
                },
              ]}
            />
          </Line>
        </Column>
      </Column>
    </React.Fragment>
  );
};

export default PolygonsList;
