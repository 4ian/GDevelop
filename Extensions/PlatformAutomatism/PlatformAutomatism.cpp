/**

GDevelop - Platform Automatism Extension
Copyright (c) 2014-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/

#include <memory>
#include "PlatformAutomatism.h"
#include "GDCore/Tools/Localization.h"
#include "GDCpp/Scene.h"
#include "GDCpp/Serialization/SerializerElement.h"
#include "GDCpp/XmlMacros.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/RuntimeObject.h"
#include "GDCpp/CommonTools.h"
#include "ScenePlatformObjectsManager.h"
#if defined(GD_IDE_ONLY)
#include <iostream>
#include <map>
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#endif


PlatformAutomatism::PlatformAutomatism() :
    parentScene(NULL),
    sceneManager(NULL),
    registeredInManager(false),
    platformType(NormalPlatform)
{
}

PlatformAutomatism::~PlatformAutomatism()
{
    if ( sceneManager && registeredInManager ) sceneManager->RemovePlatform(this);
}

void PlatformAutomatism::DoStepPreEvents(RuntimeScene & scene)
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

void PlatformAutomatism::DoStepPostEvents(RuntimeScene & scene)
{

}

void PlatformAutomatism::ChangePlatformType(const std::string & platformType_)
{
    if ( platformType_ == "Ladder" ) platformType = Ladder;
    else if ( platformType_ == "Jumpthru" ) platformType = Jumpthru;
    else platformType = NormalPlatform;
}

void PlatformAutomatism::OnActivate()
{
    if ( sceneManager )
    {
        sceneManager->AddPlatform(this);
        registeredInManager = true;
    }
}

void PlatformAutomatism::OnDeActivate()
{
    if ( sceneManager )
        sceneManager->RemovePlatform(this);

    registeredInManager = false;
}

void PlatformAutomatism::UnserializeFrom(const gd::SerializerElement & element)
{
    std::string platformTypeStr = element.GetStringAttribute("platformType");
    platformType = platformTypeStr == "Ladder" ?  Ladder : (platformTypeStr == "Jumpthru" ?
        Jumpthru : NormalPlatform);
}

#if defined(GD_IDE_ONLY)
void PlatformAutomatism::SerializeTo(gd::SerializerElement & element) const
{
    if ( platformType == Ladder)
        element.SetAttribute("platformType", "Ladder");
    else if ( platformType == Jumpthru )
        element.SetAttribute("platformType", "Jumpthru");
    else
        element.SetAttribute("platformType", "NormalPlatform");
}

std::map<std::string, gd::PropertyDescriptor> PlatformAutomatism::GetProperties(gd::Project & project) const
{
    std::map<std::string, gd::PropertyDescriptor> properties;

    std::string platformTypeStr = _("Platform");
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

bool PlatformAutomatism::UpdateProperty(const std::string & name, const std::string & value, gd::Project & project)
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
