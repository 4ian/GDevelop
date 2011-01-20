#ifndef DYNAMICEXTENSIONBASE_H
#define DYNAMICEXTENSIONBASE_H

#if !defined(GD_NO_DYNAMIC_EXTENSIONS)

#include <map>
#include "GDL/Event.h"

/**
 * Base class for C++ dynamic extensions,
 * meant to be edited and compiled directly with Game Develop,
 * using a C++ compiler, and then used in the game.
 */
class GD_API DynamicExtensionBase
{
    public :

    DynamicExtensionBase() {};
    virtual ~DynamicExtensionBase() {};

    std::map<std::string, boost::shared_ptr<BaseEvent> > callableEvents;
};

#endif

#endif // DYNAMICEXTENSIONBASE_H
