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
      selectedEvents: [],
      selectedInstructions: [],
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
        canAddSubEvent={!!this.state.selectedEvents.length}
        onAddCommentEvent={() =>
          this.addNewEvent('BuiltinCommonInstructions::Comment')}
        canRemove={
          this.state.selectedEvents.length ||
            this.state.selectedInstructions.length
        }
        onRemove={() => {
          /*TODO*/
        }}
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
    const newEvent = eventsList.insertNewEvent(
      project,
      type,
      eventsList.getEventsCount()
    );

    this._eventsTree.forceEventsUpdate(() =>
      this._eventsTree.scrollToEvent(newEvent));
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

  selectEvent = ({ event }) => {
    // TODO: Multiselection
    this.setState(
      {
        selectedEvents: [event.ptr],
        selectedInstructions: [],
      },
      () => this.updateToolbar()
    );
  };

  selectInstruction = ({ instruction }) => {
    // TODO: Multiselection
    this.setState(
      {
        selectedEvents: [],
        selectedInstructions: [instruction.ptr],
      },
      () => this.updateToolbar()
    );
  };

  render() {
    const { project, layout, events } = this.props;
    if (!project) return null;

    return (
      <div>
        <FullSizeEventsTree
          eventsTreeRef={eventsTree => this._eventsTree = eventsTree}
          events={events}
          layout={layout}
          selectedEvents={this.state.selectedEvents}
          selectedInstructions={this.state.selectedInstructions}
          onInstructionClick={this.selectInstruction}
          onInstructionDoubleClick={this.openInstructionEditor}
          onAddNewInstruction={this.openInstructionEditor}
          onEventClick={this.selectEvent}
          onAddNewEvent={context =>
            this.addNewEvent('BuiltinCommonInstructions::Standard', context)}
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
