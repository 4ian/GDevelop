import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import InstancesFullEditor from '../../SceneEditor/InstancesFullEditor';
import { serializeToJSObject } from '../../Utils/Serializer';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import BaseEditor from './BaseEditor';
import LayoutChooserDialog from './LayoutChooserDialog';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

export default class ExternalLayoutEditor extends BaseEditor {
  constructor(props) {
    super(props);
    this.state = {
      layoutChooserOpen: false,
    };
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const externalLayout = this.getExternalLayout();
    const layout = this.getLayout();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      instances: serializeToJSObject(externalLayout.getInitialInstances()),
      uiSettings: this.editor.getUiSettings(),
    };
  }

  getExternalLayout() {
    const { project, externalLayoutName } = this.props;
    if (!project.hasExternalLayoutNamed(externalLayoutName)) {
      return null;
    }
    return project.getExternalLayout(externalLayoutName);
  }

  getLayout() {
    const { project } = this.props;

    const externalLayout = this.getExternalLayout();
    if (!externalLayout) return null;

    const layoutName = externalLayout.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }
    return project.getLayout(layoutName);
  }

  setAssociatedLayout = layoutName => {
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

  render() {
    const { project, externalLayoutName } = this.props;
    const externalLayout = this.getExternalLayout();
    const layout = this.getLayout();

    if (!externalLayout) {
      //TODO: Error component
      return <div>No external layout called {externalLayoutName} found!</div>;
    }

    return (
      <div style={styles.container}>
        {layout && (
          <InstancesFullEditor
            {...this.props}
            ref={editor => (this.editor = editor)}
            project={project}
            layout={layout}
            initialInstances={externalLayout.getInitialInstances()}
            initialUiSettings={serializeToJSObject(
              externalLayout.getAssociatedSettings()
            )}
            onPreview={() =>
              this.props.onPreview(project, layout, externalLayout)}
            onOpenMoreSettings={this.openLayoutChooser}
          />
        )}
        {!layout && (
          <PlaceholderMessage>
            To edit the external layout, choose the scene in which it will be
            included:
            <RaisedButton
              label="Choose the scene"
              primary
              onClick={this.openLayoutChooser}
            />
          </PlaceholderMessage>
        )}
        <LayoutChooserDialog
          title="Choose the associated scene"
          open={this.state.layoutChooserOpen}
          project={project}
          onChoose={this.setAssociatedLayout}
          onClose={() => this.setState({ layoutChooserOpen: false })}
        />
      </div>
    );
  }
}
