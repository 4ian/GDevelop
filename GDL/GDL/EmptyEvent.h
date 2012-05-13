/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef EMPTYEVENT_H
#define EMPTYEVENT_H

#include "GDCore/Events/Event.h"

/**
 * \brief Empty event doing nothing.
 */
class EmptyEvent : public gd::BaseEvent
{
    public:
        EmptyEvent() : BaseEvent() {};
        virtual ~EmptyEvent() {};
};

#endif // EMPTYEVENT_H

#endif
