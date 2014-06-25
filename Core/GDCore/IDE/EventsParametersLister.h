/*
 * Game Develop Core
 * Copyright 2008-2014 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the GNU Lesser General Public License.
 */
#ifndef EventsParametersLister_H
#define EventsParametersLister_H
#include <string>
#include <vector>
#include <map>
#include <boost/shared_ptr.hpp>
#include "GDCore/IDE/ArbitraryEventsWorker.h"
namespace gd {class BaseEvent;}
namespace gd {class Project;}
namespace gd {class EventsList;}

namespace gd
{

/**
 * \brief List the values of the parameters of events and their type.
 *
 * \ingroup IDE
 */
class GD_CORE_API EventsParametersLister : public ArbitraryEventsWorker
{
public:
    EventsParametersLister(gd::Project & project_) : project(project_) {};
    virtual ~EventsParametersLister();

    /**
     * Return the values of all parameters associated with the type of their parent.
     */
    const std::map<std::string, std::string> & GetParametersAndTypes() { return parameters; }

private:
    virtual bool DoVisitInstruction(gd::Instruction & instruction, bool isCondition);

    std::map<std::string, std::string> parameters;
    gd::Project & project;
};

}

#endif // EventsParametersLister_H