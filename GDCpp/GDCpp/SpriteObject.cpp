/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY) && !defined(GD_NO_WX_GUI)
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDCore/Tools/Localization.h"
#include "GDCpp/SpriteObject.h"
#include "GDCpp/Animation.h"
#include "GDCpp/Project.h"
#include "GDCpp/RuntimeLayer.h"
#include "GDCpp/Object.h"
#include "GDCpp/ImageManager.h"
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCpp/Position.h"
#include "GDCpp/CommonTools.h"
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Direction.h"
#include "GDCpp/Sprite.h"
#include "GDCpp/ShaderManager.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDCore/IDE/Dialogs/PropgridPropertyDescriptor.h"
#include "GDCpp/IDE/Dialogs/SpriteObjectEditor.h"
#endif

Animation RuntimeSpriteObject::badAnimation;
Animation SpriteObject::badAnimation;
Sprite * RuntimeSpriteObject::badSpriteDatas = NULL;

SpriteObject::SpriteObject(std::string name_) :
    Object(name_)
{
}

SpriteObject::~SpriteObject()
{
};

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
    cacheAnimationSizeNeedUpdate(true),
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
    if (!badSpriteDatas) badSpriteDatas = new Sprite();

    const SpriteObject & spriteObject = static_cast<const SpriteObject&>(object);
    animations = spriteObject.GetAllAnimations();

    //Load resources
    for ( unsigned int j = 0; j < animations.size();j++ )
    {
        Animation & anim = animations[j].GetNonConst();
        for ( unsigned int k = 0;k < anim.GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < anim.GetDirection(k).GetSpriteCount();l++ )
            {
                Sprite & sprite = anim.GetDirectionToModify(k).GetSprite(l);

                sprite.LoadImage(scene.GetImageManager()->GetSFMLTexture(sprite.GetImageName()));
            }
        }
    }
}

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

    /*sf::RectangleShape rectangle(sf::Vector2f(GetWidth(), GetHeight()));
    rectangle.setPosition(sf::Vector2f(GetDrawableX(), GetDrawableY()));
    rectangle.setOutlineThickness(5);
    rectangle.setOutlineColor(sf::Color(255,0,0));
    renderTarget.draw(rectangle);*/

    /*std::vector<Polygon2d> polygons = GetHitBoxes();
    for (unsigned int i = 0;i<polygons.size();++i)
    {
        sf::ConvexShape shape;
        shape.setOutlineThickness(5);
        shape.setOutlineColor(sf::Color(255,0,0));

        shape.setPointCount(polygons[i].vertices.size());
        for (unsigned int j = 0;j<polygons[i].vertices.size();++j)
            shape.setPoint(j, polygons[i].vertices[j]);

        renderTarget.draw(shape);
    }*/

    return true;
}

