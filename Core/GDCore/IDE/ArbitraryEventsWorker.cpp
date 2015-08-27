/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/String.h"
#include <vector>
#include <map>
#include <memory>
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/IDE/ArbitraryEventsWorker.h"
#include "GDCore/Events/EventsList.h"
#include "GDCore/Events/Event.h"
#include "GDCore/Events/Instruction.h"

using namespace std;

namespace gd
{

ArbitraryEventsWorker::~ArbitraryEventsWorker()
{
}

void ArbitraryEventsWorker::VisitEventList(gd::EventsList & events)
{
	DoVisitEventList(events);

    for (std::size_t i = 0;i<events.size();++i)
    {
    	VisitEvent(events[i]);

        if (events[i].CanHaveSubEvents())
        	VisitEventList(events[i].GetSubEvents());
    }
}

void ArbitraryEventsWorker::VisitEvent(gd::BaseEvent & event)
{
    DoVisitEvent(event);

    vector < gd::InstructionsList* > conditionsVectors =  event.GetAllConditionsVectors();
    for (std::size_t j = 0;j < conditionsVectors.size();++j)
    	VisitInstructionList(*conditionsVectors[j], true);

    vector < gd::InstructionsList* > actionsVectors =  event.GetAllActionsVectors();
    for (std::size_t j = 0;j < actionsVectors.size();++j)
    	VisitInstructionList(*actionsVectors[j], false);
}

void ArbitraryEventsWorker::VisitInstructionList(gd::InstructionsList & instructions, bool areConditions)
{
    DoVisitInstructionList(instructions, areConditions);

    for (std::size_t i = 0;i < instructions.size();)
    {
        if ( VisitInstruction(instructions[i], areConditions) )
            instructions.Remove(i);
        else
        {
        	if ( !instructions[i].GetSubInstructions().empty() )
        		VisitInstructionList(instructions[i].GetSubInstructions(), areConditions);
        	++i;
        }
    }
}

bool ArbitraryEventsWorker::VisitInstruction(gd::Instruction & instruction, bool isCondition)
{
    return DoVisitInstruction(instruction, isCondition);
}


}
