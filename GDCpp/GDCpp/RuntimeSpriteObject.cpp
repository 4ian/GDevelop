/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include "RuntimeSpriteObject.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Sprite.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Animation.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Direction.h"
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeLayer.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCpp/Position.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/RuntimeScene.h"
#include <SFML/Graphics.hpp>
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/BuiltinExtensions/SpriteExtension/Dialogs/SpriteObjectEditor.h"
#endif
#if !defined(GD_IDE_ONLY)
#include "GDCore/BuiltinExtensions/SpriteExtension/SpriteObject.cpp"
#include "GDCore/BuiltinExtensions/SpriteExtension/Animation.cpp"
#include "GDCore/BuiltinExtensions/SpriteExtension/Direction.cpp"
#include "GDCore/BuiltinExtensions/SpriteExtension/Sprite.cpp"
#endif

gd::Animation RuntimeSpriteObject::badAnimation;
gd::Sprite * RuntimeSpriteObject::badSpriteDatas = NULL;

RuntimeSpriteObject::RuntimeSpriteObject(RuntimeScene & scene, const gd::Object & object) :
    RuntimeObject(scene, object),
    currentAnimation( 0 ),
    currentDirection( 0 ),
    currentAngle( 0 ),
    currentSprite( 0 ),
    animationStopped(false),
    timeElapsedOnCurrentSprite(0),
    ptrToCurrentSprite( NULL ),
    needUpdateCurrentSprite(true),
    opacity( 255 ),
    blendMode(0),
    isFlippedX(false),
    isFlippedY(false),
    scaleX( 1 ),
    scaleY( 1 ),
    colorR( 255 ),
    colorV( 255 ),
    colorB( 255 )
{
    if (!badSpriteDatas) badSpriteDatas = new gd::Sprite();

    //Initialize the runtime object using the object
    const gd::SpriteObject & spriteObject = static_cast<const gd::SpriteObject&>(object);

    animations.clear();
    for (unsigned int i = 0; i < spriteObject.GetAllAnimations().size(); ++i)
        animations.push_back(AnimationProxy(spriteObject.GetAllAnimations()[i]));

    //Load resources
    for ( unsigned int j = 0; j < animations.size();j++ )
    {
        gd::Animation & anim = animations[j].GetNonConst();
        for ( unsigned int k = 0;k < anim.GetDirectionsCount();k++ )
        {
            for ( unsigned int l = 0;l < anim.GetDirection(k).GetSpritesCount();l++ )
            {
                gd::Sprite & sprite = anim.GetDirection(k).GetSprite(l);

                sprite.LoadImage(scene.GetImageManager()->GetSFMLTexture(sprite.GetImageName()));
            }
        }
    }
}

RuntimeSpriteObject::~RuntimeSpriteObject()
{
};

/**
 * Update animation and direction from the inital position
 */
bool RuntimeSpriteObject::ExtraInitializationFromInitialInstance(const gd::InitialInstance & position)
{
    if ( position.floatInfos.find("animation") != position.floatInfos.end() )
        SetCurrentAnimation(position.floatInfos.find("animation")->second);

    return true;
}

/**
 * Render object at runtime
 */
bool RuntimeSpriteObject::Draw( sf::RenderTarget & renderTarget )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    renderTarget.draw( GetCurrentSFMLSprite(), sf::RenderStates(blendMode == 0 ? sf::BlendAlpha :
                                                               (blendMode == 1 ? sf::BlendAdd :
                                                               (blendMode == 2 ? sf::BlendMultiply :
                                                                sf::BlendNone))));

    return true;
}

/**
 * Get the real X position of the sprite
 */
float RuntimeSpriteObject::GetDrawableX() const
{
    return X - GetCurrentSprite().GetOrigin().GetX()*fabs(scaleX);
}

/**
 * Get the real Y position of the sprite
 */
float RuntimeSpriteObject::GetDrawableY() const
{
    return Y - GetCurrentSprite().GetOrigin().GetY()*fabs(scaleY);
}

/**
 * Get the width of the current sprite.
 */
float RuntimeSpriteObject::GetWidth() const
{
    return scaleX > 0 ? GetCurrentSFMLSprite().getLocalBounds().width*scaleX : -GetCurrentSFMLSprite().getLocalBounds().width*scaleX;
}

/**
 * Get the height of the current sprite.
 */
float RuntimeSpriteObject::GetHeight() const
{
    return scaleY > 0 ? GetCurrentSFMLSprite().getLocalBounds().height*scaleY : -GetCurrentSFMLSprite().getLocalBounds().height*scaleY;
}

