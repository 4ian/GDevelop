import React from 'react';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import Checkbox from 'material-ui/Checkbox';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import IconButton from 'material-ui/IconButton';
import Delete from 'material-ui/svg-icons/action/delete';
import TextField from 'material-ui/TextField';
import muiThemeable from 'material-ui/styles/muiThemeable';
import DragHandle from '../UI/DragHandle';
import styles from './styles';

const ThemableLayerRow = ({
  layerName,
  nameError,
  onBlur,
  onRemove,
  isVisible,
  onChangeVisibility,
  muiTheme,
}) => (
  <TableRow
    style={{
      backgroundColor: muiTheme.list.itemsBackgroundColor,
    }}
  >
    <TableRowColumn style={styles.handleColumn}>
      <DragHandle />
    </TableRowColumn>
    <TableRowColumn>
      <TextField
        defaultValue={layerName || 'Base layer'}
        id={layerName}
        errorText={nameError ? 'This name is already taken' : undefined}
        disabled={!layerName}
        onBlur={onBlur}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.visibleColumn}>
      <Checkbox
        checked={isVisible}
        checkedIcon={<Visibility />}
        uncheckedIcon={<VisibilityOff />}
        onCheck={onChangeVisibility}
      />
    </TableRowColumn>
    <TableRowColumn style={styles.toolColumn}>
      <IconButton onClick={onRemove}>
        <Delete />
      </IconButton>
    </TableRowColumn>
  </TableRow>
);

const LayerRow = muiThemeable()(
  ThemableLayerRow
);
export default LayerRow;
