import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import muiThemeable from 'material-ui/styles/muiThemeable';
import styles from './styles';

const ThemablePolygonRow = ({
  onRemove,
  isConvex,
  verticesCount,
  muiTheme,
}) => {
  return (
    <TableRow
      style={{
        backgroundColor: muiTheme.list.itemsBackgroundColor,
      }}
    >
      <TableRowColumn style={styles.handleColumn}>
        {/* <DragHandle /> Reordering polygons is not supported for now */}
      </TableRowColumn>
      {isConvex && (
        <TableRowColumn>
          {verticesCount === 3 && `Triangle`}
          {verticesCount === 4 && `Quadrilateral`}
          {verticesCount >= 5 && `Polygon with ${verticesCount} vertices`}
        </TableRowColumn>
      )}
      {!isConvex && <TableRowColumn>Polygon is not convex!</TableRowColumn>}
      <TableRowColumn style={styles.coordinateColumn} />
      <TableRowColumn style={styles.coordinateColumn} />
      <TableRowColumn style={styles.toolColumn}>
        {!!onRemove && (
          <IconButton onClick={onRemove}>
            <Delete />
          </IconButton>
        )}
      </TableRowColumn>
    </TableRow>
  );
};

const PointRow = muiThemeable()(ThemablePolygonRow);
export default PointRow;
