#if defined(GDE)
#include "GDL/BaseDebugger.h"

BaseDebugger::BaseDebugger()
{
    //ctor
}

BaseDebugger::~BaseDebugger()
{
    //dtor
}

void BaseDebugger::Update()
{
    if ( timeInterval.GetElapsedTime() > 0.200 )
    {
        UpdateGUI();
        timeInterval.Reset();
    }
}
#endif
