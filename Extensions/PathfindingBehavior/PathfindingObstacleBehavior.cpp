/**

GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include <memory>
#include "PathfindingObstacleBehavior.h"
#include "GDCpp/Runtime/Project/Layout.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include "GDCpp/Runtime/RuntimeObject.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "ScenePathfindingObstaclesManager.h"
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <map>
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif


PathfindingObstacleBehavior::PathfindingObstacleBehavior() :
    parentScene(NULL),
    sceneManager(NULL),
    registeredInManager(false),
    impassable(true),
    cost(2)
{
}

PathfindingObstacleBehavior::~PathfindingObstacleBehavior()
{
    if ( sceneManager && registeredInManager ) sceneManager->RemoveObstacle(this);
}

void PathfindingObstacleBehavior::DoStepPreEvents(RuntimeScene & scene)
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

void PathfindingObstacleBehavior::DoStepPostEvents(RuntimeScene & scene)
{

}

void PathfindingObstacleBehavior::OnActivate()
{
    if ( sceneManager )
    {
        sceneManager->AddObstacle(this);
        registeredInManager = true;
    }
}

void PathfindingObstacleBehavior::OnDeActivate()
{
    if ( sceneManager )
        sceneManager->RemoveObstacle(this);

    registeredInManager = false;
}

void PathfindingObstacleBehavior::UnserializeFrom(const gd::SerializerElement & element)
{
    impassable = element.GetBoolAttribute("impassable");
    cost = element.GetDoubleAttribute("cost");
}

#if defined(GD_IDE_ONLY)
void PathfindingObstacleBehavior::SerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("impassable", impassable);
    element.SetAttribute("cost", cost);
}

std::map<gd::String, gd::PropertyDescriptor> PathfindingObstacleBehavior::GetProperties(gd::Project & project) const
{
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties[_("Impassable obstacle")].SetValue(impassable ? "true" : "false").SetType("Boolean");
    properties[_("Cost (if not impassable)")].SetValue(gd::String::From(cost));

    return properties;
}

bool PathfindingObstacleBehavior::UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project)
{
    if ( name == _("Impassable obstacle") ) {
        impassable = (value != "0");
        return true;
    }

    if ( value.To<float>() < 0 ) return false;

    if ( name == _("Cost (if not impassable)") )
        cost = value.To<float>();
    else
        return false;

    return true;
}

#endif
