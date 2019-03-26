// @flow
import * as React from 'react';
import EventsTree from './EventsTree';
import InstructionEditorDialog from './InstructionEditor/InstructionEditorDialog';
import Toolbar from './Toolbar';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import InlineParameterEditor from './InlineParameterEditor';
import ContextMenu from '../UI/Menu/ContextMenu';
import Clipboard from '../Utils/Clipboard';
import { type PreviewOptions } from '../Export/PreviewLauncher.flow';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  type HistoryState,
  undo,
  redo,
  canUndo,
  canRedo,
  getHistoryInitialState,
  saveToHistory,
} from '../Utils/History';
import {
  type SelectionState,
  type EventContext,
  type InstructionsListContext,
  type InstructionContext,
  type ParameterContext,
  getInitialSelection,
  selectEvent,
  selectInstruction,
  hasSomethingSelected,
  hasEventSelected,
  hasInstructionSelected,
  hasSelectedAtLeastOneCondition,
  hasInstructionsListSelected,
  getSelectedEvents,
  getSelectedInstructions,
  clearSelection,
  getSelectedEventContexts,
  getSelectedInstructionsContexts,
  getSelectedInstructionsListsContexts,
  selectInstructionsList,
} from './SelectionHandler';
import EmptyEventsPlaceholder from './EmptyEventsPlaceholder';
import { ensureSingleOnceInstructions } from './OnceInstructionSanitizer';
import EventsContextAnalyzerDialog from './EventsContextAnalyzerDialog';
import SearchPanel from './SearchPanel';
import {
  type ResourceSource,
  type ChooseResourceFunction,
} from '../ResourcesList/ResourceSource.flow';
import { type ResourceExternalEditor } from '../ResourcesList/ResourceExternalEditor.flow';
import EventsSearcher, {
  type ReplaceInEventsInputs,
  type SearchInEventsInputs,
} from './EventsSearcher';
import { containsSubInstructions } from './ContainsSubInstruction';
import {
  enumerateEventsMetadata,
  type EventMetadata,
} from './EnumerateEventsMetadata';
const gd = global.gd;

const CLIPBOARD_KIND = 'EventsAndInstructions';

type Props = {|
  project: gdProject,
  layout: ?gdLayout,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  events: gdEventsList,
  setToolbar: (?React.Node) => void,
  showPreviewButton: boolean,
  showNetworkPreviewButton: boolean,
  onPreview: (options: PreviewOptions) => void,
  onOpenDebugger: () => void,
  onOpenSettings?: ?() => void,
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  resourceSources: Array<ResourceSource>,
  onChooseResource: ChooseResourceFunction,
  resourceExternalEditors: Array<ResourceExternalEditor>,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
|};
type State = {|
  history: HistoryState,

  editedInstruction: {
    //TODO: This could be adapted to be a InstructionContext
    isCondition: boolean,
    instruction: ?gdInstruction,
    instrsList: ?gdInstructionsList,
    indexInList: number,
  },
  editedParameter: {
    // TODO: This could be adapted to be a ParameterContext
    isCondition: boolean,
    instruction: ?gdInstruction,
    instrsList: ?gdInstructionsList,
    parameterIndex: number,
  },

  selection: SelectionState,

  inlineEditing: boolean,
  inlineEditingAnchorEl: ?any,
  inlineEditingChangesMade: boolean,

  eventsContextAnalyzerOpen: boolean,
  analyzedEventsContextObjectsNames: ?Array<string>,
  analyzedEventsContextObjectOrGroupNames: ?Array<string>,

  showSearchPanel: boolean,
  searchResults: ?Array<gdBaseEvent>,
  searchFocusOffset: ?number,

  allEventsMetadata: Array<EventMetadata>,
|};

const styles = {
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
  },
};

