/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#if defined(GD_IDE_ONLY) && !defined(EMSCRIPTEN)

#include "ProfileTools.h"
#include <iostream>
#include "GDCpp/Events/Builtin/ProfileEvent.h"
#include "GDCpp/IDE/BaseProfiler.h"
#include "GDCpp/Runtime/RuntimeScene.h"

void GD_API StartProfileTimer(RuntimeScene& scene, std::size_t id) {
  scene.GetProfiler()->profileEventsInformation[id].Reset();
}

void GD_API EndProfileTimer(RuntimeScene& scene, std::size_t id) {
  scene.GetProfiler()->profileEventsInformation[id].Stop();
}

#endif
