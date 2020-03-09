// @flow
import * as React from 'react';
import EventsFunctionsExtensionEditor from '../../EventsFunctionsExtensionEditor';
import BaseEditor from './BaseEditor';
import { emptyPreviewButtonSettings } from '../Toolbar/PreviewButtons';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

export default class EventsFunctionsExtensionEditorWrapper extends BaseEditor {
  editor: ?EventsFunctionsExtensionEditor;

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  shouldComponentUpdate(nextProps: *) {
    // This optimization is a bit more cautious than the one is BaseEditor,
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
    const { project, eventsFunctionsExtensionName } = this.props;
    if (
      !project.hasEventsFunctionsExtensionNamed(eventsFunctionsExtensionName)
    ) {
      return null;
    }
    return project.getEventsFunctionsExtension(eventsFunctionsExtensionName);
  }

  selectEventsFunctionByName(
    eventsFunctionName: string,
    behaviorName: ?string
  ) {
    if (this.editor)
      this.editor.selectEventsFunctionByName(eventsFunctionName, behaviorName);
  }

  render() {
    const { project, eventsFunctionsExtensionName } = this.props;
    const eventsFunctionsExtension = this.getEventsFunctionsExtension();

    if (!eventsFunctionsExtension) {
      //TODO: Error component
      return (
        <div>No extension called {eventsFunctionsExtensionName} found!</div>
      );
    }

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
          initiallyFocusedFunctionName={this.props.initiallyFocusedFunctionName}
          initiallyFocusedBehaviorName={this.props.initiallyFocusedBehaviorName}
          onBehaviorEdited={this._onBehaviorEdited}
          ref={editor => (this.editor = editor)}
          previewButtonSettings={emptyPreviewButtonSettings}
        />
      </div>
    );
  }
}
