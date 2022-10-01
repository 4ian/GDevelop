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
    // We stop updates when the component is inactive.
    // If it's active, was active or becoming active again we let update propagate.
    // Especially important to note that when becoming inactive, a "last" update is allowed.
    return this.props.isActive || nextProps.isActive;
  }

  componentDidUpdate(prevProps: *) {
    // Ensure that the editor will trigger the
    // reload/regeneration of extensions when the user
    // is focusing another editor
    if (prevProps.isActive && !this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions();
    }
  }

  componentWillUnmount() {
    // Ensure that a closed editor will still trigger the
    // reload/regeneration of extensions, as changes can have
    // been made inside before it's closed.
    if (this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions();
    }
  }

  _onBehaviorEdited = async () => {
    // Immediately trigger the reload/regeneration of extensions
    // as a change in the properties of a behavior can create changes
    // in actions/conditions/expressions to manipulate these properties.
    try {
      await this.props.onLoadEventsFunctionsExtensions();
    } catch (error) {
      console.warn(
        'Error while loading events functions extensions - ignoring this in the context of the EventsFunctionsExtensionEditorContainer.',
        error
      );
    }
  };

  // TODO EBO factorize?
  _onObjectEdited = async () => {
    // Immediately trigger the reload/regeneration of extensions
    // as a change in the properties of an object can create changes
    // in actions/conditions/expressions to manipulate these properties.
    try {
      await this.props.onLoadEventsFunctionsExtensions();
    } catch (error) {
      console.warn(
        'Error while loading events functions extensions - ignoring this in the context of the EventsFunctionsExtensionEditorContainer.',
        error
      );
    }
  };

  previewWillStart = () => {
    // Immediately trigger the reload/regeneration of extensions
    // if a preview is about to start, as changes chan have been made
    // inside. The preview is responsible for waiting for extensions
    // to be loaded before starting.
    if (this.props.isActive) {
      this.props.onLoadEventsFunctionsExtensions();
    }
  };

  getEventsFunctionsExtension(): ?gdEventsFunctionsExtension {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

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
          onFetchNewlyAddedResources={this.props.onFetchNewlyAddedResources}
          openInstructionOrExpression={this.props.openInstructionOrExpression}
          onCreateEventsFunction={this.props.onCreateEventsFunction}
          initiallyFocusedFunctionName={initiallyFocusedFunctionName}
          initiallyFocusedBehaviorName={initiallyFocusedBehaviorName}
          onBehaviorEdited={this._onBehaviorEdited}
          onObjectEdited={this._onObjectEdited}
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
