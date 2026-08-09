// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import {
  type EventsSheetInterface,
  type EventsSheetSelectionSnapshot,
} from '../../EventsSheet';
import EventsFunctionEditor, {
  fixedEventsFunctionCapabilities,
} from '../../EventsFunctionsExtensionEditor/EventsFunctionEditor';
import type { EventPath } from '../../Utils/EventPath';
import { sendEventsExtractedAsFunction } from '../../Utils/Analytics/EventSender';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import {
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
  type WillDeleteObjectChanges,
} from '../../EditorFunctions/OutsideEditorChanges';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../../EmbeddedGame/EmbeddedGameFrame';
import type { SearchFilterParams } from '../../Utils/Search';
import { type EventsScope } from '../../InstructionOrExpression/EventsScope';
import SceneContextLifecycleFunctionsEditor, {
  type SceneContextLifecycleFunctionsEditorInterface,
} from '../../SceneContextLifecycleFunctionsEditor';
import SceneLifecycleFunctionParametersEditor from '../../SceneContextLifecycleFunctionsEditor/SceneLifecycleFunctionParametersEditor';
import { addFunctionsListToggleButtonToToolbar } from '../../EventsFunctionsList/FunctionsListToggleButton';
import Tune from '../../UI/CustomSvgIcons/Tune';
import {
  DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME,
  getSceneLifecycleEventsFunction,
  isSceneLifecycleFunctionName,
  type SceneLifecycleFunctionName,
} from '../../SceneContextLifecycleFunctions';

export class EventsEditorContainer extends React.Component<RenderEditorContainerProps> {
  lifecycleFunctionsEditor: ?SceneContextLifecycleFunctionsEditorInterface;

  getSelectedEditor = (): ?EventsSheetInterface =>
    this.lifecycleFunctionsEditor
      ? this.lifecycleFunctionsEditor.getSelectedEditor()
      : null;

  shouldComponentUpdate(nextProps: RenderEditorContainerProps): any {
    // We stop updates when the component is inactive.
    // If it's active, was active or becoming active again we let update propagate.
    // Especially important to note that when becoming inactive, a "last" update is allowed.
    return this.props.isActive || nextProps.isActive;
  }

