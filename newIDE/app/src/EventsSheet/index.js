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
    this._eventsTree.forceEventsUpdate();
  };

  openInstructionEditor = (
    {
      instrsList,
      isCondition,
      instruction,
      indexInList,
    }
  ) => {
    if (this.state.editedInstruction.instruction) {
      this.state.editedInstruction.instruction.delete();
    }

    this.setState({
      editedInstruction: {
        instrsList,
        isCondition,
        instruction: instruction ? instruction.clone() : new gd.Instruction(),
        indexInList,
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

  render() {
    const { project, layout, events } = this.props;
    if (!project) return null;

    return (
      <div>
        <FullSizeEventsTree
          eventsTreeRef={eventsTree => this._eventsTree = eventsTree}
          events={events}
          layout={layout}
          onInstructionClick={this.openInstructionEditor}
          onAddNewInstruction={this.openInstructionEditor}
          onAddNewEvent={context =>
            this.addNewEvent('BuiltinCommonInstructions::Standard', context)}
        />
        {this.state.editedInstruction.instruction &&
          <InstructionEditorDialog
            project={project}
            layout={layout}
            {...this.state.editedInstruction}
            isNewInstruction={this.state.editedInstruction.indexInList === undefined}
            open={true}
            onCancel={() => this.closeInstructionEditor()}
            submitDisabled={!this.state.editedInstruction.instruction.getType()}
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
