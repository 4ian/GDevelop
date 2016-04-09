#ifndef EXTERNALLAYOUTSTOOLS_H
#define EXTERNALLAYOUTSTOOLS_H

#include <string>
#include "GDCpp/Runtime/String.h"

class RuntimeScene;

namespace ExternalLayoutsTools
{
    void GD_API CreateObjectsFromExternalLayout(RuntimeScene & scene, const gd::String & externalLayoutName, float xOffset, float yOffset);
};

#endif // EXTERNALLAYOUTSTOOLS_H
