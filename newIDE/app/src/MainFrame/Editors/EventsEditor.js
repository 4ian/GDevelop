import React from 'react';
import EventsSheet from '../../EventsSheet';
import { serializeToJSObject } from '../../Utils/Serializer';
import BaseEditor from './BaseEditor';

export default class EventsEditor extends BaseEditor {
  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const layout = this.getLayout();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      events: serializeToJSObject(layout.getEvents()),
    };
  }

  getLayout() {
    const { project, layoutName } = this.props;
    if (!project || !project.hasLayoutNamed(layoutName)) return null;

    return project.getLayout(layoutName);
  }

  render() {
    const { project, layoutName } = this.props;
    const layout = this.getLayout();
    if (!layout) {
      //TODO: Error component
      return <div>No layout called {layoutName} found!</div>;
    }

    return (
      <EventsSheet
        {...this.props}
        ref={editor => (this.editor = editor)}
        project={project}
        layout={layout}
        events={layout.getEvents()}
        onPreview={() => this.props.onPreview(project, layout)}
        onOpenExternalEvents={this.props.onOpenExternalEvents}
      />
    );
  }
}
