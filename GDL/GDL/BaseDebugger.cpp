/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GDE)
#include "GDL/BaseDebugger.h"

void BaseDebugger::Update()
{
    if ( timeInterval.GetElapsedTime() > 0.200 )
    {
        UpdateGUI();
        timeInterval.Reset();
    }
}
#endif
