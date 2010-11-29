#if defined(GDE)

#include "ProfileEvent.h"
#include <iostream>

ProfileEvent::ProfileEvent() :
BaseEvent(),
time(0)
{
}

ProfileEvent::~ProfileEvent()
{
    std::cout << "ProfileEvent destroyed, time :" << time << std::endl;
}

/**
 * Execution launch the timer
 */
void ProfileEvent::Execute( RuntimeScene & scene, ObjectsConcerned & objectsConcerned )
{
    if ( previousProfileEvent ) previousProfileEvent->Stop();
    if ( profileClock ) profileClock->reset();
}

void ProfileEvent::Stop()
{
    if ( profileClock )
        time += profileClock->getTimeMilliseconds();
}

/**
 * Initialize from another ProfileEvent.
 * Used by copy ctor and assignement operator
 */
void ProfileEvent::Init(const ProfileEvent & event)
{
    profileClock = event.profileClock;
    previousProfileEvent = event.previousProfileEvent;
    time = event.time;
}

/**
 * Custom copy operator
 */
ProfileEvent::ProfileEvent(const ProfileEvent & event) :
BaseEvent(event)
{
    Init(event);
}

/**
 * Custom assignement operator
 */
ProfileEvent& ProfileEvent::operator=(const ProfileEvent & event)
{
    if ( this != &event )
    {
        BaseEvent::operator=(event);
        Init(event);
    }

    return *this;
}

#endif
