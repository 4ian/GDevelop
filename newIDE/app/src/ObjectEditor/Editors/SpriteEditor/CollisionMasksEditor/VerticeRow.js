// @flow
import type { Node } from 'React';
import React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import TextField from '../../../../UI/TextField';
import styles from './styles';
import ThemeConsumer from '../../../../UI/Theme/ThemeConsumer';

type Props = {|
  canRemove: boolean,
  onRemove: () => void,
  verticeX: number,
  verticeY: number,
  onChangeVerticeX: (value: number) => void,
  onChangeVerticeY: (value: number) => void,
|};

const VerticeRow = (props: Props): Node => (
  <ThemeConsumer>
    {muiTheme => (
      <TableRow
        style={{
          backgroundColor: muiTheme.list.itemsBackgroundColor,
        }}
      >
        <TableRowColumn />
        <TableRowColumn style={styles.coordinateColumn}>
          <TextField
            margin="none"
            value={props.verticeX}
            type="number"
            id="vertice-x"
            onChange={(e, value) =>
              props.onChangeVerticeX(parseFloat(value || 0))
            }
          />
        </TableRowColumn>
        <TableRowColumn style={styles.coordinateColumn}>
          <TextField
            margin="none"
            value={props.verticeY}
            type="number"
            id="vertice-y"
            onChange={(e, value) =>
              props.onChangeVerticeY(parseFloat(value || 0))
            }
          />
        </TableRowColumn>
        <TableRowColumn style={styles.toolColumn}>
          {!!props.onRemove && (
            <IconButton
              size="small"
              onClick={props.onRemove}
              disabled={!props.canRemove}
            >
              <Delete />
            </IconButton>
          )}
        </TableRowColumn>
      </TableRow>
    )}
  </ThemeConsumer>
);

export default VerticeRow;
