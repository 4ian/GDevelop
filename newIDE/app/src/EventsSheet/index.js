// @flow
import { Trans } from '@lingui/macro';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';

import * as React from 'react';
import EventsTree from './EventsTree';
import { getInstructionMetadata } from './InstructionEditor/InstructionEditor';
import InstructionEditorDialog from './InstructionEditor/InstructionEditorDialog';
import InstructionEditorMenu from './InstructionEditor/InstructionEditorMenu';
import EventTextDialog, {
  filterEditableWithEventTextDialog,
} from './InstructionEditor/EventTextDialog';
import Toolbar from './Toolbar';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { getShortcutDisplayName } from '../KeyboardShortcuts';
import InlineParameterEditor from './InlineParameterEditor';
import ContextMenu, { type ContextMenuInterface } from '../UI/Menu/ContextMenu';
import { serializeToJSObject } from '../Utils/Serializer';
import {
  type HistoryState,
  type RevertableActionType,
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
  type InstructionContextWithLocatingEvent,
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
  getSelectedInstructionsLocatingEvents,
  selectEventsAfterHistoryChange,
} from './SelectionHandler';
import { ensureSingleOnceInstructions } from './OnceInstructionSanitizer';
import EventsContextAnalyzerDialog, {
  type EventsContextResult,
  toEventsContextResult,
} from './EventsContextAnalyzerDialog';
import SearchPanel, { type SearchPanelInterface } from './SearchPanel';
import { type ResourceManagementProps } from '../ResourcesList/ResourceSource';
import EventsSearcher, {
  type ReplaceInEventsInputs,
  type SearchInEventsInputs,
} from './EventsSearcher';
import { containsSubInstructions } from './ContainsSubInstruction';
import {
  enumerateEventsMetadata,
  type EventMetadata,
} from './EnumerateEventsMetadata';
import PreferencesContext, {
  type Preferences,
} from '../MainFrame/Preferences/PreferencesContext';
import EventsFunctionExtractorDialog from './EventsFunctionExtractor/EventsFunctionExtractorDialog';
import { createNewInstructionForEventsFunction } from './EventsFunctionExtractor';
import { type EventsScope } from '../InstructionOrExpression/EventsScope.flow';
import {
  pasteEventsFromClipboardInSelection,
  copySelectionToClipboard,
  pasteInstructionsFromClipboardInSelection,
  hasClipboardEvents,
  hasClipboardActions,
  hasClipboardConditions,
  pasteInstructionsFromClipboardInInstructionsList,
} from './ClipboardKind';
import DismissableInfoBar from '../UI/Messages/DismissableInfoBar';
import { useScreenType } from '../UI/Reponsive/ScreenTypeMeasurer';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import AuthenticatedUserContext, {
  type AuthenticatedUser,
} from '../Profile/AuthenticatedUserContext';
import {
  addCreateBadgePreHookIfNotClaimed,
  TRIVIAL_FIRST_EVENT,
} from '../Utils/GDevelopServices/Badge';
import LeaderboardContext, {
  type LeaderboardState,
} from '../Leaderboard/LeaderboardContext';
import { TutorialContext } from '../Tutorial/TutorialContext';
import { type Tutorial } from '../Utils/GDevelopServices/Tutorial';
const gd: libGDevelop = global.gd;

const zoomLevel = { min: 1, max: 50 };

export type ChangeContext = {|
  events?: Array<EventContext>,
  instructions?: Array<InstructionContextWithLocatingEvent>,
|};

type Props = {|
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  events: gdEventsList,
  setToolbar: (?React.Node) => void,
  onOpenSettings?: ?() => void,
  onOpenExternalEvents: string => void,
  onOpenLayout: string => void,
  resourceManagementProps: ResourceManagementProps,
  openInstructionOrExpression: (
    extension: gdPlatformExtension,
    type: string
  ) => void,
  onCreateEventsFunction: (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => void,
  onBeginCreateEventsFunction: () => void,
  unsavedChanges?: ?UnsavedChanges,
  isActive: boolean,
|};

type ComponentProps = {|
  ...Props,
  authenticatedUser: AuthenticatedUser,
  preferences: Preferences,
  tutorials: ?Array<Tutorial>,
  leaderboardsManager: ?LeaderboardState,
|};

type State = {|
  eventsHistory: HistoryState,

  editedInstruction: {
    //TODO: This could be adapted to be a InstructionContext
    isCondition: boolean,
    instruction: ?gdInstruction,
    instrsList: ?gdInstructionsList,
    indexInList: ?number,
    locatingEvent: ?gdBaseEvent,
  },
  editedParameter: {
    // TODO: This could be adapted to be a ParameterContext
    isCondition: boolean,
    instruction: ?gdInstruction,
    instrsList: ?gdInstructionsList,
    parameterIndex: number,
    locatingEvent: ?gdBaseEvent,
  },

  selection: SelectionState,

  inlineEditing: boolean,
  inlineEditingAnchorEl: ?HTMLElement,
  inlineInstructionEditorAnchorEl: ?HTMLElement,
  inlineEditingPreviousValue: ?string,

  analyzedEventsContextResult: ?EventsContextResult,

  serializedEventsToExtract: ?Object,

  textEditedEvent: ?gdBaseEvent,

  showSearchPanel: boolean,
  searchResults: ?Array<gdBaseEvent>,
  searchFocusOffset: ?number,

  allEventsMetadata: Array<EventMetadata>,

  fontSize: number,
|};

type EventInsertionContext = {|
  eventsList: gdEventsList,
  indexInList: number,
|};

const styles = {
  container: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    flex: 1,
    position: 'relative', // To be sure that absolutely positioned PlaceholderMessage won't go outside of the EventsSheet
  },
};

export class EventsSheetComponentWithoutHandle extends React.Component<
  ComponentProps,
  State
