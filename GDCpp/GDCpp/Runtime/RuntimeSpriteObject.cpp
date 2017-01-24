/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include "RuntimeSpriteObject.h"
#include "GDCore/Tools/Localization.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.h"
#include "GDCpp/Runtime/Project/Project.h"
#include "GDCpp/Runtime/RuntimeLayer.h"
#include "GDCpp/Runtime/ImageManager.h"
#include "GDCpp/Runtime/TinyXml/tinyxml.h"
#include "GDCpp/Runtime/Project/InitialInstance.h"
#include "GDCpp/Runtime/CommonTools.h"
#include "GDCpp/Runtime/RuntimeScene.h"
#include <SFML/Graphics.hpp>
#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/Project/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropertyDescriptor.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Dialogs/SpriteObjectEditor.h"
#endif
#if !defined(GD_IDE_ONLY)
#include "GDCore/Extensions/Builtin/SpriteExtension/SpriteObject.cpp"
#include "GDCore/Extensions/Builtin/SpriteExtension/Animation.cpp"
#include "GDCore/Extensions/Builtin/SpriteExtension/Direction.cpp"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.cpp"
#endif

gd::Animation RuntimeSpriteObject::badAnimation;
gd::Sprite * RuntimeSpriteObject::badSpriteDatas = NULL;

