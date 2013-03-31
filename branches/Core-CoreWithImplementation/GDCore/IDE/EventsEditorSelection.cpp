/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/Events/Event.h"
#include <iostream>
#include <map>
#include <list>

void EventsEditorSelection::ClearSelection(bool refresh)
{
    eventsSelected.clear();
    instructionsSelected.clear();

    if ( refresh ) eventsEditorCallback.Refresh();
}

void EventsEditorSelection::AddEvent(const EventItem & eventSelection)
{
    if ( eventSelection.event == boost::shared_ptr<gd::BaseEvent>() || eventSelection.eventsList == NULL )
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
/**
 * Return a vector with all selected events
 */
std::vector < EventItem > EventsEditorSelection::GetAllSelectedEvents()
{
    std::vector < EventItem > results;
    for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
        results.push_back(*it);

    return results;
}

std::vector < EventItem > EventsEditorSelection::GetAllSelectedEventsWithoutSubEvents()
{
    std::vector < EventItem > results;
    for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        bool isAlreadyIncludedAsSubEvent = false;
        for (boost::unordered_set< EventItem >::iterator it2 = eventsSelected.begin();it2!=eventsSelected.end();++it2)
        {
            if ((*it).event != (*it2).event &&
                (*it2).event != boost::shared_ptr<gd::BaseEvent>() &&
                (*it2).event->CanHaveSubEvents() )
            {
                if ( FindInEventsAndSubEvents((*it2).event->GetSubEvents(), (*it).event) )
                    isAlreadyIncludedAsSubEvent = true;

            }
        }

        if (!isAlreadyIncludedAsSubEvent)
            results.push_back(*it);
    }

    return results;
}

/**
 * Return a vector with all selected instructions
 */
std::vector < InstructionItem > EventsEditorSelection::GetAllSelectedInstructions()
{
    std::vector < InstructionItem > results;
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        results.push_back(*it);

    return results;
}

bool EventsEditorSelection::HasSelectedActions()
{
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        if ( !it->isCondition ) return true;

    return false;
}

bool EventsEditorSelection::HasSelectedConditions()
{
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        if ( it->isCondition ) return true;

    return false;
}

bool EventsEditorSelection::InstructionSelected(const InstructionItem & instr)
{
    return instructionsSelected.find(instr) != instructionsSelected.end();
}

void EventsEditorSelection::SetHighlighted(const EventItem & eventSelection)
{
    eventHighlighted = eventSelection;
}
void EventsEditorSelection::SetHighlighted(const InstructionItem & instructionSelection)
{
    instructionHighlighted = instructionSelection;
}
void EventsEditorSelection::SetHighlighted(const InstructionListItem & item)
{
    instructionListHighlighted = item;
}
void EventsEditorSelection::SetHighlighted(const ParameterItem & parameterItem)
{
    parameterHighlighted = parameterItem;
}

void EventsEditorSelection::BeginDragEvent()
{
    dragging = true;
}

bool EventsEditorSelection::IsDraggingEvent()
{
    return dragging;
}

bool EventsEditorSelection::EndDragEvent(bool deleteDraggedEvent, bool dropAfterHighlightedElement)
{
    if (!dragging) return false;
    dragging = false;

    if ( eventHighlighted.eventsList == NULL ) return false;

    //Be sure we do not try to drag inside an event selected
    for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        if ( (*it).event == boost::shared_ptr<gd::BaseEvent>() )
        {
            std::cout << "WARNING: Bad event in selection";
            continue;
        }

        if ( (*it).event == eventHighlighted.event || ((*it).event->CanHaveSubEvents() && FindInEventsAndSubEvents((*it).event->GetSubEvents(), eventHighlighted.event)) )
        {
            return false;
        }
    }

    //Insert dragged events
    size_t positionInList = !dropAfterHighlightedElement ? eventHighlighted.positionInList : eventHighlighted.positionInList+1;
    for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        if ( (*it).event != boost::shared_ptr<gd::BaseEvent>() )
        {
            boost::shared_ptr<gd::BaseEvent> newEvent = (*it).event->Clone();
            if ( positionInList < eventHighlighted.eventsList->size() )
                eventHighlighted.eventsList->insert(eventHighlighted.eventsList->begin()+positionInList, newEvent);
            else
                eventHighlighted.eventsList->push_back(newEvent);
        }
    }

    //Remove them from their initial position
    if ( deleteDraggedEvent )
    {
        for (boost::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
        {
            if ( (*it).event != boost::shared_ptr<gd::BaseEvent>() && (*it).eventsList != NULL)
                (*it).eventsList->erase(std::remove((*it).eventsList->begin(), (*it).eventsList->end(), (*it).event) , (*it).eventsList->end());
        }
    }

    ClearSelection();

    return true;
}

void EventsEditorSelection::BeginDragInstruction()
{
    draggingInstruction = true;
}

bool EventsEditorSelection::IsDraggingInstruction()
{
    return draggingInstruction;
}

