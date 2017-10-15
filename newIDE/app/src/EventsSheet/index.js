import React, { Component } from 'react';
import FullSizeEventsTree from './EventsTree/FullSizeEventsTree';
import InstructionEditorDialog
  from './InstructionEditor/InstructionEditorDialog';
import '../UI/Theme/EventsSheet.css';
import { container } from './ClassNames';
import Toolbar from './Toolbar';
import KeyboardShortcuts from './KeyboardShortcuts';
import InlineParameterEditor from './InlineParameterEditor';
import ContextMenu from '../UI/Menu/ContextMenu';
import Clipboard from '../Utils/Clipboard';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
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
const gd = global.gd;

const CLIPBOARD_KIND = 'EventsAndInstructions';

export default class EventsSheet extends Component {
  constructor() {
    super();
    this.state = {
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
    };
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
        canUndo={false /*TODO*/}
        canRedo={false /*TODO*/}
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

    this._eventsTree.forceEventsUpdate();
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

    this._eventsTree.forceEventsUpdate(() => {
      if (!context && !hasEventsSelected) {
        this._eventsTree.scrollToEvent(newEvents[0]);
      }
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

  closeInstructionEditor() {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState({
      editedInstruction: {
        isCondition: true,
        instruction: null,
        instrsList: null,
      },
    });
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
    });
  };

  closeParameterEditor = () => {
    this.setState({
      inlineEditing: false,
      inlineEditingAnchorEl: null,
    });
  };

  deleteSelection = () => {
    const eventsRemover = new gd.EventsRemover();
    getSelectedEvents(this.state.selection).forEach(event =>
      eventsRemover.addEventToRemove(event));
    getSelectedInstructions(this.state.selection).forEach(instruction =>
      eventsRemover.addInstructionToRemove(instruction));

    eventsRemover.launch(this.props.events);
    this.setState(
      {
        selection: clearSelection(),
        inlineEditing: false,
        inlineEditingAnchorEl: null,
      },
      () => {
        this.updateToolbar();
        this._eventsTree.forceEventsUpdate();
      }
    );
  };

  copySelection = () => {
    const eventsList = new gd.EventsList();
    const instructionsList = new gd.InstructionsList();

    getSelectedEvents(this.state.selection).forEach(event =>
      eventsList.insertEvent(event, eventsList.getEventsCount()));
    getSelectedInstructions(this.state.selection).forEach(instruction =>
      instructionsList.insert(instruction, instructionsList.size()));

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
      !hasEventSelected(this.state.selection) || !Clipboard.has(CLIPBOARD_KIND)
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

    this._eventsTree.forceEventsUpdate();
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

    this._eventsTree.forceEventsUpdate();
  };

  pasteEventsOrInstructions = () => {
    if (hasEventSelected(this.state.selection)) this.pasteEvents();
    else if (hasInstructionSelected(this.state.selection)) this.pasteInstructions();
    else if (hasInstructionsListSelected(this.state.selection)) this.pasteInstructions();
  }

  render() {
    const { project, layout, events } = this.props;
    if (!project) return null;

    return (
      <div className={container}>
        <FullSizeEventsTree
          eventsTreeRef={eventsTree => this._eventsTree = eventsTree}
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
        />
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
            this.forceUpdate();
          }}
        />
        <KeyboardShortcuts
          ref={keyboardShortcuts => this._keyboardShortcuts = keyboardShortcuts}
          onDelete={() => {
            if (
              this.state.inlineEditing ||
              this.state.editedInstruction.instruction
            )
              return;

            this.deleteSelection();
          }}
          onCopy={this.copySelection}
          onCut={this.cutSelection}
          onPaste={this.pasteEventsOrInstructions}
        />
        <ContextMenu
          ref={eventContextMenu => this.eventContextMenu = eventContextMenu}
          menuTemplate={[
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
              accelerator: 'CmdOrCtrl+V',
            },
            { type: 'separator' },
            {
              label: 'Delete',
              click: () => this.deleteSelection(),
              accelerator: 'Delete',
            },
          ]}
        />
        <ContextMenu
          ref={instructionContextMenu =>
            this.instructionContextMenu = instructionContextMenu}
          menuTemplate={[
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
              accelerator: 'CmdOrCtrl+V',
            },
            { type: 'separator' },
            {
              label: 'Delete',
              click: () => this.deleteSelection(),
              accelerator: 'Delete',
            },
          ]}
        />
        <ContextMenu
          ref={instructionsListContextMenu =>
            this.instructionsListContextMenu = instructionsListContextMenu}
          menuTemplate={[
            {
              label: 'Paste',
              click: () => this.pasteInstructions(),
              accelerator: 'CmdOrCtrl+V',
            },
          ]}
        />
        {this.state.editedInstruction.instruction &&
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

              this.closeInstructionEditor();
              this._eventsTree.forceEventsUpdate();
            }}
          />}
      </div>
    );
  }
}
