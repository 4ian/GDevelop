// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { t } from '@lingui/macro';

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
import EditorNavigator from '../../UI/EditorMosaic/EditorNavigator';
import { type Editor } from '../../UI/EditorMosaic';
import TuneIcon from '../../UI/CustomSvgIcons/Tune';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import AddIcon from '../../UI/CustomSvgIcons/Add';
import newNameGenerator from '../../Utils/NewNameGenerator';

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

const noop = () => {};

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
  const propertyEditor = React.useRef<?EventsBasedBehaviorOrObjectEditorInterface>(
    null
  );
  const propertyList = React.useRef<?PropertyListEditorInterface>(null);

  const lastFocusedProperty = React.useRef<{
    propertyName: string,
    isSharedProperties: boolean,
  } | null>(null);

  const eventsBasedEntity = eventsBasedBehavior || eventsBasedObject;

  const addProperty = React.useCallback(
    (name?: string, type?: string | null) => {
      if (!eventsBasedEntity) {
        return;
      }
      const properties = eventsBasedEntity.getPropertyDescriptors();
      const newName = newNameGenerator(name || 'Property', name =>
        properties.has(name)
      );
      const property = properties.insertNew(newName, properties.getCount());
      property.setType(type || 'Number');

      if (propertyEditor.current) {
        propertyEditor.current.forceUpdateProperties();
      }
      if (propertyList.current) {
        propertyList.current.forceUpdateList();
      }
      // Scroll to the selected property.
      // Ideally, we'd wait for the list to be updated to scroll, but
      // to simplify the code, we just wait a few ms for a new render
      // to be done.
      setTimeout(() => {
        if (propertyList.current) {
          propertyList.current.setSelectedProperty(newName, false);
        }
        if (propertyEditor.current) {
          propertyEditor.current.scrollToProperty(newName, false);
        }
        if (propertyEditor.current) {
          propertyEditor.current.focusOnProperty(newName, false);
        }
      }, 100); // A few ms is enough for a new render to be done.
      onPropertiesUpdated();
    },
    [eventsBasedEntity, onPropertiesUpdated]
  );

  React.useEffect(
    () => {
      if (!eventsBasedEntity) {
        return;
      }
      const properties = eventsBasedEntity.getPropertyDescriptors();
      if (!initiallySelectedProperty || !properties) {
        return;
      }
      if (initiallySelectedProperty.shouldCreate) {
        const propertyType =
          initiallySelectedProperty.variableType === 'number'
            ? 'Number'
            : initiallySelectedProperty.variableType === 'string'
            ? 'String'
            : initiallySelectedProperty.variableType === 'boolean'
            ? 'Boolean'
            : initiallySelectedProperty.variableType;
        addProperty(initiallySelectedProperty.variableName, propertyType);
      } else {
        const currentPropertyEditor = propertyEditor.current;
        if (currentPropertyEditor) {
          currentPropertyEditor.scrollToProperty(
            initiallySelectedProperty.variableName,
            false
          );
        }
        const currentPropertyList = propertyList.current;
        if (currentPropertyList) {
          currentPropertyList.setSelectedProperty(
            initiallySelectedProperty.variableName,
            false
          );
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const editors: {
    [string]: Editor,
  } = {
    propertyList: {
      type: 'primary',
      noTitleBar: true,
      title: t`Properties`,
      toolbarControls: [],
      renderEditor: () => (
        <PropertyListEditor
          ref={propertyList}
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          extension={eventsFunctionsExtension}
          eventsBasedBehavior={eventsBasedBehavior}
          eventsBasedObject={eventsBasedObject}
          onRenameProperty={onRenameProperty}
          onPropertiesUpdated={() => {
            if (propertyEditor.current) {
              propertyEditor.current.forceUpdateProperties();
            }
            onPropertiesUpdated();
          }}
          onOpenConfiguration={propertyName => {
            if (propertyEditor.current) {
              propertyEditor.current.scrollToConfiguration();
            }
          }}
          onOpenProperty={(propertyName, isSharedProperties) => {
            if (propertyEditor.current) {
              propertyEditor.current.scrollToProperty(
                propertyName,
                isSharedProperties
              );
            }
          }}
          onEventsFunctionsAdded={onEventsFunctionsAdded}
          initiallySelectedProperty={initiallySelectedProperty}
        />
      ),
    },
    propertyEditor: {
      type: 'primary',
      noTitleBar: true,
      noSoftKeyboardAvoidance: true,
      title: eventsBasedBehavior
        ? t`Behavior Configuration`
        : eventsBasedObject
        ? t`Object Configuration`
        : null,
      toolbarControls: [],
      renderEditor: () => (
        <EventsBasedBehaviorOrObjectEditor
          ref={propertyEditor}
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          eventsFunctionsExtension={eventsFunctionsExtension}
          eventsBasedBehavior={eventsBasedBehavior}
          eventsBasedObject={eventsBasedObject}
          unsavedChanges={unsavedChanges}
          onRenameProperty={onRenameProperty}
          onRenameSharedProperty={onRenameSharedProperty}
          onPropertyTypeChanged={onPropertyTypeChanged}
          onEventsFunctionsAdded={onEventsFunctionsAdded}
          onConfigurationUpdated={onConfigurationUpdated}
          onOpenCustomObjectEditor={onOpenCustomObjectEditor}
          onEventsBasedObjectChildrenEdited={onEventsBasedObjectChildrenEdited}
          onWillInstallExtension={onWillInstallExtension}
          onExtensionInstalled={onExtensionInstalled}
          onPropertiesUpdated={() => {
            if (propertyList.current) {
              propertyList.current.forceUpdateList();
            }
            onPropertiesUpdated();
          }}
          onFocusProperty={(propertyName, isSharedProperties) => {
            lastFocusedProperty.current = { propertyName, isSharedProperties };
            if (propertyList.current) {
              propertyList.current.setSelectedProperty(
                propertyName,
                isSharedProperties
              );
            }
          }}
          shouldHideAddPropertyButton={true}
        />
      ),
    },
  };

  const { isMobile } = useResponsiveWindowSize();

  return (
    <Dialog
      title={<Trans>Properties</Trans>}
      secondaryActions={[
        <HelpButton helpPagePath="/objects" key="help" />,
        <FlatButton
          primary
          label={<Trans>Add a property</Trans>}
          onClick={() => addProperty()}
          leftIcon={<AddIcon />}
        />,
      ]}
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
        {isMobile ? (
          <EditorNavigator
            editors={editors}
            initialEditorName={'propertyEditor'}
            transitions={{
              propertyEditor: {
                nextIcon: <TuneIcon />,
                nextLabel: <Trans>Property list</Trans>,
                previousEditor: null,
                nextEditor: () => {
                  const selection = lastFocusedProperty.current;
                  if (selection) {
                    const { propertyName, isSharedProperties } = selection;
                    // Scroll to the selected property.
                    // Ideally, we'd wait for the list to be updated to scroll, but
                    // to simplify the code, we just wait a few ms for a new render
                    // to be done.
                    setTimeout(() => {
                      if (propertyList.current) {
                        propertyList.current.setSelectedProperty(
                          propertyName,
                          isSharedProperties
                        );
                      }
                    }, 100); // A few ms is enough for a new render to be done.
                  }
                  return 'propertyList';
                },
              },
              propertyList: {
                nextIcon: null,
                nextLabel: null,
                nextEditor: null,
                previousEditor: () => {
                  if (propertyList.current) {
                    const selection = propertyList.current.getSelectedProperty();
                    if (selection) {
                      const { propertyName, isSharedProperties } = selection;
                      // Scroll to the selected property.
                      // Ideally, we'd wait for the list to be updated to scroll, but
                      // to simplify the code, we just wait a few ms for a new render
                      // to be done.
                      setTimeout(() => {
                        if (propertyEditor.current) {
                          propertyEditor.current.scrollToProperty(
                            propertyName,
                            isSharedProperties
                          );
                        }
                      }, 100); // A few ms is enough for a new render to be done.
                    }
                  }
                  return 'propertyEditor';
                },
              },
            }}
            onEditorChanged={
              // It's important that this callback is the same across renders,
              // to avoid confusing EditorNavigator into thinking it's changed
              // and immediately calling it, which would trigger an infinite loop.
              // Search for "callback-prevent-infinite-rerendering" in the codebase.
              noop
            }
          />
        ) : (
          <>
            <div style={styles.doubleSizeContainer}>
              {editors.propertyEditor.renderEditor()}
            </div>
            <div style={styles.simpleSizeContainer}>
              {editors.propertyList.renderEditor()}
            </div>
          </>
        )}
      </LineStackLayout>
    </Dialog>
  );
}
