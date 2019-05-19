/**

GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#ifndef SCENEPLATFORMOBJECTSMANAGER_H
#define SCENEPLATFORMOBJECTSMANAGER_H
#include <map>
#include <set>
#include "GDCpp/Runtime/RuntimeScene.h"
class PlatformRuntimeBehavior;

/**
 * \brief Contains lists of all platform related objects of a scene.
 *
 * \note Could be drastically improved by using spatial hashing (see JS
 * implementation).
 */
class ScenePlatformObjectsManager {
 public:
  /**
   * \brief Map containing, for each RuntimeScene, its associated
   * ScenePlatformObjectsManager.
   */
  static std::map<RuntimeScene*, ScenePlatformObjectsManager> managers;

  ScenePlatformObjectsManager(){};
  virtual ~ScenePlatformObjectsManager();

  /**
   * \brief Notify the manager that there is a new platform on the scene.
   * \param platform The new platform
   */
  void AddPlatform(PlatformRuntimeBehavior* platform);

  /**
   * \brief Notify the manager that a platform was removed from the scene.
   * \param platform The removed platform
   */
  void RemovePlatform(PlatformRuntimeBehavior* platform);

  /**
   * \brief Get a read only access to the list of all platforms
   */
  const std::set<PlatformRuntimeBehavior*>& GetAllPlatforms() {
    return allPlatforms;
  }

 private:
  std::set<PlatformRuntimeBehavior*>
      allPlatforms;  ///< The list of all platforms of the scene.
};

#endif
