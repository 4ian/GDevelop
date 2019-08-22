import React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import styles from './styles';
import ThemeConsumer from '../../../../UI/Theme/ThemeConsumer';

const PolygonRow = ({ onRemove, isConvex, verticesCount }) => {
  return (
    <ThemeConsumer>
      {muiTheme => (
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
      )}
    </ThemeConsumer>
  );
};

export default PolygonRow;
