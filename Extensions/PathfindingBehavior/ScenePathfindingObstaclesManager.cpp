/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "ScenePathfindingObstaclesManager.h"
#include "PathfindingObstacleBehavior.h"
#include <iostream>

std::map<RuntimeScene*, ScenePathfindingObstaclesManager> ScenePathfindingObstaclesManager::managers;

ScenePathfindingObstaclesManager::~ScenePathfindingObstaclesManager()
{
	for (std::set<PathfindingObstacleBehavior*>::iterator it = allObstacles.begin();
		 it != allObstacles.end();
		 ++it)
	{
		(*it)->Activate(false);
	}
}

void ScenePathfindingObstaclesManager::AddObstacle(PathfindingObstacleBehavior * obstacle)
{
	allObstacles.insert(obstacle);
}
void ScenePathfindingObstaclesManager::RemoveObstacle(PathfindingObstacleBehavior * obstacle)
{
	allObstacles.erase(obstacle);
}
