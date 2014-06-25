/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef GDCORE_ARBITRARYEVENTSWORKER_H
#define GDCORE_ARBITRARYEVENTSWORKER_H
#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
namespace gd {class Instruction;}
namespace gd {class BaseEvent;}
namespace gd {class Project;}
namespace gd {class EventsList;}

namespace gd
{

/**
 * \brief ArbitraryEventsWorker is an abstract class used to browse events (and instructions)
 * and some work on them. Can be used to implement refactoring for example.
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
    void VisitEvent(gd::BaseEvent & event);
    void VisitInstructionList(std::vector<gd::Instruction> & instructions, bool areConditions);
    bool VisitInstruction(gd::Instruction & instruction, bool isCondition);

    /**
     * Called to do some work on an event list.
     */
    virtual void DoVisitEventList(gd::EventsList & events) {};

    /**
     * Called to do some work on an event
     */
    virtual void DoVisitEvent(gd::BaseEvent & event) {};

    /**
     * Called to do some work on an instruction list
     */
    virtual void DoVisitInstructionList(std::vector<gd::Instruction> & instructions, bool areConditions) {};

    /**
     * Called to do some work on an instruction.
     * \return true if the instruction must be deleted from the list, false otherwise (default).
     */
    virtual bool DoVisitInstruction(gd::Instruction & instruction, bool isCondition) { return false; };
};

}

#endif // GDCORE_ARBITRARYEVENTSWORKER_H