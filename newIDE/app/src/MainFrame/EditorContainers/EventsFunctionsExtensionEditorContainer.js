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
    // In some cases, if some flex children cannot contract to
    // within the div, it is possible for the div to overflow
    // outside its parent. Setting min-width to 0 avoids this.
    // See: https://stackoverflow.com/a/36247448/6199068
    minWidth: 0,
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

  _reloadExtensionMetadata = () => {
    // Immediately trigger the reload/regeneration of the extension
    // as a change in function declaration must be seen in the instructions
    // especially to avoid to show "unsupported instructions".
    try {
      const extension = this.getEventsFunctionsExtension();
      if (extension) {
        this.props.onReloadEventsFunctionsExtensionMetadata(extension);
      }
    } catch (error) {
      console.warn(
        'Error while loading events functions extensions - ignoring this in the context of the EventsFunctionsExtensionEditorContainer.',
        error
      );
    }
  };

  previewOrExportWillStart = () => {
    // Immediately trigger the reload/regeneration of extensions
    // if a preview is about to start, as changes chan have been made
    // inside. The preview or export is responsible for waiting
    // for extensions to be loaded before starting.
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

  getEventsFunctionsExtensionName(): ?string {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    return projectItemName;
  }

  selectEventsFunctionByName(
    eventsFunctionName: string,
    behaviorName: ?string
  ) {
    if (this.editor)
      this.editor.selectEventsFunctionByName(eventsFunctionName, behaviorName);
  }

  selectEventsBasedBehaviorByName(behaviorName: string) {
    if (this.editor) this.editor.selectEventsBasedBehaviorByName(behaviorName);
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
          resourceManagementProps={this.props.resourceManagementProps}
          openInstructionOrExpression={this.props.openInstructionOrExpression}
          onCreateEventsFunction={this.props.onCreateEventsFunction}
          initiallyFocusedFunctionName={initiallyFocusedFunctionName}
          initiallyFocusedBehaviorName={initiallyFocusedBehaviorName}
          onBehaviorEdited={this._reloadExtensionMetadata}
          onObjectEdited={this._reloadExtensionMetadata}
          onFunctionEdited={this._reloadExtensionMetadata}
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
