// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import EventsSheet from '../EventsSheet';
import EditorMosaic, { MosaicWindow } from '../UI/EditorMosaic';
import EmptyMessage from '../UI/EmptyMessage';
import EventsFunctionConfigurationEditor from './EventsFunctionConfigurationEditor';
import EventsFunctionsList from '../EventsFunctionsList';
import EventsBasedBehaviorsList from '../EventsBasedBehaviorsList';
import Background from '../UI/Background';
import OptionsEditorDialog from './OptionsEditorDialog';
import { showWarningBox } from '../UI/Messages/MessageBox';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
const gd = global.gd;

type Props = {|
  project: gdProject,
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  setToolbar: (?React.Node) => void,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => void,
  initiallyFocusedFunctionName: ?string,
|};

type State = {|
  selectedEventsFunction: ?gdEventsFunction,
  selectedEventsBasedBehavior: ?gdEventsBasedBehavior,
  editOptionsDialogOpen: boolean,
|};

export default class EventsFunctionsExtensionEditor extends React.Component<
  Props,
  State
> {
  state = {
    selectedEventsFunction: null,
    selectedEventsBasedBehavior: null,
    editOptionsDialogOpen: false,
  };
  editor: ?EventsSheet;
  _editors: ?EditorMosaic;
  _globalObjectsContainer: ?gdObjectsContainer;
  _objectsContainer: ?gdObjectsContainer;

  componentDidMount() {
    // TODO: Adapt for events based behaviors
    if (this.props.initiallyFocusedFunctionName) {
      this.selectEventsFunctionByName(this.props.initiallyFocusedFunctionName);
    }
  }

  componentWillUnmount() {
    if (this._globalObjectsContainer) this._globalObjectsContainer.delete();
    if (this._objectsContainer) this._objectsContainer.delete();
  }

  _loadEventsFunctionFrom = (
    project: gdProject,
    eventsFunction: gdEventsFunction
  ) => {
    // Create an empty "context" of objects.
    // Avoid recreating containers if they were already created, so that
    // we keep the same objects in memory and avoid remounting components
    // (like ObjectGroupsList) because objects "ptr" changed.
    if (!this._globalObjectsContainer) {
      this._globalObjectsContainer = new gd.ObjectsContainer();
    }

    if (!this._objectsContainer) {
      this._objectsContainer = new gd.ObjectsContainer();
    }

    // Initialize this "context" of objects with the function
    // (as done during code generation).
    gd.EventsFunctionTools.eventsFunctionToObjectsContainer(
      project,
      eventsFunction,
      this._objectsContainer
    );
  };

  updateToolbar() {
    if (this.editor) {
      this.editor.updateToolbar();
    } else {
      this.props.setToolbar(<div />);
    }
  }

  selectEventsFunctionByName = (name: string) => {
    // TODO: Adapt for events based behaviors
    const { eventsFunctionsExtension } = this.props;
    if (eventsFunctionsExtension.hasEventsFunctionNamed(name)) {
      this._selectEventsFunction(
        eventsFunctionsExtension.getEventsFunction(name),
        null
      );
    }
  };

  _selectEventsFunction = (
    selectedEventsFunction: ?gdEventsFunction,
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior
  ) => {
    if (!selectedEventsFunction) {
      this.setState(
        {
          selectedEventsFunction: null,
          selectedEventsBasedBehavior: null,
        },
        () => this.updateToolbar()
      );
      return;
    }

    this._loadEventsFunctionFrom(this.props.project, selectedEventsFunction);
    this.setState(
      {
        selectedEventsFunction,
        selectedEventsBasedBehavior,
      },
      () => this.updateToolbar()
    );
  };

  _makeRenameEventsFunction = (i18n: I18nType) => (
    eventsFunction: gdEventsFunction,
    newName: string,
    done: boolean => void
  ) => {
    if (!gd.Project.validateObjectName(newName)) {
      showWarningBox(
        i18n._(
          t`This name contains forbidden characters: please only use alphanumeric characters (0-9, a-z) and underscores in your function name.`
        )
      );
      return;
    }

    const { project, eventsFunctionsExtension } = this.props;
    gd.WholeProjectRefactorer.renameEventsFunction(
      project,
      eventsFunctionsExtension,
      eventsFunction.getName(),
      newName
    );

    done(true);
  };

  _onDeleteEventsFunction = (
    eventsFunction: gdEventsFunction,
    cb: boolean => void
  ) => {
    if (
      this.state.selectedEventsFunction &&
      gd.compare(eventsFunction, this.state.selectedEventsFunction)
    ) {
      this._selectEventsFunction(null, null);
    }

    cb(true);
  };

  _selectEventsBasedBehavior = (
    selectedEventsBasedBehavior: ?gdEventsBasedBehavior
  ) => {
    this.setState(
      {
        selectedEventsBasedBehavior,
        selectedEventsFunction: null,
      },
      () => {
        this.updateToolbar();
        if (selectedEventsBasedBehavior) {
          if (this._editors)
            this._editors.openEditor('behavior-functions-list');
        }
      }
    );
  };

  _makeRenameEventsBasedBehavior = (i18n: I18nType) => (
    eventsBasedBehavior: gdEventsBasedBehavior,
    newName: string,
    done: boolean => void
  ) => {
    if (!gd.Project.validateObjectName(newName)) {
      showWarningBox(
        i18n._(
          t`This name contains forbidden characters: please only use alphanumeric characters (0-9, a-z) and underscores in your function name.`
        )
      );
      return;
    }

    done(true);
  };

  _onDeleteEventsBasedBehavior = (
    eventsBasedBehavior: gdEventsBasedBehavior,
    cb: boolean => void
  ) => {
    if (
      this.state.selectedEventsBasedBehavior &&
      gd.compare(eventsBasedBehavior, this.state.selectedEventsBasedBehavior)
    ) {
      this._selectEventsBasedBehavior(null);
    }

    cb(true);
  };

  _editOptions = (open: boolean = true) => {
    this.setState({
      editOptionsDialogOpen: open,
    });
  };

  render() {
    const { project, eventsFunctionsExtension } = this.props;
    const {
      selectedEventsFunction,
      selectedEventsBasedBehavior,
      editOptionsDialogOpen,
    } = this.state;

    return (
      <I18n>
        {({ i18n }) => (
          <React.Fragment>
            <EditorMosaic
              ref={editors => (this._editors = editors)}
              editors={{
                parameters: (
                  <MosaicWindow
                    title={<Trans>Function Configuration</Trans>}
                    toolbarControls={[]}
                    // /!\ Force re-rendering if selectedEventsFunction, globalObjectsContainer
                    // or objectsContainer change,
                    // otherwise we risk using deleted objects (because of the shouldComponentUpdate
                    // optimization in MosaicWindow).
                    selectedEventsFunction={selectedEventsFunction}
                    globalObjectsContainer={this._globalObjectsContainer}
                    objectsContainer={this._objectsContainer}
                  >
                    <Background>
                      {selectedEventsFunction &&
                      this._globalObjectsContainer &&
                      this._objectsContainer ? (
                        <EventsFunctionConfigurationEditor
                          project={project}
                          eventsFunction={selectedEventsFunction}
                          globalObjectsContainer={this._globalObjectsContainer}
                          objectsContainer={this._objectsContainer}
                          helpPagePath="/events/functions"
                          onParametersOrGroupsUpdated={() => {
                            this._loadEventsFunctionFrom(
                              project,
                              selectedEventsFunction
                            );
                            this.forceUpdate();
                          }}
                        />
                      ) : (
                        <EmptyMessage>
                          <Trans>
                            Choose a function, or a function of a behavior, to
                            set the parameters that it accepts.
                          </Trans>
                        </EmptyMessage>
                      )}
                    </Background>
                  </MosaicWindow>
                ),
                'events-sheet':
                  selectedEventsFunction &&
                  this._globalObjectsContainer &&
                  this._objectsContainer ? (
                    <EventsSheet
                      key={selectedEventsFunction.ptr}
                      ref={editor => (this.editor = editor)}
                      project={project}
                      layout={null}
                      globalObjectsContainer={this._globalObjectsContainer}
                      objectsContainer={this._objectsContainer}
                      events={selectedEventsFunction.getEvents()}
                      showPreviewButton={false}
                      onPreview={options => {}}
                      showNetworkPreviewButton={false}
                      onOpenExternalEvents={() => {}}
                      onOpenLayout={() => {}}
                      resourceSources={this.props.resourceSources}
                      onChooseResource={this.props.onChooseResource}
                      resourceExternalEditors={
                        this.props.resourceExternalEditors
                      }
                      openInstructionOrExpression={
                        this.props.openInstructionOrExpression
                      }
                      setToolbar={this.props.setToolbar}
                      onOpenDebugger={() => {}}
                      onCreateEventsFunction={this.props.onCreateEventsFunction}
                      onOpenSettings={this._editOptions} //TODO: Move this extra toolbar outside of EventsSheet toolbar
                    />
                  ) : (
                    <Background>
                      <EmptyMessage>
                        <Trans>
                          Choose a function, or a function of a behavior, to
                          edit its events.
                        </Trans>
                      </EmptyMessage>
                    </Background>
                  ),
                'free-functions-list': (
                  <MosaicWindow
                    title={<Trans>Functions</Trans>}
                    toolbarControls={[]}
                    selectedEventsFunction={selectedEventsFunction}
                  >
                    <EventsFunctionsList
                      project={project}
                      eventsFunctionsContainer={eventsFunctionsExtension}
                      selectedEventsFunction={selectedEventsFunction}
                      onSelectEventsFunction={selectedEventsFunction =>
                        this._selectEventsFunction(selectedEventsFunction, null)
                      }
                      onDeleteEventsFunction={this._onDeleteEventsFunction}
                      onRenameEventsFunction={this._makeRenameEventsFunction(
                        i18n
                      )}
                      onEditOptions={this._editOptions}
                    />
                  </MosaicWindow>
                ),
                'behavior-functions-list': selectedEventsBasedBehavior ? (
                  <MosaicWindow
                    title={<Trans>Behavior functions</Trans>}
                    toolbarControls={[]}
                    selectedEventsBasedBehavior={selectedEventsBasedBehavior}
                    selectedEventsFunction={selectedEventsFunction}
                  >
                    <EventsFunctionsList
                      project={project}
                      eventsFunctionsContainer={selectedEventsBasedBehavior.getEventsFunctions()}
                      selectedEventsFunction={selectedEventsFunction}
                      onSelectEventsFunction={selectedEventsFunction =>
                        this._selectEventsFunction(
                          selectedEventsFunction,
                          selectedEventsBasedBehavior
                        )
                      }
                      onDeleteEventsFunction={this._onDeleteEventsFunction}
                      onRenameEventsFunction={this._makeRenameEventsFunction(
                        i18n
                      )}
                      onEditOptions={this._editOptions}
                    />
                  </MosaicWindow>
                ) : (
                  <Background>
                    <EmptyMessage>
                      <Trans>
                        Select a behavior to display the functions inside this
                        behavior.
                      </Trans>
                    </EmptyMessage>
                  </Background>
                ),

                'behaviors-list': (
                  <MosaicWindow
                    title={<Trans>Behaviors</Trans>}
                    toolbarControls={[]}
                    selectedEventsBasedBehavior={selectedEventsBasedBehavior}
                  >
                    <EventsBasedBehaviorsList
                      project={project}
                      eventsBasedBehaviorsList={eventsFunctionsExtension.getEventsBasedBehaviors()}
                      selectedEventsBasedBehavior={selectedEventsBasedBehavior}
                      onSelectEventsBasedBehavior={
                        this._selectEventsBasedBehavior
                      }
                      onDeleteEventsBasedBehavior={
                        this._onDeleteEventsBasedBehavior
                      }
                      onRenameEventsBasedBehavior={this._makeRenameEventsBasedBehavior(
                        i18n
                      )}
                    />
                  </MosaicWindow>
                ),
              }}
              initialNodes={{
                direction: 'row',
                first: {
                  direction: 'column',
                  first: 'free-functions-list',
                  second: 'behaviors-list',
                  splitPercentage: 50,
                },
                second: {
                  direction: 'column',
                  first: 'parameters',
                  second: 'events-sheet',
                  splitPercentage: 25,
                },
                splitPercentage: 25,
              }}
            />
            {editOptionsDialogOpen && (
              <OptionsEditorDialog
                eventsFunctionsExtension={eventsFunctionsExtension}
                open
                onClose={() => this._editOptions(false)}
              />
            )}
          </React.Fragment>
        )}
      </I18n>
    );
  }
}