void RuntimeSpriteObject::SetWidth(float newWidth)
{
    if ( newWidth > 0 )
    {
        scaleX = newWidth/GetCurrentSFMLSprite().getLocalBounds().width;
        if ( isFlippedX ) scaleX *= -1;
        needUpdateCurrentSprite = true;
    }
}

void RuntimeSpriteObject::SetHeight(float newHeight)
{
    if ( newHeight > 0 )
    {
        scaleY = newHeight/GetCurrentSFMLSprite().getLocalBounds().height;
        if ( isFlippedY ) scaleY *= -1;
        needUpdateCurrentSprite = true;
    }
}

void RuntimeSpriteObject::SetOriginalSize()
{
    scaleX = 1;
    scaleY = 1;
    needUpdateCurrentSprite = true;
}

/**
 * X center is computed with the current sprite
 */
float RuntimeSpriteObject::GetCenterX() const
{
    //Just need to multiply by the scale as it is the center
    return GetCurrentSprite().GetCenter().GetX()*fabs(scaleX);
}

/**
 * Y center is computed with the current sprite
 */
float RuntimeSpriteObject::GetCenterY() const
{
    //Just need to multiply by the scale as it is the center
    return GetCurrentSprite().GetCenter().GetY()*fabs(scaleY);
}

float RuntimeSpriteObject::GetPointX(const std::string & name) const
{
    if ( !name.empty() )
    {
        const Point & point = GetCurrentSprite().GetPoint(name);
        return GetCurrentSFMLSprite().getTransform().transformPoint(point.GetX(), point.GetY()).x;
    }

    return GetX();
}

float RuntimeSpriteObject::GetPointY(const std::string & name) const
{
    if ( !name.empty() )
    {
        const Point & point = GetCurrentSprite().GetPoint(name);
        return GetCurrentSFMLSprite().getTransform().transformPoint(point.GetX(), point.GetY()).y;
    }

    return GetY();
}

void RuntimeSpriteObject::ChangeScale( const std::string & operatorStr, double newScale)
{
    //TODO : Generate appropriate code calling SetScaleX/Y instead of this.
    if ( operatorStr == "=" )
    {
        SetScaleX(newScale);
        SetScaleY(newScale);
    }
    else if ( operatorStr == "+" )
    {
        SetScaleX(GetScaleX()+newScale);
        SetScaleY(GetScaleY()+newScale);
    }
    else if ( operatorStr == "-" )
    {
        SetScaleX(GetScaleX()-newScale);
        SetScaleY(GetScaleY()-newScale);
    }
    else if ( operatorStr == "*" )
    {
        SetScaleX(GetScaleX()*newScale);
        SetScaleY(GetScaleY()*newScale);
    }
    else if ( operatorStr == "/" )
    {
        SetScaleX(GetScaleX()/newScale);
        SetScaleY(GetScaleY()/newScale);
    }

    return;
}

void RuntimeSpriteObject::CopyImageOnImageOfCurrentSprite(RuntimeScene & scene, const std::string & imageName, float xPosition, float yPosition, bool useTransparency)
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    ptrToCurrentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    std::shared_ptr<SFMLTextureWrapper> dest = ptrToCurrentSprite->GetSFMLTexture();

    //Make sure the coordinates are correct.
    if ( xPosition < 0 || static_cast<unsigned>(xPosition) >= dest->texture.getSize().x) return;
    if ( yPosition < 0 || static_cast<unsigned>(yPosition) >= dest->texture.getSize().y) return;

    //Update texture and pixel perfect collision mask
    dest->image.copy(scene.GetImageManager()->GetSFMLTexture(imageName)->image, xPosition, yPosition, sf::IntRect(0, 0, 0, 0), useTransparency);
    dest->texture.loadFromImage(dest->image);
}

void RuntimeSpriteObject::MakeColorTransparent( const std::string & colorStr )
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    ptrToCurrentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    std::shared_ptr<SFMLTextureWrapper> dest = ptrToCurrentSprite->GetSFMLTexture();

    std::vector < std::string > colors = SplitString <std::string> (colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    //Update texture and pixel perfect collision mask
    dest->image.createMaskFromColor(  sf::Color( ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2])));
    dest->texture.loadFromImage(dest->image);
}

void RuntimeSpriteObject::SetColor(const std::string & colorStr)
{
    std::vector < std::string > colors = SplitString<std::string>(colorStr, ';');
    if ( colors.size() < 3 ) return; //Color is not valid

    SetColor(  ToInt(colors[0]),
               ToInt(colors[1]),
               ToInt(colors[2]) );
}

