// @flow
import React from 'react';
import { TableRowColumn } from '../../../../UI/Table';
import IconButton from '../../../../UI/IconButton';
import Delete from '@material-ui/icons/Delete';
import TextField from '../../../../UI/TextField';
import styles from './styles';
import ThemeConsumer from '../../../../UI/Theme/ThemeConsumer';
import { makeDragSourceAndDropTarget } from '../../../../UI/DragAndDrop/DragSourceAndDropTarget';
import { dropIndicatorColor } from '../../../../UI/SortableVirtualizedItemList/DropIndicator';
import DragHandle from '../../../../UI/DragHandle';

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
                      setVerticeYInputValue(value);
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
              </tr>
            )
          }
        </DragSourceAndDropTarget>
      )}
    </ThemeConsumer>
  );
};

export default VerticeRow;
