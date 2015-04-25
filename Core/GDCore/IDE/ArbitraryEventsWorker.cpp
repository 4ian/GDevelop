/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
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

    for (unsigned int i = 0;i<events.size();++i)
    {
    	VisitEvent(events[i]);

        if (events[i].CanHaveSubEvents())
        	VisitEventList(events[i].GetSubEvents());
    }
}

void ArbitraryEventsWorker::VisitEvent(gd::BaseEvent & event)
{
    DoVisitEvent(event);

    vector < vector<gd::Instruction>* > conditionsVectors =  event.GetAllConditionsVectors();
    for (unsigned int j = 0;j < conditionsVectors.size();++j)
    	VisitInstructionList(*conditionsVectors[j], true);

    vector < vector<gd::Instruction>* > actionsVectors =  event.GetAllActionsVectors();
    for (unsigned int j = 0;j < actionsVectors.size();++j)
    	VisitInstructionList(*actionsVectors[j], false);
}

void ArbitraryEventsWorker::VisitInstructionList(std::vector<gd::Instruction> & instructions, bool areConditions)
{
    DoVisitInstructionList(instructions, areConditions);

    for (unsigned int i = 0;i < instructions.size();)
    {
        if ( VisitInstruction(instructions[i], areConditions) )
            instructions.erase(instructions.begin()+i);
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
