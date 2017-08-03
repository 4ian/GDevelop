import React from 'react';
import EventsSheet from '../../EventsSheet';
import { serializeToJSObject } from '../../Utils/Serializer';
import BaseEditor from './BaseEditor';

export default class EventsEditor extends BaseEditor {
  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const { layout } = this._getLayout();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      events: serializeToJSObject(layout.getEvents())
    };
  }

  _getLayout() {
    const { project, layoutName } = this.props;
    if (!project || !project.hasLayoutNamed(layoutName)) return {};

    const layout = project.getLayout(layoutName);

    return {
      layout,
    };
  }

  render() {
    const { project, layoutName } = this.props;
    const { layout } = this._getLayout();
    if (!layout) {
      //TODO: Error component
      return <div>No layout called {layoutName} found!</div>;
    }

    return (
      <EventsSheet
        {...this.props}
        ref={editor => this.editor = editor}
        project={project}
        layout={layout}
        events={layout.getEvents()}
        onPreview={() => this.props.onPreview(project, layout)}
      />
    );
  }
}
