import React, { Component } from 'react';
import EventsSheet from './EventsSheet.js';
import InstructionEditorDialog from './InstructionEditor/InstructionEditorDialog.js';
const gd = global.gd;

export default class EventsSheetContainer extends Component {
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
      }
    };
  }

  //TODO: Refactor openInstructionEditor/openNewInstructionEditor in a single function?
  openInstructionEditor(isCondition, instruction, instructionsList, cb = undefined) {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState({
      editedInstruction: {
        isCondition,
        instruction: instruction.clone(),
        instructionsList,
      }
    }, cb);
  }

  closeInstructionEditor(cb = undefined) {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState({
      editedInstruction: {
        isCondition: true,
        instruction: null,
        instructionsList: null,
      }
    }, cb);
  }

  openNewInstructionEditor(isCondition, instructionsList, cb = undefined) {
    if (this.state.newInstruction.instruction) {
      this.state.newInstruction.instruction.delete();
    }

    this.setState({
      newInstruction: {
        isCondition,
        instruction: new gd.Instruction(),
        instructionsList,
      }
    }, cb);
  }

  closeNewInstructionEditor(cb = undefined) {
    if (this.state.newInstruction.instruction) {
      this.state.newInstruction.instruction.delete();
    }

    this.setState({
      newInstruction: {
        isCondition: true,
        instruction: null,
        instructionsList: null,
      }
    }, cb);
  }

  render() {
    const {project, layout, events} = this.props;
    if (!project) return null;

    return (
      <div>
        <EventsSheet
          events={events}
          layout={layout}
          callbacks={{
            onInstructionClicked: (context) => {
              this.openInstructionEditor(context.areConditions,
                context.instruction, context.instrsList);
            },
            onInstructionLongClicked: () => console.log('onInstructionLongClicked'),
            onAddNewInstruction: (context) => {
              this.openNewInstructionEditor(context.areConditions, context.instrsList);
            },
            onEventClicked: () => console.log('onEventClicked'),
            onEventLongClicked: () => console.log('onEventLongClicked'),
            onAddNewEvent: (context) => {
              var eventsList = context.event.getSubEvents() || layout.getEvents();
              eventsList.insertNewEvent(project, "BuiltinCommonInstructions::Standard", 0);
              this.forceUpdate();
            },
            onToggleEventFolding: () => console.log('onToggleEventFolding'),
            onEditEventTemplate: () => console.log('onEditEventTemplate')
          }}
        />
        {
          this.state.newInstruction.instruction && (
            <InstructionEditorDialog
              {...this.state.newInstruction}
              open={true}
              onCancel={() => this.closeNewInstructionEditor()}
              submitDisabled={!this.state.newInstruction.instruction.getType()}
              onSubmit={() => {
                const { instructionsList, instruction } = this.state.newInstruction;
                instructionsList.insert(instruction, instructionsList.size());
                this.closeNewInstructionEditor();
              }}
            />
          )
        }
        {
          this.state.editedInstruction.instruction && (
            <InstructionEditorDialog
              {...this.state.editedInstruction}
              open={true}
              onCancel={() => this.closeInstructionEditor()}
              submitDisabled={!this.state.editedInstruction.instruction.getType()}
              onSubmit={() => {
                const { instructionsList, instruction } = this.state.editedInstruction;
                instructionsList.insert(instruction, instructionsList.size());
                this.closeInstructionEditor();
              }}
            />
          )
        }
      </div>
    )
  }
}
