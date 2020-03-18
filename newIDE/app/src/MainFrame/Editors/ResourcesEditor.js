import React from 'react';
import BaseEditor from './BaseEditor';
import ResourcesFullEditor from '../../ResourcesEditor';

export default class ResourcesEditor extends BaseEditor {
  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  performRefresh() {
    return null;
  }

  render() {
    const { project } = this.props;

    return (
      <ResourcesFullEditor
        {...this.props}
        ref={editor => (this.editor = editor)}
        project={project}
      />
    );
  }
}
