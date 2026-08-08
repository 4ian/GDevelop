// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import EventsSheet, {
  type EventsSheetInterface,
  type EventsSheetSelectionSnapshot,
} from '../../EventsSheet';
import RaisedButton from '../../UI/RaisedButton';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
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
import ExternalPropertiesDialog, {
  type ExternalProperties,
} from './ExternalPropertiesDialog';
import Text from '../../UI/Text';
import { Line } from '../../UI/Grid';
import { sendEventsExtractedAsFunction } from '../../Utils/Analytics/EventSender';
import HelpButton from '../../UI/HelpButton';
import TutorialButton from '../../UI/TutorialButton';
import EditSceneIcon from '../../UI/CustomSvgIcons/EditScene';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../ResourcesWatcher';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../../EmbeddedGame/EmbeddedGameFrame';
import Background from '../../UI/Background';
import type { EventPath } from '../../Utils/EventPath';
import type { SearchFilterParams } from '../../Utils/Search';
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
  },
};

const editSceneIconReactNode = <EditSceneIcon />;

type State = {|
  externalPropertiesDialogOpen: boolean,
  selectedLifecycleFunctionName: SceneLifecycleFunctionName,
  mountedLifecycleFunctionNames: Array<SceneLifecycleFunctionName>,
|};

export class ExternalEventsEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editorsByLifecycleFunctionName: {
    [string]: ?EventsSheetInterface,
  } = {};
  resourceExternallyChangedCallbackId: ?string;

  state: State = {
    externalPropertiesDialogOpen: false,
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
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
  }
  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
  }

  onResourceExternallyChanged = (resourceInfo: {| identifier: string |}) => {
    Object.keys(this.editorsByLifecycleFunctionName).forEach(name => {
      const editor = this.editorsByLifecycleFunctionName[name];
      if (editor) editor.onResourceExternallyChanged(resourceInfo);
    });
  };

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
    if (this.getExternalEvents() === changes.externalEvents) {
      const lifecycleFunctionName: SceneLifecycleFunctionName = isSceneLifecycleFunctionName(
        changes.lifecycleFunctionName
      )
        ? (changes.lifecycleFunctionName: any)
        : DEFAULT_SCENE_LIFECYCLE_FUNCTION_NAME;
      const editor = this.editorsByLifecycleFunctionName[lifecycleFunctionName];
      if (editor) {
        editor.onEventsModifiedOutsideEditor({
          newOrChangedAiGeneratedEventIds:
            changes.newOrChangedAiGeneratedEventIds,
        });
      }
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

  getExternalEvents(): ?gdExternalEvents {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    if (!project.hasExternalEventsNamed(projectItemName)) {
      return null;
    }
    return project.getExternalEvents(projectItemName);
  }

  getLayout(): ?gdLayout {
    const { project } = this.props;
    if (!project) return null;

    const layoutName = this.getAssociatedLayoutName();
    if (!layoutName) return null;

    return project.getLayout(layoutName);
  }

  getAssociatedLayoutName(): ?string {
    const { project } = this.props;
    if (!project) return null;

    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return null;

    const layoutName = externalEvents.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }

    return layoutName;
  }

  saveExternalProperties = (externalProps: ExternalProperties) => {
    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return;

    externalEvents.setAssociatedLayout(externalProps.layoutName);
    this.setState(
      {
        externalPropertiesDialogOpen: false,
      },
      () => this.updateToolbar()
    );
    this.props.onExternalAssociationChanged();
  };

  openExternalPropertiesDialog = () => {
    this.setState({
      externalPropertiesDialogOpen: true,
    });
  };

  onBeginCreateEventsFunction = () => {
    sendEventsExtractedAsFunction({
      step: 'begin',
      parentEditor: 'external-events-editor',
    });
  };

  onCreateEventsFunction = async (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    await this.props.onCreateEventsFunction(
      extensionName,
      eventsFunction,
      'external-events-editor'
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
    const externalEvents = this.getExternalEvents();
    const layout = this.getLayout();

    if (!externalEvents || !project) {
      //TODO: Error component
      return <div>No external events called {projectItemName} found!</div>;
    }

    return (
      <div style={styles.container}>
        {layout && (
          <React.Fragment>
            <SceneContextLifecycleFunctionsList
              ownerKind="external-events"
              selectedLifecycleFunctionName={
                this.state.selectedLifecycleFunctionName
              }
              onSelectLifecycleFunction={this.selectLifecycleFunction}
            />
            {sceneLifecycleFunctionDefinitions
              .filter(definition =>
                this.state.mountedLifecycleFunctionNames.includes(
                  definition.name
                )
              )
              .map(definition => {
                const lifecycleFunctionName = definition.name;
                const eventsFunction = getSceneLifecycleEventsFunction(
                  externalEvents,
                  lifecycleFunctionName
                );
                const scope = {
                  project,
                  layout,
                  externalEvents,
                  eventsFunction,
                  sceneLifecycleFunctionName: lifecycleFunctionName,
                };
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
                      resourceManagementProps={
                        this.props.resourceManagementProps
                      }
                      openInstructionOrExpression={
                        this.props.openInstructionOrExpression
                      }
                      onCreateEventsFunction={this.onCreateEventsFunction}
                      onBeginCreateEventsFunction={
                        this.onBeginCreateEventsFunction
                      }
                      unsavedChanges={this.props.unsavedChanges}
                      project={project}
                      // $FlowFixMe[incompatible-type]
                      scope={scope}
                      globalObjectsContainer={project.getObjects()}
                      objectsContainer={layout.getObjects()}
                      projectScopedContainersAccessor={
                        // $FlowFixMe[incompatible-type]
                        new ProjectScopedContainersAccessor(scope)
                      }
                      events={eventsFunction.getEvents()}
                      onOpenSettings={this.openExternalPropertiesDialog}
                      settingsIcon={editSceneIconReactNode}
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
          </React.Fragment>
        )}
        {!layout && (
          <Background>
            <PlaceholderMessage>
              <Text>
                <Trans>
                  To edit the external events, choose the scene in which it will
                  be included
                </Trans>
              </Text>
              <Line justifyContent="center">
                <RaisedButton
                  label={<Trans>Choose the scene</Trans>}
                  primary
                  onClick={this.openExternalPropertiesDialog}
                />
              </Line>
              <Line justifyContent="flex-start" noMargin>
                <TutorialButton
                  tutorialId="Intermediate-externals"
                  label={<Trans>Watch tutorial</Trans>}
                  renderIfNotFound={
                    <HelpButton helpPagePath="/interface/events-editor/external-events" />
                  }
                />
              </Line>
            </PlaceholderMessage>
          </Background>
        )}
        <ExternalPropertiesDialog
          title={<Trans>Configure the external events</Trans>}
          helpTexts={[
            <Trans>
              In order to use these external events, you still need to add a
              "Link" event in the events sheet of the corresponding scene
            </Trans>,
          ]}
          open={this.state.externalPropertiesDialogOpen}
          project={project}
          onChoose={this.saveExternalProperties}
          layoutName={this.getAssociatedLayoutName()}
          onClose={() => this.setState({ externalPropertiesDialogOpen: false })}
        />
      </div>
    );
  }
}

export const renderExternalEventsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <ExternalEventsEditorContainer {...props} />;
