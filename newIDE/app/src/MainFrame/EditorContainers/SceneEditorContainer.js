// @flow
import * as React from 'react';
import { prepareInstancesEditorSettings } from '../../InstancesEditor/InstancesEditorSettings';
import SceneEditor from '../../SceneEditor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from './BaseEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  switchToSceneEdition,
  setEditorHotReloadNeeded,
  type HotReloadSteps,
  switchInGameEditorIfNoHotReloadIsNeeded,
} from '../../EmbeddedGame/EmbeddedGameFrame';

export class SceneEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?SceneEditor;

  getProject(): ?gdProject {
    return this.props.project;
  }

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    if (!this.props.isActive && nextProps.isActive) {
      this._setPreviewedLayout();
    }
    // This optimization is a bit more cautious than the traditional one, to still allow
    // children, and in particular SceneEditor and InstancesEditor, to be notified when isActive
    // goes from true to false (in which case PIXI rendering is halted). If isActive was false
    // and remains false, it's safe to stop update here (PIXI rendering is already halted).
    return this.props.isActive || nextProps.isActive;
  }

  componentDidMount() {
    if (this.props.isActive) {
      this._setPreviewedLayout();
    }
  }

  _setPreviewedLayout() {
    const { projectItemName } = this.props;
    this.props.setPreviewedLayout({
      layoutName: projectItemName || null,
      externalLayoutName: null,
      eventsBasedObjectType: null,
      eventsBasedObjectVariantName: null,
    });
  }

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {
    this._switchToSceneEdition(hotReloadSteps);
  }

  _switchToSceneEdition(hotReloadSteps: HotReloadSteps): void {
    const { projectItemName, editorId } = this.props;
    this._setPreviewedLayout();
    if (
      this.props.gameEditorMode === 'embedded-game' &&
      projectItemName &&
      // Avoid to hot-reload the editor every time an image is edited with Pixi.
      (!this.editor || !this.editor.isEditingObject())
    ) {
      switchToSceneEdition({
        ...hotReloadSteps,
        editorId,
        sceneName: projectItemName,
        externalLayoutName: null,
        eventsBasedObjectType: null,
        eventsBasedObjectVariantName: null,
      });
      if (this.editor) {
        this.editor.onEditorReloaded();
      }
    } else {
      setEditorHotReloadNeeded(hotReloadSteps);
    }
  }

  switchInGameEditorIfNoHotReloadIsNeeded() {
    const { projectItemName, editorId } = this.props;
    if (!projectItemName) {
      return;
    }
    switchInGameEditorIfNoHotReloadIsNeeded({
      editorId,
      sceneName: projectItemName,
      externalLayoutName: null,
      eventsBasedObjectType: null,
      eventsBasedObjectVariantName: null,
    });
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    const { editor } = this;
    if (editor) {
      editor.forceUpdateObjectsList();
      editor.forceUpdateObjectGroupsList();
      editor.forceUpdateLayersList();
    }
  }

  onEventsBasedObjectChildrenEdited() {
    const { editor } = this;
    if (editor) {
      // Update every custom object because some custom objects may include
      // the one actually edited.
      editor.forceUpdateCustomObjectRenderedInstances();
    }
  }

  onSceneObjectEdited(scene: gdLayout, objectWithContext: ObjectWithContext) {
    const layout = this.getLayout();
    if (!layout) {
      return;
    }
    if (layout !== scene && !objectWithContext.global) {
      return;
    }
    const { editor } = this;
    if (editor) {
      // Update instances of the object as it was modified in an editor.
      editor.forceUpdateRenderedInstancesOfObject(objectWithContext.object);
    }
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    const layout = this.getLayout();
    if (!layout) {
      return;
    }
    if (layout !== scene) {
      return;
    }
    const { editor } = this;
    if (editor) {
      editor.forceUpdateObjectsList();
    }
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    // No thing to be done.
  }

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    if (changes.scene !== this.getLayout()) {
      return;
    }

    if (this.editor) {
      this.editor.onInstancesModifiedOutsideEditor();
    }
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    if (changes.scene !== this.getLayout()) {
      return;
    }

    if (this.editor) {
      this.editor.onObjectsModifiedOutsideEditor();
    }
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    if (changes.scene !== this.getLayout()) {
      return;
    }

    if (this.editor) {
      this.editor.onObjectGroupsModifiedOutsideEditor();
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

  saveUiSettings = () => {
    const layout = this.getLayout();
    const editor = this.editor;

    if (editor && layout) {
      unserializeFromJSObject(
        layout.getAssociatedEditorSettings(),
        editor.getInstancesEditorSettings()
      );
    }
  };

  render() {
    const { project, projectItemName, isActive } = this.props;
    const layout = this.getLayout();
    if (!layout || !project) {
      //TODO: Error component
      return <div>No layout called {projectItemName} found!</div>;
    }

    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    return (
      <SceneEditor
        editorId={this.props.editorId}
        gameEditorMode={this.props.gameEditorMode}
        setGameEditorMode={this.props.setGameEditorMode}
        onRestartInGameEditorAfterError={
          this.props.onRestartInGameEditorAfterError
        }
        setToolbar={this.props.setToolbar}
        resourceManagementProps={this.props.resourceManagementProps}
        unsavedChanges={this.props.unsavedChanges}
        ref={editor => (this.editor = editor)}
        project={project}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        layout={layout}
        eventsFunctionsExtension={null}
        eventsBasedObject={null}
        eventsBasedObjectVariant={null}
        globalObjectsContainer={project.getObjects()}
        objectsContainer={layout.getObjects()}
        layersContainer={layout.getLayers()}
        initialInstances={layout.getInitialInstances()}
        getInitialInstancesEditorSettings={() =>
          prepareInstancesEditorSettings(
            serializeToJSObject(layout.getAssociatedEditorSettings()),
            Math.max(
              project.getGameResolutionWidth(),
              project.getGameResolutionHeight()
            )
          )
        }
        onOpenEvents={this.props.onOpenEvents}
        isActive={isActive}
        previewDebuggerServer={this.props.previewDebuggerServer}
        hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
        openBehaviorEvents={this.props.openBehaviorEvents}
        onExtractAsExternalLayout={this.props.onExtractAsExternalLayout}
        onExtractAsEventBasedObject={this.props.onExtractAsEventBasedObject}
        onOpenEventBasedObjectEditor={this.props.onOpenEventBasedObjectEditor}
        onOpenEventBasedObjectVariantEditor={
          this.props.onOpenEventBasedObjectVariantEditor
        }
        onWillInstallExtension={this.props.onWillInstallExtension}
        onExtensionInstalled={this.props.onExtensionInstalled}
        onDeleteEventsBasedObjectVariant={
          this.props.onDeleteEventsBasedObjectVariant
        }
        onEffectAdded={this.props.onEffectAdded}
        onObjectListsModified={this.props.onObjectListsModified}
        onObjectEdited={objectWithContext =>
          this.props.onSceneObjectEdited(layout, objectWithContext)
        }
        onObjectsDeleted={() => this.props.onSceneObjectsDeleted(layout)}
        triggerHotReloadInGameEditorIfNeeded={
          this.props.triggerHotReloadInGameEditorIfNeeded
        }
        // It's only used to refresh events-based object variants.
        onObjectGroupEdited={() => {}}
        onObjectGroupsDeleted={() => {}}
        // Nothing to do as scenes are not events-based objects.
        onEventsBasedObjectChildrenEdited={() => {}}
      />
    );
  }
}

export const renderSceneEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <SceneEditorContainer {...props} />;
