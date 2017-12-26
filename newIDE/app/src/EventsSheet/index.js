import React, { Component } from 'react';
import EventsTree from './EventsTree';
import InstructionEditorDialog from './InstructionEditor/InstructionEditorDialog';
import Toolbar from './Toolbar';
import KeyboardShortcuts from '../UI/KeyboardShortcuts';
import { passFullSize } from '../UI/FullSizeMeasurer';
import InlineParameterEditor from './InlineParameterEditor';
import ContextMenu from '../UI/Menu/ContextMenu';
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  undo,
  redo,
  canUndo,
  canRedo,
  getHistoryInitialState,
  saveToHistory,
} from '../Utils/History';
import {
  getInitialSelection,
  selectEvent,
  selectInstruction,
  hasSomethingSelected,
  hasEventSelected,
  hasInstructionSelected,
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
const gd = global.gd;

const CLIPBOARD_KIND = 'EventsAndInstructions';

const FullSizeEventsTree = passFullSize(EventsTree, { useFlex: false });

export default class EventsSheet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      history: getHistoryInitialState(props.events),

      editedInstruction: {
        isCondition: true,
        instruction: null,
        instrsList: null,
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
    });
  }

  componentWillUnmount() {
    this._keyboardShortcuts.unmount();
  }

  updateToolbar() {
    if (!this.props.setToolbar) return;

    this.props.setToolbar(
      <Toolbar
        onAddStandardEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Standard')}
        onAddSubEvent={this.addSubEvents}
        canAddSubEvent={hasEventSelected(this.state.selection)}
        onAddCommentEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Comment')}
        onAddEvent={this.addNewEvent}
        canRemove={hasSomethingSelected(this.state.selection)}
        onRemove={this.deleteSelection}
        showPreviewButton={this.props.showPreviewButton}
        onPreview={this.props.onPreview}
        canUndo={canUndo(this.state.history)}
        canRedo={canRedo(this.state.history)}
        undo={this.undo}
        redo={this.redo}
        onOpenSettings={this.props.onOpenSettings}
      />
    );
  }

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
      this._eventsTree.forceEventsUpdate();
    });
  };

  addNewEvent = (type, context) => {
    const { project } = this.props;
    const hasEventsSelected = hasEventSelected(this.state.selection);

    let insertions = [];
    if (context) {
      insertions = [context];
    } else if (hasEventsSelected) {
      insertions = getSelectedEventContexts(this.state.selection);
    } else {
      insertions = [
        {
          eventsList: this.props.events,
          indexInList: this.props.events.getEventsCount(),
        },
      ];
    }

    const newEvents = insertions.map(context => {
      return context.eventsList.insertNewEvent(
        project,
        type,
        context.indexInList + 1
      );
    });

    this._saveChangesToHistory(() => {
      this._eventsTree.forceEventsUpdate(() => {
        if (!context && !hasEventsSelected) {
          this._eventsTree.scrollToEvent(newEvents[0]);
        }
      });
    });
  };

  openInstructionEditor = instructionContext => {
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

  closeInstructionEditor(saveChanges = false) {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState(
      {
        editedInstruction: {
          isCondition: true,
          instruction: null,
          instrsList: null,
        },
      },
      () => {
        if (saveChanges) {
          this._saveChangesToHistory();
        }
      }
    );
  }

  selectEvent = eventContext => {
    const multiSelect = this._keyboardShortcuts.shouldMultiSelect();
    this.setState(
      {
        selection: selectEvent(this.state.selection, eventContext, multiSelect),
      },
      () => this.updateToolbar()
    );
  };

  openEventContextMenu = (x, y, eventContext) => {
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

  openInstructionContextMenu = (x, y, instructionContext) => {
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

  openInstructionsListContextMenu = (x, y, instructionsListContext) => {
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

  selectInstruction = instructionContext => {
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

  openParameterEditor = parameterContext => {
    this.setState({
      editedParameter: parameterContext,
      inlineEditing: true,
      inlineEditingAnchorEl: parameterContext.domEvent.currentTarget,
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

  deleteSelection = () => {
    const { events } = this.props;
    const eventsRemover = new gd.EventsRemover();
    getSelectedEvents(this.state.selection).forEach(event =>
      eventsRemover.addEventToRemove(event)
    );
    getSelectedInstructions(this.state.selection).forEach(instruction =>
      eventsRemover.addInstructionToRemove(instruction)
    );

    eventsRemover.launch(events);
    this.setState(
      {
        selection: clearSelection(),
        inlineEditing: false,
        inlineEditingAnchorEl: null,
      },
      () => {
        this._saveChangesToHistory(() => this._eventsTree.forceEventsUpdate());
      }
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

    this._saveChangesToHistory(() => this._eventsTree.forceEventsUpdate());
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
    getSelectedInstructionsContexts(
      this.state.selection
    ).forEach(instructionContext => {
      instructionContext.instrsList.insertInstructions(
        instructionsList,
        0,
        instructionsList.size(),
        instructionContext.indexInList
      );
    });
    getSelectedInstructionsListsContexts(
      this.state.selection
    ).forEach(instructionsListContext => {
      instructionsListContext.instrsList.insertInstructions(
        instructionsList,
        0,
        instructionsList.size(),
        instructionsListContext.instrsList.size()
      );
    });
    instructionsList.delete();

    this._saveChangesToHistory(() => this._eventsTree.forceEventsUpdate());
  };

  pasteEventsOrInstructions = () => {
    if (hasEventSelected(this.state.selection)) this.pasteEvents();
    else if (hasInstructionSelected(this.state.selection))
      this.pasteInstructions();
    else if (hasInstructionsListSelected(this.state.selection))
      this.pasteInstructions();
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
    const { events, project } = this.props;
    const newHistory = undo(this.state.history, events, project);

    // /!\ Events were changed, so any reference to an existing event can now
    // be invalid. Make sure to immediately trigger a forced update before
    // any re-render that could use a deleted/invalid event.
    this._eventsTree.forceEventsUpdate();

    this.setState({ history: newHistory }, () => this.updateToolbar());
  };

  redo = () => {
    const { events, project } = this.props;
    const newHistory = redo(this.state.history, events, project);

    // /!\ Events were changed, so any reference to an existing event can now
    // be invalid. Make sure to immediately trigger a forced update before
    // any re-render that could use a deleted/invalid event.
    this._eventsTree.forceEventsUpdate();

    this.setState({ history: newHistory }, () => this.updateToolbar());
  };

  render() {
    const {
      project,
      layout,
      events,
      onOpenExternalEvents,
      onOpenLayout,
    } = this.props;
    if (!project) return null;

    return (
      <div
        className="gd-events-sheet"
        onFocus={() => this._keyboardShortcuts.focus()}
        onBlur={() => this._keyboardShortcuts.blur()}
        tabIndex={1}
      >
        <FullSizeEventsTree
          wrappedComponentRef={eventsTree => (this._eventsTree = eventsTree)}
          key={events.ptr}
          events={events}
          project={project}
          layout={layout}
          selection={this.state.selection}
          onInstructionClick={this.selectInstruction}
          onInstructionDoubleClick={this.openInstructionEditor}
          onInstructionContextMenu={this.openInstructionContextMenu}
          onInstructionsListContextMenu={this.openInstructionsListContextMenu}
          onAddNewInstruction={this.openInstructionEditor}
          onParameterClick={this.openParameterEditor}
          onEventClick={this.selectEvent}
          onEventContextMenu={this.openEventContextMenu}
          onAddNewEvent={context =>
            this.addNewEvent('BuiltinCommonInstructions::Standard', context)}
          onOpenExternalEvents={onOpenExternalEvents}
          onOpenLayout={onOpenLayout}
        />
        {events && events.getEventsCount() === 0 && <EmptyEventsPlaceholder />}
        <InlineParameterEditor
          open={this.state.inlineEditing}
          anchorEl={this.state.inlineEditingAnchorEl}
          onRequestClose={this.closeParameterEditor}
          project={project}
          layout={layout}
          {...this.state.editedParameter}
          onChange={value => {
            const { instruction, parameterIndex } = this.state.editedParameter;
            instruction.setParameter(parameterIndex, value);
            this.setState({
              inlineEditingChangesMade: true,
            });
          }}
        />
        <ContextMenu
          ref={eventContextMenu => (this.eventContextMenu = eventContextMenu)}
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
          ]}
        />
        <ContextMenu
          ref={instructionContextMenu =>
            (this.instructionContextMenu = instructionContextMenu)}
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
          ]}
        />
        <ContextMenu
          ref={instructionsListContextMenu =>
            (this.instructionsListContextMenu = instructionsListContextMenu)}
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
            {...this.state.editedInstruction}
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
              if (indexInList !== undefined) {
                // Replace an existing instruction
                instrsList.set(indexInList, instruction);
              } else {
                // Add a new instruction
                instrsList.insert(instruction, instrsList.size());
              }

              this.closeInstructionEditor(true);
              this._eventsTree.forceEventsUpdate();
            }}
          />
        )}
      </div>
    );
  }
}
