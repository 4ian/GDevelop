// @flow
import * as React from 'react';
import {
  type InstructionsListContext,
  type InstructionContext,
  type ParameterContext,
  type VariableDeclarationContext,
} from '../../SelectionHandler';
import { type EventsScope } from '../../../InstructionOrExpression/EventsScope';
import { type ScreenType } from '../../../UI/Responsive/ScreenTypeMeasurer';
import { type WindowSizeType } from '../../../UI/Responsive/ResponsiveWindowMeasurer';
import { ProjectScopedContainersAccessor } from '../../../InstructionOrExpression/EventsScope';

export type EventRendererProps = {
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  event: gdBaseEvent,
  disabled: boolean,

  onUpdate: () => void,
  selected: boolean,
  onAddNewInstruction: InstructionsListContext => void,
  onPasteInstructions: InstructionsListContext => void,
  onMoveToInstruction: (destinationContext: InstructionContext) => void,
  onMoveToInstructionsList: (
    destinationContext: InstructionsListContext
  ) => void,
  onInstructionClick: InstructionContext => void,
  onInstructionDoubleClick: InstructionContext => void,
  onInstructionContextMenu: (x: number, y: number, InstructionContext) => void,
  onAddInstructionContextMenu: (
    HTMLButtonElement,
    InstructionsListContext
  ) => void,
  onParameterClick: ParameterContext => void,
  onEndEditingEvent: () => void,
  selection: any,

  onVariableDeclarationClick: VariableDeclarationContext => void,
  onVariableDeclarationDoubleClick: VariableDeclarationContext => void,

  onOpenLayout: string => void,
  onOpenExternalEvents: string => void,

  leftIndentWidth: number,
  renderObjectThumbnail: string => React.Node,

  screenType: ScreenType,
  windowSize: WindowSizeType,
  eventsSheetWidth: number,
  eventsSheetHeight: number,

  idPrefix: string,
};
