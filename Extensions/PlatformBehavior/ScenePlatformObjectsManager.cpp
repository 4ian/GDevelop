#include "ScenePlatformObjectsManager.h"
#include "PlatformRuntimeBehavior.h"

std::map<RuntimeScene*, ScenePlatformObjectsManager>
    ScenePlatformObjectsManager::managers;

ScenePlatformObjectsManager::~ScenePlatformObjectsManager() {
  for (std::set<PlatformRuntimeBehavior*>::iterator it = allPlatforms.begin();
       it != allPlatforms.end();) {
    (*it++)->Activate(false);
  }
}

void ScenePlatformObjectsManager::AddPlatform(PlatformRuntimeBehavior* platform) {
  allPlatforms.insert(platform);
}
void ScenePlatformObjectsManager::RemovePlatform(PlatformRuntimeBehavior* platform) {
  allPlatforms.erase(platform);
}
