import React from 'react';
import EventsSheet from '../../EventsSheet';
import RaisedButton from 'material-ui/RaisedButton';
import { serializeToJSObject } from '../../Utils/Serializer';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import BaseEditor from './BaseEditor';
import LayoutChooserDialog from './LayoutChooserDialog';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

export default class ExternalEventsEditor extends BaseEditor {
  constructor(props) {
    super(props);
    this.state = {
      layoutChooserOpen: false,
    };
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const externalEvents = this.getExternalEvents();
    const layout = this.getLayout();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      events: serializeToJSObject(externalEvents),
      uiSettings: this.editor.getUiSettings(),
    };
  }

  getExternalEvents() {
    const { project, externalEventsName } = this.props;
    if (!project.hasExternalEventsNamed(externalEventsName)) {
      return null;
    }
    return project.getExternalEvents(externalEventsName);
  }

  getLayout() {
    const { project } = this.props;

    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return null;

    const layoutName = externalEvents.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }
    return project.getLayout(layoutName);
  }

  setAssociatedLayout = layoutName => {
    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return;

    externalEvents.setAssociatedLayout(layoutName);
    this.setState(
      {
        layoutChooserOpen: false,
      },
      () => this.updateToolbar()
    );
  };

  openLayoutChooser = () => {
    this.setState({
      layoutChooserOpen: true,
    });
  };

  render() {
    const { project, externalEventsName } = this.props;
    const externalEvents = this.getExternalEvents();
    const layout = this.getLayout();

    if (!externalEvents) {
      //TODO: Error component
      return <div>No external events called {externalEventsName} found!</div>;
    }

    return (
      <div style={styles.container}>
        {layout && (
          <EventsSheet
            {...this.props}
            ref={editor => (this.editor = editor)}
            project={project}
            layout={layout}
            events={externalEvents.getEvents()}
            onPreview={() => this.props.onPreview(project, layout)}
            onOpenSettings={this.openLayoutChooser}
            onOpenExternalEvents={this.props.onOpenExternalEvents}
          />
        )}
        {!layout && (
          <PlaceholderMessage>
            To edit the external events, choose the scene in which it will be
            included:
            <RaisedButton
              label="Choose the scene"
              primary
              onClick={this.openLayoutChooser}
            />
          </PlaceholderMessage>
        )}
        <LayoutChooserDialog
          title="Choose the associated scene"
          helpText="You still need to add a Link event in the scene to import the external events"
          open={this.state.layoutChooserOpen}
          project={project}
          onChoose={this.setAssociatedLayout}
          onClose={() => this.setState({ layoutChooserOpen: false })}
        />
      </div>
    );
  }
}
