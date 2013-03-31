/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)

#include "Platform.h"
#include "GDCore/PlatformDefinition/Platform.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDL/RuntimeGame.h"
#include "GDL/ExtensionsManager.h"
#include "GDL/ExtensionBase.h"
#include "GDL/SoundManager.h"
#include "GDL/FontManager.h"
#include "GDL/IDE/CodeCompiler.h"

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

boost::shared_ptr<gd::Project> Platform::CreateNewEmptyProject() const
{
    return boost::shared_ptr<gd::Project>(new RuntimeGame);
}

void Platform::OnIDEClosed()
{
    if ( CodeCompiler::GetInstance()->MustDeleteTemporaries() )
        CodeCompiler::GetInstance()->ClearOutputDirectory();

    SoundManager::GetInstance()->DestroySingleton();
    FontManager::GetInstance()->DestroySingleton();
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
