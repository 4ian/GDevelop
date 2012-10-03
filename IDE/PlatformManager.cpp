/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "PlatformManager.h"
#include "GDL/PlatformDefinition/Platform.h"

PlatformManager *PlatformManager::_singleton = NULL;

PlatformManager::PlatformManager()
{
    AddPlatform(boost::shared_ptr<gd::Platform>(new Platform)); //For now, GD C++ Platform is builtin
}

PlatformManager::~PlatformManager()
{
}

bool PlatformManager::AddPlatform(boost::shared_ptr<gd::Platform> newPlatform)
{
    for (unsigned int i = 0;i<platformsLoaded.size();++i)
    {
        if ( platformsLoaded[i]->GetPlatformName() == newPlatform->GetPlatformName() )
            return false;
    }

    platformsLoaded.push_back(newPlatform);
    return true;
}

boost::shared_ptr<gd::Platform> PlatformManager::GetPlatform(const std::string & platformName) const
{
    for (unsigned int i = 0;i<platformsLoaded.size();++i)
    {
        if ( platformsLoaded[i]->GetPlatformName() == platformName )
            return platformsLoaded[i];
    }

    return boost::shared_ptr<gd::Platform>();
}
