// @flow
import React from 'react';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import ResourcesEditor from '../../ResourcesEditor';

export class ResourcesEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?ResourcesEditor;

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

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (
      this.editor &&
      this.props.isActive &&
      prevProps.isActive !== this.props.isActive
    )
      this.editor.refreshResourcesList();
  }

  render() {
    const { project } = this.props;
    if (!project) return null;

    return (
      <ResourcesEditor
        setToolbar={this.props.setToolbar}
        onDeleteResource={this.props.onDeleteResource}
        onRenameResource={this.props.onRenameResource}
        resourceSources={this.props.resourceSources}
        onChooseResource={this.props.onChooseResource}
        ref={editor => (this.editor = editor)}
        project={project}
      />
    );
  }
}

export const renderResourcesEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <ResourcesEditorContainer {...props} />;
