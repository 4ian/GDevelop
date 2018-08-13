// @flow
import {
  type InstructionsListContext,
  type InstructionContext,
  type ParameterContext,
} from '../../SelectionHandler';

export type EventRendererProps = {
  project: gdProject,
  layout: gdLayout,
  event: gdBaseEvent,
  disabled: boolean,

  onUpdate: () => void,
  selected: boolean,
  onAddNewInstruction: Function,
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
  onUpdate: () => void,

  onOpenLayout: (string) => void,
  onOpenExternalEvents: (string) => void,

  leftIndentWidth: number,
};
