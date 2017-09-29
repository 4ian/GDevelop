/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_ARBITRARYEVENTSWORKER_H
#define GDCORE_ARBITRARYEVENTSWORKER_H
#include "GDCore/String.h"
#include <vector>
#include <map>
#include <memory>
#include "GDCore/Events/InstructionsList.h"
namespace gd {class Instruction;}
namespace gd {class BaseEvent;}
namespace gd {class EventsList;}

namespace gd
{

/**
 * \brief ArbitraryEventsWorker is an abstract class used to browse events (and instructions)
 * and do some work on them. Can be used to implement refactoring for example.
 *
 * \ingroup IDE
 */
class GD_CORE_API ArbitraryEventsWorker
{
public:
    ArbitraryEventsWorker() {};
    virtual ~ArbitraryEventsWorker();

    /**
     * \brief Launch the worker on the specified events list.
     */
    void Launch(gd::EventsList & events) { VisitEventList(events); };

private:
    void VisitEventList(gd::EventsList & events);
    bool VisitEvent(gd::BaseEvent & event);
    void VisitInstructionList(gd::InstructionsList & instructions, bool areConditions);
    bool VisitInstruction(gd::Instruction & instruction, bool isCondition);

    /**
     * Called to do some work on an event list.
     */
    virtual void DoVisitEventList(gd::EventsList & events) {};

    /**
     * Called to do some work on an event
     * \return true if the instruction must be deleted from the events list, false otherwise (default).
     */
    virtual bool DoVisitEvent(gd::BaseEvent & event) { return false; };

    /**
     * Called to do some work on an instruction list
     */
    virtual void DoVisitInstructionList(gd::InstructionsList & instructions, bool areConditions) {};

    /**
     * Called to do some work on an instruction.
     * \return true if the instruction must be deleted from the list, false otherwise (default).
     */
    virtual bool DoVisitInstruction(gd::Instruction & instruction, bool isCondition) { return false; };
};

}

#endif // GDCORE_ARBITRARYEVENTSWORKER_H
