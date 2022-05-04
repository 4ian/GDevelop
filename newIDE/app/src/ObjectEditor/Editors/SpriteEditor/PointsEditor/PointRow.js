// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import TextField from '../../../../UI/TextField';
import styles from './styles';
import ThemeConsumer from '../../../../UI/Theme/ThemeConsumer';
import Text from '../../../../UI/Text';

type Props = {|
  pointName: string,
  nameError: boolean,
  onBlur?: (ev: any) => void,
  onRemove?: (ev: any) => void,
  onEdit?: (ev: any) => void,
  onClick: (pointName: string) => void,
  onMouseEnter: (pointName: ?string) => void,
  onMouseLeave: (pointName: ?string) => void,
  selected: boolean,
  pointX: number,
  pointY: number,
  onChangePointX: (value: number) => void,
  onChangePointY: (value: number) => void,
  isAutomatic?: Boolean,
|};

const PointRow = ({ onMouseLeave, ...props }: Props) => {
  const onLeave = React.useCallback(
    () => {
      onMouseLeave(null);
    },
    [onMouseLeave]
  );
  return (
    <ThemeConsumer>
      {muiTheme => (
        <TableRow
          style={{
            backgroundColor: props.selected
              ? muiTheme.listItem.selectedBackgroundColor
              : muiTheme.list.itemsBackgroundColor,
          }}
          onClick={() => props.onClick(props.pointName)}
          onMouseEnter={() => props.onMouseEnter(props.pointName)}
          onMouseLeave={onLeave}
        >
          <TableRowColumn style={styles.handleColumn}>
            {/* <DragHandle /> Reordering point is not supported for now */}
          </TableRowColumn>
          <TableRowColumn>
            <TextField
              margin="none"
              inputStyle={
                props.selected
                  ? { color: muiTheme.listItem.selectedTextColor }
                  : undefined
              }
              defaultValue={props.pointName || 'Unnamed point'}
              id={props.pointName}
              fullWidth
              errorText={
                props.nameError ? 'This name is already taken' : undefined
              }
              disabled={!props.onBlur}
              onBlur={props.onBlur}
            />
          </TableRowColumn>
          <TableRowColumn style={styles.coordinateColumn}>
            {!props.isAutomatic ? (
              <TextField
                margin="none"
                inputStyle={
                  props.selected
                    ? { color: muiTheme.listItem.selectedTextColor }
                    : undefined
                }
                value={props.pointX}
                type="number"
                id="point-x"
                onChange={(e, value) =>
                  props.onChangePointX(parseFloat(value || 0))
                }
              />
            ) : (
              <Text noMargin>
                <Trans>(auto)</Trans>
              </Text>
            )}
          </TableRowColumn>
          <TableRowColumn style={styles.coordinateColumn}>
            {!props.isAutomatic ? (
              <TextField
                margin="none"
                inputStyle={
                  props.selected
                    ? { color: muiTheme.listItem.selectedTextColor }
                    : undefined
                }
                value={props.pointY}
                type="number"
                id="point-y"
                onChange={(e, value) =>
                  props.onChangePointY(parseFloat(value || 0))
                }
              />
            ) : (
              <Text noMargin>
                <Trans>(auto)</Trans>
              </Text>
            )}
          </TableRowColumn>
          <TableRowColumn style={styles.toolColumn}>
            {!!props.onRemove && (
              <IconButton size="small" onClick={props.onRemove}>
                <Delete />
              </IconButton>
            )}
            {!!props.onEdit && (
              <IconButton size="small" onClick={props.onEdit}>
                <Edit />
              </IconButton>
            )}
          </TableRowColumn>
        </TableRow>
      )}
    </ThemeConsumer>
  );
};

export default PointRow;
