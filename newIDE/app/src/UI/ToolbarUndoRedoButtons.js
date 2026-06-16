// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import IconButton from './IconButton';
import ToolbarSeparator from './ToolbarSeparator';
import RedoIcon from './CustomSvgIcons/Redo';
import UndoIcon from './CustomSvgIcons/Undo';

type Props = {|
  undo: () => void,
  canUndo: boolean,
  redo: () => void,
  canRedo: boolean,
  undoAcceleratorString?: string,
  redoAcceleratorString?: string,
|};

const ToolbarUndoRedoButtons = React.memo<Props>(function ToolbarUndoRedoButtons({
  undo,
  canUndo,
  redo,
  canRedo,
  undoAcceleratorString,
  redoAcceleratorString,
}: Props) {
  return (
    <>
      <ToolbarSeparator />
      <IconButton
        size="small"
        color="default"
        onClick={undo}
        disabled={!canUndo}
        tooltip={t`Undo the last changes`}
        acceleratorString={undoAcceleratorString}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        size="small"
        color="default"
        onClick={redo}
        disabled={!canRedo}
        tooltip={t`Redo the last changes`}
        acceleratorString={redoAcceleratorString}
      >
        <RedoIcon />
      </IconButton>
    </>
  );
});

export default ToolbarUndoRedoButtons;
