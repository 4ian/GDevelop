/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "Platform.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"

Platform::~Platform()
{
    //dtor
}

std::vector < boost::shared_ptr<gd::PlatformExtension> > Platform::GetAllPlatformExtensions() const
{
    std::vector < boost::shared_ptr<gd::PlatformExtension> > extensions;
    for (unsigned int i = 0;i<ExtensionsManager::GetInstance()->GetExtensions().size();++i)
    {
        extensions.push_back(boost::shared_ptr<gd::PlatformExtension>(ExtensionsManager::GetInstance()->GetExtensions()[i]));

    }
    return extensions;
}

boost::shared_ptr<gd::PlatformExtension> Platform::GetExtension(const std::string & name) const
{
    return ExtensionsManager::GetInstance()->GetExtension(name);
}

gd::InstructionsMetadataHolder & Platform::GetInstructionsMetadataHolder() const
{
    return *ExtensionsManager::GetInstance();
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
#endif
