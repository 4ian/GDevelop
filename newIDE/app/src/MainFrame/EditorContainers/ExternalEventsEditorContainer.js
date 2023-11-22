// @flow
import { Trans } from '@lingui/macro';
import React from 'react';
import EventsSheet, { type EventsSheetInterface } from '../../EventsSheet';
import RaisedButton from '../../UI/RaisedButton';
import PlaceholderMessage from '../../UI/PlaceholderMessage';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import ExternalPropertiesDialog, {
  type ExternalProperties,
} from './ExternalPropertiesDialog';
import Text from '../../UI/Text';
import { Line } from '../../UI/Grid';
import { sendEventsExtractedAsFunction } from '../../Utils/Analytics/EventSender';
import HelpButton from '../../UI/HelpButton';
import TutorialButton from '../../UI/TutorialButton';
import EditSceneIcon from '../../UI/CustomSvgIcons/EditScene';
import {
  registerOnResourceExternallyChangedCallback,
  unregisterOnResourceExternallyChangedCallback,
} from '../ResourcesWatcher';

const styles = {
  container: {
    display: 'flex',
    flex: 1,
  },
};

const editSceneIconReactNode = <EditSceneIcon />;

type State = {|
  externalPropertiesDialogOpen: boolean,
|};

export class ExternalEventsEditorContainer extends React.Component<
  RenderEditorContainerProps,
  State
> {
  editor: ?EventsSheetInterface;
  resourceExternallyChangedCallbackId: ?string;

  state = {
    externalPropertiesDialogOpen: false,
  };

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // We stop updates when the component is inactive.
    // If it's active, was active or becoming active again we let update propagate.
    // Especially important to note that when becoming inactive, a "last" update is allowed.
    return this.props.isActive || nextProps.isActive;
  }

  componentDidMount() {
    this.resourceExternallyChangedCallbackId = registerOnResourceExternallyChangedCallback(
      this.onResourceExternallyChanged.bind(this)
    );
  }
  componentWillUnmount() {
    unregisterOnResourceExternallyChangedCallback(
      this.resourceExternallyChangedCallbackId
    );
  }

  onResourceExternallyChanged = (resourceInfo: {| identifier: string |}) => {
    if (this.editor) this.editor.onResourceExternallyChanged(resourceInfo);
  };

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

    const layoutName = this.getAssociatedLayoutName();
    if (!layoutName) return null;

    return project.getLayout(layoutName);
  }

  getAssociatedLayoutName(): ?string {
    const { project } = this.props;
    if (!project) return null;

    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return null;

    const layoutName = externalEvents.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      return null;
    }

    return layoutName;
  }

  saveExternalProperties = (externalProps: ExternalProperties) => {
    const externalEvents = this.getExternalEvents();
    if (!externalEvents) return;

    externalEvents.setAssociatedLayout(externalProps.layoutName);
    this.setState(
      {
        externalPropertiesDialogOpen: false,
      },
      () => this.updateToolbar()
    );
  };

  openExternalPropertiesDialog = () => {
    this.setState({
      externalPropertiesDialogOpen: true,
    });
  };

  onBeginCreateEventsFunction = () => {
    sendEventsExtractedAsFunction({
      step: 'begin',
      parentEditor: 'external-events-editor',
    });
  };

  onCreateEventsFunction = (extensionName, eventsFunction) => {
    this.props.onCreateEventsFunction(
      extensionName,
      eventsFunction,
      'external-events-editor'
    );
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
            resourceManagementProps={this.props.resourceManagementProps}
            openInstructionOrExpression={this.props.openInstructionOrExpression}
            onCreateEventsFunction={this.onCreateEventsFunction}
            onBeginCreateEventsFunction={this.onBeginCreateEventsFunction}
            unsavedChanges={this.props.unsavedChanges}
            project={project}
            scope={{
              project,
              layout,
              externalEvents,
            }}
            globalObjectsContainer={project}
            objectsContainer={layout}
            events={externalEvents.getEvents()}
            onOpenSettings={this.openExternalPropertiesDialog}
            settingsIcon={editSceneIconReactNode}
            onOpenExternalEvents={this.props.onOpenExternalEvents}
            isActive={this.props.isActive}
          />
        )}
        {!layout && (
          <PlaceholderMessage>
            <Text>
              <Trans>
                To edit the external events, choose the scene in which it will
                be included
              </Trans>
            </Text>
            <Line justifyContent="center">
              <RaisedButton
                label={<Trans>Choose the scene</Trans>}
                primary
                onClick={this.openExternalPropertiesDialog}
              />
            </Line>
            <Line justifyContent="flex-start" noMargin>
              <TutorialButton
                tutorialId="Intermediate-externals"
                label={<Trans>Watch tutorial</Trans>}
                renderIfNotFound={
                  <HelpButton helpPagePath="/interface/events-editor/external-events" />
                }
              />
            </Line>
          </PlaceholderMessage>
        )}
        <ExternalPropertiesDialog
          title={<Trans>Configure the external events</Trans>}
          helpTexts={[
            <Trans>
              In order to use these external events, you still need to add a
              "Link" event in the events sheet of the corresponding scene
            </Trans>,
          ]}
          open={this.state.externalPropertiesDialogOpen}
          project={project}
          onChoose={this.saveExternalProperties}
          layoutName={this.getAssociatedLayoutName()}
          onClose={() => this.setState({ externalPropertiesDialogOpen: false })}
        />
      </div>
    );
  }
}

export const renderExternalEventsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <ExternalEventsEditorContainer {...props} />;
