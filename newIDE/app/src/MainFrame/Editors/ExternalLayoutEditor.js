import React from 'react';
import InstancesFullEditor from '../../SceneEditor/InstancesFullEditor';
import { serializeToJSObject } from '../../Utils/Serializer';
import BaseEditor from './BaseEditor';

export default class ExternalLayoutEditor extends BaseEditor {
  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const { externalLayout, layout } = this._getLayoutAndExternalLayout();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      instances: serializeToJSObject(externalLayout.getInitialInstances()),
      uiSettings: this.editor.getUiSettings(),
    };
  }

  _getLayoutAndExternalLayout() {
    const { project, externalLayoutName } = this.props;
    if (!project.hasExternalLayoutNamed(externalLayoutName)) {
      return {};
    }
    const externalLayout = project.getExternalLayout(externalLayoutName);

    const layoutName = externalLayout.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return {
        externalLayout,
      };
    }
    const layout = project.getLayout(layoutName);

    return {
      layout,
      externalLayout,
    }
  }

  render() {
    const { project, layoutName, externalLayoutName  } = this.props;
    const { layout, externalLayout } = this._getLayoutAndExternalLayout();
    if (!externalLayout) {
      //TODO: Error component
      return <div>No external layout called {externalLayoutName} found!</div>;
    }

    if (!layout) {
      //TODO: Error component
      return (
        <div>
          No layout called {layoutName} found for the external layout editor!
        </div>
      );
    }

    return (
      <InstancesFullEditor
        {...this.props}
        ref={editor => this.editor = editor}
        project={project}
        layout={layout}
        initialInstances={externalLayout.getInitialInstances()}
        initialUiSettings={serializeToJSObject(
          externalLayout.getAssociatedSettings()
        )}
        onPreview={() => this.props.onPreview(project, layout, externalLayout)}
      />
    );
  }
}