bool EventsEditorSelection::EndDragInstruction(bool deleteDraggedInstruction, bool dropAfterHighlightedElement)
{
    if (!draggingInstruction) return false;
    draggingInstruction = false;

    //Find where to drag
    std::vector<gd::Instruction> * list = NULL;
    size_t positionInList = std::string::npos;
    if ( instructionHighlighted.instructionList != NULL )
    {
        list = instructionHighlighted.instructionList;
        positionInList = instructionHighlighted.positionInList;
        if ( instructionHighlighted.event != NULL ) instructionHighlighted.event->eventHeightNeedUpdate = true;
        else std::cout << "WARNING : Instruction hightlighted event is not valid! " << std::endl;

        if ( dropAfterHighlightedElement ) positionInList++;
    }
    else if ( instructionListHighlighted.instructionList != NULL )
    {
        list = instructionListHighlighted.instructionList;
        if ( instructionListHighlighted.event != NULL ) instructionListHighlighted.event->eventHeightNeedUpdate = true;
        else std::cout << "WARNING : Instruction list hightlighted event is not valid! " << std::endl;
    }
    else return false;

    //Be sure we do not try to drag inside an instruction selected
    if (instructionHighlighted.instruction != NULL)
    {
        for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        {
            if ( (*it).instruction == NULL )
            {
                std::cout << "WARNING: Bad instr in selection";
                continue;
            }

            if ( (*it).instruction == instructionHighlighted.instruction || (FindInInstructionsAndSubInstructions((*it).instruction->GetSubInstructions(), instructionHighlighted.instruction)) )
            {
                return false;
            }
            if  (FindInInstructionsAndSubInstructions(instructionHighlighted.instruction->GetSubInstructions(), (*it).instruction) )
            {
                return false;
            }
        }
    }

    //Copy dragged instructions
    std::vector<gd::Instruction> draggedInstructions;
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
    {
        if ( (*it).instruction != NULL )
            draggedInstructions.push_back(*(*it).instruction);
    }

    //Insert dragged instructions into their new list.
    for (unsigned int i = 0;i<draggedInstructions.size();++i)
    {
        if ( positionInList < list->size() )
            list->insert(list->begin()+positionInList, draggedInstructions[i]);
        else
            list->push_back(draggedInstructions[i]);
    }

    if ( deleteDraggedInstruction )
    {
        //Update selection as some selected instruction can have become invalid
        boost::unordered_set< InstructionItem > newInstructionsSelected;
        for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        {
            if ((*it).instructionList == instructionHighlighted.instructionList && (*it).positionInList > instructionHighlighted.positionInList)
            {
                InstructionItem newItem = (*it);
                newItem.instruction = NULL;
                newItem.positionInList += draggedInstructions.size();
                newInstructionsSelected.insert(newItem);
            }
            else newInstructionsSelected.insert(*it);
        }
        instructionsSelected = newInstructionsSelected;

        //Remove dragged instructions
        DeleteAllInstructionSelected();
    }

    ClearSelection();

    return true;
}

void EventsEditorSelection::InstructionHighlightedOnBottomPart(bool isOnbottomHandSide)
{
    isOnbottomHandSideOfInstruction = isOnbottomHandSide;
}

void EventsEditorSelection::EventHighlightedOnBottomPart(bool isOnbottomHandSide)
{
    isOnbottomHandSideOfEvent = isOnbottomHandSide;
}

void EventsEditorSelection::DeleteAllInstructionSelected()
{
    //1) Construct a map with their list and their index in the list
    std::map< std::vector<gd::Instruction>*, std::list<unsigned int> > mapOfDeletionsRequest;
    for (boost::unordered_set< InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
    {
        if ( (*it).event != NULL ) (*it).event->eventHeightNeedUpdate = true;
        if ( (*it).instructionList != NULL)
            mapOfDeletionsRequest[(*it).instructionList].push_back((*it).positionInList);
    }
    //2) For each list, erase each index
    for (std::map<std::vector<gd::Instruction>*,std::list<unsigned int> >::iterator it = mapOfDeletionsRequest.begin();it!=mapOfDeletionsRequest.end();++it)
    {
        std::list<unsigned int> & listOfIndexesToDelete = it->second;
        listOfIndexesToDelete.sort();
        listOfIndexesToDelete.reverse(); //We have erase from end to start to prevent index changing

        for (std::list<unsigned int>::iterator index = listOfIndexesToDelete.begin();index!=listOfIndexesToDelete.end();++index)
            it->first->erase(it->first->begin()+*index);
    }
}

EventsEditorSelection::EventsEditorSelection(GDpriv::EventsEditorRefreshCallbacks & eventsEditorCallback_) :
    dragging(false),
    draggingInstruction(false),
    eventsEditorCallback(eventsEditorCallback_)
{
}

bool EventsEditorSelection::FindInEventsAndSubEvents(std::vector<boost::shared_ptr<gd::BaseEvent> > & list, boost::shared_ptr<gd::BaseEvent> eventToSearch)
{
    for (unsigned int i = 0;i<list.size();++i)
    {
        if ( list[i] == eventToSearch) return true;
        if ( list[i]->CanHaveSubEvents() && FindInEventsAndSubEvents(list[i]->GetSubEvents(), eventToSearch) )
            return true;
    }

    return false;
}

bool EventsEditorSelection::FindInInstructionsAndSubInstructions(std::vector<gd::Instruction> & list, const gd::Instruction * instrToSearch)
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
