// @flow
import * as React from 'react';

import EventsSheet, { type EventsSheetInterface } from '../EventsSheet';
import { type MessageDescriptor } from '../Utils/i18n/MessageDescriptor.flow';
import { type EventsScope } from '../InstructionOrExpression/EventsScope';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import { type VariableDialogOpeningProps } from '../VariablesList/VariablesEditorDialog';

export type EventsFunctionEditorCapabilities = {|
  canEditParameters: boolean,
  canEditProperties: boolean,
|};

export const editableEventsFunctionCapabilities: EventsFunctionEditorCapabilities =
  {
    canEditParameters: true,
    canEditProperties: true,
  };

export const fixedEventsFunctionCapabilities: EventsFunctionEditorCapabilities =
  {
    canEditParameters: false,
    canEditProperties: false,
  };

type Props = {|
  project: gdProject,
  scope: EventsScope,
  eventsFunction: gdEventsFunction,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  capabilities: EventsFunctionEditorCapabilities,
  setToolbar: (?React.Node) => void,
  onOpenLayoutEditor?: ?() => void,
  onOpenSettings?: ?() => void,
  settingsIcon?: React.Node,
  settingsTooltip?: MessageDescriptor,
  settingsButtonPosition?: 'start' | 'end',
  onOpenExternalEvents: (string) => void,
  onOpenLayout: (string) => void,
  resourceManagementProps: ResourceManagementProps,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => Promise<void>,
  onBeginCreateEventsFunction: () => void,
  unsavedChanges?: ?UnsavedChanges,
  isActive: boolean,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  editEventsFunctionParameter?: ?(VariableDialogOpeningProps) => void,
  openEventsBasedEntityPropertyEditorDialog?: ?(
    VariableDialogOpeningProps
  ) => void,
|};

const EventsFunctionEditor: React.ComponentType<{
  ...Props,
  +ref?: React.RefSetter<EventsSheetInterface>,
}> = React.forwardRef<Props, EventsSheetInterface>(
  (
    {
      eventsFunction,
      capabilities,
      editEventsFunctionParameter,
      openEventsBasedEntityPropertyEditorDialog,
      ...eventsSheetProps
    }: Props,
    ref
  ): React.Node => (
    <EventsSheet
      {...eventsSheetProps}
      ref={ref}
      events={eventsFunction.getEvents()}
      editEventsFunctionParameter={
        capabilities.canEditParameters
          ? editEventsFunctionParameter || null
          : null
      }
      openEventsBasedEntityPropertyEditorDialog={
        capabilities.canEditProperties
          ? openEventsBasedEntityPropertyEditorDialog || null
          : null
      }
    />
  )
);

export default EventsFunctionEditor;
