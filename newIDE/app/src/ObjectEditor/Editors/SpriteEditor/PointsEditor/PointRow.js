// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import Edit from '@material-ui/icons/Edit';
import TextField from '../../../../UI/TextField';
import SemiControlledTextField from '../../../../UI/SemiControlledTextField';
import styles from './styles';
import ThemeConsumer from '../../../../UI/Theme/ThemeConsumer';
import Text from '../../../../UI/Text';
import { roundTo } from '../../../../Utils/Mathematics';
import { Column } from '../../../../UI/Grid';

const POINT_COORDINATE_PRECISION = 4;

type Props = {|
  pointName: string,
  nameError?: boolean,
  onBlur?: (ev: any) => void,
  onRemove?: ?(ev: any) => void,
  onEdit?: ?(ev: any) => void,
  onClick: (pointName: string) => void,
  onPointerEnter: (pointName: ?string) => void,
  onPointerLeave: (pointName: ?string) => void,
  selected: boolean,
  pointX: number,
  pointY: number,
  onChangePointX: (value: number) => void,
  onChangePointY: (value: number) => void,
  isAutomatic?: boolean,
|};

const PointRow = ({ pointX, pointY, ...props }: Props) => (
  <ThemeConsumer>
    {muiTheme => (
      <TableRow
        style={{
          backgroundColor: props.selected
            ? muiTheme.listItem.selectedBackgroundColor
            : muiTheme.list.itemsBackgroundColor,
        }}
        onClick={() => props.onClick(props.pointName)}
        onPointerEnter={() => props.onPointerEnter(props.pointName)}
        onPointerLeave={props.onPointerEnter}
      >
        <TableRowColumn style={styles.nameColumn}>
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
        <TableRowColumn style={styles.coordinateColumn} padding="none">
          <Column>
            {!props.isAutomatic ? (
              <SemiControlledTextField
                margin="none"
                inputStyle={
                  props.selected
                    ? { color: muiTheme.listItem.selectedTextColor }
                    : undefined
                }
                value={roundTo(pointX, POINT_COORDINATE_PRECISION).toString()}
                type="number"
                id="point-x"
                onChange={value => {
                  const valueAsNumber = parseFloat(value);
                  if (!isNaN(valueAsNumber))
                    props.onChangePointX(valueAsNumber);
                }}
                onBlur={event => {
                  props.onChangePointX(
                    parseFloat(event.currentTarget.value) || 0
                  );
                }}
              />
            ) : (
              <Text noMargin>
                <Trans>(auto)</Trans>
              </Text>
            )}
          </Column>
        </TableRowColumn>
        <TableRowColumn style={styles.coordinateColumn} padding="none">
          <Column>
            {!props.isAutomatic ? (
              <SemiControlledTextField
                margin="none"
                inputStyle={
                  props.selected
                    ? { color: muiTheme.listItem.selectedTextColor }
                    : undefined
                }
                value={roundTo(pointY, POINT_COORDINATE_PRECISION).toString()}
                type="number"
                id="point-y"
                onChange={value => {
                  const valueAsNumber = parseFloat(value);
                  if (!isNaN(valueAsNumber))
                    props.onChangePointY(valueAsNumber);
                }}
                onBlur={event => {
                  props.onChangePointY(
                    parseFloat(event.currentTarget.value) || 0
                  );
                }}
              />
            ) : (
              <Text noMargin>
                <Trans>(auto)</Trans>
              </Text>
            )}
          </Column>
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

export default PointRow;
