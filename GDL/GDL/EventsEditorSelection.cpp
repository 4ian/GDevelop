/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "GDL/EventsEditorSelection.h"
#include "GDL/EventsEditorItemsAreas.h"
#include "GDL/Event.h"
#include <iostream>

void EventsEditorSelection::ClearSelection(bool refresh)
{
    eventsSelected.clear();
    instructionsSelected.clear();

    if ( refresh ) eventsEditorCallback.Refresh();
}

void EventsEditorSelection::AddEvent(const EventItem & eventSelection)
{
    if ( eventSelection.event == boost::shared_ptr<BaseEvent>() || eventSelection.eventsList == NULL )
    {
        std::cout << "WARNING, attempted to add a bad event to selection";
        return;
    }

    if ( !EventSelected(eventSelection))
    {
        eventsSelected.insert(eventSelection);
        eventsEditorCallback.Refresh();
    }
}

/**
 * True if an event is selected
 */
bool EventsEditorSelection::EventSelected(const EventItem & event)
{
    return eventsSelected.find(event) != eventsSelected.end();
}

void EventsEditorSelection::AddInstruction(const InstructionItem & instr)
{
    if ( instr.instruction == NULL || instr.instructionList == NULL )
    {
        std::cout << "WARNING, attempted to add a bad instruction to selection";
        return;
    }

    if ( !InstructionSelected(instr))
    {
        instructionsSelected.insert(instr);
        eventsEditorCallback.Refresh();
    }
}

bool EventsEditorSelection::InstructionSelected(const InstructionItem & instr)
{
    return instructionsSelected.find(instr) != instructionsSelected.end();
}

void EventsEditorSelection::SetHighlighted(const EventItem & eventSelection)
{
    eventHighlighted = eventSelection;

    eventsEditorCallback.Refresh();
}
void EventsEditorSelection::SetHighlighted(const InstructionItem & instructionSelection)
{
    instructionHighlighted = instructionSelection;

    eventsEditorCallback.Refresh();
}

void EventsEditorSelection::BeginDragEvent()
{
    dragging = true;
}

bool EventsEditorSelection::IsDraggingEvent()
{
    return dragging;
}

void EventsEditorSelection::EndDragEvent()
{
    if (!dragging) return;
    dragging = false;

    std::cout << "endDragSTART" << std::endl;

    if ( eventHighlighted.eventsList == NULL ) return;

    //Be sure we do not try to drag inside an event selected
    for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        if ( (*it).event == boost::shared_ptr<BaseEvent>() )
        {
            std::cout << "WARNING: Bad event in selection";
            continue;
        }

        if ( (*it).event == eventHighlighted.event || ((*it).event->CanHaveSubEvents() && FindInEventsAndSubEvents((*it).event->GetSubEvents(), eventHighlighted.event)) )
        {
            std::cout << "Cannot drag here" << std::endl;
            return;
        }
    }

    //Insert dragged events
    for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        if ( (*it).event != boost::shared_ptr<BaseEvent>() )
        {
            boost::shared_ptr<BaseEvent> newEvent = (*it).event->Clone();
            eventHighlighted.eventsList->insert(eventHighlighted.eventsList->begin()+eventHighlighted.positionInList, newEvent);
        }
    }

    //Remove them from their initial position
    for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        if ( (*it).event != boost::shared_ptr<BaseEvent>() && (*it).eventsList != NULL)
            (*it).eventsList->erase(std::remove((*it).eventsList->begin(), (*it).eventsList->end(), (*it).event) , (*it).eventsList->end());
    }

    std::cout << "endDragEND" << std::endl;
    ClearSelection();
}

void EventsEditorSelection::BeginDragInstruction()
{
    draggingInstruction = true;
}

bool EventsEditorSelection::IsDraggingInstruction()
{
    return draggingInstruction;
}

void EventsEditorSelection::EndDragInstruction()
{
    if (!draggingInstruction) return;
    draggingInstruction = false;

    std::cout << "endDragSTART" << std::endl;

    if ( instructionHighlighted.instruction == NULL ) return;

    //Be sure we do not try to drag inside an event selected
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
    {
        if ( (*it).instruction == NULL )
        {
            std::cout << "WARNING: Bad instr in selection";
            continue;
        }

        if ( (*it).instruction == instructionHighlighted.instruction || (FindInInstructionsAndSubInstructions((*it).instruction->GetSubInstructions(), instructionHighlighted.instruction)) )
        {
            std::cout << "Cannot drag here" << std::endl;
            return;
        }
    }

    //Insert dragged events
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
    {
        if ( (*it).instruction != NULL )
        {
            Instruction newInstruction = *(*it).instruction;
            instructionHighlighted.instructionList->insert(instructionHighlighted.instructionList->begin()+instructionHighlighted.positionInList, newInstruction);
        }
    }

    //Remove them from their initial position
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
    {
        if ( (*it).instruction != NULL && (*it).instructionList != NULL)
        {
            for (unsigned int i = 0;i<(*it).instructionList->size();)
            {
                if ( &(*it).instructionList->at(i) == (*it).instruction )
                    (*it).instructionList->erase((*it).instructionList->begin()+i);
                else
                    ++i;
            }
        }
    }

    std::cout << "endDragEND" << std::endl;
    ClearSelection();
}

EventsEditorSelection::EventsEditorSelection(GDpriv::EventsEditorRefreshCallbacks & eventsEditorCallback_) :
    dragging(false),
    draggingInstruction(false),
    eventsEditorCallback(eventsEditorCallback_)
{
}

bool EventsEditorSelection::FindInEventsAndSubEvents(std::vector<boost::shared_ptr<BaseEvent> > & list, boost::shared_ptr<BaseEvent> eventToSearch)
{
    for (unsigned int i = 0;i<list.size();++i)
    {
        if ( list[i] == eventToSearch) return true;
        if ( list[i]->CanHaveSubEvents() && FindInEventsAndSubEvents(list[i]->GetSubEvents(), eventToSearch) )
            return true;
    }

    return false;
}

bool EventsEditorSelection::FindInInstructionsAndSubInstructions(std::vector<Instruction> & list, Instruction * instrToSearch)
{
    for (unsigned int i = 0;i<list.size();++i)
    {
        if ( &list[i] == instrToSearch) return true;
        if ( FindInInstructionsAndSubInstructions(list[i].GetSubInstructions(), instrToSearch) )
            return true;
    }

    return false;
}

#endif
