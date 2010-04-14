/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Event.h"

vector <BaseEventSPtr> BaseEvent::badSubEvents;

BaseEvent::BaseEvent()
#ifdef GDE
: selected(false),
eventRenderingNeedUpdate(true),
renderedEventBitmap(1,1,-1),
renderedWidth(1)
#endif
{
}
