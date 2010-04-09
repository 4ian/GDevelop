#ifndef EMPTYEVENT_H
#define EMPTYEVENT_H

#include "Event.h"

class EmptyEvent : public BaseEvent
{
    public:
        EmptyEvent() : BaseEvent() {};
        virtual ~EmptyEvent() {};

    private:
};

#endif // EMPTYEVENT_H