export default class EventsSheet extends React.Component<Props, State> {
  _keyboardShortcuts: KeyboardShortcuts;
  _eventsTree: ?EventsTree;
  _eventSearcher: ?EventsSearcher;
  _searchPanel: ?SearchPanel;
  eventContextMenu: ContextMenu;
  instructionContextMenu: ContextMenu;
  instructionsListContextMenu: ContextMenu;

  constructor(props: Props) {
    super(props);
    this.state = {
      history: getHistoryInitialState(props.events, { historyMaxSize: 50 }),

      editedInstruction: {
        isCondition: true,
        instruction: null,
        instrsList: null,
        indexInList: 0,
      },
      editedParameter: {
        isCondition: true,
        instruction: null,
        instrsList: null,
        parameterIndex: 0,
      },

      selection: getInitialSelection(),

      inlineEditing: false,
      inlineEditingAnchorEl: null,
      inlineEditingChangesMade: false,

      eventsContextAnalyzerOpen: false,
      analyzedEventsContextObjectsNames: null,
      analyzedEventsContextObjectOrGroupNames: null,

      showSearchPanel: false,
      searchResults: null,
      searchFocusOffset: null,

      allEventsMetadata: [],
    };

    this._keyboardShortcuts = new KeyboardShortcuts({
      onDelete: () => {
        if (
          this.state.inlineEditing ||
          this.state.editedInstruction.instruction
        )
          return;

        this.deleteSelection();
      },
      onCopy: this.copySelection,
      onCut: this.cutSelection,
      onPaste: this.pasteEventsOrInstructions,
      onSearch: this._toggleSearchPanel,
      onUndo: this.undo,
      onRedo: this.redo,
    });
  }

  componentDidMount() {
    this.setState({ allEventsMetadata: enumerateEventsMetadata() });
  }

  componentWillUnmount() {
    this._keyboardShortcuts.unmount();
  }

