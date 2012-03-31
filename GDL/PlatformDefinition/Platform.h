/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PLATFORM_H
#define PLATFORM_H
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"

/**
 * \brief (Currently) A simple wrapper around ExtensionsManager.
 */
class GD_API Platform : public gd::Platform
{
public:
    Platform() : gd::Platform() {};
    virtual ~Platform();

    std::string GetPlatformName() { return "C++ platform"; }

    virtual std::vector < boost::shared_ptr<gd::PlatformExtension> > GetAllPlatformExtensions() const;

    virtual boost::shared_ptr<gd::PlatformExtension> GetExtension(const std::string & name) const;

private:
};

#endif // PLATFORM_H

#endif
