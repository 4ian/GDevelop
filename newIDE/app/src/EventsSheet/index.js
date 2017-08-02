import React from 'react';
import FullSizeEventsTree from './EventsTree/FullSizeEventsTree';
import InstructionEditorDialog
  from './InstructionEditor/InstructionEditorDialog';
import BaseEditor from '../MainFrame/BaseEditor';
import '../UI/Theme/EventsSheet.css';
import { container } from './ClassNames';
import Toolbar from './Toolbar';
import KeyboardShortcuts from './KeyboardShortcuts';
import InlineParameterEditor from './InlineParameterEditor';
import {
  getInitialSelection,
  selectEvent,
  selectInstruction,
  hasSomethingSelected,
  hasEventSelected,
  getSelectedEvents,
  getSelectedInstructions,
  clearSelection,
  getSelectedEventContexts,
} from './SelectionHandler';
const gd = global.gd;

export default class EventsSheet extends BaseEditor {
  constructor() {
    super();
    this.state = {
      editedInstruction: {
        isCondition: true,
        instruction: null,
        instructionsList: null,
      },
      editedParameter: {
        isCondition: true,
        instruction: null,
        instructionsList: null,
        parameterIndex: 0,
      },
      selection: getInitialSelection(),
      inlineEditing: false,
      inlineEditingAnchorEl: null,
    };
  }

  updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        onAddStandardEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Standard')}
        onAddSubEvent={this.addSubEvents}
        canAddSubEvent={hasEventSelected(this.state.selection)}
        onAddCommentEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Comment')}
        canRemove={hasSomethingSelected(this.state.selection)}
        onRemove={this.deleteSelection}
        canUndo={false /*TODO*/}
        canRedo={false /*TODO*/}
        undo={this.undo}
        redo={this.redo}
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
        context.indexInList
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
        indexInList: instructionContext.isCondition,
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
        instructionsList: null,
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

  render() {
    const { project, layout, events } = this.props;
    if (!project) return null;

    return (
      <div className={container}>
        <FullSizeEventsTree
          eventsTreeRef={eventsTree => this._eventsTree = eventsTree}
          events={events}
          layout={layout}
          selection={this.state.selection}
          onInstructionClick={this.selectInstruction}
          onInstructionDoubleClick={this.openInstructionEditor}
          onAddNewInstruction={this.openInstructionEditor}
          onParameterClick={this.openParameterEditor}
          onEventClick={this.selectEvent}
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
