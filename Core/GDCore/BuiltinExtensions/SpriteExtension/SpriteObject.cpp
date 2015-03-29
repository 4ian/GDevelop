/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <algorithm>
#include "GDCore/Tools/Localization.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Animation.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Direction.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Sprite.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/ImageManager.h"
#include "GDCore/Serialization/SerializerElement.h"
#include "GDCore/PlatformDefinition/InitialInstance.h"
#include "GDCore/CommonTools.h"

#if defined(GD_IDE_ONLY)
#include <SFML/Graphics.hpp>
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Dialogs/SpriteObjectEditor.h"
#endif

namespace gd {

Animation SpriteObject::badAnimation;

SpriteObject::SpriteObject(std::string name_) :
    Object(name_)
{
}

SpriteObject::~SpriteObject()
{
};


void SpriteObject::DoUnserializeFrom(gd::Project & project, const gd::SerializerElement & element)
{
    const gd::SerializerElement & animationsElement = element.GetChild("animations", 0, "Animations");
    animationsElement.ConsiderAsArrayOf("animation", "Animation");
    for (unsigned int i = 0; i < animationsElement.GetChildrenCount(); ++i)
    {
        const gd::SerializerElement & animationElement = animationsElement.GetChild(i);
        Animation newAnimation;

        newAnimation.useMultipleDirections = animationElement.GetBoolAttribute("useMultipleDirections", false, "typeNormal");

        //Compatibility with GD <= 3.3
        if (animationElement.HasChild("Direction"))
        {
            for (unsigned int j = 0; j < animationElement.GetChildrenCount("Direction"); ++j)
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
            for (unsigned int j = 0; j < directionsElement.GetChildrenCount(); ++j)
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
    //Animations
    gd::SerializerElement & animationsElement = element.AddChild("animations");
    animationsElement.ConsiderAsArrayOf("animation");
    for ( unsigned int k = 0;k < GetAnimationsCount();k++ )
    {
        gd::SerializerElement & animationElement = animationsElement.AddChild("animation");

        animationElement.SetAttribute( "useMultipleDirections", GetAnimation(k).useMultipleDirections);

        gd::SerializerElement & directionsElement = animationElement.AddChild("directions");
        directionsElement.ConsiderAsArrayOf("direction");
        for ( unsigned int l = 0;l < GetAnimation(k).GetDirectionsCount();l++ )
        {
            GetAnimation(k).GetDirection(l).SerializeTo(directionsElement.AddChild("direction"));
        }
    }
}
#if !defined(EMSCRIPTEN)
void SpriteObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    for ( unsigned int j = 0; j < animations.size();j++ )
    {
        Animation & anim = animations[j];
        for ( unsigned int k = 0;k < anim.GetDirectionsCount();k++ )
        {
            for ( unsigned int l = 0;l < anim.GetDirection(k).GetSpritesCount();l++ )
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
    unsigned int animationId = instance.floatInfos.find("animation") != instance.floatInfos.end() ? instance.floatInfos.find("animation")->second : 0;
    if ( animationId >= GetAnimationsCount() ) animationId = 0;

    const Animation & animation = GetAnimation(animationId);
    if ( animation.HasNoDirections() ) return NULL;

    unsigned int directionId = 0;
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
        std::string imageName = GetAnimation(0).GetDirection(0).GetSprite(0).GetImageName();

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
    for ( unsigned int j = 0; j < GetAnimationsCount();j++ )
    {
        for ( unsigned int k = 0;k < GetAnimation( j ).GetDirectionsCount();k++ )
        {
            for ( unsigned int l = 0;l < GetAnimation( j ).GetDirection(k).GetSpritesCount();l++ )
                worker.ExposeImage(GetAnimation( j ).GetDirection(k).GetSprite(l).GetImageName());
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


std::map<std::string, gd::PropertyDescriptor> SpriteObject::GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & project, gd::Layout & scene)
{
    std::map<std::string, gd::PropertyDescriptor> properties;
    properties[GD_T("Animation")] = position.floatInfos.find("animation") != position.floatInfos.end() ?
                                           ToString(position.floatInfos.find("animation")->second) :
                                           "0";

    return properties;
}

bool SpriteObject::UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & project, gd::Layout & scene)
{
    if ( name == GD_T("Animation") ) position.floatInfos["animation"] = ToInt(value);

    return true;
}
#endif

const Animation & SpriteObject::GetAnimation(unsigned int nb) const
{
    if ( nb >= animations.size())
        return badAnimation;

    return animations[nb];
}

Animation & SpriteObject::GetAnimation(unsigned int nb)
{
    if ( nb >= animations.size())
        return badAnimation;

    return animations[nb];
}

void SpriteObject::AddAnimation(const Animation & animation)
{
    animations.push_back(animation);
}

bool SpriteObject::RemoveAnimation(unsigned int nb)
{
    if ( nb >= GetAnimationsCount() )
        return false;

    animations.erase( animations.begin() + nb );
    return true;
}

void SpriteObject::SwapAnimations(unsigned int firstIndex, unsigned int secondIndex)
{
    if ( firstIndex < animations.size() && secondIndex < animations.size() && firstIndex != secondIndex)
        std::swap(animations[firstIndex], animations[secondIndex]);
}

/**
 * Function creating an extension Object.
 * GDevelop can not directly create an extension object
 */
gd::Object * CreateSpriteObject(std::string name)
{
    return new SpriteObject(name);
}

}
