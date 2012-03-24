#include "Platform.h"
#include "GDCore/PlatformDefinition/Platform.h"

Platform::~Platform()
{
    //dtor
}

/**
 * Used by Game Develop to create the platform class
 */
extern "C" gd::Platform * GD_API CreateGDPlatform() {
    return new Platform;
}

/**
 * Used by Game Develop to destroy the platform class
 */
extern "C" void GD_API DestroyGDPlatform(Platform * p) {
    delete p;
}