/**
 * Prepare the current sprite
 */
void RuntimeSpriteObject::UpdateCurrentSprite() const
{
    bool multipleDirections = false;
    if ( currentAnimation >= animations.size() )
        ptrToCurrentSprite = badSpriteDatas;
    else
    {
        gd::Animation & animation = animations[currentAnimation].GetNonConst();
        multipleDirections = animation.useMultipleDirections;

        unsigned int directionIndex = multipleDirections ? currentDirection : 0;
        if ( directionIndex >= animation.GetDirectionsCount() )
            ptrToCurrentSprite = badSpriteDatas;
        else
        {
            gd::Direction & direction = animation.GetDirection(directionIndex);
            if ( currentSprite >= direction.GetSpritesCount())
                ptrToCurrentSprite = badSpriteDatas;
            else
                ptrToCurrentSprite = &direction.GetSprite(currentSprite);
        }
    }

    ptrToCurrentSprite->GetSFMLSprite().setOrigin( ptrToCurrentSprite->GetCenter().GetX(), ptrToCurrentSprite->GetCenter().GetY() ); ;
    ptrToCurrentSprite->GetSFMLSprite().setRotation( multipleDirections ? 0 : currentAngle );
    ptrToCurrentSprite->GetSFMLSprite().setPosition( X + (ptrToCurrentSprite->GetCenter().GetX() - ptrToCurrentSprite->GetOrigin().GetX())*fabs(scaleX),
                                                     Y + (ptrToCurrentSprite->GetCenter().GetY() - ptrToCurrentSprite->GetOrigin().GetY())*fabs(scaleY) );
    if ( isFlippedX ) ptrToCurrentSprite->GetSFMLSprite().move((ptrToCurrentSprite->GetSFMLSprite().getLocalBounds().width/2-ptrToCurrentSprite->GetCenter().GetX())*fabs(scaleX)*2,0 );
    if ( isFlippedY ) ptrToCurrentSprite->GetSFMLSprite().move(0, (ptrToCurrentSprite->GetSFMLSprite().getLocalBounds().height/2-ptrToCurrentSprite->GetCenter().GetY())*fabs(scaleY)*2);
    ptrToCurrentSprite->GetSFMLSprite().setScale( scaleX, scaleY );
    ptrToCurrentSprite->GetSFMLSprite().setColor( sf::Color( colorR, colorV, colorB, opacity ) );

    needUpdateCurrentSprite = false;
}


/**
 * Update the time elpased on the current sprite, and change this latter if needed.
 */
void RuntimeSpriteObject::UpdateTime(float elapsedTime)
{
    if ( animationStopped || currentAnimation >= GetAnimationsCount() ) return;

    timeElapsedOnCurrentSprite += elapsedTime;

    const gd::Direction & direction = animations[currentAnimation].Get().GetDirection( currentDirection );

    float delay = direction.GetTimeBetweenFrames();

    //On gère l'avancement du sprite actuel suivant le temps entre chaque sprite
    if ( timeElapsedOnCurrentSprite > delay )
    {
        if ( delay != 0 )
        {
            unsigned int frameCount = static_cast<unsigned int>( timeElapsedOnCurrentSprite / delay );
            currentSprite += frameCount;
        }
        else currentSprite++;

        timeElapsedOnCurrentSprite = 0;
    }
    if ( currentSprite >= direction.GetSpritesCount() )
    {
        if ( direction.IsLooping() )  currentSprite = 0;
        else  currentSprite = direction.GetSpritesCount() - 1;
    }

    needUpdateCurrentSprite = true;
}

/**
 * Get the SFML sprite
 */
const sf::Sprite & RuntimeSpriteObject::GetCurrentSFMLSprite() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return ptrToCurrentSprite->GetSFMLSprite();
}

/**
 * Get the ( GDevelop ) sprite
 */
const gd::Sprite & RuntimeSpriteObject::GetCurrentSprite() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return *ptrToCurrentSprite;
}

/**
 * Get object hit box(es)
 */
std::vector<Polygon2d> RuntimeSpriteObject::GetHitBoxes() const
{
    if ( currentAnimation >= animations.size() )
    {
        std::vector<Polygon2d> hitboxes; //Invalid animation, bail out.
        return hitboxes;
    }
    const sf::Sprite & currentSFMLSprite = GetCurrentSFMLSprite();

    std::vector<Polygon2d> polygons = GetCurrentSprite().GetCollisionMask();
    for (unsigned int i = 0;i<polygons.size();++i)
    {
        for (unsigned int j = 0;j<polygons[i].vertices.size();++j)
        {
            sf::Vector2f newVertice = currentSFMLSprite.getTransform().transformPoint(
                            !isFlippedX ? polygons[i].vertices[j].x : GetCurrentSprite().GetSFMLSprite().getLocalBounds().width-polygons[i].vertices[j].x,
                            !isFlippedY ? polygons[i].vertices[j].y : GetCurrentSprite().GetSFMLSprite().getLocalBounds().height-polygons[i].vertices[j].y);
            polygons[i].vertices[j] = newVertice;
        }
    }

    return polygons;
}