> {
  _eventsTree: ?EventsTree;
  _eventSearcher: ?EventsSearcher;
  _searchPanel: ?SearchPanelInterface;
  _containerDiv = React.createRef<HTMLDivElement>();
  _keyboardShortcuts = new KeyboardShortcuts({
    isActive: () =>
      !this.state.inlineEditing &&
      !this.state.editedInstruction.instruction &&
      !this.state.analyzedEventsContextResult &&
      !this.state.serializedEventsToExtract,
    shortcutCallbacks: {
      onDelete: () => this.deleteSelection(),
      onCopy: () => this.copySelection(),
      onCut: () => this.cutSelection(),
      onPaste: () => this.pasteEventsOrInstructions(),
      onSearch: () => this._toggleSearchPanel(),
      onEscape: () => this._closeSearchPanel(),
      onUndo: () => this.undo(),
      onRedo: () => this.redo(),
      onZoomIn: (event: KeyboardEvent) => this.onZoomEvent('IN')(event),
      onZoomOut: (event: KeyboardEvent) => this.onZoomEvent('OUT')(event),
    },
  });

  eventContextMenu: ?ContextMenuInterface;
  instructionContextMenu: ?ContextMenuInterface;
  addNewEvent: (
    type: string,
    context: ?EventInsertionContext
  ) => Array<gdBaseEvent>;

  state = {
    eventsHistory: getHistoryInitialState(this.props.events, {
      historyMaxSize: 100,
    }),

    editedInstruction: {
      isCondition: true,
      instruction: null,
      instrsList: null,
      indexInList: 0,
      locatingEvent: null,
    },
    editedParameter: {
      isCondition: true,
      instruction: null,
      instrsList: null,
      parameterIndex: 0,
      locatingEvent: null,
    },

    selection: getInitialSelection(),

    inlineEditing: false,
    inlineEditingAnchorEl: null,
    inlineInstructionEditorAnchorEl: null,
    inlineEditingPreviousValue: null,

    analyzedEventsContextResult: null,

    serializedEventsToExtract: null,

    showSearchPanel: false,
    searchResults: null,
    searchFocusOffset: null,

    allEventsMetadata: [],

    textEditedEvent: null,

    fontSize: 14,
  };

  constructor(props: ComponentProps) {
    super(props);
    this.addNewEvent = addCreateBadgePreHookIfNotClaimed(
      this.props.authenticatedUser,
      TRIVIAL_FIRST_EVENT,
      this._addNewEvent
    );
  }

  componentDidMount() {
    this.setState({ allEventsMetadata: enumerateEventsMetadata() });
  }

  componentDidUpdate(prevProps: ComponentProps, prevState: State) {
    this.addNewEvent = addCreateBadgePreHookIfNotClaimed(
      this.props.authenticatedUser,
      TRIVIAL_FIRST_EVENT,
      this._addNewEvent
    );

    if (this.state.eventsHistory !== prevState.eventsHistory)
      if (this.props.unsavedChanges)
        this.props.unsavedChanges.triggerUnsavedChanges();

    // If the tab becomes active again, we ensure the dom is focused
    // allowing the keyboard shortcuts to work.
    if (!prevProps.isActive && this.props.isActive) {
      this._ensureFocused();
    }
  }

  updateToolbar() {
    if (!this.props.setToolbar) return;

    this.props.setToolbar(
      <Toolbar
        allEventsMetadata={this.state.allEventsMetadata}
        onAddStandardEvent={this._addStandardEvent}
        onAddSubEvent={this.addSubEvents}
        canAddSubEvent={hasEventSelected(this.state.selection)}
        canToggleEventDisabled={
          hasEventSelected(this.state.selection) &&
          this._selectionCanToggleDisabled()
        }
        canToggleInstructionInverted={hasInstructionSelected(
          this.state.selection
        )}
        onAddCommentEvent={this._addCommentEvent}
        onAddEvent={this.addNewEvent}
        onToggleInvertedCondition={this._invertSelectedConditions}
        onToggleDisabledEvent={this.toggleDisabled}
        canRemove={hasSomethingSelected(this.state.selection)}
        onRemove={this.deleteSelection}
        canUndo={canUndo(this.state.eventsHistory)}
        canRedo={canRedo(this.state.eventsHistory)}
        undo={this.undo}
        redo={this.redo}
        onOpenSettings={this.props.onOpenSettings}
        onToggleSearchPanel={this._toggleSearchPanel}
      />
    );
  }

  _addStandardEvent = () => {
    this.addNewEvent('BuiltinCommonInstructions::Standard');
  };

  _addCommentEvent = () => {
    this.addNewEvent('BuiltinCommonInstructions::Comment');
  };

  _toggleSearchPanel = () => {
    this.setState(
      state => {
        if (
          state.showSearchPanel &&
          this._searchPanel &&
          this._searchPanel.isSearchOngoing()
        ) {
          this._searchPanel.focus();
          return;
        }
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

  _closeSearchPanel = () => {
    if (this._eventSearcher) this._eventSearcher.reset();
    this.setState({ showSearchPanel: false });
  };

  addSubEvents = () => {
    const { project } = this.props;
    const selectedEvents = getSelectedEvents(this.state.selection);
    const newSubEvents = selectedEvents
      .map(event => {
        if (event.canHaveSubEvents()) {
          return event
            .getSubEvents()
            .insertNewEvent(
              project,
              'BuiltinCommonInstructions::Standard',
              event.getSubEvents().getEventsCount()
            );
        }
        return null;
      })
      .filter(Boolean);
    this._eventsTree &&
      this._eventsTree.forceEventsUpdate(() => {
        const positions = this._getChangedEventRows(newSubEvents);
        this._saveChangesToHistory('ADD', {
          positionsBeforeAction: positions,
          positionAfterAction: positions,
        });
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

  _addNewEvent = (
    type: string,
    context: ?EventInsertionContext
  ): Array<gdBaseEvent> => {
    const { project } = this.props;
    const hasEventsSelected = hasEventSelected(this.state.selection);
    let insertTopOfSelection = false;

    let insertions: Array<EventInsertionContext> = [];
    if (context) {
      insertions = [context];
    } else if (hasEventsSelected) {
      if (
        type === 'BuiltinCommonInstructions::Comment' ||
        type === 'BuiltinCommonInstructions::Group'
      ) {
        insertTopOfSelection = true;
      }

      insertions = getSelectedEventContexts(this.state.selection).map(
        selectedEvent => ({
          eventsList: selectedEvent.eventsList,
          indexInList: insertTopOfSelection
            ? selectedEvent.indexInList - 1
            : selectedEvent.indexInList,
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
    const currentTree = this._eventsTree;
    if (currentTree) {
      currentTree.forceEventsUpdate(() => {
        const positions = this._getChangedEventRows(newEvents);
        this._saveChangesToHistory(
          'ADD',
          { positionsBeforeAction: positions, positionAfterAction: positions },
          () => {
            if (!context && !hasEventsSelected) {
              currentTree.scrollToRow(currentTree.getEventRow(newEvents[0]));
            }
          }
        );
      });
    }

    return newEvents;
  };

  openEventTextDialog = () => {
    const editableEvents = filterEditableWithEventTextDialog(
      getSelectedEvents(this.state.selection)
    );
    if (!editableEvents.length) return;

    const event = editableEvents[editableEvents.length - 1]; // Get the last selected event.
    this.setState({
      textEditedEvent: event,
    });
  };

  closeEventTextDialog = () => {
    if (this.state.textEditedEvent) {
      const positions = this._getChangedEventRows([this.state.textEditedEvent]);
      this._saveChangesToHistory('EDIT', {
        positionsBeforeAction: positions,
        positionAfterAction: positions,
      });
    }
    this.setState({
      textEditedEvent: null,
    });
  };

  _buildInstructionContextMenu = (i18n: I18nType) => [
    {
      label: i18n._(t`Copy`),
      click: () => this.copySelection(),
      accelerator: 'CmdOrCtrl+C',
    },
    {
      label: i18n._(t`Cut`),
      click: () => this.cutSelection(),
      accelerator: 'CmdOrCtrl+X',
    },
    {
      label: i18n._(t`Paste`),
      click: () => this.pasteInstructions(),
      enabled: hasClipboardConditions() || hasClipboardActions(),
      accelerator: 'CmdOrCtrl+V',
    },
    { type: 'separator' },
    {
      label: i18n._(t`Delete`),
      click: () => this.deleteSelection(),
      accelerator: 'Delete',
    },
    { type: 'separator' },
    {
      label: i18n._(t`Undo`),
      click: this.undo,
      enabled: canUndo(this.state.eventsHistory),
      accelerator: 'CmdOrCtrl+Z',
    },
    {
      label: i18n._(t`Redo`),
      click: this.redo,
      enabled: canRedo(this.state.eventsHistory),
      accelerator: 'CmdOrCtrl+Shift+Z',
    },
    {
      label: i18n._(t`Invert Condition`),
      click: () => this._invertSelectedConditions(),
      visible: hasSelectedAtLeastOneCondition(this.state.selection),
      accelerator: getShortcutDisplayName(
        this.props.preferences.values.userShortcutMap[
          'TOGGLE_CONDITION_INVERTED'
        ] || 'KeyJ'
      ),
    },
    {
      label: i18n._(t`Toggle Wait the Action to End`),
      click: () => this._toggleAwaitingActions(),
      visible: this._hasSelectedOptionallyAsyncActions(),
    },
  ];

  openAddInstructionContextMenu = (
    locatingEvent: gdBaseEvent,
    button: HTMLButtonElement,
    instructionsListContext: InstructionsListContext
  ) => {
    this.openInstructionEditor(locatingEvent, instructionsListContext, button);
  };

  openInstructionEditor = (
    locatingEvent: gdBaseEvent,
    instructionContext: InstructionContext | InstructionsListContext,
    inlineInstructionEditorAnchorEl?: ?HTMLButtonElement = null
  ) => {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
      console.warn(
        'state.editedInstruction.instruction was containing an instruction - deleting it. Verify the logic handling the state in EventsSheet because that should not happen.'
      );
    }

    this.setState({
      inlineInstructionEditorAnchorEl,
      editedInstruction: {
        instrsList: instructionContext.instrsList,
        isCondition: instructionContext.isCondition,
        instruction: instructionContext.instruction
          ? instructionContext.instruction.clone()
          : new gd.Instruction(),
        indexInList:
          instructionContext.indexInList !== undefined
            ? instructionContext.indexInList
            : undefined,
        locatingEvent,
      },
    });
  };

  closeInstructionEditor(saveChanges: boolean = false) {
    const { instruction, locatingEvent } = this.state.editedInstruction;

    this.setState(
      {
        editedInstruction: {
          isCondition: true,
          instruction: null,
          instrsList: null,
          indexInList: 0,
          locatingEvent: null,
        },
      },
      () => {
        // Delete from memory the instruction being edited, *after* resetting
        // editedInstruction and after the re-rendering, in an effort to be
        // sure that instruction is not used after deletion.
        if (instruction) {
          instruction.delete();
        }
        if (saveChanges && locatingEvent) {
          const positions = this._getChangedEventRows([locatingEvent]);
          this._saveChangesToHistory('EDIT', {
            positionsBeforeAction: positions,
            positionAfterAction: positions,
          });
        }
      }
    );
  }

  moveSelectionToInstruction = (
    locatingEvent: gdBaseEvent,
    destinationContext: InstructionContext
  ) => {
    this.moveSelectionToInstructionsList(
      locatingEvent,
      {
        instrsList: destinationContext.instrsList,
        isCondition: destinationContext.isCondition,
      },
      destinationContext.indexInList
    );
  };

  moveSelectionToInstructionsList = (
    locatingEvent: gdBaseEvent,
    destinationContext: InstructionsListContext,
    indexInList: ?number = undefined
  ) => {
    const selectedInstructions = getSelectedInstructions(this.state.selection);
    const destinationIndex =
      indexInList === undefined || indexInList === null
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

    const locatingEvents = getSelectedInstructionsLocatingEvents(
      this.state.selection
    );
    const previousPositions = this._getChangedEventRows(locatingEvents);
    const nextPositions = this._getChangedEventRows([locatingEvent]);

    if (!this._keyboardShortcuts.shouldCloneInstances()) {
      this.deleteSelection({ deleteEvents: false, shouldSaveInHistory: false });
      this._saveChangesToHistory('EDIT', {
        positionsBeforeAction: previousPositions,
        positionAfterAction: nextPositions,
      });
    } else {
      this._saveChangesToHistory('EDIT', {
        positionsBeforeAction: previousPositions,
        positionAfterAction: nextPositions,
      });
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

  collapseAll = () => {
    if (this._eventsTree) this._eventsTree.foldAll();
  };

  expandToLevel = (level: number) => {
    if (this._eventsTree) this._eventsTree.unfoldToLevel(level);
  };

  _buildEventContextMenu = (i18n: I18nType) => [
    {
      label: i18n._(t`Edit`),
      click: () => this.openEventTextDialog(),
      visible:
        filterEditableWithEventTextDialog(
          getSelectedEvents(this.state.selection)
        ).length > 0,
    },
    {
      label: i18n._(t`Copy`),
      click: () => this.copySelection(),
      accelerator: 'CmdOrCtrl+C',
    },
    {
      label: i18n._(t`Cut`),
      click: () => this.cutSelection(),
      accelerator: 'CmdOrCtrl+X',
    },
    {
      label: i18n._(t`Paste`),
      click: () => this.pasteEvents(),
      enabled: hasClipboardEvents(),
      accelerator: 'CmdOrCtrl+V',
    },
    {
      label: i18n._(t`Delete`),
      click: () => this.deleteSelection(),
      accelerator: 'Delete',
    },
    {
      label: i18n._(t`Toggle disabled`),
      click: () => this.toggleDisabled(),
      enabled: this._selectionCanToggleDisabled(),
      accelerator: getShortcutDisplayName(
        this.props.preferences.values.userShortcutMap[
          'TOGGLE_EVENT_DISABLED'
        ] || 'KeyD'
      ),
    },
    { type: 'separator' },
    {
      label: i18n._(t`Add New Event Below`),
      click: () => {
        this.addNewEvent('BuiltinCommonInstructions::Standard');
      },
    },
    {
      label: i18n._(t`Add Sub Event`),
      click: () => this.addSubEvents(),
      enabled: this._selectionCanHaveSubEvents(),
    },
    {
      label: i18n._(t`Add Other`),
      submenu: this.state.allEventsMetadata.map(metadata => {
        return {
          label: metadata.fullName,
          click: () => {
            this.addNewEvent(metadata.type);
          },
        };
      }),
    },
    { type: 'separator' },
    {
      label: i18n._(t`Undo`),
      click: this.undo,
      enabled: canUndo(this.state.eventsHistory),
      accelerator: 'CmdOrCtrl+Z',
    },
    {
      label: i18n._(t`Redo`),
      click: this.redo,
      enabled: canRedo(this.state.eventsHistory),
      accelerator: 'CmdOrCtrl+Shift+Z',
    },
    { type: 'separator' },
    {
      label: i18n._(t`Collapse all`),
      click: this.collapseAll,
    },
    {
      label: i18n._(t`Expand all to level`),
      submenu: [
        {
          label: i18n._(t`All`),
          click: () => this.expandToLevel(-1),
        },
        { type: 'separator' },
        ...[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => {
          return {
            label: i18n._(t`Level ${index + 1}`),
            click: () => this.expandToLevel(index),
          };
        }),
      ],
    },
    { type: 'separator' },
    {
      label: i18n._(t`Extract Events to a Function`),
      click: () => this.extractEventsToFunction(),
    },
    {
      label: i18n._(t`Move Events into a Group`),
      click: () => this.moveEventsIntoNewGroup(),
    },
    {
      label: i18n._(t`Analyze Objects Used in this Event`),
      click: this._openEventsContextAnalyzer,
    },
    { type: 'separator' },
    {
      label: i18n._(t`Zoom In`),
      click: () => this.onZoomEvent('IN')(),
      accelerator: 'CmdOrCtrl+=',
      enabled:
        this.props.preferences.values.eventsSheetZoomLevel < zoomLevel.max,
    },
    {
      label: i18n._(t`Zoom Out`),
      click: () => this.onZoomEvent('OUT')(),
      accelerator: 'CmdOrCtrl+-',
      enabled:
        this.props.preferences.values.eventsSheetZoomLevel > zoomLevel.min,
    },
  ];

  openEventContextMenu = (x: number, y: number, eventContext: EventContext) => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectEvent(this.state.selection, eventContext, multiSelect),
      },
      () => {
        this.updateToolbar();
        if (this.eventContextMenu) this.eventContextMenu.open(x, y);
      }
    );
  };

  openInstructionContextMenu = (
    locatingEvent: gdBaseEvent,
    x: number,
    y: number,
    instructionContext: InstructionContext
  ) => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectInstruction(
          locatingEvent,
          this.state.selection,
          instructionContext,
          multiSelect
        ),
      },
      () => {
        this.updateToolbar();
        if (this.instructionContextMenu) this.instructionContextMenu.open(x, y);
      }
    );
  };

  selectInstruction = (
    locatingEvent: gdBaseEvent,
    instructionContext: InstructionContext
  ) => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectInstruction(
          locatingEvent,
          this.state.selection,
          instructionContext,
          multiSelect
        ),
      },
      () => this.updateToolbar()
    );
  };

  openParameterEditor = (
    locatingEvent: gdBaseEvent,
    parameterContext: ParameterContext
  ) => {
    const { instruction, parameterIndex } = parameterContext;

    this.setState({
      editedParameter: { locatingEvent, ...parameterContext },
      inlineEditing: true,
      inlineEditingAnchorEl: parameterContext.domEvent
        ? parameterContext.domEvent.currentTarget
        : null,
      inlineEditingPreviousValue: instruction
        .getParameter(parameterIndex)
        .getPlainString(),
    });
  };

  closeParameterEditor = (shouldCancel: boolean) => {
    const {
      instruction,
      parameterIndex,
      locatingEvent,
    } = this.state.editedParameter;
    if (instruction) {
      // If the user canceled, revert the value to the positionsBeforeAction value, if not null.
      if (
        shouldCancel &&
        typeof this.state.inlineEditingPreviousValue === 'string'
      ) {
        instruction.setParameter(
          parameterIndex,
          this.state.inlineEditingPreviousValue
        );
      }
      // If the user made changes, save the value to history.
      if (
        !shouldCancel &&
        this.state.inlineEditingPreviousValue !==
          instruction.getParameter(parameterIndex) &&
        locatingEvent
      ) {
        const positions = this._getChangedEventRows([locatingEvent]);
        this._saveChangesToHistory('EDIT', {
          positionsBeforeAction: positions,
          positionAfterAction: positions,
        });
      }
    }

    const { inlineEditingAnchorEl } = this.state;

    this.setState(
      {
        editedParameter: {
          isCondition: true,
          instruction: null,
          instrsList: null,
          parameterIndex: 0,
          locatingEvent: null,
        },
        inlineEditing: false,
        inlineEditingAnchorEl: null,
      },
      () => {
        if (inlineEditingAnchorEl) {
          // Focus back the parameter - especially useful when editing
          // with the keyboard only.
          //
          // Do this **after** the state change is applied.
          // Otherwise this could cause a blur event for the input field
          // that was focused in the inline popover,
          // which would override the changes just applied to the
          // instruction in case of cancellation.
          // As the state change is applied, the inline popover is already
          // gone and we can change the focus without worries.
          inlineEditingAnchorEl.focus();
        }
      }
    );
  };

  toggleDisabled = () => {
    let shouldBeSaved = false;
    const selectedEvents = getSelectedEvents(this.state.selection);
    selectedEvents.forEach(event => {
      if (event.isExecutable()) {
        event.setDisabled(!event.isDisabled());
        shouldBeSaved = true;
      }
    });
    if (shouldBeSaved) {
      const positions = this._getChangedEventRows(selectedEvents);
      this._saveChangesToHistory(
        'DELETE',
        {
          positionsBeforeAction: positions,
          positionAfterAction: positions,
        },
        () => {
          if (this._eventsTree) this._eventsTree.forceEventsUpdate();
        }
      );
    }
  };

  deleteSelection = ({
    deleteInstructions = true,
    deleteEvents = true,
    shouldSaveInHistory = true,
  }: {
    deleteInstructions?: boolean,
    deleteEvents?: boolean,
    shouldSaveInHistory?: boolean,
  } = {}) => {
    const { events } = this.props;
    const eventsRemover = new gd.EventsRemover();
    let eventsWithDeletion: Array<gdBaseEvent> = [];
    if (deleteEvents) {
      const selectedEvents = getSelectedEvents(this.state.selection);
      selectedEvents.forEach(event => eventsRemover.addEventToRemove(event));
      eventsWithDeletion = eventsWithDeletion.concat(selectedEvents);
    }
    if (deleteInstructions) {
      getSelectedInstructions(this.state.selection).forEach(instruction =>
        eventsRemover.addInstructionToRemove(instruction)
      );
      eventsWithDeletion = eventsWithDeletion.concat(
        getSelectedInstructionsLocatingEvents(this.state.selection)
      );
    }

    const positions = this._getChangedEventRows(eventsWithDeletion);
    eventsRemover.launch(events);
    eventsRemover.delete();

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
      () => {
        // If there is at least one edited instruction,
        shouldSaveInHistory &&
          this._saveChangesToHistory('DELETE', {
            positionsBeforeAction: positions,
            positionAfterAction: positions,
          });
        // Deletion of an event/instruction will remove it from the DOM,
        // potentially losing the focus on the associated DOM elements. Ensure
        // we keep the focus on the EventsSheet.
        this._ensureFocused();
      }
    );
  };

  copySelection = () => {
    copySelectionToClipboard(this.state.selection);
  };

  cutSelection = () => {
    this.copySelection();
    this.deleteSelection();
  };

  pasteEvents = () => {
    if (
      !pasteEventsFromClipboardInSelection(
        this.props.project,
        this.state.selection
      )
    ) {
      return;
    }
    const positions = this._getChangedEventRows(
      getSelectedEvents(this.state.selection)
    );
    this._saveChangesToHistory(
      'ADD',
      {
        positionsBeforeAction: positions,
        positionAfterAction: positions,
      },
      () => {
        if (this._eventsTree) this._eventsTree.forceEventsUpdate();
      }
    );
  };

  pasteInstructions = () => {
    if (
      !pasteInstructionsFromClipboardInSelection(
        this.props.project,
        this.state.selection
      )
    ) {
      return;
    }
    const locatingEvents = getSelectedInstructionsLocatingEvents(
      this.state.selection
    );
    const positions = this._getChangedEventRows(locatingEvents);
    this._saveChangesToHistory(
      'EDIT',
      {
        positionsBeforeAction: positions,
        positionAfterAction: positions,
      },
      () => {
        if (this._eventsTree) this._eventsTree.forceEventsUpdate();
      }
    );
  };

  pasteEventsOrInstructions = () => {
    if (hasEventSelected(this.state.selection)) this.pasteEvents();
    else if (hasInstructionSelected(this.state.selection))
      this.pasteInstructions();
    else if (hasInstructionsListSelected(this.state.selection))
      this.pasteInstructions();
  };

  pasteInstructionsInInstructionsList = (
    locatingEvent: gdBaseEvent,
    instructionsListContext: InstructionsListContext
  ) => {
    if (
      !pasteInstructionsFromClipboardInInstructionsList(
        this.props.project,
        instructionsListContext
      )
    ) {
      return;
    }
    const positions = this._getChangedEventRows([locatingEvent]);
    this._saveChangesToHistory(
      'EDIT',
      {
        positionsBeforeAction: positions,
        positionAfterAction: positions,
      },
      () => {
        if (this._eventsTree) this._eventsTree.forceEventsUpdate();
      }
    );
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

    const locatingEvent = getSelectedInstructionsLocatingEvents(
      this.state.selection
    );
    const positions = this._getChangedEventRows(locatingEvent);
    this._saveChangesToHistory(
      'EDIT',
      {
        positionsBeforeAction: positions,
        positionAfterAction: positions,
      },
      () => {
        if (this._eventsTree) this._eventsTree.forceEventsUpdate();
      }
    );
  };

  _hasSelectedOptionallyAsyncActions = (): boolean => {
    return getSelectedInstructionsContexts(this.state.selection).some(
      instructionContext => {
        if (!instructionContext.isCondition) {
          const instructionMetadata = getInstructionMetadata({
            instructionType: instructionContext.instruction.getType(),
            project: this.props.project,
            isCondition: false,
          });

          if (instructionMetadata && instructionMetadata.isOptionallyAsync()) {
            return true;
          }
        }
        return false;
      }
    );
  };

  _toggleAwaitingActions = () => {
    getSelectedInstructionsContexts(this.state.selection).forEach(
      instructionContext => {
        if (!instructionContext.isCondition) {
          const instructionMetadata = getInstructionMetadata({
            instructionType: instructionContext.instruction.getType(),
            project: this.props.project,
            isCondition: false,
          });

          if (instructionMetadata && instructionMetadata.isOptionallyAsync()) {
            instructionContext.instruction.setAwaited(
              !instructionContext.instruction.isAwaited()
            );
          }
        }
      }
    );

    const locatingEvent = getSelectedInstructionsLocatingEvents(
      this.state.selection
    );
    const positions = this._getChangedEventRows(locatingEvent);
    this._saveChangesToHistory(
      'EDIT',
      {
        positionsBeforeAction: positions,
        positionAfterAction: positions,
      },
      () => {
        if (this._eventsTree) this._eventsTree.forceEventsUpdate();
      }
    );
  };

  _onEndEditingStringEvent = (event: gdBaseEvent) => {
    const eventRowIndex = this._getChangedEventRows([event]);
    this._saveChangesToHistory('EDIT', {
      positionsBeforeAction: eventRowIndex,
      positionAfterAction: eventRowIndex,
    });
  };

  _getChangedEventRows = (events: Array<gdBaseEvent>) => {
    const currentTree = this._eventsTree;
    if (currentTree) {
      return events.map(event => currentTree.getEventRow(event));
    }
    return [];
  };

  _saveChangesToHistory = (
    // actionType is defined from the point of view of the event.
    actionType: RevertableActionType,
    positions: {
      positionsBeforeAction: Array<number>,
      positionAfterAction: Array<number>,
    },
    cb: ?Function
  ) => {
    this.setState(
      {
        eventsHistory: saveToHistory(
          this.state.eventsHistory,
          this.props.events,
          actionType,
          { positions }
        ),
      },
      () => {
        this.updateToolbar();
        if (cb) cb();
      }
    );
    if (this._searchPanel) this._searchPanel.markSearchResultsDirty();
  };

  undo = () => {
    if (!canUndo(this.state.eventsHistory)) return;

    const { events, project } = this.props;
    const newEventsHistory = undo(this.state.eventsHistory, events, project);

    // /!\ Events were changed, so any reference to an existing event can now
    // be invalid. Make sure to immediately trigger a forced update before
    // any re-render that could use a deleted/invalid event.
    const { _eventsTree: eventsTree } = this;
    if (!eventsTree) return;
    eventsTree.forceEventsUpdate(() => {
      const {
        changeContext: { positions },
        type,
      } = newEventsHistory.futureActions[
        newEventsHistory.futureActions.length - 1
      ];
      // Whether it is an ADD, EDIT or DELETE, scroll to the place where it was done.
      eventsTree.scrollToRow(positions.positionsBeforeAction[0]);

      let newSelection: SelectionState = getInitialSelection();
      // If it is a DELETE or EDIT, then the element will be present, so we can select them.
      // If it is an ADD, then it will not be present, so we can't select them.
      if (type === 'ADD') {
        newSelection = clearSelection();
      } else {
        const eventContexts = eventsTree.getEventContextAtRowIndexes(
          positions.positionsBeforeAction
        );
        newSelection = selectEventsAfterHistoryChange(eventContexts);
      }
      this.setState(
        {
          selection: newSelection,
          eventsHistory: newEventsHistory,
        },
        () => this.updateToolbar()
      );
    });
  };

  redo = () => {
    if (!canRedo(this.state.eventsHistory)) return;

    const { events, project } = this.props;
    const newEventsHistory = redo(this.state.eventsHistory, events, project);

    // /!\ Events were changed, so any reference to an existing event can now
    // be invalid. Make sure to immediately trigger a forced update before
    // any re-render that could use a deleted/invalid event.
    const { _eventsTree: eventsTree } = this;
    if (!eventsTree) return;
    eventsTree.forceEventsUpdate(() => {
      const {
        changeContext: { positions },
        type,
      } = newEventsHistory.previousActions[
        newEventsHistory.previousActions.length - 1
      ];
      // Whether it was an ADD, EDIT or DELETE, scroll to the place where it will happen.
      eventsTree.scrollToRow(positions.positionAfterAction);
      // If it is a ADD or EDIT, then the element will be present, so we can select them.
      // If it is a DELETE, then they will not be present, so we can't select them.
      let newSelection: SelectionState = getInitialSelection();
      if (type === 'DELETE') {
        newSelection = clearSelection();
      } else {
        const eventContexts = eventsTree.getEventContextAtRowIndexes(
          positions.positionAfterAction
        );
        newSelection = selectEventsAfterHistoryChange(eventContexts);
      }

      this.setState(
        {
          selection: newSelection,
          eventsHistory: newEventsHistory,
        },
        () => this.updateToolbar()
      );
    });
  };

  onZoomEvent = (
    towards: 'IN' | 'OUT'
  ): ((domEvent?: KeyboardEvent) => void) => {
    const factor = towards === 'IN' ? 1 : -1;
    return (domEvent?: KeyboardEvent) => {
      if (domEvent) {
        // Browsers usually implement their own zoom features on the same shortcut
        domEvent.preventDefault();
        domEvent.stopPropagation();
      }
      this.props.preferences.setEventsSheetZoomLevel(
        Math.min(
          Math.max(
            this.props.preferences.values.eventsSheetZoomLevel + factor * 1,
            zoomLevel.min
          ),
          zoomLevel.max
        )
      );
    };
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

    this.setState({
      analyzedEventsContextResult: toEventsContextResult(
        eventsContextAnalyzer.getEventsContext()
      ),
    });
    eventsContextAnalyzer.delete();
  };

  _closeEventsContextAnalyzer = () => {
    this.setState({
      analyzedEventsContextResult: null,
    });
  };

  extractEventsToFunction = () => {
    const eventsList = new gd.EventsList();

    getSelectedEvents(this.state.selection).forEach(event =>
      eventsList.insertEvent(event, eventsList.getEventsCount())
    );

    this.props.onBeginCreateEventsFunction();

    this.setState({
      serializedEventsToExtract: serializeToJSObject(eventsList),
    });

    eventsList.delete();
  };

  moveEventsIntoNewGroup = () => {
    const eventsList = new gd.EventsList();

    getSelectedEvents(this.state.selection).forEach(event =>
      eventsList.insertEvent(event, eventsList.getEventsCount())
    );

    this._replaceSelectionByGroupOfEvents(eventsList);
    eventsList.delete();
  };

  _replaceSelectionByEventsFunction = (
    extensionName: string,
    eventsFunction: gdEventsFunction
  ) => {
    const contexts = getSelectedEventContexts(this.state.selection);
    if (!contexts.length) return;

    const newEvents = this.addNewEvent('BuiltinCommonInstructions::Standard', {
      eventsList: contexts[0].eventsList,
      indexInList: contexts[0].indexInList,
    });
    if (!newEvents.length) {
      console.error('A new event should have been created');
      return;
    }

    const action = createNewInstructionForEventsFunction(
      extensionName,
      eventsFunction
    );
    const standardEvt = gd.asStandardEvent(newEvents[0]);
    standardEvt.getActions().push_back(action);
    action.delete();

    this.deleteSelection({ deleteInstructions: false });
  };

  _replaceSelectionByGroupOfEvents = (eventsList: gdEventsList) => {
    const contexts = getSelectedEventContexts(this.state.selection);
    if (!contexts.length) return;

    const newEvents = this.addNewEvent('BuiltinCommonInstructions::Group', {
      eventsList: contexts[0].eventsList,
      indexInList: contexts[0].indexInList,
    });
    if (!newEvents.length) {
      console.error('A new event should have been created');
      return;
    }

    const groupEvent = gd.asGroupEvent(newEvents[0]);

    groupEvent.setName('Grouped events');
    groupEvent.setFolded(true);
    groupEvent
      .getSubEvents()
      .insertEvents(eventsList, 0, eventsList.getEventsCount(), 0);

    this.deleteSelection({ deleteInstructions: false });
  };

  _ensureEventUnfolded = (cb: () => ?gdBaseEvent) => {
    const event = cb();
    if (event && this._eventsTree) {
      this._eventsTree.unfoldForEvent(event);
    }
  };

  _replaceInEvents = (
    doReplaceInEvents: (
      inputs: ReplaceInEventsInputs,
      cb: () => void
    ) => Array<gdBaseEvent>,
    inputs: ReplaceInEventsInputs
  ) => {
    const modifiedEvents = doReplaceInEvents(inputs, () => {
      this.forceUpdate(() => {
        if (this._eventsTree) this._eventsTree.forceEventsUpdate();
      });
    });
    if (modifiedEvents.length) {
      const positions = this._getChangedEventRows(modifiedEvents);
      this._saveChangesToHistory('EDIT', {
        positionsBeforeAction: positions,
        positionAfterAction: positions,
      });
    }
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

  _onEventMoved = (previousRowIndex: number, nextRowIndex: number) => {
    // Move of the event in the list is handled by EventsTree.
    // This could be refactored and put here if the drag'n'drop of events
    // is reworked at some point.
    this._saveChangesToHistory('EDIT', {
      positionsBeforeAction: [previousRowIndex],
      positionAfterAction: [nextRowIndex],
    });
  };

  _renderInstructionEditorDialog = () => {
    const {
      project,
      scope,
      globalObjectsContainer,
      objectsContainer,
    } = this.props;

    // Choose the dialog to use
    const Dialog = this.state.inlineInstructionEditorAnchorEl
      ? InstructionEditorMenu
      : InstructionEditorDialog;

    return this.state.editedInstruction.instruction ? (
      <Dialog
        project={project}
        scope={scope}
        globalObjectsContainer={globalObjectsContainer}
        objectsContainer={objectsContainer}
        instruction={this.state.editedInstruction.instruction}
        isCondition={this.state.editedInstruction.isCondition}
        isNewInstruction={
          this.state.editedInstruction.indexInList === undefined
        }
        anchorEl={this.state.inlineInstructionEditorAnchorEl}
        open={true}
        onCancel={() => this.closeInstructionEditor()}
        onSubmit={() => {
          const {
            instrsList,
            instruction,
            indexInList,
          } = this.state.editedInstruction;
          if (!instrsList || !instruction) return;

          if (indexInList !== undefined && indexInList !== null) {
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
        resourceManagementProps={this.props.resourceManagementProps}
        openInstructionOrExpression={(extension, type) => {
          this.closeInstructionEditor();
          this.props.openInstructionOrExpression(extension, type);
        }}
        canPasteInstructions={
          this.state.editedInstruction.isCondition
            ? hasClipboardConditions()
            : hasClipboardActions()
        }
        onPasteInstructions={() => {
          const {
            instrsList,
            isCondition,
            locatingEvent,
          } = this.state.editedInstruction;
          if (!instrsList) return;

          locatingEvent &&
            this.pasteInstructionsInInstructionsList(locatingEvent, {
              instrsList,
              isCondition,
            });
        }}
      />
    ) : (
      undefined
    );
  };

  /**
   * Call this to ensure that the events sheet stays focused after a potential
   * lost of focus (for example, after a scroll, the focused element might have
   * been scrolled out of the view and so removed from the DOM)
   */
  _ensureFocused = () => {
    if (!this._containerDiv || !document) return;

    const containerDivElement = this._containerDiv.current;
    if (document.activeElement === containerDivElement) {
      // Focus is already on the container
      return;
    }
    if (containerDivElement) {
      if (
        document.activeElement !== document.body &&
        containerDivElement.contains(document.activeElement)
      ) {
        // Focus is already on an element of the container
        return;
      }

      // Focus is not on an element of the container, we probably lost the focus
      // after scrolling or removing an element. Give back the focus to the container.
      containerDivElement.focus();
    }
  };

  render() {
    const {
      isActive,
      project,
      scope,
      events,
      onOpenExternalEvents,
      onOpenLayout,
      globalObjectsContainer,
      objectsContainer,
      preferences,
      resourceManagementProps,
      onCreateEventsFunction,
      tutorials,
    } = this.props;
    if (!project) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const screenType = useScreenType();

    return (
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <EventsSearcher
            key={events.ptr}
            ref={eventSearcher => (this._eventSearcher = eventSearcher)}
            events={events}
            globalObjectsContainer={globalObjectsContainer}
            objectsContainer={objectsContainer}
            selection={this.state.selection}
            project={project}
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
                id="events-editor"
                data-active={isActive ? 'true' : undefined}
                className="gd-events-sheet"
                style={styles.container}
                onKeyDown={this._keyboardShortcuts.onKeyDown}
                onKeyUp={this._keyboardShortcuts.onKeyUp}
                onDragOver={this._keyboardShortcuts.onDragOver}
                ref={this._containerDiv}
                tabIndex={0}
              >
                <EventsTree
                  ref={eventsTree => (this._eventsTree = eventsTree)}
                  key={events.ptr}
                  onScroll={this._ensureFocused}
                  events={events}
                  project={project}
                  scope={scope}
                  globalObjectsContainer={globalObjectsContainer}
                  objectsContainer={objectsContainer}
                  selection={this.state.selection}
                  onInstructionClick={this.selectInstruction}
                  onInstructionDoubleClick={this.openInstructionEditor}
                  onInstructionContextMenu={this.openInstructionContextMenu}
                  onAddInstructionContextMenu={
                    this.openAddInstructionContextMenu
                  }
                  onAddNewInstruction={this.openInstructionEditor}
                  onPasteInstructions={this.pasteInstructionsInInstructionsList}
                  onMoveToInstruction={this.moveSelectionToInstruction}
                  onMoveToInstructionsList={
                    this.moveSelectionToInstructionsList
                  }
                  onParameterClick={this.openParameterEditor}
                  onEventClick={this.selectEvent}
                  onEventContextMenu={this.openEventContextMenu}
                  onAddNewEvent={(
                    eventType: string,
                    eventsList: gdEventsList
                  ) => {
                    this.addNewEvent(eventType, {
                      eventsList,
                      indexInList: eventsList.getEventsCount(),
                    });
                  }}
                  onOpenExternalEvents={onOpenExternalEvents}
                  onOpenLayout={onOpenLayout}
                  searchResults={eventsSearchResultEvents}
                  searchFocusOffset={searchFocusOffset}
                  onEventMoved={this._onEventMoved}
                  onEndEditingEvent={this._onEndEditingStringEvent}
                  showObjectThumbnails={
                    preferences.values.eventsSheetShowObjectThumbnails
                  }
                  screenType={screenType}
                  windowWidth={windowWidth}
                  eventsSheetHeight={
                    this._containerDiv.current
                      ? this._containerDiv.current.clientHeight
                      : 0
                  }
                  fontSize={preferences.values.eventsSheetZoomLevel}
                  preferences={preferences}
                  tutorials={tutorials}
                />
                {this.state.showSearchPanel && (
                  <SearchPanel
                    ref={searchPanel => (this._searchPanel = searchPanel)}
                    onSearchInEvents={inputs =>
                      this._searchInEvents(searchInEvents, inputs)
                    }
                    onReplaceInEvents={inputs => {
                      this._replaceInEvents(replaceInEvents, inputs);
                    }}
                    resultsCount={
                      eventsSearchResultEvents
                        ? eventsSearchResultEvents.length
                        : null
                    }
                    hasEventSelected={hasEventSelected(this.state.selection)}
                    onGoToPreviousSearchResult={() =>
                      this._ensureEventUnfolded(goToPreviousSearchResult)
                    }
                    onCloseSearchPanel={() => {
                      this._closeSearchPanel();
                    }}
                    onGoToNextSearchResult={() =>
                      this._ensureEventUnfolded(goToNextSearchResult)
                    }
                    searchFocusOffset={searchFocusOffset}
                  />
                )}
                <InlineParameterEditor
                  open={this.state.inlineEditing}
                  anchorEl={this.state.inlineEditingAnchorEl}
                  onRequestClose={() => {
                    this.closeParameterEditor(
                      /*shouldCancel=*/ preferences.values
                        .eventsSheetCancelInlineParameter === 'cancel'
                    );
                  }}
                  onApply={() => {
                    this.closeParameterEditor(/*shouldCancel=*/ false);
                  }}
                  project={project}
                  scope={scope}
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
                    if (!instruction || !this.state.inlineEditing) {
                      // Unlikely to ever happen, but maybe a component could
                      // fire the "onChange" while the inline editor was just
                      // dismissed.
                      return;
                    }
                    instruction.setParameter(parameterIndex, value);
                    // Ask the component to re-render, so that the new parameter
                    // set for the instruction in the state
                    // is taken into account for the InlineParameterEditor.
                    this.forceUpdate();
                    if (this._searchPanel)
                      this._searchPanel.markSearchResultsDirty();
                  }}
                  resourceManagementProps={resourceManagementProps}
                />
                <ContextMenu
                  ref={eventContextMenu =>
                    (this.eventContextMenu = eventContextMenu)
                  }
                  buildMenuTemplate={this._buildEventContextMenu}
                />
                <ContextMenu
                  ref={instructionContextMenu =>
                    (this.instructionContextMenu = instructionContextMenu)
                  }
                  buildMenuTemplate={this._buildInstructionContextMenu}
                />
                {this._renderInstructionEditorDialog()}
                {this.state.analyzedEventsContextResult && (
                  <EventsContextAnalyzerDialog
                    onClose={this._closeEventsContextAnalyzer}
                    eventsContextResult={this.state.analyzedEventsContextResult}
                  />
                )}
                {this.state.serializedEventsToExtract && (
                  <EventsFunctionExtractorDialog
                    project={project}
                    globalObjectsContainer={globalObjectsContainer}
                    objectsContainer={objectsContainer}
                    onClose={() =>
                      this.setState({
                        serializedEventsToExtract: null,
                      })
                    }
                    serializedEvents={this.state.serializedEventsToExtract}
                    onCreate={(extensionName, eventsFunction) => {
                      onCreateEventsFunction(extensionName, eventsFunction);
                      this._replaceSelectionByEventsFunction(
                        extensionName,
                        eventsFunction
                      );
                      this.setState({
                        serializedEventsToExtract: null,
                      });
                    }}
                  />
                )}
                {this.state.textEditedEvent && (
                  <EventTextDialog
                    event={this.state.textEditedEvent}
                    onApply={() => {
                      this.closeEventTextDialog();
                    }}
                    onClose={this.closeEventTextDialog}
                  />
                )}
                <DismissableInfoBar
                  identifier="edit-instruction-explanation"
                  message={
                    <Trans>
                      Double click on a condition or action to edit it.
                    </Trans>
                  }
                  touchScreenMessage={
                    <Trans>
                      Double tap a condition or action to edit it. Long press to
                      show more options.
                    </Trans>
                  }
                  show={hasInstructionSelected(this.state.selection)}
                />
              </div>
            )}
          </EventsSearcher>
        )}
      </ResponsiveWindowMeasurer>
    );
  }
}

export type EventsSheetInterface = {|
  updateToolbar: () => void,
|};

// EventsSheet is a wrapper so that the component can use multiple
// context in class methods while correctly exposing the interface.
const EventsSheet = (props, ref) => {
  React.useImperativeHandle(ref, () => ({
    updateToolbar,
  }));

  const component = React.useRef<?EventsSheetComponentWithoutHandle>(null);
  const updateToolbar = () => {
    if (component.current) component.current.updateToolbar();
  };

  const authenticatedUser = React.useContext(AuthenticatedUserContext);
  const preferences = React.useContext(PreferencesContext);
  const { tutorials } = React.useContext(TutorialContext);
  const leaderboardsManager = React.useContext(LeaderboardContext);
  return (
    <EventsSheetComponentWithoutHandle
      ref={component}
      authenticatedUser={authenticatedUser}
      preferences={preferences}
      tutorials={tutorials}
      leaderboardsManager={leaderboardsManager}
      {...props}
    />
  );
};

export default React.forwardRef<Props, EventsSheetInterface>(EventsSheet);
