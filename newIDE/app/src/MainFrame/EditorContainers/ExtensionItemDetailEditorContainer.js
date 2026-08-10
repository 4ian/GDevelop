// @flow
import * as React from 'react';
import EventsFunctionsExtensionEditor from '../../EventsFunctionsExtensionEditor';
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

type DetailKind = 'behavior' | 'function';
type Props = {|
  ...RenderEditorContainerProps,
  detailKind: DetailKind,
|};

export class ExtensionItemDetailEditorContainer extends React.Component<Props> {
  editor: ?EventsFunctionsExtensionEditor;

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

  shouldComponentUpdate(nextProps: Props): any {
    return this.props.isActive || nextProps.isActive;
  }

  // $FlowFixMe[unsupported-syntax]
  componentDidUpdate(prevProps: *) {
    if (prevProps.isActive && !this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions({
        shouldHotReloadEditor: this.hasAnyEventBasedObject(),
      });
    }
  }

  componentWillUnmount() {
    if (this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions({
        shouldHotReloadEditor: this.hasAnyEventBasedObject(),
      });
    }
  }

  hasAnyEventBasedObject(): any {
    const extension = this.getEventsFunctionsExtension();
    return extension ? extension.getEventsBasedObjects().getCount() > 0 : false;
  }

  _reloadExtensionMetadata = () => {
    try {
      const extension = this.getEventsFunctionsExtension();
      if (extension) {
        this.props.onReloadEventsFunctionsExtensionMetadata(extension);
      }
    } catch (error) {
      console.warn(
        'Error while loading events functions extensions - ignoring this in the context of the ExtensionItemDetailEditorContainer.',
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
    const { project } = this.props;
    const extensionName = this.getEventsFunctionsExtensionName();
    if (!project || !extensionName) return null;

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

  getEventsBasedBehavior(): ?gdEventsBasedBehavior {
    if (this.props.detailKind !== 'behavior') return null;
    const extension = this.getEventsFunctionsExtension();
    const { projectItemName } = this.props;
    if (!extension || !projectItemName) return null;

    const behaviorName = projectItemName.split('::')[1] || '';
    const behaviors = extension.getEventsBasedBehaviors();
    if (!behaviors.has(behaviorName)) return null;
    return behaviors.get(behaviorName);
  }

  getEventsBasedBehaviorName(): ?string {
    if (this.props.detailKind !== 'behavior') return null;
    const { projectItemName } = this.props;
    if (!projectItemName) return null;
    return projectItemName.split('::')[1] || '';
  }

  getEventsFunction(): ?gdEventsFunction {
    if (this.props.detailKind !== 'function') return null;
    const extension = this.getEventsFunctionsExtension();
    const { projectItemName } = this.props;
    if (!extension || !projectItemName) return null;

    const functionName = projectItemName.split('::')[1] || '';
    const functions = extension.getEventsFunctions();
    if (!functions.hasEventsFunctionNamed(functionName)) return null;
    return functions.getEventsFunction(functionName);
  }

  getEventsFunctionName(): ?string {
    if (this.props.detailKind !== 'function') return null;
    const { projectItemName } = this.props;
    if (!projectItemName) return null;
    return projectItemName.split('::')[1] || '';
  }

  selectEventsFunctionByName(
    eventsFunctionName: string,
    eventBasedBehaviorName?: ?string,
    eventBasedObjectName?: ?string
  ) {
    if (this.editor) {
      this.editor.selectEventsFunctionByName(
        eventsFunctionName,
        eventBasedBehaviorName,
        eventBasedObjectName
      );
    }
  }

  selectEventsBasedBehaviorByName(eventBasedBehaviorName: string) {
    if (this.editor) {
      this.editor.selectEventsBasedBehaviorByName(eventBasedBehaviorName);
    }
  }

  openBehaviorSettingsDialog() {
    if (this.editor) {
      this.editor.openBehaviorSettingsDialog();
    }
  }

  selectEventsBasedObjectByName(eventsBasedObjectName: string) {
    // No object selection in this focused editor.
  }

  render(): any {
    const { project, projectItemName, detailKind } = this.props;
    const eventsFunctionsExtension = this.getEventsFunctionsExtension();
    const focusedEventsBasedBehavior = this.getEventsBasedBehavior();
    const focusedEventsFunction = this.getEventsFunction();

    if (!eventsFunctionsExtension || !project) {
      return <div>No extension called {projectItemName} found!</div>;
    }

    if (detailKind === 'behavior' && !focusedEventsBasedBehavior) {
      return <div>No behavior called {projectItemName} found!</div>;
    }

    if (detailKind === 'function' && !focusedEventsFunction) {
      return <div>No function called {projectItemName} found!</div>;
    }

    const {
      initiallyFocusedFunctionName,
      initiallyFocusedBehaviorName,
      initiallyFocusedObjectName,
      initiallyOpenSettingsDialog,
    } = this.props.extraEditorProps || {};

    return (
      <div style={styles.container}>
        <EventsFunctionsExtensionEditor
          key={
            detailKind === 'behavior'
              ? focusedEventsBasedBehavior && focusedEventsBasedBehavior.ptr
              : focusedEventsFunction && focusedEventsFunction.ptr
          }
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          setToolbar={this.props.setToolbar}
          resourceManagementProps={this.props.resourceManagementProps}
          openInstructionOrExpression={this.props.openInstructionOrExpression}
          onCreateEventsFunction={this.props.onCreateEventsFunction}
          initiallyFocusedFunctionName={initiallyFocusedFunctionName}
          initiallyFocusedBehaviorName={initiallyFocusedBehaviorName}
          initiallyFocusedObjectName={initiallyFocusedObjectName}
          initiallyOpenSettingsDialog={initiallyOpenSettingsDialog}
          focusedEventsBasedBehavior={focusedEventsBasedBehavior}
          focusedEventsFunction={focusedEventsFunction}
          onBehaviorEdited={this._reloadExtensionMetadata}
          onObjectEdited={this._reloadExtensionMetadata}
          onFunctionEdited={this._reloadExtensionMetadata}
          gameplayTestsCallbacks={this.props.gameplayTestsCallbacks}
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
          onRenamedEventsBasedObject={this.props.onRenamedEventsBasedObject}
          onDeletedEventsBasedObject={this.props.onDeletedEventsBasedObject}
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

export const renderBehaviorDetailEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => (
  <ExtensionItemDetailEditorContainer {...props} detailKind="behavior" />
);

export const renderFunctionDetailEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => (
  <ExtensionItemDetailEditorContainer {...props} detailKind="function" />
);
