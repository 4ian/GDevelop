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

type Props = {|
  parentVerticeId: string,
  canRemove: boolean,
  onRemove: () => void,
  verticeX: number,
  verticeY: number,
  onChangeVerticeX: (value: number) => void,
  onChangeVerticeY: (value: number) => void,
  onMouseEnter: () => void,
  onMouseLeave: () => void,
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
                style={{ backgroundColor: muiTheme.list.itemsBackgroundColor }}
                onMouseEnter={props.onMouseEnter}
                onMouseLeave={props.onMouseLeave}
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
                    value={verticeX.toString()}
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
                    value={verticeY.toString()}
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
