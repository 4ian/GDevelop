// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';

import WindowPortal from '../UI/WindowPortal';
import AlertProvider from '../UI/Alert/AlertProvider';
import { FullThemeProvider } from '../UI/Theme/FullThemeProvider';
import { SpecificDimensionsWindowSizeProvider } from '../UI/Responsive/ResponsiveWindowMeasurer';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import SemiControlledTextField from '../UI/SemiControlledTextField';
import ObjectsEditorService from '../ObjectEditor/ObjectsEditorService';
import { type EditorProps } from '../ObjectEditor/Editors/EditorProps.flow';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import classes from './RichObjectEditorWindow.module.css';

type Props = {|
  project: gdProject,
  object: gdObject,
  layout: gdLayout | null,
  eventsFunctionsExtension: gdEventsFunctionsExtension | null,
  eventsBasedObject: gdEventsBasedObject | null,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  resourceManagementProps: ResourceManagementProps,
  unsavedChanges: ?UnsavedChanges,
  objectTypeLabel: string,
  originLabel: string,
  getValidatedObjectName: string => string,
  onRenameObject: string => void,
  onObjectUpdated: () => void,
  onOpenEventBasedObjectEditor: (
    extensionName: string,
    eventsBasedObjectName: string
  ) => void,
  onOpenEventBasedObjectVariantEditor: (
    extensionName: string,
    eventsBasedObjectName: string,
    variantName: string
  ) => void,
  onDeleteEventsBasedObjectVariant: (
    eventsFunctionsExtension: gdEventsFunctionsExtension,
    eventsBasedObject: gdEventsBasedObject,
    variant: gdEventsBasedObjectVariant
  ) => void,
  onClose: () => void,
|};

const RichObjectEditorWindow = ({
  project,
  object,
  layout,
  eventsFunctionsExtension,
  eventsBasedObject,
  projectScopedContainersAccessor,
  resourceManagementProps,
  unsavedChanges,
  objectTypeLabel,
  originLabel,
  getValidatedObjectName,
  onRenameObject,
  onObjectUpdated,
  onOpenEventBasedObjectEditor,
  onOpenEventBasedObjectVariantEditor,
  onDeleteEventsBasedObjectVariant,
  onClose,
}: Props): React.Node => {
  const [externalWindow, setExternalWindow] = React.useState<?any>(null);
  const [renderVersion, setRenderVersion] = React.useState(0);
  const [objectName, setObjectName] = React.useState(object.getName());
  const editorConfiguration = ObjectsEditorService.getEditorConfiguration(
    project,
    object.getType()
  );
  const EditorComponent: ?React.ComponentType<EditorProps> = editorConfiguration
    ? editorConfiguration.component
    : null;

  const notifyObjectUpdated = React.useCallback(
    () => {
      onObjectUpdated();
      setRenderVersion(version => version + 1);
    },
    [onObjectUpdated]
  );

  return (
    <WindowPortal
      role="object-editor"
      title={`Edit ${objectName}`}
      initialWidth={1100}
      initialHeight={760}
      onClose={onClose}
      onWindowReady={setExternalWindow}
      renderContent={({ windowSize }) => (
        <SpecificDimensionsWindowSizeProvider
          innerWidth={windowSize.width}
          innerHeight={windowSize.height}
        >
          <FullThemeProvider forcedThemeName="Dark">
            <AlertProvider>
              <DragAndDropContextProvider
                key={
                  externalWindow
                    ? 'rich-object-editor-external-window'
                    : 'rich-object-editor-main-window-fallback'
                }
                window={externalWindow}
              >
                <div className={classes.root} data-render-version={renderVersion}>
                  <header className={classes.titlebar}>
                    <span className={classes.title}>
                      <Trans>Edit {objectName}</Trans>
                    </span>
                    <span className={classes.subtitle}>
                      {objectTypeLabel} · {originLabel}
                    </span>
                  </header>
                  <main className={classes.editor}>
                    {EditorComponent && (
                      <EditorComponent
                        objectConfiguration={object.getConfiguration()}
                        project={project}
                        layout={layout}
                        eventsFunctionsExtension={eventsFunctionsExtension}
                        eventsBasedObject={eventsBasedObject}
                        object={object}
                        objectName={objectName}
                        resourceManagementProps={resourceManagementProps}
                        projectScopedContainersAccessor={
                          projectScopedContainersAccessor
                        }
                        unsavedChanges={unsavedChanges || undefined}
                        onSizeUpdated={() =>
                          setRenderVersion(version => version + 1)
                        }
                        onObjectUpdated={notifyObjectUpdated}
                        renderObjectNameField={() => (
                          <SemiControlledTextField
                            fullWidth
                            id="object-name"
                            commitOnBlur
                            floatingLabelText={<Trans>Object name</Trans>}
                            floatingLabelFixed
                            value={objectName}
                            onChange={value => {
                              const validatedName = getValidatedObjectName(
                                value
                              );
                              if (validatedName === objectName) return;
                              onRenameObject(validatedName);
                              setObjectName(validatedName);
                              notifyObjectUpdated();
                            }}
                            autoFocus="desktop"
                          />
                        )}
                        onOpenEventBasedObjectEditor={
                          onOpenEventBasedObjectEditor
                        }
                        onOpenEventBasedObjectVariantEditor={
                          onOpenEventBasedObjectVariantEditor
                        }
                        onDeleteEventsBasedObjectVariant={
                          onDeleteEventsBasedObjectVariant
                        }
                      />
                    )}
                  </main>
                </div>
              </DragAndDropContextProvider>
            </AlertProvider>
          </FullThemeProvider>
        </SpecificDimensionsWindowSizeProvider>
      )}
    />
  );
};

export default RichObjectEditorWindow;

