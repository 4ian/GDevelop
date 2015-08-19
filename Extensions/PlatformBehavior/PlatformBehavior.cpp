/**

GDevelop - Platform Behavior Extension
Copyright (c) 2014-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <memory>
#include "PlatformBehavior.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/CommonTools.h"
#include "ScenePlatformObjectsManager.h"
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <map>
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif


PlatformBehavior::PlatformBehavior() :
    parentScene(NULL),
    sceneManager(NULL),
    registeredInManager(false),
    platformType(NormalPlatform)
{
}

PlatformBehavior::~PlatformBehavior()
{
    if ( sceneManager && registeredInManager ) sceneManager->RemovePlatform(this);
}

void PlatformBehavior::DoStepPreEvents(RuntimeScene & scene)
{
    if ( parentScene != &scene ) //Parent scene has changed
    {
        if ( sceneManager ) //Remove the object from any old scene manager.
            sceneManager->RemovePlatform(this);

        parentScene = &scene;
        sceneManager = parentScene ? &ScenePlatformObjectsManager::managers[&scene] : NULL;
        registeredInManager = false;
    }

    if (!activated && registeredInManager)
    {
        if ( sceneManager ) sceneManager->RemovePlatform(this);
        registeredInManager = false;
    }
    else if (activated && !registeredInManager)
    {
        if ( sceneManager )
        {
            sceneManager->AddPlatform(this);
            registeredInManager = true;
        }
    }
}

void PlatformBehavior::DoStepPostEvents(RuntimeScene & scene)
{

}

void PlatformBehavior::ChangePlatformType(const gd::String & platformType_)
{
    if ( platformType_ == "Ladder" ) platformType = Ladder;
    else if ( platformType_ == "Jumpthru" ) platformType = Jumpthru;
    else platformType = NormalPlatform;
}

void PlatformBehavior::OnActivate()
{
    if ( sceneManager )
    {
        sceneManager->AddPlatform(this);
        registeredInManager = true;
    }
}

void PlatformBehavior::OnDeActivate()
{
    if ( sceneManager )
        sceneManager->RemovePlatform(this);

    registeredInManager = false;
}

void PlatformBehavior::UnserializeFrom(const gd::SerializerElement & element)
{
    gd::String platformTypeStr = element.GetStringAttribute("platformType");
    platformType = platformTypeStr == "Ladder" ?  Ladder : (platformTypeStr == "Jumpthru" ?
        Jumpthru : NormalPlatform);
}

#if defined(GD_IDE_ONLY)
void PlatformBehavior::SerializeTo(gd::SerializerElement & element) const
{
    if ( platformType == Ladder)
        element.SetAttribute("platformType", "Ladder");
    else if ( platformType == Jumpthru )
        element.SetAttribute("platformType", "Jumpthru");
    else
        element.SetAttribute("platformType", "NormalPlatform");
}

std::map<gd::String, gd::PropertyDescriptor> PlatformBehavior::GetProperties(gd::Project & project) const
{
    std::map<gd::String, gd::PropertyDescriptor> properties;

    gd::String platformTypeStr = _("Platform");
    if ( platformType == Ladder)
        platformTypeStr = _("Ladder");
    else if ( platformType == Jumpthru )
        platformTypeStr = _("Jumpthru platform");

    properties[_("Type")]
        .SetValue(platformTypeStr)
        .SetType("Choice")
        .AddExtraInfo(_("Platform"))
        .AddExtraInfo(_("Jumpthru platform"))
        .AddExtraInfo(_("Ladder"));

    return properties;
}

bool PlatformBehavior::UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project)
{
    if ( name == _("Type") )
    {
        if ( value == _("Jumpthru platform") )
            platformType = Jumpthru;
        else if ( value == _("Ladder") )
            platformType = Ladder;
        else
            platformType = NormalPlatform;

        return true;
    }

    return false;
}

#endif
