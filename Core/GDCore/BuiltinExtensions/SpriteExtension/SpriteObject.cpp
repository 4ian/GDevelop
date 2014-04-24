/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include "GDCore/Tools/Localization.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Animation.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Direction.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Sprite.h"
#include "GDCore/PlatformDefinition/Project.h"
#include "GDCore/PlatformDefinition/Layout.h"
#include "GDCore/PlatformDefinition/Object.h"
#include "GDCore/PlatformDefinition/ImageManager.h"
#include "GDCore/TinyXml/tinyxml.h"
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

void SpriteObject::DoLoadFromXml(gd::Project & project, const TiXmlElement * elemScene)
{
    if ( elemScene->FirstChildElement( "Animations" ) == NULL ) return;

    const TiXmlElement * animationElem = elemScene->FirstChildElement( "Animations" )->FirstChildElement();

    while ( animationElem )
    {
        Animation newAnimation;
        newAnimation.useMultipleDirections = (animationElem->Attribute( "typeNormal" )  != NULL && ToString(animationElem->Attribute( "typeNormal" )) == "true");

        const TiXmlElement *elemObjetDirecScene = animationElem->FirstChildElement();
        while ( elemObjetDirecScene )
        {
            Direction direction;
            direction.LoadFromXml(elemObjetDirecScene);

            newAnimation.SetDirectionsNumber(newAnimation.GetDirectionsNumber()+1);
            newAnimation.SetDirection(direction, newAnimation.GetDirectionsNumber()-1);
            elemObjetDirecScene = elemObjetDirecScene->NextSiblingElement();
        }

        AddAnimation( newAnimation );

        animationElem = animationElem->NextSiblingElement();
    }
}

#if defined(GD_IDE_ONLY)
void SpriteObject::DoSaveToXml(TiXmlElement * elem)
{
    //Animations
    TiXmlElement * animations = new TiXmlElement( "Animations" );
    elem->LinkEndChild( animations );
    TiXmlElement * animation;

    for ( unsigned int k = 0;k < GetAnimationCount();k++ )
    {
        animation = new TiXmlElement( "Animation" );
        animations->LinkEndChild( animation );

        animation->SetAttribute( "typeNormal", GetAnimation( k ).useMultipleDirections ? "true" : "false" );

        TiXmlElement * direction;
        for ( unsigned int l = 0;l < GetAnimation( k ).GetDirectionsNumber();l++ )
        {
            direction = new TiXmlElement( "Direction" );
            animation->LinkEndChild( direction );

            GetAnimation(k).GetDirection(l).SaveToXml(direction);

        }
    }
}

void SpriteObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    std::cout << "Reloading resources for" << name;
    for ( unsigned int j = 0; j < animations.size();j++ )
    {
        Animation & anim = animations[j];
        for ( unsigned int k = 0;k < anim.GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < anim.GetDirection(k).GetSpriteCount();l++ )
            {
                Sprite & sprite = anim.GetDirection(k).GetSprite(l);

                sprite.LoadImage(project.GetImageManager()->GetSFMLTexture(sprite.GetImageName()));
            }
        }
    }
    std::cout << "END" << std::endl;
}

const Sprite * SpriteObject::GetInitialInstanceSprite(gd::InitialInstance & instance, gd::Project & project, gd::Layout & layout, bool * shouldNotRotate) const
{
    if ( HasNoAnimations() ) return NULL;

    //Search the first sprite of the current animation/direction.
    unsigned int animationId = instance.floatInfos.find("animation") != instance.floatInfos.end() ? instance.floatInfos.find("animation")->second : 0;
    if ( animationId >= GetAnimationCount() ) animationId = 0;

    const Animation & animation = GetAnimation(animationId);
    if ( animation.HasNoDirections() ) return NULL;

    unsigned int directionId = 0;
    if ( animation.useMultipleDirections ) {

        float normalizedAngle = static_cast<int>(instance.GetAngle())%360;
        if ( normalizedAngle < 0 ) normalizedAngle += 360;

        directionId = static_cast<int>(gd::Round(normalizedAngle/45.f))%8;
    }

    if ( directionId >= animation.GetDirectionsNumber() ) directionId = 0;

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

    float scaleX = instance.HasCustomSize() ? instance.GetCustomWidth()/sprite.getLocalBounds().width : 1;
    float scaleY = instance.HasCustomSize() ? instance.GetCustomHeight()/sprite.getLocalBounds().height : 1;

    sprite.setOrigin( associatedSprite->GetCentre().GetX(), associatedSprite->GetCentre().GetY() ); ;
    sprite.setRotation( shouldNotRotate ? 0 : instance.GetAngle() );
    sprite.setPosition( instance.GetX() + (associatedSprite->GetCentre().GetX() - associatedSprite->GetOrigine().GetX())*abs(scaleX),
                        instance.GetY() + (associatedSprite->GetCentre().GetY() - associatedSprite->GetOrigine().GetY())*abs(scaleY) );
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

    return sf::Vector2f(associatedSprite->GetOrigine().GetX()*abs(scaleX),
                        associatedSprite->GetOrigine().GetY()*abs(scaleY));
}

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
    for ( unsigned int j = 0; j < GetAnimationCount();j++ )
    {
        for ( unsigned int k = 0;k < GetAnimation( j ).GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < GetAnimation( j ).GetDirection(k).GetSpriteCount();l++ )
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
    properties[ToString(_("Animation"))] = position.floatInfos.find("animation") != position.floatInfos.end() ?
                                           ToString(position.floatInfos.find("animation")->second) :
                                           "0";

    return properties;
}

bool SpriteObject::UpdateInitialInstanceProperty(gd::InitialInstance & position, const std::string & name, const std::string & value, gd::Project & project, gd::Layout & scene)
{
    if ( name == _("Animation") ) position.floatInfos["animation"] = ToInt(value);

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
    if ( nb >= GetAnimationCount() )
        return false;

    animations.erase( animations.begin() + nb );
    return true;
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroySpriteObject(gd::Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
gd::Object * CreateSpriteObject(std::string name)
{
    return new SpriteObject(name);
}

}