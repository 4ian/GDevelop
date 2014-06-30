/**

Game Develop - Pathfinding Automatism Extension
Copyright (c) 2010-2014 Florian Rival (Florian.Rival@gmail.com)

This software is provided 'as-is', without any express or implied
warranty. In no event will the authors be held liable for any damages
arising from the use of this software.

Permission is granted to anyone to use this software for any purpose,
including commercial applications, and to alter it and redistribute it
freely, subject to the following restrictions:

    1. The origin of this software must not be misrepresented; you must not
    claim that you wrote the original software. If you use this software
    in a product, an acknowledgment in the product documentation would be
    appreciated but is not required.

    2. Altered source versions must be plainly marked as such, and must not be
    misrepresented as being the original software.

    3. This notice may not be removed or altered from any source
    distribution.

*/
#ifndef SCENEPLATFORMOBJECTSMANAGER_H
#define SCENEPLATFORMOBJECTSMANAGER_H
#include <map>
#include <set>
#include "GDCpp/RuntimeScene.h"
class PathfindingObstacleAutomatism;

/**
 * \brief Contains lists of all obstacle related objects of a scene.
 */
class ScenePathfindingObstaclesManager
{
public:
    /**
     * \brief Map containing, for each RuntimeScene, its associated ScenePathfindingObstaclesManager.
     */
    static std::map<RuntimeScene*, ScenePathfindingObstaclesManager> managers;

	ScenePathfindingObstaclesManager() {};
	virtual ~ScenePathfindingObstaclesManager();

    /**
     * \brief Notify the manager that there is a new obstacle on the scene.
     * \param obstacle The new obstacle
     */
    void AddObstacle(PathfindingObstacleAutomatism * obstacle);

    /**
     * \brief Notify the manager that a obstacle was removed from the scene.
     * \param obstacle The removed obstacle
     */
    void RemoveObstacle(PathfindingObstacleAutomatism * obstacle);

    /**
     * \brief Get a read only access to the list of all obstacles
     */
    const std::set<PathfindingObstacleAutomatism*> & GetAllObstacles() const { return allObstacles; }

private:
    std::set<PathfindingObstacleAutomatism*> allObstacles; ///< The list of all obstacles of the scene.
};



#endif