// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import RaisedButton from '../../UI/RaisedButton';
import SceneEditor from '../../SceneEditor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import ExternalPropertiesDialog, {
  type ExternalProperties,
} from './ExternalPropertiesDialog';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';
import { prepareInstancesEditorSettings } from '../../InstancesEditor/InstancesEditorSettings';
import TutorialButton from '../../UI/TutorialButton';
import HelpButton from '../../UI/HelpButton';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../ResourcesWatcher';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

type State = {|
  externalPropertiesDialogOpen: boolean,
|};

export class ExternalLayoutEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?SceneEditor;
  resourceExternallyChangedCallbackId: ?string;
  state = {
    externalPropertiesDialogOpen: false,
  };

  getProject(): ?gdProject {
    return this.props.project;
  }

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // This optimization is a bit more cautious than the traditional one, to still allow
    // children, and in particular SceneEditor and InstancesEditor, to be notified when isActive
    // goes from true to false (in which case PIXI rendering is halted). If isActive was false
    // and remains false, it's safe to stop update here (PIXI rendering is already halted).
    return this.props.isActive || nextProps.isActive;
  }

  componentDidMount() {
    if (this.props.isActive) {
      const { projectItemName } = this.props;
      const layout = this.getLayout();
      this.props.setPreviewedLayout(
        layout ? layout.getName() : null,
        projectItemName
      );
    }
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
  }
  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive) {
      const { projectItemName } = this.props;
      const layout = this.getLayout();
      this.props.setPreviewedLayout(
        layout ? layout.getName() : null,
        projectItemName
      );
    }
  }

  onResourceExternallyChanged(resourceInfo: {| identifier: string |}) {
    const { editor } = this;
    if (editor) {
      editor.onResourceExternallyChanged(resourceInfo);
    }
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
    const { editor } = this;
    const externalLayout = this.getExternalLayout();
    if (!externalLayout) {
      return;
    }
    if (
      externalLayout.getAssociatedLayout() !== scene.getName() &&
      !objectWithContext.global
    ) {
      return;
    }
    if (editor) {
      // Update instances of the object as it was modified in an editor.
      editor.forceUpdateRenderedInstancesOfObject(objectWithContext.object);
    }
  }

  getExternalLayout(): ?gdExternalLayout {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    if (!project.hasExternalLayoutNamed(projectItemName)) {
      return null;
    }
    return project.getExternalLayout(projectItemName);
  }

  getLayout(): ?gdLayout {
    const { project } = this.props;
    if (!project) return null;

    const layoutName = this.getAssociatedLayoutName();
    if (!layoutName) return;

    return project.getLayout(layoutName);
  }

  getAssociatedLayoutName(): ?string {
    const { project } = this.props;
    if (!project) return null;

    const externalLayout = this.getExternalLayout();
    if (!externalLayout) return null;

    const layoutName = externalLayout.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }

    return layoutName;
  }

  saveExternalProperties = (externalProps: ExternalProperties) => {
    const externalLayout = this.getExternalLayout();
    if (!externalLayout) return;

    externalLayout.setAssociatedLayout(externalProps.layoutName);
    this.setState(
      {
        externalPropertiesDialogOpen: false,
      },
      () => this.updateToolbar()
    );
  };

  openExternalPropertiesDialog = () => {
    this.setState({
      externalPropertiesDialogOpen: true,
    });
  };

  saveUiSettings = () => {
    const layout = this.getExternalLayout();
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
    const externalLayout = this.getExternalLayout();
    const layout = this.getLayout();

    if (!externalLayout || !project) {
      //TODO: Error component
      return <div>No external layout called {projectItemName} found!</div>;
    }

    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    return (
      <div style={styles.container}>
        {layout && (
          <SceneEditor
            setToolbar={this.props.setToolbar}
            resourceManagementProps={this.props.resourceManagementProps}
            unsavedChanges={this.props.unsavedChanges}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
            ref={editor => (this.editor = editor)}
            project={project}
            projectScopedContainersAccessor={projectScopedContainersAccessor}
            layout={layout}
            eventsFunctionsExtension={null}
            eventsBasedObject={null}
            globalObjectsContainer={project.getObjects()}
            objectsContainer={layout.getObjects()}
            layersContainer={layout.getLayers()}
            initialInstances={externalLayout.getInitialInstances()}
            getInitialInstancesEditorSettings={() =>
              prepareInstancesEditorSettings(
                serializeToJSObject(
                  externalLayout.getAssociatedEditorSettings()
                ),
                Math.max(
                  project.getGameResolutionWidth(),
                  project.getGameResolutionHeight()
                )
              )
            }
            onOpenEvents={this.props.onOpenEvents}
            onOpenMoreSettings={this.openExternalPropertiesDialog}
            isActive={isActive}
            openBehaviorEvents={this.props.openBehaviorEvents}
            onExtractAsExternalLayout={this.props.onExtractAsExternalLayout}
            onExtractAsEventBasedObject={this.props.onExtractAsEventBasedObject}
            onOpenEventBasedObjectEditor={
              this.props.onOpenEventBasedObjectEditor
            }
            onObjectEdited={objectWithContext =>
              this.props.onSceneObjectEdited(layout, objectWithContext)
            }
            // Nothing to do as events-based objects can't have external layout.
            onEventsBasedObjectChildrenEdited={() => {}}
          />
        )}
        {!layout && (
          <PlaceholderMessage>
            <Text>
              <Trans>
                To edit the external layout, choose the scene in which it will
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
        )}
        <ExternalPropertiesDialog
          title={<Trans>Configure the external layout</Trans>}
          helpTexts={[
            <Trans>
              In order to see your objects in the scene, you need to add an
              action "Create objects from external layout" in your events sheet.
            </Trans>,
            <Trans>
              You can also launch a preview from this external layout, but
              remember that it will still create objects from the scene, as well
              as trigger its events. Make sure to disable any action loading the
              external layout before doing so to avoid having duplicate objects!
            </Trans>,
          ]}
          open={this.state.externalPropertiesDialogOpen}
          project={project}
          layoutName={this.getAssociatedLayoutName()}
          onChoose={this.saveExternalProperties}
          onClose={() => this.setState({ externalPropertiesDialogOpen: false })}
        />
      </div>
    );
  }
}

export const renderExternalLayoutEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <ExternalLayoutEditorContainer {...props} />;
