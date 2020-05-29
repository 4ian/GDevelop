// @flow
import React from 'react';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import ResourcesFullEditor from '../../ResourcesEditor';

export class ResourcesEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?ResourcesFullEditor;

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // Prevent any update to the editor if the editor is not active,
    // and so not visible to the user.
    return nextProps.isActive;
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout(): ?gdLayout {
    return null;
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    // No updates to be done.
  }

  render() {
    const { project } = this.props;
    if (!project) return null;

    return (
      <ResourcesFullEditor
        {...this.props}
        ref={editor => (this.editor = editor)}
        project={project}
      />
    );
  }
}

export const renderResourcesEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <ResourcesEditorContainer {...props} />;