/**
 * Change the number of the current sprite
 */
bool RuntimeSpriteObject::SetSprite( unsigned int nb )
{
    if ( currentAnimation >= GetAnimationsCount() ||
        currentDirection >= animations[currentAnimation].Get().GetDirectionsCount() ||
        nb >= animations[currentAnimation].Get().GetDirection( currentDirection ).GetSpritesCount() ) return false;

    currentSprite = nb;
    timeElapsedOnCurrentSprite = 0;

    needUpdateCurrentSprite = true;
    return true;
}

/**
 * Change the number of the current animation
 */
bool RuntimeSpriteObject::SetCurrentAnimation( unsigned int nb )
{
    if ( nb >= GetAnimationsCount() ) return false;

    if ( nb == currentAnimation ) return true;

    currentAnimation = nb;
    currentSprite = 0;
    timeElapsedOnCurrentSprite = 0;

    needUpdateCurrentSprite = true;
    return true;
}

/**
 * Change the value of the current direction.
 * If Sprite is using a direction which use angle, the function behave as SetAngle.
 */
bool RuntimeSpriteObject::SetDirection( float nb )
{
    if ( currentAnimation >= GetAnimationsCount() ) return false;

    if ( !animations[currentAnimation].Get().useMultipleDirections )
    {
        currentAngle = nb;

        needUpdateCurrentSprite = true;
        return true;
    }
    else
    {
        if ( nb >= animations[currentAnimation].Get().GetDirectionsCount() ||
            animations[currentAnimation].Get().GetDirection( nb ).HasNoSprites() ) return false;

        if ( nb == currentDirection ) return true;

        currentDirection = nb;
        currentSprite = 0;
        timeElapsedOnCurrentSprite = 0;

        needUpdateCurrentSprite = true;
        return true;
    }
}

/**
 * Set the angle of a sprite object, which corresponds to its direction.
 * If Sprite is using a direction which do not use angle, the direction is deduced from the angle.
 */
bool RuntimeSpriteObject::SetAngle(float newAngle)
{
    if ( currentAnimation >= GetAnimationsCount() ) return false;

    if ( !animations[currentAnimation].Get().useMultipleDirections )
    {
        currentAngle = newAngle;

        needUpdateCurrentSprite = true;
    }
    else
    {
        newAngle = static_cast<int>(newAngle)%360;
        if ( newAngle < 0 ) newAngle += 360;

        return SetDirection(static_cast<int>(GDRound(newAngle/45.f))%8);
    }

    return true;
}

/**
 * Get the angle of a sprite object, which corresponds to its direction.
 */
float RuntimeSpriteObject::GetAngle() const
{
    if ( currentAnimation >= GetAnimationsCount() ) return 0;

    if ( !animations[currentAnimation].Get().useMultipleDirections )
        return currentAngle;
    else
        return currentDirection*45;
}

float RuntimeSpriteObject::GetCurrentDirectionOrAngle() const
{
    if ( currentAnimation >= GetAnimationsCount() ) return 0;

    if ( animations[currentAnimation].Get().useMultipleDirections )
        return GetCurrentDirection();
    else
        return GetAngle();
}

bool RuntimeSpriteObject::AnimationEnded() const
{
    if (currentAnimation >= GetAnimationsCount()) return true;

    const gd::Direction & direction = animations[currentAnimation].Get().GetDirection( currentDirection );
    return ( !direction.IsLooping() && currentSprite == direction.GetSpritesCount()-1 );
}

/**
 * Change the opacity of the object
 */
void RuntimeSpriteObject::SetOpacity( float val )
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    needUpdateCurrentSprite = true;
}

/**
 * Change the color filter of the sprite object
 */
void RuntimeSpriteObject::SetColor( unsigned int r, unsigned int v, unsigned int b )
{
    colorR = r;
    colorV = v;
    colorB = b;
    needUpdateCurrentSprite = true;
}