#if defined(GD_IDE_ONLY)
void SpriteObject::LoadResources(gd::Project & project, gd::Layout & layout)
{
    for ( unsigned int j = 0; j < animations.size();j++ )
    {
        Animation & anim = animations[j].GetNonConst();
        for ( unsigned int k = 0;k < anim.GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < anim.GetDirection(k).GetSpriteCount();l++ )
            {
                Sprite & sprite = anim.GetDirectionToModify(k).GetSprite(l);

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
    if ( animationId >= GetAnimationCount() ) animationId = 0;

    const Animation & animation = GetAnimation(animationId);
    if ( animation.HasNoDirections() ) return NULL;

    unsigned int directionId = 0;
    if ( animation.useMultipleDirections ) {

        float normalizedAngle = static_cast<int>(instance.GetAngle())%360;
        if ( normalizedAngle < 0 ) normalizedAngle += 360;

        directionId = static_cast<int>(GDRound(normalizedAngle/45.f))%8;
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
    if ( associatedSprite == NULL ) return sf::Vector2f(0,0);

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
                worker.ExposeImage(GetAnimation( j ).GetDirectionToModify(k).GetSprite(l).GetImageName());
        }
    }
}

void SpriteObject::EditObject( wxWindow* parent, gd::Project & project, gd::MainFrameWrapper & mainFrameWrapper )
{
#if !defined(GD_NO_WX_GUI)
    SpriteObjectEditor dialog( parent, dynamic_cast<Game&>(project), *this, mainFrameWrapper );
    dialog.ShowModal();
#endif
}


std::map<std::string, gd::PropgridPropertyDescriptor> SpriteObject::GetInitialInstanceProperties(const gd::InitialInstance & position, gd::Project & project, gd::Layout & scene)
{
    std::map<std::string, gd::PropgridPropertyDescriptor> properties;
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

void RuntimeSpriteObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
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

bool RuntimeSpriteObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if ( propertyNb == 0 ) { return SetCurrentAnimation(ToInt(newValue)); }
    else if ( propertyNb == 1 )
    {
        if ( currentAnimation >= GetAnimationCount() ) return false;

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

/**
 * Get the real X position of the sprite
 */
float RuntimeSpriteObject::GetDrawableX() const
{
    return X - GetCurrentSprite().GetOrigine().GetX()*abs(scaleX);
}

/**
 * Get the real Y position of the sprite
 */
float RuntimeSpriteObject::GetDrawableY() const
{
    return Y - GetCurrentSprite().GetOrigine().GetY()*abs(scaleY);
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
    return GetCurrentSprite().GetCentre().GetX()*abs(scaleX);
}

/**
 * Y center is computed with the current sprite
 */
float RuntimeSpriteObject::GetCenterY() const
{
    //Just need to multiply by the scale as it is the center
    return GetCurrentSprite().GetCentre().GetY()*abs(scaleY);
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
    boost::shared_ptr<SFMLTextureWrapper> dest = ptrToCurrentSprite->GetSFMLTexture();

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
    boost::shared_ptr<SFMLTextureWrapper> dest = ptrToCurrentSprite->GetSFMLTexture();

    vector < string > colors = SplitString <string> (colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    //Update texture and pixel perfect collision mask
    dest->image.createMaskFromColor(  sf::Color( ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2])));
    dest->texture.loadFromImage(dest->image);
}

void RuntimeSpriteObject::SetColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetColor(  ToInt(colors[0]),
               ToInt(colors[1]),
               ToInt(colors[2]) );
}

void RuntimeSpriteObject::TurnTowardPosition(float Xposition, float Yposition)
{
	//Work around for a Visual C++ internal compiler error (!)
	double y = Yposition - (GetDrawableY()+GetCenterY());
	double x = Xposition - (GetDrawableX()+GetCenterX());
    float angle = atan2(y,x) * 180 / 3.14159;

    SetAngle(angle);
    return;
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
        Animation & animation = animations[currentAnimation].GetNonConst();
        multipleDirections = animation.useMultipleDirections;

        unsigned int directionIndex = multipleDirections ? currentDirection : 0;
        if ( directionIndex >= animation.GetDirectionsNumber() )
            ptrToCurrentSprite = badSpriteDatas;
        else
        {
            Direction & direction = animation.GetDirectionToModify(directionIndex);
            if ( currentSprite >= direction.GetSpriteCount())
                ptrToCurrentSprite = badSpriteDatas;
            else
                ptrToCurrentSprite = &direction.GetSprite(currentSprite);
        }
    }

    ptrToCurrentSprite->GetSFMLSprite().setOrigin( ptrToCurrentSprite->GetCentre().GetX(), ptrToCurrentSprite->GetCentre().GetY() ); ;
    ptrToCurrentSprite->GetSFMLSprite().setRotation( multipleDirections ? 0 : currentAngle );
    ptrToCurrentSprite->GetSFMLSprite().setPosition( X + (ptrToCurrentSprite->GetCentre().GetX() - ptrToCurrentSprite->GetOrigine().GetX())*abs(scaleX),
                                                     Y + (ptrToCurrentSprite->GetCentre().GetY() - ptrToCurrentSprite->GetOrigine().GetY())*abs(scaleY) );
    if ( isFlippedX ) ptrToCurrentSprite->GetSFMLSprite().move((ptrToCurrentSprite->GetSFMLSprite().getLocalBounds().width/2-ptrToCurrentSprite->GetCentre().GetX())*abs(scaleX)*2,0 );
    if ( isFlippedY ) ptrToCurrentSprite->GetSFMLSprite().move(0, (ptrToCurrentSprite->GetSFMLSprite().getLocalBounds().height/2-ptrToCurrentSprite->GetCentre().GetY())*abs(scaleY)*2);
    ptrToCurrentSprite->GetSFMLSprite().setScale( scaleX, scaleY );
    ptrToCurrentSprite->GetSFMLSprite().setColor( sf::Color( colorR, colorV, colorB, opacity ) );

    needUpdateCurrentSprite = false;
}


/**
 * Update the time elpased on the current sprite, and change this latter if needed.
 */
