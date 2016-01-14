/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY)
#include "GDCpp/IDE/BaseDebugger.h"

void BaseDebugger::Update()
{
    if ( timeInterval.getElapsedTime().asMilliseconds() > 200 ) //Update each 200 ms
    {
        UpdateGUI();
        timeInterval.restart();
    }
}
#endif
