import React from 'react';
import FullSizeEventsTree from './EventsTree/FullSizeEventsTree';
import InstructionEditorDialog
  from './InstructionEditor/InstructionEditorDialog';
import BaseEditor from '../MainFrame/BaseEditor';
import Toolbar from './Toolbar';
const gd = global.gd;

export default class EventsSheet extends BaseEditor {
  constructor() {
    super();
    this.state = {
      newInstruction: {
        isCondition: true,
        instruction: null,
        instructionsList: null,
      },
      editedInstruction: {
        isCondition: true,
        instruction: null,
        instructionsList: null,
      },
    };
  }

  updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        onAddStandardEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Standard')}
        onAddSubEvent={() => {
          /*TODO*/
        }}
        onAddCommentEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Comment')}
        canUndo={false /*TODO*/}
        canRedo={false /*TODO*/}
        undo={this.undo}
        redo={this.redo}
      />
    );
  }

  addNewEvent = (type, context) => {
    const { project } = this.props;
    const eventsList = context && context.events
      ? context.event.getSubEvents()
      : this.props.events;
    eventsList.insertNewEvent(project, type, eventsList.getEventsCount());
    this._eventTree.forceEventsUpdate();
  };

  //TODO: Refactor openInstructionEditor/openNewInstructionEditor in a single function?
  openInstructionEditor(
    isCondition,
    instruction,
    instructionsList,
    cb = undefined
  ) {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState(
      {
        editedInstruction: {
          isCondition,
          instruction: instruction.clone(),
          instructionsList,
        },
      },
      cb
    );
  }

  closeInstructionEditor(cb = undefined) {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState(
      {
        editedInstruction: {
          isCondition: true,
          instruction: null,
          instructionsList: null,
        },
      },
      cb
    );
  }

  openNewInstructionEditor(isCondition, instructionsList, cb = undefined) {
    if (this.state.newInstruction.instruction) {
      this.state.newInstruction.instruction.delete();
    }

    this.setState(
      {
        newInstruction: {
          isCondition,
          instruction: new gd.Instruction(),
          instructionsList,
        },
      },
      cb
    );
  }

  closeNewInstructionEditor(cb = undefined) {
    if (this.state.newInstruction.instruction) {
      this.state.newInstruction.instruction.delete();
    }

    this.setState(
      {
        newInstruction: {
          isCondition: true,
          instruction: null,
          instructionsList: null,
        },
      },
      cb
    );
  }

  render() {
    const { project, layout, events } = this.props;
    if (!project) return null;

    return (
      <div>
        <FullSizeEventsTree
          eventsTreeRef={eventTree => this._eventTree = eventTree}
          events={events}
          layout={layout}
          onInstructionClick={context => {
            this.openInstructionEditor(
              context.areConditions,
              context.instruction,
              context.instrsList
            );
          }}
          onAddNewInstruction={context => {
            this.openNewInstructionEditor(
              context.areConditions,
              context.instrsList
            );
          }}
          onAddNewEvent={context =>
            this.addNewEvent('BuiltinCommonInstructions::Standard', context)}
        />
        {this.state.newInstruction.instruction &&
          <InstructionEditorDialog
            {...this.state.newInstruction}
            open={true}
            onCancel={() => this.closeNewInstructionEditor()}
            submitDisabled={!this.state.newInstruction.instruction.getType()}
            onSubmit={() => {
              const {
                instructionsList,
                instruction,
              } = this.state.newInstruction;
              instructionsList.insert(instruction, instructionsList.size());
              this.closeNewInstructionEditor();
            }}
          />}
        {this.state.editedInstruction.instruction &&
          <InstructionEditorDialog
            {...this.state.editedInstruction}
            open={true}
            onCancel={() => this.closeInstructionEditor()}
            submitDisabled={!this.state.editedInstruction.instruction.getType()}
            onSubmit={() => {
              const {
                instructionsList,
                instruction,
              } = this.state.editedInstruction;
              instructionsList.insert(instruction, instructionsList.size());
              this.closeInstructionEditor();
            }}
          />}
      </div>
    );
  }
}