void RuntimeSpriteObject::UpdateTime(float elapsedTime)
{
    if ( animationStopped || currentAnimation >= GetAnimationCount() ) return;

    timeElapsedOnCurrentSprite += elapsedTime;

    const Direction & direction = animations[currentAnimation].Get().GetDirection( currentDirection );

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
    if ( currentSprite >= direction.GetSpriteCount() )
    {
        if ( direction.IsLooping() )  currentSprite = 0;
        else  currentSprite = direction.GetSpriteCount() - 1;
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
 * Get the ( Game Develop ) sprite
 */
const Sprite & RuntimeSpriteObject::GetCurrentSprite() const
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
    if ( currentAnimation >= GetAnimationCount() ||
        currentDirection >= animations[currentAnimation].Get().GetDirectionsNumber() ||
        nb >= animations[currentAnimation].Get().GetDirection( currentDirection ).GetSpriteCount() ) return false;

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
    if ( nb >= GetAnimationCount() ) return false;

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
    if ( currentAnimation >= GetAnimationCount() ) return false;

    if ( !animations[currentAnimation].Get().useMultipleDirections )
    {
        currentAngle = nb;

        needUpdateCurrentSprite = true;
        return true;
    }
    else
    {
        if ( nb >= animations[currentAnimation].Get().GetDirectionsNumber() ||
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
    if ( currentAnimation >= GetAnimationCount() ) return false;

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
    if ( !animations[currentAnimation].Get().useMultipleDirections )
        return currentAngle;
    else
        return currentDirection*45;
}

float RuntimeSpriteObject::GetCurrentDirectionOrAngle() const
{
    if ( currentAnimation >= GetAnimationCount() ) return 0;

    if ( animations[currentAnimation].Get().useMultipleDirections )
        return GetCurrentDirection();
    else
        return GetAngle();
}

/**
 * Add an animation
 */
void SpriteObject::AddAnimation(const Animation & animation)
{
    animations.push_back(AnimationProxy(animation));
}

/**
 * Remove an animation from the object
 */
bool SpriteObject::RemoveAnimation(unsigned int nb)
{
    if ( nb >= GetAnimationCount() )
        return false;

    animations.erase( animations.begin() + nb );
    return true;
}

/**
 * Return the number of animations the object has.
 */
unsigned int RuntimeSpriteObject::GetAnimationCount() const
{
    if ( cacheAnimationSizeNeedUpdate )
    {
        cacheAnimationsSize = animations.size();
        cacheAnimationSizeNeedUpdate = false;
    }

    return cacheAnimationsSize;
}

bool RuntimeSpriteObject::AnimationEnded() const
{
    if (currentAnimation >= GetAnimationCount()) return true;

    const Direction & direction = animations[currentAnimation].Get().GetDirection( currentDirection );
    return ( !direction.IsLooping() && currentSprite == direction.GetSpriteCount()-1 );
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

bool RuntimeSpriteObject::CursorOnObject( RuntimeScene & scene, bool accurate )
{
    RuntimeLayer & theLayer = scene.GetRuntimeLayer(layer);

    for (unsigned int cameraIndex = 0;cameraIndex < theLayer.GetCameraCount();++cameraIndex)
    {
        sf::Vector2f mousePos = scene.renderWindow->convertCoords(sf::Mouse::getPosition(*scene.renderWindow),
                                                                  theLayer.GetCamera(cameraIndex).GetSFMLView());

        if  ( GetDrawableX() <= mousePos.x
              && GetDrawableX() + GetWidth()  >= mousePos.x
              && GetDrawableY() <= mousePos.y
              && GetDrawableY() + GetHeight() >= mousePos.y )
        {
            int ClicX = static_cast<int>( mousePos.x - GetDrawableX() );
            int ClicY = static_cast<int>( mousePos.y - GetDrawableY() );

            return ( !accurate || GetCurrentSprite().GetSFMLTexture()->image.getPixel( ClicX , ClicY ).a != 0 );
        }
    }

    return false;
}

void RuntimeSpriteObject::TurnTowardObject( RuntimeObject * object )
{
    if (object == NULL) return;

    //On se dirige vers le centre
    float angle = atan2(
    (object->GetDrawableY() + object->GetCenterY()) - (GetDrawableY()+GetCenterY()),
    (object->GetDrawableX() + object->GetCenterX()) - (GetDrawableX()+GetCenterX())
    ) * 180 / 3.14159;

    SetAngle(angle);
    return;
}


void SpriteObject::DoLoadFromXml(gd::Project & project, const TiXmlElement * elemScene)
{
    if ( elemScene->FirstChildElement( "Animations" ) == NULL ) return;

    const TiXmlElement * elemObjetScene = elemScene->FirstChildElement( "Animations" )->FirstChildElement();

    //Pour chaque animation
    while ( elemObjetScene )
    {
        Animation newAnimation;
        newAnimation.useMultipleDirections = (elemObjetScene->Attribute( "typeNormal" )  != NULL && ToString(elemObjetScene->Attribute( "typeNormal" )) == "true");

        const TiXmlElement *elemObjetDirecScene = elemObjetScene->FirstChildElement();
        while ( elemObjetDirecScene )
        {
            Direction direction;
            direction.LoadFromXml(elemObjetDirecScene);

            newAnimation.SetDirectionsNumber(newAnimation.GetDirectionsNumber()+1);
            newAnimation.SetDirection(direction, newAnimation.GetDirectionsNumber()-1);
            elemObjetDirecScene = elemObjetDirecScene->NextSiblingElement();
        }

        AddAnimation( newAnimation );

        elemObjetScene = elemObjetScene->NextSiblingElement();
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
#endif

AnimationProxy::AnimationProxy() :
    animation(new Animation)
{
}
AnimationProxy::~AnimationProxy()
{
    delete animation;
}

AnimationProxy::AnimationProxy(const Animation & animation_) :
    animation(new Animation(animation_))
{
}

AnimationProxy::AnimationProxy(const AnimationProxy & proxy) :
    animation(new Animation(proxy.Get()))
{
}
AnimationProxy & AnimationProxy::operator=(const AnimationProxy & rhs)
{
    *animation = Animation(rhs.Get());

    return *this;
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


void DestroyRuntimeSpriteObject(RuntimeObject * object)
{
    delete object;
}

RuntimeObject * CreateRuntimeSpriteObject(RuntimeScene & scene, const gd::Object & object)
{
    return new RuntimeSpriteObject(scene, object);
}
