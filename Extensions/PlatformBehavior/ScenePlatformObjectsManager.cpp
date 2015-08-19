#include "ScenePlatformObjectsManager.h"
#include "PlatformBehavior.h"

std::map<RuntimeScene*, ScenePlatformObjectsManager> ScenePlatformObjectsManager::managers; 

ScenePlatformObjectsManager::~ScenePlatformObjectsManager()
{
	for (std::set<PlatformBehavior*>::iterator it = allPlatforms.begin();
		 it != allPlatforms.end();
		 ++it)
	{
		(*it)->Activate(false);
	}
}

void ScenePlatformObjectsManager::AddPlatform(PlatformBehavior * platform)
{
	allPlatforms.insert(platform);
}
void ScenePlatformObjectsManager::RemovePlatform(PlatformBehavior * platform)
{
	allPlatforms.erase(platform);
}