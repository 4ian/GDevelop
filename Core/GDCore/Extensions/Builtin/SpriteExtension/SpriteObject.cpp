/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <algorithm>
#include "GDCore/Tools/Localization.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
#include "GDCore/Project/Project.h"
#include "GDCore/Project/Layout.h"
#include "GDCore/Project/Object.h"
#include "GDCore/Project/ImageManager.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/Project/InitialInstance.h"
#include "GDCore/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include <SFML/Graphics.hpp>
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Dialogs/SpriteObjectEditor.h"
#endif

namespace gd {

Animation SpriteObject::badAnimation;

SpriteObject::SpriteObject(gd::String name_) :
    Object(name_),
    updateIfNotVisible(false)
{
}

SpriteObject::~SpriteObject()
{
};

void SpriteObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    updateIfNotVisible = element.GetBoolAttribute("updateIfNotVisible", true);

    RemoveAllAnimations();
    const gd::SerializerElement & animationsElement = element.GetChild("animations", 0, "Animations");
    animationsElement.ConsiderAsArrayOf("animation", "Animation");
    for (std::size_t i = 0; i < animationsElement.GetChildrenCount(); ++i)
    {
        const gd::SerializerElement & animationElement = animationsElement.GetChild(i);
        Animation newAnimation;

        newAnimation.useMultipleDirections = animationElement.GetBoolAttribute("useMultipleDirections", false, "typeNormal");
        newAnimation.SetName(animationElement.GetStringAttribute("name", ""));

        //Compatibility with GD <= 3.3
        if (animationElement.HasChild("Direction"))
        {
            for (std::size_t j = 0; j < animationElement.GetChildrenCount("Direction"); ++j)
            {
                Direction direction;
                direction.UnserializeFrom(animationElement.GetChild("Direction", j));

                newAnimation.SetDirectionsCount(newAnimation.GetDirectionsCount()+1);
                newAnimation.SetDirection(direction, newAnimation.GetDirectionsCount()-1);
            }
        }
        //End of compatibility code
        else
        {
            const gd::SerializerElement & directionsElement = animationElement.GetChild("directions");
            directionsElement.ConsiderAsArrayOf("direction");
            for (std::size_t j = 0; j < directionsElement.GetChildrenCount(); ++j)
            {
                Direction direction;
                direction.UnserializeFrom(directionsElement.GetChild(j));

                newAnimation.SetDirectionsCount(newAnimation.GetDirectionsCount()+1);
                newAnimation.SetDirection(direction, newAnimation.GetDirectionsCount()-1);
            }
        }

        AddAnimation( newAnimation );
    }
}

#if defined(GD_IDE_ONLY)
void SpriteObject::DoSerializeTo(gd::SerializerElement & element) const
{
    element.SetAttribute("updateIfNotVisible", updateIfNotVisible);

    //Animations
    gd::SerializerElement & animationsElement = element.AddChild("animations");
    animationsElement.ConsiderAsArrayOf("animation");
    for ( std::size_t k = 0;k < GetAnimationsCount();k++ )
    {
        gd::SerializerElement & animationElement = animationsElement.AddChild("animation");

        animationElement.SetAttribute( "useMultipleDirections", GetAnimation(k).useMultipleDirections);
        animationElement.SetAttribute( "name", GetAnimation(k).GetName());

        gd::SerializerElement & directionsElement = animationElement.AddChild("directions");
        directionsElement.ConsiderAsArrayOf("direction");
        for ( std::size_t l = 0;l < GetAnimation(k).GetDirectionsCount();l++ )
        {
            GetAnimation(k).GetDirection(l).SerializeTo(directionsElement.AddChild("direction"));
        }
    }
}

std::map<gd::String, gd::PropertyDescriptor> SpriteObject::GetProperties(gd::Project & project) const
{
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties[_("Animate even if hidden or far from the screen")].SetValue(updateIfNotVisible ? "true" : "false").SetType("Boolean");
    properties[_("PLEASE_ALSO_SHOW_EDIT_BUTTON_THANKS")].SetValue("");

    return properties;
}

