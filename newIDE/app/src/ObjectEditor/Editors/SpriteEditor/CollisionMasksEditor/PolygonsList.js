// @flow
import * as React from 'react';
import { Trans, t } from '@lingui/macro';
import DeleteIcon from '@material-ui/icons/Delete';
import WarningIcon from '@material-ui/icons/Warning';
import AddIcon from '@material-ui/icons/Add';
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
import GDevelopThemeContext from '../../../../UI/Theme/ThemeContext';
import ScrollView from '../../../../UI/ScrollView';
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
  const draggedVerticeIndex = React.useRef<?number>(null);

  const updateVerticeX = (vertice: gdVector2f, newValue: number) => {
    // Ensure vertice stays inside the sprite bounding box.
    vertice.set_x(Math.min(props.spriteWidth, Math.max(newValue, 0)));
    props.onUpdated();
  };

  const updateVerticeY = (vertice: gdVector2f, newValue: number) => {
    // Ensure vertice stays inside the sprite bounding box.
    vertice.set_y(Math.min(props.spriteHeight, Math.max(newValue, 0)));
    props.onUpdated();
  };

  const dropVertice = (oldIndex: number, newIndex: number) => {
    if (oldIndex === newIndex) return;
    gd.moveVector2fInVector(
      props.vertices,
      oldIndex,
      newIndex > oldIndex ? newIndex - 1 : newIndex
    );
    props.onUpdated();
  };

  return (
    <Column expand>
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
          {mapVector(props.vertices, (vertice, verticeIndex) => (
            <VerticeRow
              key={vertice.ptr}
              parentVerticeId={props.vertices.ptr.toString()}
              setDragged={() => {
                draggedVerticeIndex.current = verticeIndex;
              }}
              drop={() => {
                const { current } = draggedVerticeIndex;
                if (!current && current !== 0) return;
                dropVertice(current, verticeIndex);
                draggedVerticeIndex.current = null;
              }}
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
          leftIcon={<AddIcon size="small" />}
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
  restoreCollisionMask: () => void,
  onHoverVertice: (ptr: ?number) => void,
  onClickVertice: (ptr: ?number) => void,
  selectedVerticePtr: ?number,

  // Sprite size is useful to make sure polygon vertices
  // are not put outside the sprite bounding box, which is not supported:
  spriteWidth: number,
  spriteHeight: number,
|};

const PolygonsList = (props: PolygonsListProps) => {
  const {
    polygons,
    spriteHeight,
    spriteWidth,
    onPolygonsUpdated,
    restoreCollisionMask,
    onHoverVertice,
    onClickVertice,
    selectedVerticePtr,
  } = props;

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
              onRemove={() => {
                gd.removeFromVectorPolygon2d(polygons, i);
                if (polygons.size() === 0) {
                  restoreCollisionMask();
                }
                onPolygonsUpdated();
              }}
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
              icon={<AddIcon />}
              label={<Trans>Add collision mask</Trans>}
              onClick={() => {
                addCollisionMask();
              }}
              buildMenuTemplate={i18n => [
                {
                  label: i18n._(t`Restore the default collision mask`),
                  click: restoreCollisionMask,
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
