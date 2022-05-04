// @flow
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

const VerticeRow = ({ verticeX, verticeY, ...props }: Props) => {
  const [verticeXInputValue, setVerticeXInputValue] = React.useState<string>(
    verticeX.toString()
  );
  const [verticeYInputValue, setVerticeYInputValue] = React.useState<string>(
    verticeY.toString()
  );
  React.useEffect(
    () => {
      setVerticeXInputValue(verticeX.toString());
    },
    [verticeX]
  );
  React.useEffect(
    () => {
      setVerticeYInputValue(verticeY.toString());
    },
    [verticeY]
  );
  return (
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
              value={verticeXInputValue}
              type="number"
              id="vertice-x"
              onChange={(e, value) => {
                setVerticeXInputValue(value);
                const valueAsNumber = parseFloat(value);
                if (!isNaN(valueAsNumber)) {
                  props.onChangeVerticeX(valueAsNumber);
                }
              }}
            />
          </TableRowColumn>
          <TableRowColumn style={styles.coordinateColumn}>
            <TextField
              margin="none"
              value={verticeYInputValue}
              type="number"
              id="vertice-y"
              onChange={(e, value) => {
                setVerticeXInputValue(value);
                const valueAsNumber = parseFloat(value);
                if (!isNaN(valueAsNumber)) {
                  props.onChangeVerticeY(valueAsNumber);
                }
              }}
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
};

export default VerticeRow;
