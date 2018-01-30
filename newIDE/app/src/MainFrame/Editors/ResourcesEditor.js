import React from 'react';
import BaseEditor from './BaseEditor';
import ResourcesList from '../../ResourcesList';

export default class ResourcesEditor extends BaseEditor {
  updateToolbar() {
    // TODO
  }

  render() {
    const { project } = this.props;

    return (
      <ResourcesList
        {...this.props}
        ref={editor => (this.editor = editor)}
        project={project}
      />
    );
  }
}
