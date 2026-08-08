// @flow
import * as React from 'react';
import EventsSheet, {
  type EventsSheetInterface,
  type EventsSheetSelectionSnapshot,
} from '../../EventsSheet';
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
import SceneContextLifecycleFunctionsList from '../../SceneContextLifecycleFunctionsList';
import {
  DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME,
  getSceneLifecycleEventsFunction,
  isSceneLifecycleFunctionName,
  sceneLifecycleFunctionDefinitions,
  type SceneLifecycleFunctionName,
} from '../../SceneContextLifecycleFunctions';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
  },
};

type State = {|
  selectedLifecycleFunctionName: SceneLifecycleFunctionName,
  mountedLifecycleFunctionNames: Array<SceneLifecycleFunctionName>,
|};

export class EventsEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editorsByLifecycleFunctionName: {
    [string]: ?EventsSheetInterface,
  } = {};

  state: State = {
    selectedLifecycleFunctionName: DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME,
    mountedLifecycleFunctionNames: [DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME],
  };

  getSelectedEditor = (): ?EventsSheetInterface =>
    this.editorsByLifecycleFunctionName[
      this.state.selectedLifecycleFunctionName
    ];

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
      this.props.setToolbar(null);
    }
  }

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
    if (!isSceneLifecycleFunctionName(name)) return false;
    if (name === this.state.selectedLifecycleFunctionName) return true;

    const lifecycleFunctionName: SceneLifecycleFunctionName = (name: any);
    this.setState(
      state => ({
        selectedLifecycleFunctionName: lifecycleFunctionName,
        mountedLifecycleFunctionNames: state.mountedLifecycleFunctionNames.includes(
          lifecycleFunctionName
        )
          ? state.mountedLifecycleFunctionNames
          : [...state.mountedLifecycleFunctionNames, lifecycleFunctionName],
      }),
      () => this.updateToolbar()
    );
    return true;
  };

  selectLifecycleFunction = (name: SceneLifecycleFunctionName): void => {
    this.selectLifecycleFunctionByName(name);
  };

  onEventsBasedObjectChildrenEdited(
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) {
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
      const lifecycleFunctionName: SceneLifecycleFunctionName = isSceneLifecycleFunctionName(
        changes.lifecycleFunctionName
      )
        ? (changes.lifecycleFunctionName: any)
        : DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME;
      const editor = this.editorsByLifecycleFunctionName[lifecycleFunctionName];
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

    Object.keys(this.editorsByLifecycleFunctionName).forEach(name => {
      const editor = this.editorsByLifecycleFunctionName[name];
      if (editor) editor.forceUpdateEditor();
    });
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
      <div style={styles.container}>
        <SceneContextLifecycleFunctionsList
          ownerKind="scene"
          selectedLifecycleFunctionName={
            this.state.selectedLifecycleFunctionName
          }
          onSelectLifecycleFunction={this.selectLifecycleFunction}
        />
        {sceneLifecycleFunctionDefinitions
          .filter(definition =>
            this.state.mountedLifecycleFunctionNames.includes(definition.name)
          )
          .map(definition => {
            const lifecycleFunctionName = definition.name;
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
            const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
              // $FlowFixMe[incompatible-type]
              scope
            );
            const isSelected =
              lifecycleFunctionName ===
              this.state.selectedLifecycleFunctionName;

            return (
              <div
                key={lifecycleFunctionName}
                style={{
                  display: isSelected ? 'flex' : 'none',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <EventsSheet
                  ref={editor => {
                    this.editorsByLifecycleFunctionName[
                      lifecycleFunctionName
                    ] = editor;
                  }}
                  setToolbar={this.props.setToolbar}
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
                    projectScopedContainersAccessor
                  }
                  events={eventsFunction.getEvents()}
                  onOpenExternalEvents={this.props.onOpenExternalEvents}
                  isActive={this.props.isActive && isSelected}
                  hotReloadPreviewButtonProps={
                    this.props.hotReloadPreviewButtonProps
                  }
                  onWillInstallExtension={this.props.onWillInstallExtension}
                  onExtensionInstalled={this.props.onExtensionInstalled}
                  // Scene events don't have parameters nor properties.
                  editEventsFunctionParameter={null}
                  openEventsBasedEntityPropertyEditorDialog={null}
                />
              </div>
            );
          })}
      </div>
    );
  }
}

export const renderEventsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <EventsEditorContainer {...props} />;
