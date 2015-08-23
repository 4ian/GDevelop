/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "GDCore/IDE/EventsEditorSelection.h"
#include "GDCore/IDE/EventsEditorItemsAreas.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/EventsList.h"
#include <iostream>
#include <map>
#include <list>

namespace gd {

void EventsEditorSelection::ClearSelection(bool refresh)
{
    eventsSelected.clear();
    instructionsSelected.clear();

    if ( refresh ) eventsEditorCallback.Refresh();
}

void EventsEditorSelection::AddEvent(const gd::EventItem & eventSelection)
{
    if ( eventSelection.event == std::shared_ptr<gd::BaseEvent>() || eventSelection.eventsList == NULL )
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
bool EventsEditorSelection::EventSelected(const gd::EventItem & event)
{
    return eventsSelected.find(event) != eventsSelected.end();
}

void EventsEditorSelection::AddInstruction(const gd::InstructionItem & instr)
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
    for (std::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
        results.push_back(*it);

    return results;
}

std::vector < EventItem > EventsEditorSelection::GetAllSelectedEventsWithoutSubEvents()
{
    std::vector < EventItem > results;
    for (std::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        bool isAlreadyIncludedAsSubEvent = false;
        for (std::unordered_set< EventItem >::iterator it2 = eventsSelected.begin();it2!=eventsSelected.end();++it2)
        {
            if ((*it).event != (*it2).event &&
                (*it2).event != std::shared_ptr<gd::BaseEvent>() &&
                (*it2).event->CanHaveSubEvents() )
            {
                if ( (*it2).event->GetSubEvents().Contains(*(*it).event) )
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
std::vector < gd::InstructionItem > EventsEditorSelection::GetAllSelectedInstructions()
{
    std::vector < gd::InstructionItem > results;
    for (std::unordered_set< gd::InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        results.push_back(*it);

    return results;
}

bool EventsEditorSelection::HasSelectedActions()
{
    for (std::unordered_set< gd::InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        if ( !it->isCondition ) return true;

    return false;
}

bool EventsEditorSelection::HasSelectedConditions()
{
    for (std::unordered_set< gd::InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        if ( it->isCondition ) return true;

    return false;
}

bool EventsEditorSelection::InstructionSelected(const gd::InstructionItem & instr)
{
    return instructionsSelected.find(instr) != instructionsSelected.end();
}

void EventsEditorSelection::SetHighlighted(const gd::EventItem & eventSelection)
{
    eventHighlighted = eventSelection;
}
void EventsEditorSelection::SetHighlighted(const gd::InstructionItem & instructionSelection)
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
    for (std::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        if ( (*it).event == std::shared_ptr<gd::BaseEvent>() )
        {
            std::cout << "WARNING: Bad event in selection";
            continue;
        }

        if ( (*it).event == eventHighlighted.event || ((*it).event->CanHaveSubEvents() && (*it).event->GetSubEvents().Contains(*eventHighlighted.event)) )
        {
            return false;
        }
    }

    //Insert copy of dragged events
    size_t positionInList = !dropAfterHighlightedElement ? eventHighlighted.positionInList : eventHighlighted.positionInList+1;
    for (std::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
    {
        if ( (*it).event != std::shared_ptr<gd::BaseEvent>() )
            eventHighlighted.eventsList->InsertEvent(*(*it).event, positionInList);
    }

    //Remove them from their initial position
    if ( deleteDraggedEvent )
    {
        for (std::unordered_set< EventItem >::iterator it = eventsSelected.begin();it!=eventsSelected.end();++it)
        {
            if ( (*it).event != std::shared_ptr<gd::BaseEvent>() && (*it).eventsList != NULL)
                (*it).eventsList->RemoveEvent(*(*it).event);
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

gd::InstructionsList * EventsEditorSelection::EndDragInstruction(bool deleteDraggedInstruction, bool dropAfterHighlightedElement)
{
    if (!draggingInstruction) return NULL;
    draggingInstruction = false;

    //Find where to drag
    gd::InstructionsList * list = NULL;
    size_t positionInList = gd::String::npos;
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
    else return NULL;

    //Be sure we do not try to drag inside an instruction selected
    if (instructionHighlighted.instruction != NULL)
    {
        for (std::unordered_set< gd::InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        {
            if ( (*it).instruction == NULL )
            {
                std::cout << "WARNING: Bad instr in selection";
                continue;
            }

            if ( (*it).instruction == instructionHighlighted.instruction || (FindInInstructionsAndSubInstructions((*it).instruction->GetSubInstructions(), instructionHighlighted.instruction)) )
            {
                return NULL;
            }
            if  (FindInInstructionsAndSubInstructions(instructionHighlighted.instruction->GetSubInstructions(), (*it).instruction) )
            {
                return NULL;
            }
        }
    }

    //Copy dragged instructions
    gd::InstructionsList draggedInstructions;
    for (std::unordered_set< gd::InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
    {
        if ( (*it).instruction != NULL )
            draggedInstructions.Insert(*(*it).instruction);
    }

    //Insert dragged instructions into their new list.
    for (std::size_t i = 0;i<draggedInstructions.size();++i)
    {
        if ( positionInList < list->size() )
            list->Insert(draggedInstructions[i], positionInList);
        else
            list->Insert(draggedInstructions[i]);
    }

    if ( deleteDraggedInstruction )
    {
        //Update selection as some selected instruction can have become invalid
        std::unordered_set< gd::InstructionItem > newInstructionsSelected;
        for (std::unordered_set< gd::InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
        {
            if ((*it).instructionList == instructionHighlighted.instructionList && (*it).positionInList > instructionHighlighted.positionInList)
            {
                gd::InstructionItem newItem = (*it);
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

    return list;
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
    std::map< gd::InstructionsList*, std::list<std::size_t> > mapOfDeletionsRequest;
    for (std::unordered_set< gd::InstructionItem >::iterator it = instructionsSelected.begin();it!=instructionsSelected.end();++it)
    {
        if ( (*it).event != NULL ) (*it).event->eventHeightNeedUpdate = true;
        if ( (*it).instructionList != NULL)
            mapOfDeletionsRequest[(*it).instructionList].push_back((*it).positionInList);
    }
    //2) For each list, erase each index
    for (auto it = mapOfDeletionsRequest.begin();it!=mapOfDeletionsRequest.end();++it)
    {
        std::list<std::size_t> & listOfIndexesToDelete = it->second;
        listOfIndexesToDelete.sort();
        listOfIndexesToDelete.reverse(); //We have erase from end to start to prevent index changing

        for (std::list<std::size_t>::iterator index = listOfIndexesToDelete.begin();index!=listOfIndexesToDelete.end();++index)
            it->first->Remove(*index);
    }
}

EventsEditorSelection::EventsEditorSelection(gd::EventsEditorRefreshCallbacks & eventsEditorCallback_) :
    dragging(false),
    draggingInstruction(false),
    eventsEditorCallback(eventsEditorCallback_)
{
}


bool EventsEditorSelection::FindInInstructionsAndSubInstructions(gd::InstructionsList & list, const gd::Instruction * instrToSearch)
{
    for (std::size_t i = 0;i<list.size();++i)
    {
        if ( &list[i] == instrToSearch) return true;
        if ( FindInInstructionsAndSubInstructions(list[i].GetSubInstructions(), instrToSearch) )
            return true;
    }

    return false;
}

}

#endif