RuntimeSpriteObject::RuntimeSpriteObject(RuntimeScene & scene, const gd::SpriteObject & spriteObject) :
    RuntimeObject(scene, spriteObject),
    currentAnimation( 0 ),
    currentDirection( 0 ),
    currentAngle( 0 ),
    currentSprite( 0 ),
    animationStopped(false),
    timeElapsedOnCurrentSprite(0.f),
    animationSpeedScale(1.f),
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

    animations.clear();
    for (std::size_t i = 0; i < spriteObject.GetAllAnimations().size(); ++i)
        animations.push_back(AnimationProxy(spriteObject.GetAllAnimations()[i]));

    //Load resources
    for ( std::size_t j = 0; j < animations.size();j++ )
    {
        gd::Animation & anim = animations[j].GetNonConst();
        for ( std::size_t k = 0;k < anim.GetDirectionsCount();k++ )
        {
            for ( std::size_t l = 0;l < anim.GetDirection(k).GetSpritesCount();l++ )
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

bool RuntimeSpriteObject::ExtraInitializationFromInitialInstance(const gd::InitialInstance & position)
{
    if ( position.floatInfos.find("animation") != position.floatInfos.end() )
        SetCurrentAnimation(position.floatInfos.find("animation")->second);

    return true;
}

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

float RuntimeSpriteObject::GetDrawableX() const
{
    return X - GetCurrentSprite().GetOrigin().GetX()*fabs(scaleX);
}

float RuntimeSpriteObject::GetDrawableY() const
{
    return Y - GetCurrentSprite().GetOrigin().GetY()*fabs(scaleY);
}

float RuntimeSpriteObject::GetWidth() const
{
    return scaleX > 0 ? GetCurrentSFMLSprite().getLocalBounds().width*scaleX : -GetCurrentSFMLSprite().getLocalBounds().width*scaleX;
}

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

float RuntimeSpriteObject::GetCenterX() const
{
    return GetCurrentSprite().GetCenter().GetX()*fabs(scaleX);
}

float RuntimeSpriteObject::GetCenterY() const
{
    return GetCurrentSprite().GetCenter().GetY()*fabs(scaleY);
}

float RuntimeSpriteObject::GetPointX(const gd::String & name) const
{
    if ( !name.empty() )
    {
        const Point & point = GetCurrentSprite().GetPoint(name);
        return GetCurrentSFMLSprite().getTransform().transformPoint(point.GetX(), point.GetY()).x;
    }

    return GetX();
}

float RuntimeSpriteObject::GetPointY(const gd::String & name) const
{
    if ( !name.empty() )
    {
        const Point & point = GetCurrentSprite().GetPoint(name);
        return GetCurrentSFMLSprite().getTransform().transformPoint(point.GetX(), point.GetY()).y;
    }

    return GetY();
}

void RuntimeSpriteObject::ChangeScale( const gd::String & operatorStr, double newScale)
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

void RuntimeSpriteObject::SetScaleX(float val)
{
    if (val == GetScaleX()) return;
    if (val < 0) val = 0;

    scaleX = val * (isFlippedX ? -1.0 : 1.0);
    needUpdateCurrentSprite = true;
}

void RuntimeSpriteObject::SetScaleY(float val)
{
    if (val == GetScaleY()) return;
    if (val < 0) val = 0;

    scaleY = val * (isFlippedY ? -1.0 : 1.0);
    needUpdateCurrentSprite = true;
}

float RuntimeSpriteObject::GetScaleX() const
{
    return fabs(scaleX);
}

float RuntimeSpriteObject::GetScaleY() const
{
    return fabs(scaleY);
}

void RuntimeSpriteObject::CopyImageOnImageOfCurrentSprite(RuntimeScene & scene, const gd::String & imageName, float xPosition, float yPosition, bool useTransparency)
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

void RuntimeSpriteObject::MakeColorTransparent( const gd::String & colorStr )
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    ptrToCurrentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    std::shared_ptr<SFMLTextureWrapper> dest = ptrToCurrentSprite->GetSFMLTexture();

    std::vector < gd::String > colors = colorStr.Split(U';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    //Update texture and pixel perfect collision mask
    dest->image.createMaskFromColor(  sf::Color( colors[0].To<int>(), colors[1].To<int>(), colors[2].To<int>()));
    dest->texture.loadFromImage(dest->image);
}

void RuntimeSpriteObject::SetColor(const gd::String & colorStr)
{
    std::vector < gd::String > colors = colorStr.Split(U';');
    if ( colors.size() < 3 ) return; //Color is not valid

    SetColor(  colors[0].To<int>(),
               colors[1].To<int>(),
               colors[2].To<int>() );
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

        std::size_t directionIndex = multipleDirections ? currentDirection : 0;
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

void RuntimeSpriteObject::Update(const RuntimeScene & scene)
{
    if ( animationStopped || currentAnimation >= GetAnimationsCount() ) return;

    double elapsedTimeInSeconds = static_cast<double>(GetElapsedTime(scene))/1000000.0;
    timeElapsedOnCurrentSprite += elapsedTimeInSeconds * animationSpeedScale;

    const gd::Direction & direction = animations[currentAnimation].Get().GetDirection( currentDirection );

    float delay = direction.GetTimeBetweenFrames();

    if ( timeElapsedOnCurrentSprite > delay )
    {
        if ( delay != 0 )
        {
            std::size_t frameCount = static_cast<std::size_t>( timeElapsedOnCurrentSprite / delay );
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

const sf::Sprite & RuntimeSpriteObject::GetCurrentSFMLSprite() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return ptrToCurrentSprite->GetSFMLSprite();
}

const gd::Sprite & RuntimeSpriteObject::GetCurrentSprite() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return *ptrToCurrentSprite;
}

std::vector<Polygon2d> RuntimeSpriteObject::GetHitBoxes() const
{
    if ( currentAnimation >= animations.size() )
    {
        std::vector<Polygon2d> hitboxes; //Invalid animation, bail out.
        return hitboxes;
    }
    const sf::Sprite & currentSFMLSprite = GetCurrentSFMLSprite();

    std::vector<Polygon2d> polygons = GetCurrentSprite().GetCollisionMask();
    for (std::size_t i = 0;i<polygons.size();++i)
    {
        for (std::size_t j = 0;j<polygons[i].vertices.size();++j)
        {
            sf::Vector2f newVertice = currentSFMLSprite.getTransform().transformPoint(
                            !isFlippedX ? polygons[i].vertices[j].x : GetCurrentSprite().GetSFMLSprite().getLocalBounds().width-polygons[i].vertices[j].x,
                            !isFlippedY ? polygons[i].vertices[j].y : GetCurrentSprite().GetSFMLSprite().getLocalBounds().height-polygons[i].vertices[j].y);
            polygons[i].vertices[j] = newVertice;
        }
    }

    return polygons;
}

bool RuntimeSpriteObject::SetSprite( std::size_t nb )
{
    if ( currentAnimation >= GetAnimationsCount() ||
        currentDirection >= animations[currentAnimation].Get().GetDirectionsCount() ||
        nb >= animations[currentAnimation].Get().GetDirection( currentDirection ).GetSpritesCount() ) return false;

    currentSprite = nb;
    timeElapsedOnCurrentSprite = 0;

    needUpdateCurrentSprite = true;
    return true;
}

bool RuntimeSpriteObject::SetCurrentAnimation( std::size_t nb )
{
    if ( nb >= GetAnimationsCount() ) return false;
    if ( nb == currentAnimation ) return true;

    currentAnimation = nb;
    currentSprite = 0;
    timeElapsedOnCurrentSprite = 0;

    needUpdateCurrentSprite = true;
    return true;
}

bool RuntimeSpriteObject::SetCurrentAnimation(const gd::String & newAnimationName)
{
    for(size_t i = 0;i<animations.size();++i)
    {
        const gd::String & name = animations[i].Get().GetName();
        if (!name.empty() && name == newAnimationName)
            return SetCurrentAnimation(i);
    }

    return false;
}

const gd::String & RuntimeSpriteObject::GetCurrentAnimationName() const
{
    if ( currentAnimation >= GetAnimationsCount() ) return badAnimation.GetName();
    return animations[currentAnimation].Get().GetName();
}

bool RuntimeSpriteObject::IsCurrentAnimationName(const gd::String & name) const
{
    return GetCurrentAnimationName() == name;
}

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

void RuntimeSpriteObject::SetOpacity( float val )
{
    if ( val > 255 )
        val = 255;
    else if ( val < 0 )
        val = 0;

    opacity = val;
    needUpdateCurrentSprite = true;
}

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
        scaleX *= -1.0;
        needUpdateCurrentSprite = true;
    }
    isFlippedX = flip;
}

void RuntimeSpriteObject::FlipY(bool flip)
{
    if ( flip != isFlippedY )
    {
        scaleY *= -1.0;
        needUpdateCurrentSprite = true;
    }
    isFlippedY = flip;
}

bool RuntimeSpriteObject::CursorOnObject(RuntimeScene & scene, bool accurate)
{
    #if defined(ANDROID) //TODO: Accurate test leads to strange result with touches.
    accurate = false;
    #endif

    RuntimeLayer & theLayer = scene.GetRuntimeLayer(layer);
    auto insideObject = [this, accurate](const sf::Vector2f & pos) {
        if (GetDrawableX() <= pos.x
            && GetDrawableX() + GetWidth()  >= pos.x
            && GetDrawableY() <= pos.y
            && GetDrawableY() + GetHeight() >= pos.y)
        {
            int localX = static_cast<int>( pos.x - GetDrawableX() );
            int localY = static_cast<int>( pos.y - GetDrawableY() );

            return ( !accurate || GetCurrentSprite().GetSFMLTexture()->image.getPixel(localX , localY).a != 0);
        }

        return false;
    };

    for (std::size_t cameraIndex = 0;cameraIndex < theLayer.GetCameraCount();++cameraIndex)
    {
        const auto & view = theLayer.GetCamera(cameraIndex).GetSFMLView();

        sf::Vector2f mousePos = scene.renderWindow->GetRenderingTarget().mapPixelToCoords(
            scene.GetInputManager().GetMousePosition(), view);

        if (insideObject(mousePos)) return true;

        auto & touches = scene.GetInputManager().GetAllTouches();
        for(auto & it : touches)
        {
            sf::Vector2f touchPos = scene.renderWindow->GetRenderingTarget().mapPixelToCoords(it.second, view);
            if (insideObject(touchPos)) return true;
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
void RuntimeSpriteObject::GetPropertyForDebugger(std::size_t propertyNb, gd::String & name, gd::String & value) const
{
    if      ( propertyNb == 0 ) {name = _("Animation");     value = gd::String::From(GetCurrentAnimation());}
    else if ( propertyNb == 1 ) {name = _("Direction");     value = gd::String::From(GetCurrentDirection());}
    else if ( propertyNb == 2 ) {name = _("Image");         value = gd::String::From(GetSpriteNb());}
    else if ( propertyNb == 3 ) {name = _("Opacity");       value = gd::String::From(GetOpacity());}
    else if ( propertyNb == 4 ) {name = _("Blend mode");   if ( blendMode == 0) value = "0 (Alpha)";
                                                                    else if ( blendMode == 1) value = "1 (Add)";
                                                                    else if ( blendMode == 2) value = "2 (Multiply)";
                                                                    else if ( blendMode == 3) value = "3 (None)";}
    else if ( propertyNb == 5 ) {name = _("X Scale");       value = gd::String::From(GetScaleX());}
    else if ( propertyNb == 6 ) {name = _("Y Scale");       value = gd::String::From(GetScaleY());}
}

bool RuntimeSpriteObject::ChangeProperty(std::size_t propertyNb, gd::String newValue)
{
    if ( propertyNb == 0 ) { return SetCurrentAnimation(newValue.To<int>()); }
    else if ( propertyNb == 1 )
    {
        if ( currentAnimation >= GetAnimationsCount() ) return false;

        return animations[currentAnimation].Get().useMultipleDirections ? SetDirection(newValue.To<std::size_t>()) : SetAngle(newValue.To<float>());
    }
    else if ( propertyNb == 2 ) { return SetSprite(newValue.To<int>()); }
    else if ( propertyNb == 3 ) { SetOpacity(newValue.To<float>()); }
    else if ( propertyNb == 4 ) { SetBlendMode(newValue.To<int>()); }
    else if ( propertyNb == 5 ) {SetScaleX(newValue.To<float>());}
    else if ( propertyNb == 6 ) {SetScaleY(newValue.To<float>());}

    return true;
}

std::size_t RuntimeSpriteObject::GetNumberOfProperties() const
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
