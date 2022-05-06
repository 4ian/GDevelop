// @flow
import React from 'react';
import Delete from '@material-ui/icons/Delete';
import { TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import SemiControlledTextField from '../../../../UI/SemiControlledTextField';
import ThemeConsumer from '../../../../UI/Theme/ThemeConsumer';
import { makeDragSourceAndDropTarget } from '../../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { dropIndicatorColor } from '../../../../UI/SortableVirtualizedItemList/DropIndicator';
import DragHandle from '../../../../UI/DragHandle';
import styles from './styles';
import { roundTo } from '../../../../Utils/Mathematics';

const VERTICE_COORDINATE_PRECISION = 4;

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
  setDragged: () => void,
  drop: () => void,
|};

const VerticeRow = ({
  verticeX,
  verticeY,
  parentVerticeId,
  ...props
}: Props) => {
  const DragSourceAndDropTarget = React.useMemo(
    () => makeDragSourceAndDropTarget(`collision-mask-${parentVerticeId}`),
    [parentVerticeId]
  );

  return (
    <ThemeConsumer>
      {muiTheme => (
        <DragSourceAndDropTarget
          beginDrag={() => {
            props.setDragged();
            return {};
          }}
          canDrag={() => true}
          canDrop={() => true}
          drop={() => {
            props.drop();
          }}
        >
          {({ connectDragSource, connectDropTarget, isOver, canDrop }) =>
            connectDropTarget(
              // Input of connectDropTarget must be an html element.
              // So instead of using Material UI table row,
              // the MUI class name for the component is used.
              <tr
                className="MuiTableRow-root"
                style={{
                  backgroundColor: props.selected
                    ? muiTheme.listItem.selectedBackgroundColor
                    : muiTheme.list.itemsBackgroundColor,
                }}
                onPointerEnter={props.onPointerEnter}
                onPointerLeave={props.onPointerLeave}
                onClick={props.onClick}
              >
                {connectDragSource(
                  <td
                    style={
                      isOver
                        ? { borderTop: `2px solid ${dropIndicatorColor}` }
                        : undefined
                    }
                  >
                    <DragHandle />
                  </td>
                )}
                <TableRowColumn style={styles.coordinateColumn}>
                  <SemiControlledTextField
                    margin="none"
                    inputStyle={
                      props.selected
                        ? { color: muiTheme.listItem.selectedTextColor }
                        : undefined
                    }
                    value={roundTo(
                      verticeX,
                      VERTICE_COORDINATE_PRECISION
                    ).toString()}
                    type="number"
                    id="vertice-x"
                    onChange={value => {
                      const valueAsNumber = parseFloat(value);
                      if (!isNaN(valueAsNumber))
                        props.onChangeVerticeX(valueAsNumber);
                    }}
                    onBlur={event => {
                      props.onChangeVerticeX(
                        parseFloat(event.currentTarget.value) || 0
                      );
                    }}
                  />
                </TableRowColumn>
                <TableRowColumn style={styles.coordinateColumn}>
                  <SemiControlledTextField
                    margin="none"
                    inputStyle={
                      props.selected
                        ? { color: muiTheme.listItem.selectedTextColor }
                        : undefined
                    }
                    value={roundTo(
                      verticeY,
                      VERTICE_COORDINATE_PRECISION
                    ).toString()}
                    type="number"
                    id="vertice-y"
                    onChange={value => {
                      const valueAsNumber = parseFloat(value);
                      if (!isNaN(valueAsNumber))
                        props.onChangeVerticeY(valueAsNumber);
                    }}
                    onBlur={event => {
                      props.onChangeVerticeY(
                        parseFloat(event.currentTarget.value) || 0
                      );
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
              </tr>
            )
          }
        </DragSourceAndDropTarget>
      )}
    </ThemeConsumer>
  );
};

export default VerticeRow;
