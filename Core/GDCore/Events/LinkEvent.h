/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef GDCORE_LINKEVENT_H
#define GDCORE_LINKEVENT_H
#include "GDCore/Events/Event.h"
#include <string>

namespace gd
{

/**
 * \brief Base class for implementing a "Link event".
 */
class GD_CORE_API LinkEvent : public gd::BaseEvent
{
public:
    LinkEvent() : BaseEvent(), includeAll(true), includeStart(std::string::npos), includeEnd(std::string::npos) {};
    virtual ~LinkEvent();
    virtual gd::BaseEventSPtr Clone() const { return boost::shared_ptr<gd::BaseEvent>(new LinkEvent(*this));}

    /**
     * Get the link target ( i.e. the scene or external events the link refers to )
     */
    const std::string & GetTarget() const { return target; };

    /**
     * Change the link target ( i.e. the scene or external events the link refers to )
     */
    void SetTarget(const std::string & target_) { target = target_; };

    /**
     * Return true if the link event must include all the events of the target.
     */
    bool IncludeAllEvents() const { return includeAll; };

    /**
     * Return true if the link event must include all the events of the target.
     */
    void SetIncludeAllEvents(bool includeAllEvents) { includeAll = includeAllEvents; };

    /**
     * Set the number of the first and last event to be included ( Meaningful only if includeAll was set to false, see SetIncludeAllEvents )
     */
    void SetIncludeStartAndEnd(unsigned int includeStart_, unsigned int includeEnd_) { includeStart = includeStart_; includeEnd = includeEnd_;  };

    /**
     * Get the number of the first event to be included. ( Meaningful only if includeAll was set to false, see SetIncludeAllEvents )
     */
    unsigned int GetIncludeStart() const { return includeStart; };

    /**
     * Get the number of the last event to be included. ( Meaningful only if includeAll was set to false, see SetIncludeAllEvents )
     */
    unsigned int GetIncludeEnd() const { return includeEnd; };

private:
    std::string target;
    bool includeAll; ///< If set to true, all the events of the target should be included
    unsigned int includeStart; ///< If includeAll is set to false, represents the number of the first event of the target to included.
    unsigned int includeEnd; ///< If includeAll is set to false, represents the number of the last event of the target to included.
};

}

#endif // GDCORE_LINKEVENT_H


