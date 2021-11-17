// @flow
import * as React from 'react';
import EventsSheet, { type EventsSheetInterface } from '../../EventsSheet';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';

export class EventsEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?EventsSheetInterface;

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // Prevent any update to the editor if the editor is not active,
    // and so not visible to the user.
    return nextProps.isActive;
  }

  componentDidMount() {
    if (this.props.isActive) {
      const layout = this.getLayout();
      this.props.setPreviewedLayout(layout ? layout.getName() : null);
    }
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive) {
      const layout = this.getLayout();
      this.props.setPreviewedLayout(layout ? layout.getName() : null);
    }
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    // No updates to be done.
  }

  getLayout(): ?gdLayout {
    const { project, projectItemName } = this.props;
    if (
      !project ||
      !projectItemName ||
      !project.hasLayoutNamed(projectItemName)
    )
      return null;

    return project.getLayout(projectItemName);
  }

  render() {
    const { project, projectItemName } = this.props;
    const layout = this.getLayout();
    if (!layout || !project) {
      //TODO: Error component
      return <div>No layout called {projectItemName} found!</div>;
    }

    return (
      <EventsSheet
        ref={editor => (this.editor = editor)}
        setToolbar={this.props.setToolbar}
        onOpenLayout={this.props.onOpenLayout}
        resourceSources={this.props.resourceSources}
        onChooseResource={this.props.onChooseResource}
        resourceExternalEditors={this.props.resourceExternalEditors}
        openInstructionOrExpression={this.props.openInstructionOrExpression}
        onCreateEventsFunction={this.props.onCreateEventsFunction}
        unsavedChanges={this.props.unsavedChanges}
        project={project}
        scope={{
          layout,
        }}
        globalObjectsContainer={project}
        objectsContainer={layout}
        events={layout.getEvents()}
        onOpenExternalEvents={this.props.onOpenExternalEvents}
      />
    );
  }
}

export const renderEventsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <EventsEditorContainer {...props} />;
