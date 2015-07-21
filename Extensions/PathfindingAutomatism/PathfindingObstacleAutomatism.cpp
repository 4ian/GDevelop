/**

GDevelop - Pathfinding Automatism Extension
Copyright (c) 2010-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include <memory>
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

std::map<gd::String, gd::PropertyDescriptor> PathfindingObstacleAutomatism::GetProperties(gd::Project & project) const
{
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties[_("Impassable obstacle")].SetValue(impassable ? "true" : "false").SetType("Boolean");
    properties[_("Cost (if not impassable)")].SetValue(gd::String::From(cost));

    return properties;
}

bool PathfindingObstacleAutomatism::UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project)
{
    if ( name == _("Impassable obstacle") ) {
        impassable = (value != "0");
        return true;
    }

    if ( value.ToFloat() < 0 ) return false;

    if ( name == _("Cost (if not impassable)") )
        cost = value.ToFloat();
    else
        return false;

    return true;
}

#endif
