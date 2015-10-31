/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#ifndef EVENTSEDITORSELECTION_H
#define EVENTSEDITORSELECTION_H
#include <set>
#include <memory>
#include <memory>
#include "GDCore/IDE/Dialogs/EventsEditor/EventsEditorItemsAreas.h"
#include <unordered_set>
namespace gd { class EventsList; }
namespace gd { class BaseEvent; }
namespace gd { class EventsEditorRefreshCallbacks; }

namespace gd {

/**
 * \brief Represents the selection in an event editor
 *
 * \ingroup IDEDialogsEventsEditor
 */
class GD_CORE_API EventsEditorSelection
{
public:
    EventsEditorSelection(gd::EventsEditorRefreshCallbacks & eventsEditorCallback_);
    virtual ~EventsEditorSelection() {};

    /**
     * Clear selection
     */
    void ClearSelection(bool refresh = true);

    /**
     * Add an event to selection
     */
    void AddEvent(const gd::EventItem & event);

    /**
     * Add an instruction to selection
     */
    void AddInstruction(const gd::InstructionItem & event);

    /**
     * Return true if an event is selected
     */
    bool EventSelected(const gd::EventItem & event);

    /**
     * Return true if an instruction is selected
     */
    bool InstructionSelected(const gd::InstructionItem & event);

    /**
     * Highlight an event
     */
    void SetHighlighted(const gd::EventItem & event);

    /**
     * Highlight an instruction
     */
    void SetHighlighted(const gd::InstructionItem & item);

    /**
     * Highlight an instruction list
     */
    void SetHighlighted(const InstructionListItem & item);

    /**
     * Highlight a parameter
     */
    void SetHighlighted(const ParameterItem & parameter);

    /**
     * Set if the mouse is on the bottom hand side of the instruction, or on the top hand side.
     */
    void InstructionHighlightedOnBottomPart(bool isOnbottomHandSide);

    /**
     * Set if the mouse is on the bottom hand side of the event, or on the top hand side.
     */
    void EventHighlightedOnBottomPart(bool isOnbottomHandSide);

    /**
     * Return true if an event is highlighted
     */
    bool EventHighlighted(const gd::EventItem & event) { return eventHighlighted == event; };

    /**
     * Return true if the mouse is on the bottom hand side of the event highlighted. ( Used to known if we have to drop the dragged event(s) afer or before the highlighted one )
     */
    bool IsEventHighlightedOnBottomPart(){ return isOnbottomHandSideOfEvent; };

    /**
     * Return true if an instruction item is highlighted
     */
    bool InstructionHighlighted(const gd::InstructionItem & instr) { return instructionHighlighted == instr; };

    /**
     * Return true if the mouse is on the bottom hand side of the instruction highlighted
     */
    bool IsInstructionHighlightedOnBottomPart() { return isOnbottomHandSideOfInstruction; };

    /**
     * Return true if an instruction list item is highlighted
     */
    bool InstructionListHighlighted(const InstructionListItem & list) { return instructionListHighlighted == list; };

    /**
     * Return true if a parameter is highlighted
     */
    bool ParameterHighLighted(const ParameterItem & parameter) { return parameterHighlighted == parameter; };

    /**
     * Return highlighted event item
     */
    gd::EventItem & GetHighlightedEvent() { return eventHighlighted; };

    /**
     * Return highlighted instruction list item
     */
    InstructionListItem & GetHighlightedInstructionList() { return instructionListHighlighted; };

    /**
     * Return true if some events are selected
     */
    bool HasSelectedEvents() { return !eventsSelected.empty(); };

    /**
     * Return true if some instructions are selected
     */
    bool HasSelectedInstructions() { return !instructionsSelected.empty(); };

    /**
     * Return true if some actions are selected
     */
    bool HasSelectedActions();

    /**
     * Return true if some conditions are selected
     */
    bool HasSelectedConditions();

    /**
     * Return a vector with all selected events
     */
    std::vector < EventItem > GetAllSelectedEvents();

    /**
     * Return a vector with all selected events but without sub events
     */
    std::vector < EventItem > GetAllSelectedEventsWithoutSubEvents();

    /**
     * Return a vector with all selected instructions
     */
    std::vector < gd::InstructionItem > GetAllSelectedInstructions();

    /**
     * As it is more difficult than for event, this function is dedicaced to deleting all instructions selected
     */
    void DeleteAllInstructionSelected();

    void BeginDragEvent();
    bool IsDraggingEvent();
    bool EndDragEvent(bool deleteDraggedEvent = true, bool dropAfterHighlightedElement = false);

    void BeginDragInstruction();
    bool IsDraggingInstruction();
    gd::InstructionsList * EndDragInstruction(bool deleteDraggedInstruction = true, bool dropAfterHighlightedElement = false);

private:

    std::unordered_set< EventItem > eventsSelected; ///< Events selection
    std::unordered_set< gd::InstructionItem > instructionsSelected; ///< Events selection

    EventItem eventHighlighted;
    bool isOnbottomHandSideOfEvent;
    gd::InstructionItem instructionHighlighted;
    bool isOnbottomHandSideOfInstruction;
    InstructionListItem instructionListHighlighted;
    ParameterItem parameterHighlighted;

    bool dragging; ///< True if dragging event
    bool draggingInstruction; ///< True if dragging instruction

    /**
     * Return true if an event is found in the list ( sub events are also taken in account )
     */
    bool FindInEventsAndSubEvents(const gd::EventsList & list, const gd::BaseEvent & eventToSearch);
    /**
     * Return true if an instruction is found in the list ( sub instructions are also taken in account )
     */
    bool FindInInstructionsAndSubInstructions(gd::InstructionsList & list, const gd::Instruction * instrToSearch);

    gd::EventsEditorRefreshCallbacks & eventsEditorCallback;
};

/**
 * \brief Internal GD class used to notice events editor they must be refreshed.
 *
 * \ingroup IDEDialogs
 */
class GD_CORE_API EventsEditorRefreshCallbacks
{
public:
    EventsEditorRefreshCallbacks() {};
    virtual ~EventsEditorRefreshCallbacks() {};

    virtual void Refresh() = 0;
};

}

#endif // EVENTSEDITORSELECTION_H
#endif
