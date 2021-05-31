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
import LayoutChooserDialog from './LayoutChooserDialog';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

type State = {|
  layoutChooserOpen: boolean,
|};

export class ExternalLayoutEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?SceneEditor;
  state: State = {
    layoutChooserOpen: false,
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

    const externalLayout = this.getExternalLayout();
    if (!externalLayout) return null;

    const layoutName = externalLayout.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }
    return project.getLayout(layoutName);
  }

  setAssociatedLayout = (layoutName: string) => {
    const externalLayout = this.getExternalLayout();
    if (!externalLayout) return;

    externalLayout.setAssociatedLayout(layoutName);
    this.setState(
      {
        layoutChooserOpen: false,
      },
      () => this.updateToolbar()
    );
  };

  openLayoutChooser = () => {
    this.setState({
      layoutChooserOpen: true,
    });
  };

  saveUiSettings = () => {
    const layout = this.getExternalLayout();
    const editor = this.editor;

    if (editor && layout) {
      unserializeFromJSObject(
        layout.getAssociatedSettings(),
        editor.getUiSettings()
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
            initialUiSettings={serializeToJSObject(
              externalLayout.getAssociatedSettings()
            )}
            onOpenMoreSettings={this.openLayoutChooser}
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
                onClick={this.openLayoutChooser}
              />
            </Line>
          </PlaceholderMessage>
        )}
        <LayoutChooserDialog
          title={<Trans>Choose the associated scene</Trans>}
          open={this.state.layoutChooserOpen}
          project={project}
          onChoose={this.setAssociatedLayout}
          onClose={() => this.setState({ layoutChooserOpen: false })}
        />
      </div>
    );
  }
}

export const renderExternalLayoutEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <ExternalLayoutEditorContainer {...props} />;
