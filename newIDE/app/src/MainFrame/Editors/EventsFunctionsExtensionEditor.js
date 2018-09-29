// @flow
import * as React from 'react';
import EventsFunctionsExtensionEditor from '../../EventsFunctionsExtensionEditor';
import BaseEditor from './BaseEditor';

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

  getEventsFunctionsExtension(): ?gdEventsFunctionsExtension {
    const { project, eventsFunctionsExtensionName } = this.props;
    if (!project.hasEventsFunctionsExtensionNamed(eventsFunctionsExtensionName)) {
      return null;
    }
    return project.getEventsFunctionsExtension(eventsFunctionsExtensionName);
  }

  render() {
    const { project, eventsFunctionsExtensionName } = this.props;
    const eventsFunctionsExtension = this.getEventsFunctionsExtension();

    if (!eventsFunctionsExtension) {
      //TODO: Error component
      return <div>No extension called {eventsFunctionsExtensionName} found!</div>;
    }

    return (
      <div style={styles.container}>
        <EventsFunctionsExtensionEditor
          key={eventsFunctionsExtension.ptr}
          project={project}
          eventsFunctionsExtension={eventsFunctionsExtension}
          setToolbar={this.props.setToolbar}
          ref={editor => (this.editor = editor)}
        />
      </div>
    );
  }
}
