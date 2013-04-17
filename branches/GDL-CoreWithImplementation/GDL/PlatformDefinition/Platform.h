/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#ifndef PLATFORM_H
#define PLATFORM_H
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/PlatformExtension.h"
namespace gd { class Automatism; }
namespace gd { class Object; }

/**
 * \brief Game Develop C++ Platform
 *
 * Platform designed to be used to create 2D games based on SFML and OpenGL libraries for rendering,
 * events being translated to C++ and then compiled using GCC.
 */
class GD_API Platform : public gd::Platform
{
public:
    Platform() : gd::Platform() {};
    virtual ~Platform();

    std::string GetPlatformName() { return "Game Develop C++ platform"; }

    virtual std::vector < boost::shared_ptr<gd::PlatformExtension> > GetAllPlatformExtensions() const;

    virtual boost::shared_ptr<gd::PlatformExtension> GetExtension(const std::string & name) const;

    virtual boost::shared_ptr<gd::Project> CreateNewEmptyProject() const;

    virtual gd::Automatism* CreateAutomatism(const std::string & type) const;

    virtual boost::shared_ptr<gd::AutomatismsSharedData> CreateAutomatismSharedDatas(const std::string & type) const;

    virtual boost::shared_ptr<gd::BaseEvent> CreateEvent(const std::string & type) const;

    virtual boost::shared_ptr<gd::Object> CreateObject(const std::string & type, const std::string & name) const;

    virtual void OnIDEClosed();
};

#endif // PLATFORM_H
#endif
