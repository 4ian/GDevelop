// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { type UnsavedChanges } from '../../MainFrame/UnsavedChangesContext';
import { type ExtensionItemConfigurationAttribute } from '../../EventsFunctionsExtensionEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { LineStackLayout } from '../../UI/Layout';
import {
  EventsBasedBehaviorOrObjectEditor,
  type EventsBasedBehaviorOrObjectEditorInterface,
} from '.';
import PropertyListEditor, {
  type PropertyListEditorInterface,
} from '../PropertyListEditor';
import FlatButton from '../../UI/FlatButton';
import HelpButton from '../../UI/HelpButton';
import Dialog from '../../UI/Dialog';
import { type VariableDialogOpeningProps } from '../../VariablesList/VariablesEditorDialog';

const styles = {
  simpleSizeContainer: {
    display: 'flex',
    flex: 1,
  },
  doubleSizeContainer: {
    display: 'flex',
    flex: 2,
  },
};

type Props = {|
  project: gdProject,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior?: ?gdEventsBasedBehavior,
  eventsBasedObject?: ?gdEventsBasedObject,
  onRenameProperty: (oldName: string, newName: string) => void,
  onRenameSharedProperty: (oldName: string, newName: string) => void,
  onPropertyTypeChanged: (propertyName: string) => void,
  onPropertiesUpdated: () => void,
  onEventsFunctionsAdded: () => void,
  unsavedChanges?: ?UnsavedChanges,
  onConfigurationUpdated?: (?ExtensionItemConfigurationAttribute) => void,
  onOpenCustomObjectEditor: () => void,
  onEventsBasedObjectChildrenEdited: (
    eventsBasedObject: gdEventsBasedObject
  ) => void,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  onClose: () => void,
  initiallySelectedProperty: VariableDialogOpeningProps | null,
|};

export default function EventsBasedBehaviorOrObjectEditorDialog({
  eventsBasedBehavior,
  eventsBasedObject,
  eventsFunctionsExtension,
  project,
  projectScopedContainersAccessor,
  onRenameProperty,
  onRenameSharedProperty,
  onPropertyTypeChanged,
  unsavedChanges,
  onEventsFunctionsAdded,
  onConfigurationUpdated,
  onPropertiesUpdated,
  onOpenCustomObjectEditor,
  onEventsBasedObjectChildrenEdited,
  onWillInstallExtension,
  onExtensionInstalled,
  onClose,
  initiallySelectedProperty,
}: Props): React.Node {
  const editor = React.useRef<?EventsBasedBehaviorOrObjectEditorInterface>(
    null
  );
  const propertyList = React.useRef<?PropertyListEditorInterface>(null);

  return (
    <Dialog
      title={<Trans>Properties</Trans>}
      secondaryActions={[<HelpButton helpPagePath="/objects" key="help" />]}
      actions={[
        <FlatButton
          key="close"
          label={<Trans>Close</Trans>}
          primary={false}
          onClick={onClose}
          id="close-button"
        />,
      ]}
      onRequestClose={onClose}
      onApply={onClose}
      open
      flexBody
      fullHeight
      id="properties-editor-dialog"
    >
      <LineStackLayout expand useFullHeight noMargin>
        <div style={styles.doubleSizeContainer}>
          <EventsBasedBehaviorOrObjectEditor
            ref={editor}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            eventsFunctionsExtension={eventsFunctionsExtension}
            eventsBasedBehavior={eventsBasedBehavior}
            unsavedChanges={unsavedChanges}
            onRenameProperty={onRenameProperty}
            onRenameSharedProperty={onRenameSharedProperty}
            onPropertyTypeChanged={onPropertyTypeChanged}
            onEventsFunctionsAdded={onEventsFunctionsAdded}
            onConfigurationUpdated={onConfigurationUpdated}
            onOpenCustomObjectEditor={onOpenCustomObjectEditor}
            onEventsBasedObjectChildrenEdited={
              onEventsBasedObjectChildrenEdited
            }
            onWillInstallExtension={onWillInstallExtension}
            onExtensionInstalled={onExtensionInstalled}
            onPropertiesUpdated={() => {
              if (propertyList.current) {
                propertyList.current.forceUpdateList();
              }
              onPropertiesUpdated();
            }}
            onFocusProperty={(propertyName, isSharedProperties) => {
              if (propertyList.current) {
                propertyList.current.setSelectedProperty(
                  propertyName,
                  isSharedProperties
                );
              }
            }}
          />
        </div>
        <div style={styles.simpleSizeContainer}>
          <PropertyListEditor
            ref={propertyList}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            extension={eventsFunctionsExtension}
            eventsBasedBehavior={eventsBasedBehavior}
            eventsBasedObject={eventsBasedObject}
            onRenameProperty={onRenameProperty}
            onPropertiesUpdated={() => {
              if (editor.current) {
                editor.current.forceUpdateProperties();
              }
              onPropertiesUpdated();
            }}
            onOpenConfiguration={propertyName => {
              if (editor.current) {
                editor.current.scrollToConfiguration();
              }
            }}
            onOpenProperty={(propertyName, isSharedProperties) => {
              if (editor.current) {
                editor.current.scrollToProperty(
                  propertyName,
                  isSharedProperties
                );
              }
            }}
            onEventsFunctionsAdded={onEventsFunctionsAdded}
            initiallySelectedProperty={initiallySelectedProperty}
          />
        </div>
      </LineStackLayout>
    </Dialog>
  );
}
