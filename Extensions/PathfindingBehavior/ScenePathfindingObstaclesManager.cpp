/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "ScenePathfindingObstaclesManager.h"
#include <iostream>
#include "PathfindingObstacleRuntimeBehavior.h"

std::map<RuntimeScene*, ScenePathfindingObstaclesManager>
    ScenePathfindingObstaclesManager::managers;

ScenePathfindingObstaclesManager::~ScenePathfindingObstaclesManager() {
  for (std::set<PathfindingObstacleRuntimeBehavior*>::iterator it =
           allObstacles.begin();
       it != allObstacles.end();
       ++it) {
    (*it)->Activate(false);
  }
}

void ScenePathfindingObstaclesManager::AddObstacle(
    PathfindingObstacleRuntimeBehavior* obstacle) {
  allObstacles.insert(obstacle);
}
void ScenePathfindingObstaclesManager::RemoveObstacle(
    PathfindingObstacleRuntimeBehavior* obstacle) {
  allObstacles.erase(obstacle);
}
