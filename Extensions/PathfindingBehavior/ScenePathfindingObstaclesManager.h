/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#ifndef SCENEPLATFORMOBJECTSMANAGER_H
#define SCENEPLATFORMOBJECTSMANAGER_H
#include <map>
#include <set>
#include "GDCpp/Runtime/RuntimeScene.h"
class PathfindingObstacleRuntimeBehavior;

/**
 * \brief Contains lists of all obstacle related objects of a scene.
 *
 * \note Could be drastically improved by using spatial hashing (see JS
 * implementation).
 */
class ScenePathfindingObstaclesManager {
 public:
  /**
   * \brief Map containing, for each RuntimeScene, its associated
   * ScenePathfindingObstaclesManager.
   */
  static std::map<RuntimeScene*, ScenePathfindingObstaclesManager> managers;

  ScenePathfindingObstaclesManager(){};
  virtual ~ScenePathfindingObstaclesManager();

  /**
   * \brief Notify the manager that there is a new obstacle on the scene.
   * \param obstacle The new obstacle
   */
  void AddObstacle(PathfindingObstacleRuntimeBehavior* obstacle);

  /**
   * \brief Notify the manager that a obstacle was removed from the scene.
   * \param obstacle The removed obstacle
   */
  void RemoveObstacle(PathfindingObstacleRuntimeBehavior* obstacle);

  /**
   * \brief Get a read only access to the list of all obstacles
   */
  const std::set<PathfindingObstacleRuntimeBehavior*>& GetAllObstacles() const {
    return allObstacles;
  }

 private:
  std::set<PathfindingObstacleRuntimeBehavior*>
      allObstacles;  ///< The list of all obstacles of the scene.
};

#endif
