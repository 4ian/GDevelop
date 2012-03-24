/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PLATFORM_H
#define PLATFORM_H
#include "GDCore/PlatformDefinition/Platform.h"

class Platform : public gd::Platform
{
public:
    Platform() : gd::Platform() {};
    virtual ~Platform();

    std::string GetPlatformName() { return "C++ platform"; }

private:
};

#endif // PLATFORM_H

#endif
