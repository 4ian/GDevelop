/**

Game Develop - Platform Automatism Extension
Copyright (c) 2013-2014 Florian Rival (Florian.Rival@gmail.com)

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
class PlatformAutomatism;

/**
 * \brief Contains lists of all platform related objects of a scene.
 */
class ScenePlatformObjectsManager
{
public:
    /**
     * \brief Map containing, for each RuntimeScene, its associated ScenePlatformObjectsManager.
     */
    static std::map<RuntimeScene*, ScenePlatformObjectsManager> managers; 

	ScenePlatformObjectsManager() {};
	virtual ~ScenePlatformObjectsManager();

    /**
     * \brief Notify the manager that there is a new platform on the scene.
     * \param platform The new platform
     */
    void AddPlatform(PlatformAutomatism * platform);

    /**
     * \brief Notify the manager that a platform was removed from the scene.
     * \param platform The removed platform
     */
    void RemovePlatform(PlatformAutomatism * platform);

    /**
     * \brief Get a read only access to the list of all platforms
     */
    const std::set<PlatformAutomatism*> & GetAllPlatforms() { return allPlatforms; }

private:
    std::set<PlatformAutomatism*> allPlatforms; ///< The list of all platforms of the scene.
};



#endif