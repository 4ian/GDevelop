// @flow
import * as React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../../../../UI/Table';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
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
import DeleteIcon from '@material-ui/icons/Delete';
import WarningIcon from '@material-ui/icons/Warning';
import AddIcon from '@material-ui/icons/Add';
import FlatButton from '../../../../UI/FlatButton';
import { Trans, t } from '@lingui/macro';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import RaisedButton from '../../../../UI/RaisedButton';
import AlertMessage from '../../../../UI/AlertMessage';
import GDevelopThemeContext from '../../../../UI/Theme/ThemeContext';
const gd = global.gd;

const SortableVerticeRow = SortableElement(VerticeRow);

type VerticesTableProps = {|
  vertices: gdVectorVector2f,
  hasWarning: boolean,
  onUpdated: () => void,

  // Sprite size is useful to make sure polygon vertices
  // are not put outside the sprite bounding box, which is not supported:
  spriteWidth: number,
  spriteHeight: number,
|};

const VerticesTable = (props: VerticesTableProps) => {
  const updateVerticeX = (vertice, newValue) => {
    // Ensure vertice stays inside the sprite bounding box.
    vertice.set_x(Math.min(props.spriteWidth, Math.max(newValue, 0)));
    props.onUpdated();
  };

  const updateVerticeY = (vertice, newValue) => {
    // Ensure vertice stays inside the sprite bounding box.
    vertice.set_y(Math.min(props.spriteHeight, Math.max(newValue, 0)));
    props.onUpdated();
  };

  return (
    <Column expand>
      {props.hasWarning && (
        <AlertMessage kind="warning">
          <Trans>
            The polygon is not convex. Ensure it is, otherwise the collision
            mask won't work.
          </Trans>
        </AlertMessage>
      )}
      <Spacer />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn />
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
          {mapVector(props.vertices, (vertice, j) => (
            <SortableVerticeRow
              index={j}
              key={j}
              disabled
              verticeX={vertice.get_x()}
              verticeY={vertice.get_y()}
              onChangeVerticeX={newValue => updateVerticeX(vertice, newValue)}
              onChangeVerticeY={newValue => updateVerticeY(vertice, newValue)}
              onRemove={() => {
                gd.removeFromVectorVector2f(props.vertices, j);
                props.onUpdated();
              }}
              canRemove={props.vertices.size() > 3}
            />
          ))}
        </TableBody>
      </Table>
      <Line justifyContent="center">
        <FlatButton
          icon={<AddIcon size="small" />}
          label={<Trans>Add a vertex</Trans>}
          onClick={() => {
            const newVertice = new gd.Vector2f();
            props.vertices.push_back(newVertice);
            newVertice.delete();
            props.onUpdated();
          }}
        />
      </Line>
    </Column>
  );
};

const SortableVerticesTable = SortableContainer(VerticesTable);

type PolygonSectionProps = {|
  polygon: gdPolygon2d,
  onUpdated: () => void,
  onRemove: () => void,

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
        <WarningIcon style={{ color: warningColor }} />
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
      <DeleteIcon />
    </IconButton>,
  ];

  return (
    <Accordion defaultExpanded>
      <AccordionHeader actions={polygonActions}>
        <Text displayInlineAsSpan>
          {verticesCount === 3 && `Triangle`}
          {verticesCount === 4 && `Quadrilateral`}
          {verticesCount >= 5 && `Polygon with ${verticesCount} vertices`}
        </Text>
      </AccordionHeader>
      <AccordionBody disableGutters>
        <SortableVerticesTable
          vertices={vertices}
          hasWarning={!isConvex}
          onUpdated={props.onUpdated}
          spriteWidth={props.spriteWidth}
          spriteHeight={props.spriteHeight}
          onSortEnd={({ oldIndex, newIndex }) => {
            // Reordering polygons is not supported for now
          }}
          helperClass="sortable-helper"
          useDragHandle
          lockToContainerEdges
        />
      </AccordionBody>
    </Accordion>
  );
};

type PolygonsListProps = {|
  polygons: gdVectorPolygon2d,
  onPolygonsUpdated: () => void,

  // Sprite size is useful to make sure polygon vertices
  // are not put outside the sprite bounding box, which is not supported:
  spriteWidth: number,
  spriteHeight: number,
|};

const PolygonsList = (props: PolygonsListProps) => {
  return (
    <React.Fragment>
      <Column expand>
        {mapVector(props.polygons, (polygon, i) => (
          <PolygonSection
            key={`polygon-${i}`}
            polygon={polygon}
            onUpdated={props.onPolygonsUpdated}
            onRemove={() => {
              gd.removeFromVectorPolygon2d(props.polygons, i);
              props.onPolygonsUpdated();
            }}
            spriteWidth={props.spriteWidth}
            spriteHeight={props.spriteHeight}
          />
        ))}
        <Line alignItems="center" justifyContent="center">
          <RaisedButton
            primary
            icon={<AddIcon />}
            label={<Trans>Add collision mask</Trans>}
            onClick={() => {
              const newPolygon = gd.Polygon2d.createRectangle(32, 32);
              newPolygon.move(props.spriteWidth / 2, props.spriteHeight / 2);
              props.polygons.push_back(newPolygon);
              props.onPolygonsUpdated();
            }}
          />
        </Line>
      </Column>
    </React.Fragment>
  );
};

export default PolygonsList;