  componentDidMount() {
    if (this.props.isActive) {
      this._setPreviewedLayout();
    }
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive) {
      this._setPreviewedLayout();
    }
  }

  _setPreviewedLayout() {
    const layout = this.getLayout();
    this.props.setPreviewedLayout({
      layoutName: layout ? layout.getName() : null,
      externalLayoutName: null,
      eventsBasedObjectType: null,
      eventsBasedObjectVariantName: null,
    });
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  updateToolbar() {
    const editor = this.getSelectedEditor();
    if (editor) {
      editor.updateToolbar();
    } else {
      // Clear the toolbar if the editor is not ready yet to avoid showing stale toolbar
      // from the previous editor (e.g., HomePage)
      this.setToolbar(null);
    }
  }

  isFunctionsListCollapsed = (): boolean =>
    !!this.lifecycleFunctionsEditor &&
    this.lifecycleFunctionsEditor.isFunctionsListCollapsed();

  toggleFunctionsList = (): boolean =>
    this.lifecycleFunctionsEditor
      ? this.lifecycleFunctionsEditor.toggleFunctionsList()
      : false;

  setToolbar = (editorToolbar: ?React.Node): void => {
    this.props.setToolbar(
      addFunctionsListToggleButtonToToolbar(editorToolbar, {
        isFunctionsListCollapsed: this.isFunctionsListCollapsed,
        onToggleFunctionsList: this.toggleFunctionsList,
      })
    );
  };

  scrollToEventPath(eventPath: EventPath) {
    const editor = this.getSelectedEditor();
    if (editor) editor.scrollToEventPath(eventPath);
  }

  setGlobalSearchResults(
    eventPaths: Array<EventPath>,
    focusedEventPath: EventPath,
    searchText: string,
    searchFilters?: SearchFilterParams
  ) {
    const editor = this.getSelectedEditor();
    if (editor) {
      editor.setGlobalSearchResults(
        eventPaths,
        focusedEventPath,
        searchText,
        searchFilters
      );
    }
  }

  clearGlobalSearchResults() {
    const editor = this.getSelectedEditor();
    if (editor) editor.clearGlobalSearchResults();
  }

  selectAllInsideEditor() {
    const editor = this.getSelectedEditor();
    if (editor) editor.selectAllEvents();
  }

  getEditorSelectionSnapshot(): ?EventsSheetSelectionSnapshot {
    const editor = this.getSelectedEditor();
    return editor ? editor.getEditorSelectionSnapshot() : null;
  }

  forceUpdateEditor() {
    const editor = this.getSelectedEditor();
    if (editor) {
      editor.forceUpdateEditor();
    }
  }

  selectLifecycleFunctionByName = (name: string): boolean => {
    return this.lifecycleFunctionsEditor
      ? this.lifecycleFunctionsEditor.selectFunctionByName(name)
      : false;
  };

  onSelectedLifecycleFunctionChanged = (): void => this.updateToolbar();

  onLifecycleFunctionsChanged = (): void => {
    if (this.props.unsavedChanges) {
      this.props.unsavedChanges.triggerUnsavedChanges();
    }
    this.forceUpdate();
    this.props.triggerHotReloadInGameEditorIfNeeded();
  };

  onEventsBasedObjectChildrenEdited(
    eventsBasedObject?: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ): void {
    // No thing to be done.
  }

  onSceneObjectEdited(
    scene: gdLayout,
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
  ) {
    // No thing to be done.
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    // No thing to be done.
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    if (this.getLayout() === changes.scene) {
      const lifecycleFunctionName: SceneLifecycleFunctionName =
        isSceneLifecycleFunctionName(changes.lifecycleFunctionName)
          ? (changes.lifecycleFunctionName: any)
          : DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME;
      const editor = this.lifecycleFunctionsEditor
        ? this.lifecycleFunctionsEditor.getEditor(lifecycleFunctionName)
        : null;
      if (editor)
        editor.onEventsModifiedOutsideEditor({
          newOrChangedAiGeneratedEventIds:
            changes.newOrChangedAiGeneratedEventIds,
        });
    }
  }

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {
    setEditorHotReloadNeeded(hotReloadSteps);
  }

  switchInGameEditorIfNoHotReloadIsNeeded() {}

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    // No thing to be done.
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    // No thing to be done.
  }

  onWillDeleteObject(changes: WillDeleteObjectChanges) {
    // No thing to be done.
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    if (changes.scene !== this.getLayout()) {
      return;
    }

    if (this.lifecycleFunctionsEditor) {
      this.lifecycleFunctionsEditor.forEachEditor((editor) =>
        editor.forceUpdateEditor()
      );
    }
  }

  getLayout(): ?gdLayout {
    const { project, projectItemName } = this.props;
    if (
      !project ||
      !projectItemName ||
      !project.hasLayoutNamed(projectItemName)
    )
      return null;

    return project.getLayout(projectItemName);
  }

  onBeginCreateEventsFunction = () => {
    sendEventsExtractedAsFunction({
      step: 'begin',
      parentEditor: 'scene-events-editor',
    });
  };

  onCreateEventsFunction = async (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    await this.props.onCreateEventsFunction(
      extensionName,
      eventsFunction,
      'scene-events-editor'
    );
  };

  openLayoutEditor = () => {
    const layout = this.getLayout();
    if (!layout) return;

    this.props.onOpenLayout(layout.getName(), {
      openEventsEditor: false,
      openSceneEditor: true,
      focusWhenOpened: 'scene',
    });
  };

  render(): any {
    const { project, projectItemName } = this.props;
    const layout = this.getLayout();
    if (!layout || !project) {
      //TODO: Error component
      return <div>No layout called {projectItemName} found!</div>;
    }

    return (
      <SceneContextLifecycleFunctionsEditor
        ref={(editor) => (this.lifecycleFunctionsEditor = editor)}
        ownerKind="scene"
        ownerName={layout.getName()}
        owner={layout}
        onSelectedFunctionChanged={this.onSelectedLifecycleFunctionChanged}
        onLifecycleFunctionsChanged={this.onLifecycleFunctionsChanged}
        renderFunctionParameters={({ lifecycleFunctionName }) => {
          const eventsFunction = getSceneLifecycleEventsFunction(
            layout,
            lifecycleFunctionName
          );
          const scope: EventsScope = {
            project,
            layout,
            eventsFunction,
            sceneLifecycleFunctionName: lifecycleFunctionName,
          };
          return (
            <SceneLifecycleFunctionParametersEditor
              project={project}
              projectScopedContainersAccessor={
                new ProjectScopedContainersAccessor(scope)
              }
              eventsFunction={eventsFunction}
              onWillInstallExtension={this.props.onWillInstallExtension}
              onExtensionInstalled={this.props.onExtensionInstalled}
            />
          );
        }}
        renderFunctionEditor={({
          lifecycleFunctionName,
          isSelected,
          editorRef,
          onOpenParameters,
        }) => {
          const eventsFunction = getSceneLifecycleEventsFunction(
            layout,
            lifecycleFunctionName
          );
          const scope: EventsScope = {
            project,
            layout,
            eventsFunction,
            sceneLifecycleFunctionName: lifecycleFunctionName,
          };
          return (
            <EventsFunctionEditor
              ref={editorRef}
              setToolbar={this.setToolbar}
              onOpenLayoutEditor={this.openLayoutEditor}
              onOpenLayout={this.props.onOpenLayout}
              resourceManagementProps={this.props.resourceManagementProps}
              openInstructionOrExpression={
                this.props.openInstructionOrExpression
              }
              onCreateEventsFunction={this.onCreateEventsFunction}
              onBeginCreateEventsFunction={this.onBeginCreateEventsFunction}
              unsavedChanges={this.props.unsavedChanges}
              project={project}
              scope={scope}
              globalObjectsContainer={project.getObjects()}
              objectsContainer={layout.getObjects()}
              projectScopedContainersAccessor={
                // $FlowFixMe[incompatible-type]
                new ProjectScopedContainersAccessor(scope)
              }
              eventsFunction={eventsFunction}
              capabilities={fixedEventsFunctionCapabilities}
              onOpenSettings={onOpenParameters}
              settingsIcon={onOpenParameters ? <Tune /> : undefined}
              settingsTooltip={
                onOpenParameters ? t`Open parameters` : undefined
              }
              settingsButtonPosition={
                onOpenParameters ? 'start' : undefined
              }
              onOpenExternalEvents={this.props.onOpenExternalEvents}
              isActive={this.props.isActive && isSelected}
              hotReloadPreviewButtonProps={
                this.props.hotReloadPreviewButtonProps
              }
              onWillInstallExtension={this.props.onWillInstallExtension}
              onExtensionInstalled={this.props.onExtensionInstalled}
            />
          );
        }}
      />
    );
  }
}

export const renderEventsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <EventsEditorContainer {...props} />;
