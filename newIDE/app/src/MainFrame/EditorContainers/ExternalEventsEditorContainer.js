// @flow
import type { Node } from 'React';
import { Trans } from '@lingui/macro';
import React from 'react';
import EventsSheet from '../../EventsSheet';
import RaisedButton from '../../UI/RaisedButton';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import LayoutChooserDialog from './LayoutChooserDialog';
import Text from '../../UI/Text';
import { Line } from '../../UI/Grid';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

type State = {|
  layoutChooserOpen: boolean,
|};

export class ExternalEventsEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?EventsSheet;

  state: State = {
    layoutChooserOpen: false,
  };

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // Prevent any update to the editor if the editor is not active,
    // and so not visible to the user.
    return nextProps.isActive;
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

  getExternalEvents(): ?gdExternalEvents {
    const { project, projectItemName } = this.props;
    if (!project || !projectItemName) return null;

    if (!project.hasExternalEventsNamed(projectItemName)) {
      return null;
    }
    return project.getExternalEvents(projectItemName);
  }

  getLayout(): ?gdLayout {
    const { project } = this.props;
    if (!project) return null;

    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return null;

    const layoutName = externalEvents.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }
    return project.getLayout(layoutName);
  }

  setAssociatedLayout = (layoutName: string) => {
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
    const { project, projectItemName } = this.props;
    const externalEvents = this.getExternalEvents();
    const layout = this.getLayout();

    if (!externalEvents || !project) {
      //TODO: Error component
      return <div>No external events called {projectItemName} found!</div>;
    }

    return (
      <div style={styles.container}>
        {layout && (
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
            events={externalEvents.getEvents()}
            onOpenSettings={this.openLayoutChooser}
            onOpenExternalEvents={this.props.onOpenExternalEvents}
          />
        )}
        {!layout && (
          <PlaceholderMessage>
            <Text>
              <Trans>
                To edit the external events, choose the scene in which it will
                be included:
              </Trans>
            </Text>
            <Line justifyContent="center">
              <RaisedButton
                label={<Trans>Choose the scene</Trans>}
                primary
                onClick={this.openLayoutChooser}
              />
            </Line>
          </PlaceholderMessage>
        )}
        <LayoutChooserDialog
          title={<Trans>Choose the associated scene</Trans>}
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

export const renderExternalEventsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): Node => <ExternalEventsEditorContainer {...props} />;
