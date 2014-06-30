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
#include <boost/shared_ptr.hpp>
#include "PathfindingObstacleAutomatism.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/CommonTools.h"
#include "ScenePathfindingObstaclesManager.h"
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <map>
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif


PathfindingObstacleAutomatism::PathfindingObstacleAutomatism() :
    parentScene(NULL),
    sceneManager(NULL),
    registeredInManager(false),
    impassable(true),
    cost(2)
{
}

PathfindingObstacleAutomatism::~PathfindingObstacleAutomatism()
{
    if ( sceneManager && registeredInManager ) sceneManager->RemoveObstacle(this);
}

void PathfindingObstacleAutomatism::DoStepPreEvents(RuntimeScene & scene)
{
    if ( parentScene != &scene ) //Parent scene has changed
    {
        if ( sceneManager ) //Remove the object from any old scene manager.
            sceneManager->RemoveObstacle(this);

        parentScene = &scene;
        sceneManager = parentScene ? &ScenePathfindingObstaclesManager::managers[&scene] : NULL;
        registeredInManager = false;
    }

    if (!activated && registeredInManager)
    {
        if ( sceneManager ) sceneManager->RemoveObstacle(this);
        registeredInManager = false;
    }
    else if (activated && !registeredInManager)
    {
        if ( sceneManager )
        {
            sceneManager->AddObstacle(this);
            registeredInManager = true;
        }
    }
}

void PathfindingObstacleAutomatism::DoStepPostEvents(RuntimeScene & scene)
{

}

void PathfindingObstacleAutomatism::OnActivate()
{
    if ( sceneManager )
    {
        sceneManager->AddObstacle(this);
        registeredInManager = true;
    }
}

void PathfindingObstacleAutomatism::OnDeActivate()
{
    if ( sceneManager )
        sceneManager->RemoveObstacle(this);

    registeredInManager = false;
}

void PathfindingObstacleAutomatism::UnserializeFrom(const gd::SerializerElement & element)
{
    impassable = element.GetBoolAttribute("impassable");
    cost = element.GetDoubleAttribute("cost");
}

#if defined(GD_IDE_ONLY)
void PathfindingObstacleAutomatism::SerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("impassable", impassable);
    element.SetAttribute("cost", cost);
}

std::map<std::string, gd::PropertyDescriptor> PathfindingObstacleAutomatism::GetProperties(gd::Project & project) const
{
    std::map<std::string, gd::PropertyDescriptor> properties;
    properties[ToString(_("Impassable obstacle"))].SetValue(impassable ? "true" : "false").SetType("Boolean");
    properties[ToString(_("Cost (if not impassable)"))].SetValue(ToString(cost));

    return properties;
}

bool PathfindingObstacleAutomatism::UpdateProperty(const std::string & name, const std::string & value, gd::Project & project)
{
    if ( name == ToString(_("Impassable obstacle")) ) {
        impassable = (value != "0");
        return true;
    }

    if ( ToDouble(value) < 0 ) return false;

    if ( name == ToString(_("Cost (if not impassable)")) )
        cost = ToDouble(value);
    else
        return false;

    return true;
}

#endif