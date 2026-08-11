// @flow
import * as React from 'react';
import PrefabDetailEditor from '../../PrefabDetailEditor';
import { type EventsSheetSelectionSnapshot } from '../../EventsSheet';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
  type SceneEventsOutsideEditorChanges,
  type ExtensionFunctionEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from './BaseEditor';
import { type WillDeleteObjectChanges } from '../../EditorFunctions/OutsideEditorChanges';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../../EmbeddedGame/EmbeddedGameFrame';
import type { EventPath } from '../../Utils/EventPath';
import type { SearchFilterParams } from '../../Utils/Search';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
  },
};

export class PrefabDetailEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?PrefabDetailEditor;

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout(): ?gdLayout {
    return null;
  }

  getEditorSelectionSnapshot(): ?EventsSheetSelectionSnapshot {
    return this.editor ? this.editor.getEditorSelectionSnapshot() : null;
  }

  updateToolbar() {
    if (this.editor) {
      this.editor.updateToolbar();
    } else {
      this.props.setToolbar(null);
    }
  }

  setGlobalSearchResults(
    eventPaths: Array<EventPath>,
    focusedEventPath: EventPath,
    searchText: string,
    searchFilters?: SearchFilterParams
  ) {
    if (this.editor) {
      this.editor.setGlobalSearchResults(
        eventPaths,
        focusedEventPath,
        searchText,
        searchFilters
      );
    }
  }

  clearGlobalSearchResults() {
    if (this.editor) {
      this.editor.clearGlobalSearchResults();
    }
  }

  scrollToEventPath(eventPath: EventPath) {
    if (this.editor) {
      this.editor.scrollToEventPath(eventPath);
    }
  }

  selectAllInsideEditor() {
    if (this.editor) {
      this.editor.selectAllEvents();
    }
  }

  forceUpdateEditor() {
    if (this.editor) {
      this.editor.forceUpdate();
    }
  }

  onEventsBasedObjectChildrenEdited() {
    // No updates to be done.
  }

  onSceneObjectEdited(scene: gdLayout, objectWithContext: ObjectWithContext) {
    // No updates to be done.
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    // No updates to be done.
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    // No updates to be done.
  }

  onExtensionFunctionEventsModifiedOutsideEditor(
    changes: ExtensionFunctionEventsOutsideEditorChanges
  ) {
    if (this.getEventsFunctionsExtensionName() !== changes.extensionName) {
      return;
    }
    if (this.editor) {
      this.editor.onExtensionFunctionEventsModifiedOutsideEditor(changes);
    }
  }

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {
    setEditorHotReloadNeeded(hotReloadSteps);
  }

  switchInGameEditorIfNoHotReloadIsNeeded() {}

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    // No updates to be done.
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    // No updates to be done.
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    // No updates to be done.
  }

  onWillDeleteObject(changes: WillDeleteObjectChanges) {
    // No updates to be done.
  }

  shouldComponentUpdate(nextProps: RenderEditorContainerProps): any {
    return this.props.isActive || nextProps.isActive;
  }

  // $FlowFixMe[unsupported-syntax]
  componentDidUpdate(prevProps: *) {
    if (prevProps.isActive && !this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions({
        shouldHotReloadEditor: true,
      });
    }
  }

  componentWillUnmount() {
    if (this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions({
        shouldHotReloadEditor: true,
      });
    }
  }

  _reloadExtensionMetadata = () => {
    try {
      const extension = this.getEventsFunctionsExtension();
      if (extension) {
        this.props.onReloadEventsFunctionsExtensionMetadata(extension);
      }
    } catch (error) {
      console.warn(
        'Error while loading events functions extensions - ignoring this in the context of the PrefabDetailEditorContainer.',
        error
      );
    }
  };

  previewOrExportWillStart = () => {
    if (this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions({
        shouldHotReloadEditor: false,
      });
    }
  };

  getEventsFunctionsExtension(): ?gdEventsFunctionsExtension {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    const extensionName = projectItemName.split('::')[0] || '';
    if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
      return null;
    }
    return project.getEventsFunctionsExtension(extensionName);
  }

  getEventsFunctionsExtensionName(): ?string {
    const { projectItemName } = this.props;
    if (!projectItemName) return null;
    return projectItemName.split('::')[0] || '';
  }

  getEventsBasedObject(): ?gdEventsBasedObject {
    const extension = this.getEventsFunctionsExtension();
    const { projectItemName } = this.props;
    if (!extension || !projectItemName) return null;

    const eventsBasedObjectName = projectItemName.split('::')[1] || '';
    if (!extension.getEventsBasedObjects().has(eventsBasedObjectName)) {
      return null;
    }
    return extension.getEventsBasedObjects().get(eventsBasedObjectName);
  }

  getEventsBasedObjectName(): ?string {
    const { projectItemName } = this.props;
    if (!projectItemName) return null;
    return projectItemName.split('::')[1] || '';
  }

  selectEventsFunctionByName(
    eventsFunctionName: string,
    _eventBasedBehaviorName?: ?string,
    _eventBasedObjectName?: ?string
  ) {
    if (this.editor) {
      this.editor.selectEventsFunctionByName(eventsFunctionName);
    }
  }

  selectEventsBasedObjectByName(eventsBasedObjectName: string) {
    if (this.editor) {
      this.editor.selectEventsBasedObjectByName(eventsBasedObjectName);
    }
  }

  openPrefabSettingsDialog() {
    if (this.editor) {
      this.editor.openPrefabSettingsDialog();
    }
  }

  render(): any {
    const { project, projectItemName } = this.props;
    const eventsFunctionsExtension = this.getEventsFunctionsExtension();
    const eventsBasedObject = this.getEventsBasedObject();

    if (!eventsFunctionsExtension || !eventsBasedObject || !project) {
      return <div>No prefab called {projectItemName} found!</div>;
    }

    const { initiallyFocusedFunctionName, initiallyOpenSettingsDialog } =
      this.props.extraEditorProps || {};

    return (
      <div style={styles.container}>
        <PrefabDetailEditor
          key={eventsBasedObject.ptr}
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          eventsBasedObject={eventsBasedObject}
          setToolbar={this.props.setToolbar}
          resourceManagementProps={this.props.resourceManagementProps}
          openInstructionOrExpression={this.props.openInstructionOrExpression}
          openBehaviorEvents={this.props.openBehaviorEvents}
          onCreateEventsFunction={this.props.onCreateEventsFunction}
          initiallyFocusedFunctionName={initiallyFocusedFunctionName}
          initiallyOpenSettingsDialog={initiallyOpenSettingsDialog}
          onObjectEdited={this._reloadExtensionMetadata}
          onFunctionEdited={this._reloadExtensionMetadata}
          ref={editor => (this.editor = editor)}
          unsavedChanges={this.props.unsavedChanges}
          onOpenCustomObjectEditor={eventsBasedObject => {
            this.props.onOpenCustomObjectEditor(
              eventsFunctionsExtension,
              eventsBasedObject,
              ''
            );
          }}
          hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
          onEventsBasedObjectChildrenEdited={
            this.props.onEventsBasedObjectChildrenEdited
          }
          onWillInstallExtension={this.props.onWillInstallExtension}
          onExtensionInstalled={this.props.onExtensionInstalled}
          onEventBasedObjectTypeChanged={
            this.props.onEventBasedObjectTypeChanged
          }
        />
      </div>
    );
  }
}

export const renderPrefabDetailEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <PrefabDetailEditorContainer {...props} />;