bool SpriteObject::UpdateProperty(const gd::String & name, const gd::String & value, gd::Project & project)
{
    if (name == _("Animate even if hidden or far from the screen")) updateIfNotVisible = value == "1";

    return true;
}

#if !defined(EMSCRIPTEN)
void SpriteObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    for ( std::size_t j = 0; j < animations.size();j++ )
    {
        Animation & anim = animations[j];
        for ( std::size_t k = 0;k < anim.GetDirectionsCount();k++ )
        {
            for ( std::size_t l = 0;l < anim.GetDirection(k).GetSpritesCount();l++ )
            {
                Sprite & sprite = anim.GetDirection(k).GetSprite(l);

                sprite.LoadImage(project.GetImageManager()->GetSFMLTexture(sprite.GetImageName()));
            }
        }
    }
}

const Sprite * SpriteObject::GetInitialInstanceSprite(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout, bool * shouldNotRotate) const
{
    if ( HasNoAnimations() ) return NULL;

    //Search the first sprite of the current animation/direction.
    std::size_t animationId = instance.floatInfos.find("animation") != instance.floatInfos.end() ? instance.floatInfos.find("animation")->second : 0;
    if ( animationId >= GetAnimationsCount() ) animationId = 0;

    const Animation & animation = GetAnimation(animationId);
    if ( animation.HasNoDirections() ) return NULL;

    std::size_t directionId = 0;
    if ( animation.useMultipleDirections ) {

        float normalizedAngle = static_cast<int>(instance.GetAngle())%360;
        if ( normalizedAngle < 0 ) normalizedAngle += 360;

        directionId = static_cast<int>(gd::Round(normalizedAngle/45.f))%8;
    }

    if ( directionId >= animation.GetDirectionsCount() ) directionId = 0;

    const Direction & direction = animation.GetDirection(directionId);

    if ( shouldNotRotate ) *shouldNotRotate = animation.useMultipleDirections;
    return direction.HasNoSprites() ? NULL : &direction.GetSprite(0);
}

void SpriteObject::DrawInitialInstance(gd::InitialInstance & instance, sf::RenderTarget & renderTarget, gd::Project & project, gd::Layout & layout)
{
    bool shouldNotRotate = false;
    const Sprite * associatedSprite = GetInitialInstanceSprite(instance, project, layout, &shouldNotRotate);
    if ( associatedSprite == NULL || !associatedSprite->GetSFMLTexture() ) return;

    sf::Sprite sprite(associatedSprite->GetSFMLTexture()->texture);

    float scaleX = instance.HasCustomSize() ? instance.GetCustomWidth()/associatedSprite->GetSFMLTexture()->texture.getSize().x : 1;
    float scaleY = instance.HasCustomSize() ? instance.GetCustomHeight()/associatedSprite->GetSFMLTexture()->texture.getSize().y : 1;

    sprite.setOrigin( associatedSprite->GetCenter().GetX(), associatedSprite->GetCenter().GetY() ); ;
    sprite.setRotation( shouldNotRotate ? 0 : instance.GetAngle() );
    sprite.setPosition( instance.GetX() + (associatedSprite->GetCenter().GetX() - associatedSprite->GetOrigin().GetX())*fabs(scaleX),
                        instance.GetY() + (associatedSprite->GetCenter().GetY() - associatedSprite->GetOrigin().GetY())*fabs(scaleY) );
    sprite.setScale(scaleX, scaleY);

    renderTarget.draw(sprite);
}

sf::Vector2f SpriteObject::GetInitialInstanceDefaultSize(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    const Sprite * associatedSprite = GetInitialInstanceSprite(instance, project, layout);
    if ( associatedSprite == NULL || !associatedSprite->GetSFMLTexture() ) return sf::Vector2f(32,32);

    sf::Vector2u size = associatedSprite->GetSFMLTexture()->texture.getSize();
    return sf::Vector2f(size.x, size.y);
}