void RuntimeSpriteObject::FlipX(bool flip)
{
    if ( flip != isFlippedX )
    {
        scaleX *= -1;
        needUpdateCurrentSprite = true;
    }
    isFlippedX = flip;
};
void RuntimeSpriteObject::FlipY(bool flip)
{
    if ( flip != isFlippedY )
    {
        scaleY *= -1;
        needUpdateCurrentSprite = true;
    }
    isFlippedY = flip;
};

bool RuntimeSpriteObject::CursorOnObject(RuntimeScene & scene, bool accurate)
{
    RuntimeLayer & theLayer = scene.GetRuntimeLayer(layer);

    for (unsigned int cameraIndex = 0;cameraIndex < theLayer.GetCameraCount();++cameraIndex)
    {
        sf::Vector2f mousePos = scene.renderWindow->mapPixelToCoords(
            scene.GetInputManager().GetMousePosition(), theLayer.GetCamera(cameraIndex).GetSFMLView());

        if (GetDrawableX() <= mousePos.x
            && GetDrawableX() + GetWidth()  >= mousePos.x
            && GetDrawableY() <= mousePos.y
            && GetDrawableY() + GetHeight() >= mousePos.y)
        {
            int localX = static_cast<int>( mousePos.x - GetDrawableX() );
            int localY = static_cast<int>( mousePos.y - GetDrawableY() );

            return ( !accurate || GetCurrentSprite().GetSFMLTexture()->image.getPixel( localX , localY ).a != 0 );
        }
    }

    return false;
}

void RuntimeSpriteObject::TurnTowardObject(RuntimeObject * object, RuntimeScene & scene)
{
    if (object == NULL) return;

    RotateTowardPosition(object->GetDrawableX() + object->GetCenterX(),
        object->GetDrawableY() + object->GetCenterY(), 0, scene);
}

#if defined(GD_IDE_ONLY)
void RuntimeSpriteObject::GetPropertyForDebugger(unsigned int propertyNb, std::string & name, std::string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Animation");     value = ToString(GetCurrentAnimation());}
    else if ( propertyNb == 1 ) {name = _("Direction");     value = ToString(GetCurrentDirection());}
    else if ( propertyNb == 2 ) {name = _("Image");         value = ToString(GetSpriteNb());}
    else if ( propertyNb == 3 ) {name = _("Opacity");       value = ToString(GetOpacity());}
    else if ( propertyNb == 4 ) {name = _("Blend mode");   if ( blendMode == 0) value = "0 (Alpha)";
                                                                    else if ( blendMode == 1) value = "1 (Add)";
                                                                    else if ( blendMode == 2) value = "2 (Multiply)";
                                                                    else if ( blendMode == 3) value = "3 (None)";}
    else if ( propertyNb == 5 ) {name = _("X Scale");       value = ToString(GetScaleX());}
    else if ( propertyNb == 6 ) {name = _("Y Scale");       value = ToString(GetScaleY());}
}

bool RuntimeSpriteObject::ChangeProperty(unsigned int propertyNb, std::string newValue)
{
    if ( propertyNb == 0 ) { return SetCurrentAnimation(ToInt(newValue)); }
    else if ( propertyNb == 1 )
    {
        if ( currentAnimation >= GetAnimationsCount() ) return false;

        return animations[currentAnimation].Get().useMultipleDirections ? SetDirection(ToInt(newValue)) : SetAngle(ToFloat(newValue));
    }
    else if ( propertyNb == 2 ) { return SetSprite(ToInt(newValue)); }
    else if ( propertyNb == 3 ) { SetOpacity(ToFloat(newValue)); }
    else if ( propertyNb == 4 ) { SetBlendMode(ToInt(newValue)); }
    else if ( propertyNb == 5 ) {SetScaleX(ToFloat(newValue));}
    else if ( propertyNb == 6 ) {SetScaleY(ToFloat(newValue));}

    return true;
}

unsigned int RuntimeSpriteObject::GetNumberOfProperties() const
{
    return 7;
}
#endif

AnimationProxy::AnimationProxy() :
    animation(new gd::Animation)
{
}
AnimationProxy::~AnimationProxy()
{
    delete animation;
}

AnimationProxy::AnimationProxy(const gd::Animation & animation_) :
    animation(new gd::Animation(animation_))
{
}

AnimationProxy::AnimationProxy(const AnimationProxy & proxy) :
    animation(new gd::Animation(proxy.Get()))
{
}
AnimationProxy & AnimationProxy::operator=(const AnimationProxy & rhs)
{
    *animation = gd::Animation(rhs.Get());

    return *this;
}

RuntimeObject * CreateRuntimeSpriteObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeSpriteObject(scene, object);
}
