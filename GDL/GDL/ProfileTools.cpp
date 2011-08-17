#include "ProfileTools.h"
#include "GDL/ProfileEvent.h"
#include "GDL/RuntimeScene.h"
#include "GDL/BaseProfiler.h"
#include <iostream>

void GD_API StartProfileTimer(RuntimeScene & scene, unsigned int id)
{
    scene.profiler->profileEventsInformation[id].Reset();
}

void GD_API EndProfileTimer(RuntimeScene & scene, unsigned int id)
{
    scene.profiler->profileEventsInformation[id].Stop();
}
