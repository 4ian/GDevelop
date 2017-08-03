import React from 'react';
import EventsSheet from '../../EventsSheet';
import { serializeToJSObject } from '../../Utils/Serializer';
import BaseEditor from './BaseEditor';

// TODO: Move in a folder with all editors
export default class ExternalEventsEditor extends BaseEditor {
  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const { externalLayout, layout } = this._getLayoutAndExternalEvents();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      instances: serializeToJSObject(externalLayout.getInitialInstances()),
      uiSettings: this.editor.getUiSettings(),
    };
  }

  _getLayoutAndExternalEvents() {
    const { project, externalEventsName } = this.props;
    if (!project.hasExternalEventsNamed(externalEventsName)) {
      return {};
    }
    const externalEvents = project.getExternalEvents(externalEventsName);

    const layoutName = externalEvents.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return {
        externalEvents,
      };
    }
    const layout = project.getLayout(layoutName);

    return {
      layout,
      externalEvents,
    }
  }

  render() {
    const { project, layoutName, externalEventsName  } = this.props;
    const { layout, externalEvents } = this._getLayoutAndExternalEvents();
    if (!externalEvents) {
      //TODO: Error component
      return <div>No external events called {externalEventsName} found!</div>;
    }

    if (!layout) {
      //TODO: Error component
      return (
        <div>
          No layout called {layoutName} found for the external events editor!
        </div>
      );
    }

    return (
      <EventsSheet
        {...this.props}
        ref={editor => this.editor = editor}
        project={project}
        layout={layout}
        events={externalEvents.getEvents()}
        onPreview={() => this.props.onPreview(project, layout)}
      />
    );
  }
}
