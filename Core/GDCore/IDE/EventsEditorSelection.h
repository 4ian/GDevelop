/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EVENTSEDITORSELECTION_H
#define EVENTSEDITORSELECTION_H
#include <set>
#include <boost/weak_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/unordered_set.hpp>
#include "GDCore/IDE/EventsEditorItemsAreas.h"
namespace gd { class BaseEvent; }
namespace GDpriv
{
class EventsEditorRefreshCallbacks;
}

class GD_CORE_API EventsEditorSelection
{
    public:
        EventsEditorSelection(GDpriv::EventsEditorRefreshCallbacks & eventsEditorCallback_);
        virtual ~EventsEditorSelection() {};

        /**
         * Clear selection
         */
        void ClearSelection(bool refresh = true);

        /**
         * Add an event to selection
         */
        void AddEvent(const EventItem & event);

        /**
         * Add an instruction to selection
         */
        void AddInstruction(const InstructionItem & event);

        /**
         * Return true if an event is selected
         */
        bool EventSelected(const EventItem & event);

        /**
         * Return true if an instruction is selected
         */
        bool InstructionSelected(const InstructionItem & event);

        /**
         * Highlight an event
         */
        void SetHighlighted(const EventItem & event);

        /**
         * Highlight an instruction
         */
        void SetHighlighted(const InstructionItem & item);

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
        bool EventHighlighted(const EventItem & event) { return eventHighlighted == event; };

        /**
         * Return true if the mouse is on the bottom hand side of the event highlighted. ( Used to known if we have to drop the dragged event(s) afer or before the highlighted one )
         */
        bool IsEventHighlightedOnBottomPart(){ return isOnbottomHandSideOfEvent; };

        /**
         * Return true if an instruction item is highlighted
         */
        bool InstructionHighlighted(const InstructionItem & instr) { return instructionHighlighted == instr; };

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
        EventItem & GetHighlightedEvent() { return eventHighlighted; };

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
        std::vector < InstructionItem > GetAllSelectedInstructions();

        /**
         * As it is more difficult than for event, this function is dedicaced to deleting all instructions selected
         */
        void DeleteAllInstructionSelected();

        void BeginDragEvent();
        bool IsDraggingEvent();
        bool EndDragEvent(bool deleteDraggedEvent = true, bool dropAfterHighlightedElement = false);

        void BeginDragInstruction();
        bool IsDraggingInstruction();
        bool EndDragInstruction(bool deleteDraggedInstruction = true, bool dropAfterHighlightedElement = false);

    private:

        boost::unordered_set< EventItem > eventsSelected; ///< Events selection
        boost::unordered_set< InstructionItem > instructionsSelected; ///< Events selection

        EventItem eventHighlighted;
        bool isOnbottomHandSideOfEvent;
        InstructionItem instructionHighlighted;
        bool isOnbottomHandSideOfInstruction;
        InstructionListItem instructionListHighlighted;
        ParameterItem parameterHighlighted;

        bool dragging; ///< True if dragging event
        bool draggingInstruction; ///< True if dragging instruction

        /**
         * Return true if an event is found in the list ( sub events are also taken in account )
         */
        bool FindInEventsAndSubEvents(std::vector<boost::shared_ptr<gd::BaseEvent> > & list, boost::shared_ptr<gd::BaseEvent> eventToSearch);
        /**
         * Return true if an instruction is found in the list ( sub instructions are also taken in account )
         */
        bool FindInInstructionsAndSubInstructions(std::vector<gd::Instruction> & list, const gd::Instruction * instrToSearch);

        GDpriv::EventsEditorRefreshCallbacks & eventsEditorCallback;
};

namespace GDpriv
{

/**
 * \brief Internal GD class used to notice events editor they must be refreshed.
 */
class GD_CORE_API EventsEditorRefreshCallbacks
{
public:
    EventsEditorRefreshCallbacks() {};
    virtual ~EventsEditorRefreshCallbacks() {};

    virtual void Refresh() = 0;
};

};

#endif // EVENTSEDITORSELECTION_H
#endif
