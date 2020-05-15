// @flow
import * as React from 'react';
import EventsFunctionsExtensionEditor from '../../EventsFunctionsExtensionEditor';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

export class EventsFunctionsExtensionEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?EventsFunctionsExtensionEditor;

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

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // This optimization is a bit more cautious than the traditional one,
    // to still be notified when isActive goes from true to false.
    if (!this.props.isActive && !nextProps.isActive) {
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps: *) {
    if (prevProps.isActive && !this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions();
    }
  }

  _onBehaviorEdited = () => {
    // Immediately trigger the reload/regeneration of extensions
    // as a change in the properties of a behavior can create changes
    // in actions/conditions/expressions to manipulate these properties.
    this.props.onLoadEventsFunctionsExtensions();
  };

  getEventsFunctionsExtension(): ?gdEventsFunctionsExtension {
    const { project, projectItemName } = this.props;
    if (!project) return null;

    if (!project.hasEventsFunctionsExtensionNamed(projectItemName)) {
      return null;
    }
    return project.getEventsFunctionsExtension(projectItemName);
  }

  selectEventsFunctionByName(
    eventsFunctionName: string,
    behaviorName: ?string
  ) {
    if (this.editor)
      this.editor.selectEventsFunctionByName(eventsFunctionName, behaviorName);
  }

  render() {
    const { project, projectItemName } = this.props;
    const eventsFunctionsExtension = this.getEventsFunctionsExtension();

    if (!eventsFunctionsExtension || !project) {
      //TODO: Error component
      return <div>No extension called {projectItemName} found!</div>;
    }

    const { initiallyFocusedFunctionName, initiallyFocusedBehaviorName } =
      this.props.extraEditorProps || {};

    return (
      <div style={styles.container}>
        <EventsFunctionsExtensionEditor
          key={eventsFunctionsExtension.ptr}
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          setToolbar={this.props.setToolbar}
          resourceSources={this.props.resourceSources}
          onChooseResource={this.props.onChooseResource}
          resourceExternalEditors={this.props.resourceExternalEditors}
          openInstructionOrExpression={this.props.openInstructionOrExpression}
          onCreateEventsFunction={this.props.onCreateEventsFunction}
          initiallyFocusedFunctionName={initiallyFocusedFunctionName}
          initiallyFocusedBehaviorName={initiallyFocusedBehaviorName}
          onBehaviorEdited={this._onBehaviorEdited}
          ref={editor => (this.editor = editor)}
          unsavedChanges={this.props.unsavedChanges}
        />
      </div>
    );
  }
}

export const renderEventsFunctionsExtensionEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <EventsFunctionsExtensionEditorContainer {...props} />;
