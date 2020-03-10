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
import BaseEditor from './BaseEditor';
import LayoutChooserDialog from './LayoutChooserDialog';
import { Line } from '../../UI/Grid';
import Text from '../../UI/Text';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

export default class ExternalLayoutEditor extends BaseEditor {
  editor: ?SceneEditor;
  state = {
    layoutChooserOpen: false,
  };

  shouldComponentUpdate(nextProps: *) {
    // This optimization is a bit more cautious than the one is BaseEditor, to still allow
    // children, and in particular SceneEditor and InstancesEditor, to be notified when isActive
    // goes from true to false (in which case PIXI rendering is halted). If isActive was false
    // and remains false, it's safe to stop update here (PIXI rendering is already halted).
    if (!this.props.isActive && !nextProps.isActive) {
      return false;
    }

    return true;
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const externalLayout = this.getExternalLayout();
    const layout = this.getLayout();
    if (!externalLayout || !layout) return {};

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      instances: serializeToJSObject(externalLayout.getInitialInstances()),
      uiSettings: this.editor ? this.editor.getUiSettings() : {},
    };
  }

  getExternalLayout(): ?gdExternalLayout {
    const { project, externalLayoutName } = this.props;
    if (!project.hasExternalLayoutNamed(externalLayoutName)) {
      return null;
    }
    return project.getExternalLayout(externalLayoutName);
  }

  getLayout(): ?gdLayout {
    const { project } = this.props;

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
    const { project, externalLayoutName, isActive } = this.props;
    const externalLayout = this.getExternalLayout();
    const layout = this.getLayout();

    if (!externalLayout) {
      //TODO: Error component
      return <div>No external layout called {externalLayoutName} found!</div>;
    }

    return (
      <div style={styles.container}>
        {layout && (
          <SceneEditor
            {...this.props}
            ref={editor => (this.editor = editor)}
            project={project}
            layout={layout}
            initialInstances={externalLayout.getInitialInstances()}
            initialUiSettings={serializeToJSObject(
              externalLayout.getAssociatedSettings()
            )}
            onPreview={options =>
              this.props.onPreview(project, layout, externalLayout, options)
            }
            previewButtonSettings={this.props.previewButtonSettings}
            onOpenDebugger={this.props.onOpenDebugger}
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
