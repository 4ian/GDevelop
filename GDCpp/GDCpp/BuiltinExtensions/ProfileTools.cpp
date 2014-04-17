/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)

#include "ProfileTools.h"
#include "GDCpp/ProfileEvent.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/IDE/BaseProfiler.h"
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