  updateToolbar() {
    if (!this.props.setToolbar) return;

    this.props.setToolbar(
      <Toolbar
        allEventsMetadata={this.state.allEventsMetadata}
        onAddStandardEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Standard')
        }
        onAddSubEvent={this.addSubEvents}
        canAddSubEvent={hasEventSelected(this.state.selection)}
        onAddCommentEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Comment')
        }
        onAddEvent={this.addNewEvent}
        canRemove={hasSomethingSelected(this.state.selection)}
        onRemove={this.deleteSelection}
        showPreviewButton={this.props.showPreviewButton}
        showNetworkPreviewButton={this.props.showNetworkPreviewButton}
        onPreview={() => this.props.onPreview({})}
        onNetworkPreview={() => this.props.onPreview({ networkPreview: true })}
        onOpenDebugger={() => {
          this.props.onOpenDebugger();
          this.props.onPreview({});
        }}
        canUndo={canUndo(this.state.history)}
        canRedo={canRedo(this.state.history)}
        undo={this.undo}
        redo={this.redo}
        onOpenSettings={this.props.onOpenSettings}
        onToggleSearchPanel={this._toggleSearchPanel}
      />
    );
  }

  _toggleSearchPanel = () => {
    this.setState(
      state => {
        const show = !state.showSearchPanel;
        if (!show) {
          if (this._eventSearcher) this._eventSearcher.reset();
        }

        return {
          showSearchPanel: show,
        };
      },
      () => {
        if (this.state.showSearchPanel && this._searchPanel) {
          this._searchPanel.focus();
        }
      }
    );
  };

  addSubEvents = () => {
    const { project } = this.props;

    getSelectedEvents(this.state.selection).forEach(event => {
      if (event.canHaveSubEvents()) {
        event
          .getSubEvents()
          .insertNewEvent(
            project,
            'BuiltinCommonInstructions::Standard',
            event.getSubEvents().getEventsCount()
          );
      }
    });

    this._saveChangesToHistory(() => {
      if (this._eventsTree) this._eventsTree.forceEventsUpdate();
    });
  };

  _selectionCanHaveSubEvents = () => {
    return getSelectedEvents(this.state.selection).some(event => {
      return event.canHaveSubEvents();
    });
  };

  _selectionCanToggleDisabled = () => {
    return getSelectedEvents(this.state.selection).some(event => {
      return event.isExecutable();
    });
  };

  addNewEvent = (type: string, context: ?EventContext) => {
    const { project } = this.props;
    const hasEventsSelected = hasEventSelected(this.state.selection);

    let insertions: Array<{
      eventsList: gdEventsList,
      indexInList: number,
    }> = [];
    if (context) {
      insertions = [context];
    } else if (hasEventsSelected) {
      insertions = getSelectedEventContexts(this.state.selection).map(
        selectedEvent => ({
          eventsList: selectedEvent.eventsList,
          indexInList: selectedEvent.indexInList,
        })
      );
    } else {
      insertions = [
        {
          eventsList: this.props.events,
          indexInList: this.props.events.getEventsCount(),
        },
      ];
    }

    const newEvents = insertions.map(
      (context: { eventsList: gdEventsList, indexInList: number }) => {
        return context.eventsList.insertNewEvent(
          project,
          type,
          context.indexInList + 1
        );
      }
    );

    this._saveChangesToHistory(() => {
      const eventsTree = this._eventsTree;
      if (!eventsTree) return;

      eventsTree.forceEventsUpdate(() => {
        if (!context && !hasEventsSelected) {
          eventsTree.scrollToEvent(newEvents[0]);
        }
      });
    });
  };

  openInstructionEditor = (instructionContext: InstructionContext) => {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState({
      editedInstruction: {
        instrsList: instructionContext.instrsList,
        isCondition: instructionContext.isCondition,
        instruction: instructionContext.instruction
          ? instructionContext.instruction.clone()
          : new gd.Instruction(),
        indexInList: instructionContext.indexInList,
      },
    });
  };

  closeInstructionEditor(saveChanges: boolean = false) {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState(
      {
        editedInstruction: {
          isCondition: true,
          instruction: null,
          instrsList: null,
          indexInList: 0,
        },
      },
      () => {
        if (saveChanges) {
          this._saveChangesToHistory();
        }
      }
    );
  }

  moveSelectionToInstruction = (destinationContext: InstructionContext) => {
    this.moveSelectionToInstructionsList(
      {
        instrsList: destinationContext.instrsList,
        isCondition: destinationContext.isCondition,
      },
      destinationContext.indexInList
    );
  };

  moveSelectionToInstructionsList = (
    destinationContext: InstructionsListContext,
    indexInList: ?number = undefined
  ) => {
    const selectedInstructions = getSelectedInstructions(this.state.selection);
    const destinationIndex =
      indexInList === undefined
        ? destinationContext.instrsList.size()
        : indexInList;

    const isTryingToDragAnInstructionIntoItsOwnNestedInstructions = !!selectedInstructions.filter(
      instruction =>
        containsSubInstructions(instruction, destinationContext.instrsList)
    ).length;

    if (isTryingToDragAnInstructionIntoItsOwnNestedInstructions) return;

    selectedInstructions.forEach(instruction =>
      destinationContext.instrsList.insert(instruction, destinationIndex)
    );

    if (!this._keyboardShortcuts.shouldCloneInstances()) {
      this.deleteSelection(/*deleteOnlyInstructions=*/ true);
    } else {
      this._saveChangesToHistory();
    }
  };

  selectEvent = (eventContext: EventContext) => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectEvent(this.state.selection, eventContext, multiSelect),
      },
      () => this.updateToolbar()
    );
  };

  openEventContextMenu = (x: number, y: number, eventContext: EventContext) => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectEvent(this.state.selection, eventContext, multiSelect),
      },
      () => {
        this.updateToolbar();
        this.eventContextMenu.open(x, y);
      }
    );
  };

  openInstructionContextMenu = (
    x: number,
    y: number,
    instructionContext: InstructionContext
  ) => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectInstruction(
          this.state.selection,
          instructionContext,
          multiSelect
        ),
      },
      () => {
        this.updateToolbar();
        this.instructionContextMenu.open(x, y);
      }
    );
  };

  openInstructionsListContextMenu = (
    x: number,
    y: number,
    instructionsListContext: InstructionsListContext
  ) => {
    this.setState(
      {
        selection: selectInstructionsList(
          this.state.selection,
          instructionsListContext,
          false
        ),
      },
      () => {
        this.updateToolbar();
        this.instructionsListContextMenu.open(x, y);
      }
    );
  };

  selectInstruction = (instructionContext: InstructionContext) => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectInstruction(
          this.state.selection,
          instructionContext,
          multiSelect
        ),
      },
      () => this.updateToolbar()
    );
  };

  openParameterEditor = (parameterContext: ParameterContext) => {
    // $FlowFixMe
    this.setState({
      editedParameter: parameterContext,
      inlineEditing: true,
      inlineEditingAnchorEl: parameterContext.domEvent
        ? parameterContext.domEvent.currentTarget
        : null,
      inlineEditingChangesMade: false,
    });
  };

  closeParameterEditor = () => {
    if (this.state.inlineEditingChangesMade) {
      this._saveChangesToHistory();
    }

    this.setState({
      inlineEditing: false,
      inlineEditingAnchorEl: null,
      inlineEditingChangesMade: false,
    });
  };

  toggleDisabled = () => {
    getSelectedEvents(this.state.selection).forEach(event =>
      event.setDisabled(!event.isDisabled())
    );
    this._saveChangesToHistory(() => {
      if (this._eventsTree) this._eventsTree.forceEventsUpdate();
    });
  };

  deleteSelection = (deleteOnlyInstructions: boolean = false) => {
    const { events } = this.props;
    const eventsRemover = new gd.EventsRemover();
    if (!deleteOnlyInstructions) {
      getSelectedEvents(this.state.selection).forEach(event =>
        eventsRemover.addEventToRemove(event)
      );
    }
    getSelectedInstructions(this.state.selection).forEach(instruction =>
      eventsRemover.addInstructionToRemove(instruction)
    );

    eventsRemover.launch(events);

    // /!\ Events were changed, so any reference to an existing event can now
    // be invalid. Make sure to immediately trigger a forced update before
    // any re-render that could use a deleted/invalid event.
    if (this._eventsTree) this._eventsTree.forceEventsUpdate();

    this.setState(
      {
        selection: clearSelection(),
        inlineEditing: false,
        inlineEditingAnchorEl: null,
      },
      () => this._saveChangesToHistory()
    );
  };

  copySelection = () => {
    const eventsList = new gd.EventsList();
    const instructionsList = new gd.InstructionsList();

    getSelectedEvents(this.state.selection).forEach(event =>
      eventsList.insertEvent(event, eventsList.getEventsCount())
    );
    getSelectedInstructions(this.state.selection).forEach(instruction =>
      instructionsList.insert(instruction, instructionsList.size())
    );

    Clipboard.set(CLIPBOARD_KIND, {
      eventsList: serializeToJSObject(eventsList),
      instructionsList: serializeToJSObject(instructionsList),
    });

    eventsList.delete();
    instructionsList.delete();
  };

  cutSelection = () => {
    this.copySelection();
    this.deleteSelection();
  };

  pasteEvents = () => {
    if (
      !hasEventSelected(this.state.selection) ||
      !Clipboard.has(CLIPBOARD_KIND)
    )
      return;

    const eventsList = new gd.EventsList();
    unserializeFromJSObject(
      eventsList,
      Clipboard.get(CLIPBOARD_KIND).eventsList,
      'unserializeFrom',
      this.props.project
    );
    getSelectedEventContexts(this.state.selection).forEach(eventContext => {
      eventContext.eventsList.insertEvents(
        eventsList,
        0,
        eventsList.getEventsCount(),
        eventContext.indexInList
      );
    });
    eventsList.delete();

    this._saveChangesToHistory(() => {
      if (this._eventsTree) this._eventsTree.forceEventsUpdate();
    });
  };

  pasteInstructions = () => {
    if (
      (!hasInstructionSelected(this.state.selection) &&
        !hasInstructionsListSelected(this.state.selection)) ||
      !Clipboard.has(CLIPBOARD_KIND)
    )
      return;

    const instructionsList = new gd.InstructionsList();
    unserializeFromJSObject(
      instructionsList,
      Clipboard.get(CLIPBOARD_KIND).instructionsList,
      'unserializeFrom',
      this.props.project
    );
    getSelectedInstructionsContexts(this.state.selection).forEach(
      instructionContext => {
        instructionContext.instrsList.insertInstructions(
          instructionsList,
          0,
          instructionsList.size(),
          instructionContext.indexInList
        );
      }
    );
    getSelectedInstructionsListsContexts(this.state.selection).forEach(
      instructionsListContext => {
        instructionsListContext.instrsList.insertInstructions(
          instructionsList,
          0,
          instructionsList.size(),
          instructionsListContext.instrsList.size()
        );
      }
    );
    instructionsList.delete();

    this._saveChangesToHistory(() => {
      if (this._eventsTree) this._eventsTree.forceEventsUpdate();
    });
  };

  pasteEventsOrInstructions = () => {
    if (hasEventSelected(this.state.selection)) this.pasteEvents();
    else if (hasInstructionSelected(this.state.selection))
      this.pasteInstructions();
    else if (hasInstructionsListSelected(this.state.selection))
      this.pasteInstructions();
  };

  _invertSelectedConditions = () => {
    getSelectedInstructionsContexts(this.state.selection).forEach(
      instructionContext => {
        if (instructionContext.isCondition) {
          instructionContext.instruction.setInverted(
            !instructionContext.instruction.isInverted()
          );
        }
      }
    );

    this._saveChangesToHistory(() => {
      if (this._eventsTree) this._eventsTree.forceEventsUpdate();
    });
  };

  _saveChangesToHistory = (cb: ?Function) => {
    this.setState(
      {
        history: saveToHistory(this.state.history, this.props.events),
      },
      () => {
        this.updateToolbar();
        if (cb) cb();
      }
    );
  };

  undo = () => {
    if (!canUndo(this.state.history)) return;

    const { events, project } = this.props;
    const newHistory = undo(this.state.history, events, project);

    // /!\ Events were changed, so any reference to an existing event can now
    // be invalid. Make sure to immediately trigger a forced update before
    // any re-render that could use a deleted/invalid event.
    if (this._eventsTree) this._eventsTree.forceEventsUpdate();

    this.setState({ history: newHistory }, () => this.updateToolbar());
  };

  redo = () => {
    if (!canRedo(this.state.history)) return;

    const { events, project } = this.props;
    const newHistory = redo(this.state.history, events, project);

    // /!\ Events were changed, so any reference to an existing event can now
    // be invalid. Make sure to immediately trigger a forced update before
    // any re-render that could use a deleted/invalid event.
    if (this._eventsTree) this._eventsTree.forceEventsUpdate();

    this.setState({ history: newHistory }, () => this.updateToolbar());
  };

  _openEventsContextAnalyzer = () => {
    const { globalObjectsContainer, objectsContainer } = this.props;
    const eventsContextAnalyzer = new gd.EventsContextAnalyzer(
      gd.JsPlatform.get(),
      globalObjectsContainer,
      objectsContainer
    );

    const eventsList = new gd.EventsList();
    getSelectedEvents(this.state.selection).forEach(event =>
      eventsList.insertEvent(event, eventsList.getEventsCount())
    );

    eventsContextAnalyzer.launch(eventsList);
    eventsList.delete();

    const eventsContext = eventsContextAnalyzer.getEventsContext();
    this.setState({
      eventsContextAnalyzerOpen: true,
      analyzedEventsContextObjectsNames: eventsContext
        .getObjectNames()
        .toNewVectorString()
        .toJSArray(),
      analyzedEventsContextObjectOrGroupNames: eventsContext
        .getObjectOrGroupNames()
        .toNewVectorString()
        .toJSArray(),
    });
  };

  _closeEventsContextAnalyzer = () => {
    this.setState({
      eventsContextAnalyzerOpen: false,
    });
  };

  _ensureEventUnfolded = (cb: () => ?gdBaseEvent) => {
    const event = cb();
    if (event && this._eventsTree) {
      this._eventsTree.unfoldForEvent(event);
    }
  };

  _replaceInEvents = (
    doReplaceInEvents: (inputs: ReplaceInEventsInputs) => void,
    inputs: ReplaceInEventsInputs
  ) => {
    doReplaceInEvents(inputs);
    this._saveChangesToHistory(() => {
      if (this._eventsTree) this._eventsTree.forceEventsUpdate();
    });
  };

  _searchInEvents = (
    doSearchInEvents: (inputs: SearchInEventsInputs, cb: () => void) => void,
    inputs: SearchInEventsInputs
  ) => {
    doSearchInEvents(inputs, () => {
      this.forceUpdate(() => {
        if (this._eventsTree) this._eventsTree.forceEventsUpdate();
      });
    });
  };

  _onEventMoved = () => {
    // Move of the event in the list is handled by EventsTree.
    // This could be refactored and put here if the drag'n'drop of events
    // is reworked at some point.
    this._saveChangesToHistory();
  };

  render() {
    const {
      project,
      layout,
      events,
      onOpenExternalEvents,
      onOpenLayout,
      globalObjectsContainer,
      objectsContainer,
    } = this.props;
    if (!project) return null;

    return (
      <EventsSearcher
        key={events.ptr}
        ref={eventSearcher => (this._eventSearcher = eventSearcher)}
        events={events}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
        selection={this.state.selection}
      >
        {({
          eventsSearchResultEvents,
          searchFocusOffset,
          searchInEvents,
          replaceInEvents,
          goToPreviousSearchResult,
          goToNextSearchResult,
        }) => (
          <div
            className="gd-events-sheet"
            style={styles.container}
            onFocus={() => this._keyboardShortcuts.focus()}
            onBlur={() => this._keyboardShortcuts.blur()}
            tabIndex={1}
          >
            <EventsTree
              ref={eventsTree => (this._eventsTree = eventsTree)}
              key={events.ptr}
              events={events}
              project={project}
              layout={layout}
              globalObjectsContainer={globalObjectsContainer}
              objectsContainer={objectsContainer}
              selection={this.state.selection}
              onInstructionClick={this.selectInstruction}
              onInstructionDoubleClick={this.openInstructionEditor}
              onInstructionContextMenu={this.openInstructionContextMenu}
              onInstructionsListContextMenu={
                this.openInstructionsListContextMenu
              }
              onAddNewInstruction={this.openInstructionEditor}
              onMoveToInstruction={this.moveSelectionToInstruction}
              onMoveToInstructionsList={this.moveSelectionToInstructionsList}
              onParameterClick={this.openParameterEditor}
              onEventClick={this.selectEvent}
              onEventContextMenu={this.openEventContextMenu}
              onAddNewEvent={context =>
                this.addNewEvent('BuiltinCommonInstructions::Standard', context)
              }
              onOpenExternalEvents={onOpenExternalEvents}
              onOpenLayout={onOpenLayout}
              searchResults={eventsSearchResultEvents}
              searchFocusOffset={searchFocusOffset}
              onEventMoved={this._onEventMoved}
            />
            {this.state.showSearchPanel && (
              <SearchPanel
                ref={searchPanel => (this._searchPanel = searchPanel)}
                onSearchInEvents={inputs =>
                  this._searchInEvents(searchInEvents, inputs)
                }
                onReplaceInEvents={inputs =>
                  this._replaceInEvents(replaceInEvents, inputs)
                }
                resultsCount={
                  eventsSearchResultEvents
                    ? eventsSearchResultEvents.length
                    : null
                }
                hasEventSelected={hasEventSelected(this.state.selection)}
                onGoToPreviousSearchResult={() =>
                  this._ensureEventUnfolded(goToPreviousSearchResult)
                }
                onGoToNextSearchResult={() =>
                  this._ensureEventUnfolded(goToNextSearchResult)
                }
              />
            )}
            {events && events.getEventsCount() === 0 && (
              <EmptyEventsPlaceholder />
            )}
            <InlineParameterEditor
              open={this.state.inlineEditing}
              anchorEl={this.state.inlineEditingAnchorEl}
              onRequestClose={this.closeParameterEditor}
              project={project}
              layout={layout}
              globalObjectsContainer={globalObjectsContainer}
              objectsContainer={objectsContainer}
              isCondition={this.state.editedParameter.isCondition}
              instruction={this.state.editedParameter.instruction}
              parameterIndex={this.state.editedParameter.parameterIndex}
              onChange={value => {
                const {
                  instruction,
                  parameterIndex,
                } = this.state.editedParameter;
                if (!instruction) return;
                instruction.setParameter(parameterIndex, value);
                this.setState({
                  inlineEditingChangesMade: true,
                });
              }}
              resourceSources={this.props.resourceSources}
              onChooseResource={this.props.onChooseResource}
              resourceExternalEditors={this.props.resourceExternalEditors}
            />
            <ContextMenu
              ref={eventContextMenu =>
                (this.eventContextMenu = eventContextMenu)
              }
              buildMenuTemplate={() => [
                {
                  label: 'Copy',
                  click: () => this.copySelection(),
                  accelerator: 'CmdOrCtrl+C',
                },
                {
                  label: 'Cut',
                  click: () => this.cutSelection(),
                  accelerator: 'CmdOrCtrl+X',
                },
                {
                  label: 'Paste',
                  click: () => this.pasteEvents(),
                  enabled: Clipboard.has(CLIPBOARD_KIND),
                  accelerator: 'CmdOrCtrl+V',
                },
                {
                  label: 'Delete',
                  click: () => this.deleteSelection(),
                  accelerator: 'Delete',
                },
                {
                  label: 'Toggle disabled',
                  click: () => this.toggleDisabled(),
                  enabled: this._selectionCanToggleDisabled(),
                },
                { type: 'separator' },
                {
                  label: 'Add New Event Below',
                  click: () =>
                    this.addNewEvent('BuiltinCommonInstructions::Standard'),
                },
                {
                  label: 'Add Sub Event',
                  click: () => this.addSubEvents(),
                  enabled: this._selectionCanHaveSubEvents(),
                },
                {
                  label: 'Add Other',
                  submenu: this.state.allEventsMetadata.map(metadata => {
                    return {
                      label: metadata.fullName,
                      click: () => this.addNewEvent(metadata.type),
                    };
                  }),
                },
                { type: 'separator' },
                {
                  label: 'Undo',
                  click: this.undo,
                  enabled: canUndo(this.state.history),
                  accelerator: 'CmdOrCtrl+Z',
                },
                {
                  label: 'Redo',
                  click: this.redo,
                  enabled: canRedo(this.state.history),
                  accelerator: 'CmdOrCtrl+Shift+Z',
                },
                { type: 'separator' },
                {
                  label: 'Analyze objects used in this event',
                  click: this._openEventsContextAnalyzer,
                },
              ]}
            />
            <ContextMenu
              ref={instructionContextMenu =>
                (this.instructionContextMenu = instructionContextMenu)
              }
              buildMenuTemplate={() => [
                {
                  label: 'Copy',
                  click: () => this.copySelection(),
                  accelerator: 'CmdOrCtrl+C',
                },
                {
                  label: 'Cut',
                  click: () => this.cutSelection(),
                  accelerator: 'CmdOrCtrl+X',
                },
                {
                  label: 'Paste',
                  click: () => this.pasteInstructions(),
                  enabled: Clipboard.has(CLIPBOARD_KIND),
                  accelerator: 'CmdOrCtrl+V',
                },
                { type: 'separator' },
                {
                  label: 'Delete',
                  click: () => this.deleteSelection(),
                  accelerator: 'Delete',
                },
                { type: 'separator' },
                {
                  label: 'Undo',
                  click: this.undo,
                  enabled: canUndo(this.state.history),
                  accelerator: 'CmdOrCtrl+Z',
                },
                {
                  label: 'Redo',
                  click: this.redo,
                  enabled: canRedo(this.state.history),
                  accelerator: 'CmdOrCtrl+Shift+Z',
                },
                {
                  label: 'Invert Condition',
                  click: () => this._invertSelectedConditions(),
                  visible: hasSelectedAtLeastOneCondition(this.state.selection),
                },
              ]}
            />
            <ContextMenu
              ref={instructionsListContextMenu =>
                (this.instructionsListContextMenu = instructionsListContextMenu)
              }
              buildMenuTemplate={() => [
                {
                  label: 'Paste',
                  click: () => this.pasteInstructions(),
                  enabled: Clipboard.has(CLIPBOARD_KIND),
                  accelerator: 'CmdOrCtrl+V',
                },
                { type: 'separator' },
                {
                  label: 'Undo',
                  click: this.undo,
                  enabled: canUndo(this.state.history),
                  accelerator: 'CmdOrCtrl+Z',
                },
                {
                  label: 'Redo',
                  click: this.redo,
                  enabled: canRedo(this.state.history),
                  accelerator: 'CmdOrCtrl+Shift+Z',
                },
              ]}
            />
            {this.state.editedInstruction.instruction && (
              <InstructionEditorDialog
                project={project}
                layout={layout}
                globalObjectsContainer={globalObjectsContainer}
                objectsContainer={objectsContainer}
                instruction={this.state.editedInstruction.instruction}
                isCondition={this.state.editedInstruction.isCondition}
                isNewInstruction={
                  this.state.editedInstruction.indexInList === undefined
                }
                open={true}
                onCancel={() => this.closeInstructionEditor()}
                onSubmit={() => {
                  const {
                    instrsList,
                    instruction,
                    indexInList,
                  } = this.state.editedInstruction;
                  if (!instrsList) return;

                  if (indexInList !== undefined) {
                    // Replace an existing instruction
                    instrsList.set(indexInList, instruction);
                  } else {
                    // Add a new instruction
                    instrsList.insert(instruction, instrsList.size());
                  }

                  this.closeInstructionEditor(true);
                  ensureSingleOnceInstructions(instrsList);
                  if (this._eventsTree) this._eventsTree.forceEventsUpdate();
                }}
                resourceSources={this.props.resourceSources}
                onChooseResource={this.props.onChooseResource}
                resourceExternalEditors={this.props.resourceExternalEditors}
                openInstructionOrExpression={(extension, type) => {
                  this.closeInstructionEditor();
                  this.props.openInstructionOrExpression(extension, type);
                }}
              />
            )}
            {this.state.eventsContextAnalyzerOpen &&
              this.state.analyzedEventsContextObjectsNames &&
              this.state.analyzedEventsContextObjectOrGroupNames && (
                <EventsContextAnalyzerDialog
                  open={this.state.eventsContextAnalyzerOpen}
                  onClose={this._closeEventsContextAnalyzer}
                  objectsNames={this.state.analyzedEventsContextObjectsNames}
                  objectOrGroupNames={
                    this.state.analyzedEventsContextObjectOrGroupNames
                  }
                />
              )}
          </div>
        )}
      </EventsSearcher>
    );
  }
}
