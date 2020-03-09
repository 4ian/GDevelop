// @flow
import * as React from 'react';
import { makeDragSourceAndDropTarget } from '../UI/DragAndDrop/DragSourceAndDropTarget';
import { makeDropTarget } from '../UI/DragAndDrop/DropTarget';

type Props = {||};

const DragSourceAndDropTarget = makeDragSourceAndDropTarget<{
  someData: string,
}>('dnd-type1');

const DragSourceAndDropTargetBox = ({ name }: {| name: string |}) => (
  <DragSourceAndDropTarget
    beginDrag={() => {
      console.log(
        'Begin dragging' + name + ', which should be added to the selection'
      );

      return { someData: name };
    }}
    canDrop={() => name.indexOf('cant-drop-here') === -1}
    drop={() => {
      console.log('Selection to be dropped on' + name);
    }}
  >
    {({ connectDragSource, connectDropTarget, isOver, canDrop }) => {
      const connectedDragSource = connectDragSource(
        <div
          style={{
            backgroundColor: 'blue',
            color: 'white',
            height: 100,
            width: 100,
            margin: 20,
          }}
        >
          This is a box called {name}.{isOver && <div>Hovered</div>}
          {canDrop && <div>Can drop here</div>}
        </div>
      );

      return connectedDragSource
        ? connectDropTarget(connectedDragSource)
        : null;
    }}
  </DragSourceAndDropTarget>
);

const DropTarget = makeDropTarget<{
  someData: string,
}>('dnd-type1');

const DropTargetBox = ({ name }: {| name: string |}) => (
  <DropTarget
    canDrop={() => name.indexOf('cant-drop-here') === -1}
    drop={() => {
      console.log('Selection to be dropped on' + name);
    }}
  >
    {({ connectDropTarget, isOver, canDrop }) =>
      connectDropTarget(
        <div
          style={{
            backgroundColor: 'green',
            color: 'white',
            height: 100,
            width: 100,
            margin: 20,
          }}
        >
          This is a box called {name}.{isOver && <div>Hovered</div>}
          {canDrop && <div>Can drop here</div>}
        </div>
      )
    }
  </DropTarget>
);

export default (props: Props) => (
  <div>
    <DragSourceAndDropTargetBox name="box1" />
    <DragSourceAndDropTargetBox name="box2, cant-drop-here" />
    <DragSourceAndDropTargetBox name="box3" />
    <DropTargetBox name="box4, drop target only" />
    <DropTargetBox name="box5, drop target but cant-drop-here" />
  </div>
);
