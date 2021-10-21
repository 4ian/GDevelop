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
    if (!this.props.isActive && !nextProps.isActive) {
      return false;
    }

    return true;
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

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    // No updates to be done.
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

  saveExternalProperties = (props: ExternalProperties) => {
    const externalLayout = this.getExternalLayout();
    if (!externalLayout) return;

    externalLayout.setAssociatedLayout(props.layoutName);
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

    return (
      <div style={styles.container}>
        {layout && (
          <SceneEditor
            setToolbar={this.props.setToolbar}
            resourceSources={this.props.resourceSources}
            onChooseResource={this.props.onChooseResource}
            resourceExternalEditors={this.props.resourceExternalEditors}
            unsavedChanges={this.props.unsavedChanges}
            hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
            ref={editor => (this.editor = editor)}
            project={project}
            layout={layout}
            initialInstances={externalLayout.getInitialInstances()}
            getInitialInstancesEditorSettings={() =>
              prepareInstancesEditorSettings(
                serializeToJSObject(
                  externalLayout.getAssociatedEditorSettings()
                )
              )
            }
            onOpenMoreSettings={this.openExternalPropertiesDialog}
            isActive={isActive}
          />
        )}
        {!layout && (
          <PlaceholderMessage>
            <Text>
              <Trans>
                To edit the external layout, choose the scene in which it will
                be included:
              </Trans>
            </Text>
            <Line justifyContent="center">
              <RaisedButton
                label={<Trans>Choose the scene</Trans>}
                primary
                onClick={this.openExternalPropertiesDialog}
              />
            </Line>
          </PlaceholderMessage>
        )}
        <ExternalPropertiesDialog
          title={<Trans>Configure the external layout</Trans>}
          helpTexts={[
            <Trans>
              Remember! In order to see your objects in the scene, you need to
              add an action "Create objects from external layout" in your events
              sheet.
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
