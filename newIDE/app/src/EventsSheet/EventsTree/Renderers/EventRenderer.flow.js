// @flow
import {
  type InstructionsListContext,
  type InstructionContext,
  type ParameterContext,
} from '../../SelectionHandler';

export type EventRendererProps = {
  project: gdProject,
  layout?: ?gdLayout,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  event: gdBaseEvent,
  disabled: boolean,

  onUpdate: () => void,
  selected: boolean,
  onAddNewInstruction: Function,
  onMoveToInstruction: (destinationContext: InstructionContext) => void,
  onMoveToInstructionsList: (
    destinationContext: InstructionsListContext
  ) => void,
  onInstructionClick: InstructionContext => void,
  onInstructionDoubleClick: InstructionContext => void,
  onInstructionContextMenu: (x: number, y: number, InstructionContext) => void,
  onInstructionsListContextMenu: (
    x: number,
    y: number,
    InstructionsListContext
  ) => void,
  onParameterClick: ParameterContext => void,
  selection: any,

  onOpenLayout: string => void,
  onOpenExternalEvents: string => void,

  leftIndentWidth: number,
};
