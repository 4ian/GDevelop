/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Event.h"

vector <BaseEventSPtr> BaseEvent::badSubEvents;

BaseEvent::BaseEvent()
#ifdef GDE
:
conditionsHeightNeedUpdate(true),
conditionsHeight(0),
actionsHeightNeedUpdate(true),
actionsHeight(0),
selected(false)
#endif
{
}
