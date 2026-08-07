// @flow
import * as React from 'react';
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
import { prepareInstancesEditorSettings } from '../../InstancesEditor/InstancesEditorSettings';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../ResourcesWatcher';
import SceneEditor from '../../SceneEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  switchToSceneEdition,
  setEditorHotReloadNeeded,
  switchInGameEditorIfNoHotReloadIsNeeded,
  type HotReloadSteps,
} from '../../EmbeddedGame/EmbeddedGameFrame';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import {
  parseCustomObjectEditorTabName,
  getObjectTypeFromCustomObjectEditorTabName,
} from '../../Utils/CustomObjectEditorTabName';

const gd: libGDevelop = global.gd;

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

// TODO: move to function component
export class CustomObjectEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?SceneEditor;
  resourceExternallyChangedCallbackId: ?string;
  _objectsContainer: gdObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Function
  );

  getProject(): ?gdProject {
    return this.props.project;
  }

  shouldComponentUpdate(nextProps: RenderEditorContainerProps): any {
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
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      // $FlowFixMe[method-unbinding]
      this.onResourceExternallyChanged.bind(this)
    );
  }

  _setPreviewedLayout() {
    const { projectItemName } = this.props;
    this.props.setPreviewedLayout({
      layoutName: null,
      externalLayoutName: null,
      eventsBasedObjectType: projectItemName || null,
      eventsBasedObjectVariantName: this.getVariantName(),
    });
  }

  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
    if (this._objectsContainer) this._objectsContainer.delete();
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
        sceneName: null,
        externalLayoutName: null,
        eventsBasedObjectType: this.getEventsBasedObjectType() || null,
        eventsBasedObjectVariantName: this.getVariantName(),
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
      sceneName: null,
      externalLayoutName: null,
      eventsBasedObjectType: this.getEventsBasedObjectType() || null,
      eventsBasedObjectVariantName: this.getVariantName(),
    });
  }

  onResourceExternallyChanged(resourceInfo: {| identifier: string |}) {
    const { editor } = this;
    if (editor) {
      editor.onResourceExternallyChanged(resourceInfo);
    }
  }

  updateToolbar() {
    if (this.editor) {
      this.editor.updateToolbar();
    } else {
      // Clear the toolbar if the editor is not ready yet to avoid showing stale toolbar
      // from the previous editor (e.g., HomePage)
      this.props.setToolbar(null);
    }
  }

  forceUpdateEditor() {
    const { editor } = this;
    if (editor) {
      editor.forceUpdateObjectsList();
      editor.forceUpdateObjectGroupsList();
      editor.forceUpdateLayersList();
    }
  }

  onEventsBasedObjectChildrenEdited(
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) {
    const { editor } = this;
    if (editor) {
      // Update the edited object and every custom object that includes it.
      editor.forceUpdateCustomObjectRenderedInstances(
        eventsBasedObject,
        options
      );
    }
  }

  onSceneObjectEdited(scene: gdLayout, objectWithContext: ObjectWithContext) {
    // No thing to be done.
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    // No thing to be done.
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    // No thing to be done.
  }

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    // No thing to be done.
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    // No thing to be done.
  }

  onWillDeleteObject(changes: WillDeleteObjectChanges) {
    // No thing to be done: `changes.scene` is always a real project layout,
    // and this editor's own object dialog (if any) is scoped to the custom
    // object variant's private objects container, which can't be targeted by
    // this notification. Revisit if object deletion is ever extended to
    // event-based-object children.
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    // No thing to be done.
  }

  saveUiSettings = () => {
    const variant = this.getVariant();
    const editor = this.editor;
    if (editor && variant) {
      unserializeFromJSObject(
        variant.getAssociatedEditorSettings(),
        editor.getInstancesEditorSettings()
      );
    }
  };

  getEventsFunctionsExtension(): ?gdEventsFunctionsExtension {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;
    const { extensionName } = parseCustomObjectEditorTabName(projectItemName);

    if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
      return null;
    }
    return project.getEventsFunctionsExtension(extensionName);
  }

  getEventsFunctionsExtensionName(): ?string {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    return gd.PlatformExtension.getExtensionFromFullObjectType(projectItemName);
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    const extension = this.getEventsFunctionsExtension();
    if (!extension) return null;

    const {
      objectName: eventsBasedObjectName,
    } = parseCustomObjectEditorTabName(projectItemName);

    if (!extension.getEventsBasedObjects().has(eventsBasedObjectName)) {
      return null;
    }
    return extension.getEventsBasedObjects().get(eventsBasedObjectName);
  }

  getEventsBasedObjectType(): string {
    const { projectItemName } = this.props;
    return projectItemName
      ? getObjectTypeFromCustomObjectEditorTabName(projectItemName)
      : '';
  }

  getVariantName(): string {
    const { projectItemName } = this.props;
    return projectItemName
      ? parseCustomObjectEditorTabName(projectItemName).variantName
      : '';
  }

  getVariant(): ?gdEventsBasedObjectVariant {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    const eventsBasedObject = this.getEventsBasedObject();
    if (!eventsBasedObject) return null;

    const { variantName } = parseCustomObjectEditorTabName(projectItemName);
    return eventsBasedObject.getVariants().hasVariantNamed(variantName)
      ? eventsBasedObject.getVariants().getVariant(variantName)
      : eventsBasedObject.getDefaultVariant();
  }

  getEventsBasedObjectName(): ?string {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    const extension = this.getEventsFunctionsExtension();
    if (!extension) return null;

    return gd.PlatformExtension.getObjectNameFromFullObjectType(
      projectItemName
    );
  }

  render(): any {
    const { project, isActive } = this.props;
    if (!project) return null;

    const eventsFunctionsExtension = this.getEventsFunctionsExtension();
    if (!eventsFunctionsExtension) return null;

    const eventsBasedObject = this.getEventsBasedObject();
    if (!eventsBasedObject) return null;

    const variant = this.getVariant();
    if (!variant) return null;

    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        eventsFunctionsExtension,
        eventsBasedObject,
      },
      this._objectsContainer
    );

    return (
      <div style={styles.container}>
        <SceneEditor
          editorId={this.props.editorId}
          gameEditorMode={this.props.gameEditorMode}
          setGameEditorMode={this.props.setGameEditorMode}
          onRestartInGameEditor={this.props.onRestartInGameEditor}
          showRestartInGameEditorAfterErrorButton={
            this.props.showRestartInGameEditorAfterErrorButton
          }
          setToolbar={this.props.setToolbar}
          resourceManagementProps={this.props.resourceManagementProps}
          unsavedChanges={this.props.unsavedChanges}
          ref={editor => (this.editor = editor)}
          project={project}
          projectScopedContainersAccessor={projectScopedContainersAccessor}
          layout={null}
          eventsFunctionsExtension={eventsFunctionsExtension}
          eventsBasedObject={eventsBasedObject}
          eventsBasedObjectVariant={variant}
          globalObjectsContainer={null}
          objectsContainer={variant.getObjects()}
          layersContainer={variant.getLayers()}
          initialInstances={variant.getInitialInstances()}
          getInitialInstancesEditorSettings={() =>
            prepareInstancesEditorSettings(
              serializeToJSObject(variant.getAssociatedEditorSettings()),
              Math.max(
                variant.getAreaMaxX() - variant.getAreaMinX(),
                variant.getAreaMaxY() - variant.getAreaMinY()
              )
            )
          }
          onOpenEvents={() =>
            this.props.openObjectEvents(
              eventsFunctionsExtension.getName(),
              eventsBasedObject.getName()
            )
          }
          isActive={isActive}
          previewDebuggerServer={this.props.previewDebuggerServer}
          hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          openBehaviorEvents={this.props.openBehaviorEvents}
          onObjectEdited={(objectWithContext, hasResourceChanged) =>
            this.props.onEventsBasedObjectChildrenEdited(eventsBasedObject, {
              editedObject: objectWithContext.object,
              hasResourceChanged,
            })
          }
          onObjectsDeleted={() =>
            this.props.onEventsBasedObjectChildrenEdited(eventsBasedObject)
          }
          onObjectGroupEdited={() =>
            this.props.onEventsBasedObjectChildrenEdited(eventsBasedObject)
          }
          onObjectGroupsDeleted={() =>
            this.props.onEventsBasedObjectChildrenEdited(eventsBasedObject)
          }
          onEventsBasedObjectChildrenEdited={
            this.props.onEventsBasedObjectChildrenEdited
          }
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
          triggerHotReloadInGameEditorIfNeeded={
            this.props.triggerHotReloadInGameEditorIfNeeded
          }
        />
      </div>
    );
  }
}

export const renderCustomObjectEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <CustomObjectEditorContainer {...props} />;