sf::Vector2f SpriteObject::GetInitialInstanceOrigin(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout) const
{
    const Sprite * associatedSprite = GetInitialInstanceSprite(instance, project, layout);
    if ( associatedSprite == NULL || !associatedSprite->GetSFMLTexture() ) return sf::Vector2f(0,0);

    float scaleX = instance.HasCustomSize() ? instance.GetCustomWidth()/associatedSprite->GetSFMLTexture()->texture.getSize().x : 1;
    float scaleY = instance.HasCustomSize() ? instance.GetCustomHeight()/associatedSprite->GetSFMLTexture()->texture.getSize().y : 1;

    return sf::Vector2f(((float)associatedSprite->GetOrigin().GetX())*fabs(scaleX),
                        ((float)associatedSprite->GetOrigin().GetY())*fabs(scaleY));
}
#endif

bool SpriteObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail) const
{
#if !defined(GD_NO_WX_GUI)
    //Generate a thumbnail from the first animation
    if ( !HasNoAnimations() && !GetAnimation(0).HasNoDirections() && !GetAnimation(0).GetDirection(0).HasNoSprites() )
    {
        gd::String imageName = GetAnimation(0).GetDirection(0).GetSprite(0).GetImageName();

        if ( project.GetResourcesManager().HasResource(imageName) && wxFileExists(project.GetResourcesManager().GetResource(imageName).GetAbsoluteFile(project)) )
        {
            thumbnail = wxBitmap( project.GetResourcesManager().GetResource(imageName).GetAbsoluteFile(project), wxBITMAP_TYPE_ANY);

            wxImage thumbImage = thumbnail.ConvertToImage();
            thumbnail = wxBitmap(thumbImage.Scale(24, 24));

            return true;
        }
    }
#endif

    return false;
}

void SpriteObject::ExposeResources(gd::ArbitraryResourceWorker & worker)
{
    for ( std::size_t j = 0; j < GetAnimationsCount();j++ )
    {
        for ( std::size_t k = 0;k < GetAnimation( j ).GetDirectionsCount();k++ )
        {
            for ( std::size_t l = 0;l < GetAnimation( j ).GetDirection(k).GetSpritesCount();l++ ) {
                worker.ExposeImage(GetAnimation( j ).GetDirection(k).GetSprite(l).GetImageName());
            }
        }
    }
}

void SpriteObject::EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper )
{
#if !defined(GD_NO_WX_GUI)
    SpriteObjectEditor dialog( parent, project, *this, mainFrameWrapper );
    dialog.ShowModal();
#endif
}


std::map<gd::String, gd::PropertyDescriptor> SpriteObject::GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & project, gd::Layout & scene)
{
    std::map<gd::String, gd::PropertyDescriptor> properties;
    properties[_("Animation")] = position.floatInfos.find("animation") != position.floatInfos.end() ?
                                           gd::String::From(position.floatInfos.find("animation")->second) :
                                           gd::String("0");

    return properties;
}

bool SpriteObject::UpdateInitialInstanceProperty(gd::InitialInstance & position, const gd::String & name, const gd::String & value, gd::Project & project, gd::Layout & scene)
{
    if ( name == _("Animation") ) position.floatInfos["animation"] = value.To<int>();

    return true;
}
#endif

const Animation & SpriteObject::GetAnimation(std::size_t nb) const
{
    if ( nb >= animations.size())
        return badAnimation;

    return animations[nb];
}

Animation & SpriteObject::GetAnimation(std::size_t nb)
{
    if ( nb >= animations.size())
        return badAnimation;

    return animations[nb];
}

void SpriteObject::AddAnimation(const Animation & animation)
{
    animations.push_back(animation);
}

bool SpriteObject::RemoveAnimation(std::size_t nb)
{
    if ( nb >= GetAnimationsCount() )
        return false;

    animations.erase( animations.begin() + nb );
    return true;
}

void SpriteObject::SwapAnimations(std::size_t firstIndex, std::size_t secondIndex)
{
    if ( firstIndex < animations.size() && secondIndex < animations.size() && firstIndex != secondIndex)
        std::swap(animations[firstIndex], animations[secondIndex]);
}

void SpriteObject::MoveAnimation(std::size_t oldIndex, std::size_t newIndex)
{
    if ( oldIndex >= animations.size() || newIndex >= animations.size())
        return;

    auto animation = animations[oldIndex];
    animations.erase(animations.begin() + oldIndex);
    animations.insert(animations.begin() + newIndex, animation);
}

}
