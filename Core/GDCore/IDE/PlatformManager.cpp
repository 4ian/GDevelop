/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "PlatformManager.h"
#include "GDCore/PlatformDefinition/Platform.h"

namespace gd
{

PlatformManager *PlatformManager::_singleton = NULL;

PlatformManager::PlatformManager()
{
}

PlatformManager::~PlatformManager()
{
}

bool PlatformManager::AddPlatform(std::shared_ptr<gd::Platform> newPlatform)
{
    for (std::size_t i = 0;i<platformsLoaded.size();++i)
    {
        if ( platformsLoaded[i]->GetName() == newPlatform->GetName() )
            return false;
    }

    platformsLoaded.push_back(newPlatform);
    return true;
}

gd::Platform* PlatformManager::GetPlatform(const gd::String & platformName) const
{
    for (std::size_t i = 0;i<platformsLoaded.size();++i)
    {
        if ( platformsLoaded[i]->GetName() == platformName )
            return platformsLoaded[i].get();
    }

    return NULL;
}

void PlatformManager::NotifyPlatformIDEInitialized() const
{
    for (std::size_t i = 0;i<platformsLoaded.size();++i)
    {
        if ( platformsLoaded[i] != std::shared_ptr<gd::Platform>() )
            platformsLoaded[i]->OnIDEInitialized();
    }
}

}
