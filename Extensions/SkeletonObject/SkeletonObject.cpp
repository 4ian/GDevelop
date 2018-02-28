
/**
GDevelop - Skeleton Object Extension
Copyright (c) 2017-2018 Franco Maciel (francomaciel10@gmail.com)
This project is released under the MIT License.
*/

#include <SFML/Graphics.hpp>
#include "GDCpp/Runtime/Project/Object.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/Serialization/SerializerElement.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "SkeletonObject.h"

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/bitmap.h>

sf::Texture SkeletonObject::edittimeIconImage;
sf::Sprite SkeletonObject::edittimeIcon;
#endif

SkeletonObject::SkeletonObject(gd::String name_) :
    Object(name_)
{
}

std::map<gd::String, gd::PropertyDescriptor> SkeletonObject::GetProperties(gd::Project & project) const
{
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties[_("Skeletal data filename")].SetValue(skeletalDataFilename);
    properties[_("Main armature name")].SetValue(rootArmatureName);
    properties[_("Texture data filename")].SetValue(textureDataFilename);
    properties[_("Texture")].SetValue(textureName);
    properties[_("API")]
        .SetValue(apiName)
        .SetType("Choice")
        .AddExtraInfo("DragonBones");

    return properties;
}

bool SkeletonObject::UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project)
{
    if (name == _("Skeletal data filename")) skeletalDataFilename = value;
    if (name == _("Main armature name")) rootArmatureName = value;
    if (name == _("Texture data filename")) textureDataFilename = value;
    if (name == _("Texture")) textureName = value;
    if (name == _("API")) apiName = value;

    return true;
}

void SkeletonObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    skeletalDataFilename = element.GetStringAttribute("skeletalDataFilename");
    rootArmatureName = element.GetStringAttribute("rootArmatureName");
    textureDataFilename = element.GetStringAttribute("textureDataFilename");
    textureName = element.GetStringAttribute("textureName");
    apiName = element.GetStringAttribute("apiName");
}

void SkeletonObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("skeletalDataFilename", skeletalDataFilename);
    element.SetAttribute("rootArmatureName", rootArmatureName);
    element.SetAttribute("textureDataFilename", textureDataFilename);
    element.SetAttribute("textureName", textureName);
    element.SetAttribute("apiName", apiName);
}

#if !defined(GD_NO_WX_GUI)
void SkeletonObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    edittimeIcon.setPosition(instance.GetX() - 16.0f, instance.GetY() - 16.0f);
    renderTarget.draw(edittimeIcon);
}

void SkeletonObject::LoadEdittimeIcon()
{
    edittimeIconImage.loadFromFile("JsPlatform/Extensions/skeletonicon.png");
    edittimeIcon.setTexture(edittimeIconImage);
}

bool SkeletonObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
    thumbnail = wxBitmap("JsPlatform/Extensions/skeletonicon24.png", wxBITMAP_TYPE_ANY);

    return true;
}

sf::Vector2f SkeletonObject::GetInitialInstanceOrigin(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const 
{ 
    return sf::Vector2f(16.0f, 16.0f); 
}
#endif

gd::Object * CreateSkeletonObject(gd::String name)
{
    return new SkeletonObject(name);
}
