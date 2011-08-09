/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EVENTSEDITORSELECTION_H
#define EVENTSEDITORSELECTION_H
#include <set>
#include <boost/weak_ptr.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/unordered_set.hpp>
#include "GDL/EventsEditorItemsAreas.h"
class BaseEvent;
namespace GDpriv
{
class EventsEditorRefreshCallbacks;
}

class GD_API EventsEditorSelection
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
         * Highlight an event
         */
        void SetHighlighted(const InstructionItem & event);

        /**
         * Highlight a parameter
         */
        void SetHighlighted(const ParameterItem & parameter);

        /**
         * Return true if an event is highlighted
         */
        bool EventHighlighted(const EventItem & event) { return eventHighlighted == event; };

        /**
         * Return true if an event is highlighted
         */
        bool InstructionHighlighted(const InstructionItem & instr) { return instructionHighlighted == instr; };

        /**
         * Return true if a parameter is highlighted
         */
        bool ParameterHighLighted(const ParameterItem & parameter) { return parameterHighlighted == parameter; };

        void BeginDragEvent();
        bool IsDraggingEvent();
        void EndDragEvent();

        void BeginDragInstruction();
        bool IsDraggingInstruction();
        void EndDragInstruction();

    private:

        boost::unordered_set< EventItem > eventsSelected; ///< Events selection
        boost::unordered_set< InstructionItem > instructionsSelected; ///< Events selection
        EventItem eventHighlighted;
        InstructionItem instructionHighlighted;
        ParameterItem parameterHighlighted;
        bool dragging; ///< True if dragging event
        bool draggingInstruction; ///< True if dragging instruction

        /**
         * Return true if an event is found in the list ( sub events are also taken in account )
         */
        bool FindInEventsAndSubEvents(std::vector<boost::shared_ptr<BaseEvent> > & list, boost::shared_ptr<BaseEvent> eventToSearch);
        /**
         * Return true if an instruction is found in the list ( sub instructions are also taken in account )
         */
        bool FindInInstructionsAndSubInstructions(std::vector<Instruction> & list, Instruction * instrToSearch);

        GDpriv::EventsEditorRefreshCallbacks & eventsEditorCallback;
};

namespace GDpriv
{

/**
 * Internal GD class to say events editor to refresh itself.
 */
class GD_API EventsEditorRefreshCallbacks
{
public:
    EventsEditorRefreshCallbacks() {};
    virtual ~EventsEditorRefreshCallbacks() {};

    virtual void Refresh() = 0;
};

};

#endif // EVENTSEDITORSELECTION_H
#endif
