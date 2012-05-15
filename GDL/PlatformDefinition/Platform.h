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
 * \brief Game Develop C++/OpenGL Platform
 *
 * Platform designed to be used to create 2D games based on SFML and OpenGL libraries for rendering,
 * events being compiled to C++ and then to native code using LLVM/Clang.
 */
class GD_API Platform : public gd::Platform
{
public:
    Platform() : gd::Platform() {};
    virtual ~Platform();

    std::string GetPlatformName() { return "Game Develop C++/OpenGL platform"; }

    virtual std::vector < boost::shared_ptr<gd::PlatformExtension> > GetAllPlatformExtensions() const;

    virtual boost::shared_ptr<gd::PlatformExtension> GetExtension(const std::string & name) const;

    virtual gd::InstructionsMetadataHolder & GetInstructionsMetadataHolder() const;
};

#endif // PLATFORM_H

#endif
