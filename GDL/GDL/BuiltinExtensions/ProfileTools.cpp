/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "ProfileTools.h"
#include "GDL/ProfileEvent.h"
#include "GDL/RuntimeScene.h"
#include "GDL/IDE/BaseProfiler.h"
#include <iostream>

void GD_API StartProfileTimer(RuntimeScene & scene, unsigned int id)
{
    scene.GetProfiler()->profileEventsInformation[id].Reset();
}

void GD_API EndProfileTimer(RuntimeScene & scene, unsigned int id)
{
    scene.GetProfiler()->profileEventsInformation[id].Stop();
}

#endif

