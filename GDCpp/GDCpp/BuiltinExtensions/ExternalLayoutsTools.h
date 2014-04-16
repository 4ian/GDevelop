#if !defined(EMSCRIPTEN)
#ifndef EXTERNALLAYOUTSTOOLS_H
#define EXTERNALLAYOUTSTOOLS_H
#include <string>
class RuntimeScene;

namespace ExternalLayoutsTools
{
    void GD_API CreateObjectsFromExternalLayout(RuntimeScene & scene, const std::string & externalLayoutName, float xOffset, float yOffset);
};

#endif // EXTERNALLAYOUTSTOOLS_H
#endif