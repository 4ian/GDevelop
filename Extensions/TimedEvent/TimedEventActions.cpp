/**

Game Develop - Timed Event Extension
Copyright (c) 2011 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/

#include "GDL/Instruction.h"
#include "GDL/RuntimeScene.h"
#include "TimedEvent.h"
#include <iostream>
#include <string>
#include <vector>

bool ActResetTimedEvent( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    TimedEvent * eventPtr = TimedEvent::timedEventsList[&scene][action.GetParameter(0).GetPlainString()];
    if ( eventPtr ) eventPtr->Reset();

    return true;
}

void ResetTimedEventAndSubs(TimedEvent & event)
{
    event.Reset();
    const vector < BaseEventSPtr > & subEvents = event.GetSubEvents();
    for (unsigned int i = 0;i<subEvents.size();++i)
    {
        boost::shared_ptr<TimedEvent> timedEvent = boost::dynamic_pointer_cast<TimedEvent>(subEvents[i]);
        if ( timedEvent )
            ResetTimedEventAndSubs(*timedEvent);
    }
}

bool ActResetTimedEventAndSubs( RuntimeScene & scene, ObjectsConcerned & objectsConcerned, const Instruction & action )
{
    TimedEvent * eventPtr = TimedEvent::timedEventsList[&scene][action.GetParameter(0).GetPlainString()];
    if ( eventPtr ) ResetTimedEventAndSubs(*eventPtr);

    return true;
}







