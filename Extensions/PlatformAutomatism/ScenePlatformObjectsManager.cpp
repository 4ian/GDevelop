#include "ScenePlatformObjectsManager.h"
#include "PlatformAutomatism.h"

std::map<RuntimeScene*, ScenePlatformObjectsManager> ScenePlatformObjectsManager::managers; 

ScenePlatformObjectsManager::~ScenePlatformObjectsManager()
{
	for (std::set<PlatformAutomatism*>::iterator it = allPlatforms.begin();
		 it != allPlatforms.end();
		 ++it)
	{
		(*it)->Activate(false);
	}
}

void ScenePlatformObjectsManager::AddPlatform(PlatformAutomatism * platform)
{
	allPlatforms.insert(platform);
}
void ScenePlatformObjectsManager::RemovePlatform(PlatformAutomatism * platform)
{
	allPlatforms.erase(platform);
}