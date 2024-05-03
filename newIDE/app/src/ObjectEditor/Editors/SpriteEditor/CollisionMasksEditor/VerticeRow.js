// @flow
import React from 'react';
import { TableRow, TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import SemiControlledTextField from '../../../../UI/SemiControlledTextField';
import styles from './styles';
import { roundTo } from '../../../../Utils/Mathematics';
import GDevelopThemeContext from '../../../../UI/Theme/GDevelopThemeContext';
import Trash from '../../../../UI/CustomSvgIcons/Trash';

const VERTEX_COORDINATE_PRECISION = 4;

type Props = {|
  parentVerticeId: string,
  canRemove: boolean,
  onRemove: () => void,
  onClick: () => void,
  selected?: boolean,
  verticeX: number,
  verticeY: number,
  onChangeVerticeX: (value: number) => void,
  onChangeVerticeY: (value: number) => void,
  onPointerEnter: () => void,
  onPointerLeave: () => void,
|};

const VerticeRow = ({
  verticeX,
  verticeY,
  parentVerticeId,
  ...props
}: Props) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <TableRow
      style={{
        backgroundColor: props.selected
          ? gdevelopTheme.listItem.selectedBackgroundColor
          : gdevelopTheme.list.itemsBackgroundColor,
      }}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
      onClick={props.onClick}
    >
      <TableRowColumn style={styles.coordinateColumn}>
        <SemiControlledTextField
          margin="none"
          inputStyle={
            props.selected
              ? { color: gdevelopTheme.listItem.selectedTextColor }
              : undefined
          }
          value={roundTo(verticeX, VERTEX_COORDINATE_PRECISION).toString()}
          type="number"
          step={0.5}
          id="vertice-x"
          onChange={value => {
            const valueAsNumber = parseFloat(value);
            if (!isNaN(valueAsNumber)) props.onChangeVerticeX(valueAsNumber);
          }}
          onBlur={event => {
            props.onChangeVerticeX(parseFloat(event.currentTarget.value) || 0);
          }}
        />
      </TableRowColumn>
      <TableRowColumn style={styles.coordinateColumn}>
        <SemiControlledTextField
          margin="none"
          inputStyle={
            props.selected
              ? { color: gdevelopTheme.listItem.selectedTextColor }
              : undefined
          }
          value={roundTo(verticeY, VERTEX_COORDINATE_PRECISION).toString()}
          type="number"
          step={0.5}
          id="vertice-y"
          onChange={value => {
            const valueAsNumber = parseFloat(value);
            if (!isNaN(valueAsNumber)) props.onChangeVerticeY(valueAsNumber);
          }}
          onBlur={event => {
            props.onChangeVerticeY(parseFloat(event.currentTarget.value) || 0);
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
            <Trash />
          </IconButton>
        )}
      </TableRowColumn>
    </TableRow>
  );
};

export default VerticeRow;
