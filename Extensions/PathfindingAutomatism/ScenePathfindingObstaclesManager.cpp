/**

GDevelop - Pathfinding Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "ScenePathfindingObstaclesManager.h"
#include "PathfindingObstacleAutomatism.h"

std::map<RuntimeScene*, ScenePathfindingObstaclesManager> ScenePathfindingObstaclesManager::managers;

ScenePathfindingObstaclesManager::~ScenePathfindingObstaclesManager()
{
	for (std::set<PathfindingObstacleAutomatism*>::iterator it = allObstacles.begin();
		 it != allObstacles.end();
		 ++it)
	{
		(*it)->Activate(false);
	}
}

void ScenePathfindingObstaclesManager::AddObstacle(PathfindingObstacleAutomatism * obstacle)
{
	allObstacles.insert(obstacle);
}
void ScenePathfindingObstaclesManager::RemoveObstacle(PathfindingObstacleAutomatism * obstacle)
{
	allObstacles.erase(obstacle);
}
