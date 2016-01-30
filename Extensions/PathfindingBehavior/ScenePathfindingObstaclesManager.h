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
class PathfindingObstacleBehavior;

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
    void AddObstacle(PathfindingObstacleBehavior * obstacle);

    /**
     * \brief Notify the manager that a obstacle was removed from the scene.
     * \param obstacle The removed obstacle
     */
    void RemoveObstacle(PathfindingObstacleBehavior * obstacle);

    /**
     * \brief Get a read only access to the list of all obstacles
     */
    const std::set<PathfindingObstacleBehavior*> & GetAllObstacles() const { return allObstacles; }

private:
    std::set<PathfindingObstacleBehavior*> allObstacles; ///< The list of all obstacles of the scene.
};



#endif
