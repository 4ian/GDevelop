/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <SFML/Graphics.hpp>
#include "GDL/SpriteObject.h"
#include "GDL/Object.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/Position.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Direction.h"
#include "GDL/Sprite.h"
#include "GDL/ShaderManager.h"
#include "GDL/ArbitraryResourceWorker.h"

#if defined(GD_IDE_ONLY)
#include <wx/wx.h>
#include "GDL/CommonTools.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/EditorObjet.h"
#include "GDL/SpriteInitialPositionPanel.h"
#endif

sf::Sprite SpriteObject::badSprite;
Animation SpriteObject::badAnimation;
Sprite SpriteObject::badSpriteDatas;

SpriteObject::SpriteObject(std::string name_) :
Object(name_),
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
}

bool SpriteObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    for ( unsigned int j = 0; j < GetAnimationsNumber();j++ )
    {
        for ( unsigned int k = 0;k < GetAnimation( j ).GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < GetAnimation( j ).GetDirection(k).GetSpritesNumber();l++ )
            {
                Sprite & sprite = GetAnimation( j ).GetDirectionToModify(k).GetSprite(l);

                sprite.LoadImage(imageMgr.GetSFMLTexture(sprite.GetImageName()));
            }
        }
    }

    /*std::vector<std::string> shaders;
//    shaders.push_back("blur.sfx");
    shaders.push_back("fisheye.sfx");
    optionalShader = scene.game->shaderManager->GetSFMLShader(shaders);
    optionalShader->SetCurrentTexture("texture");
    optionalShader->SetParameter("offset", 0.1f);
    optionalShader->SetParameter("mouse", 10,10);*/

    return true;
}

/**
 * Update animation and direction from the inital position
 */
bool SpriteObject::InitializeFromInitialPosition(const InitialPosition & position)
{
    if ( position.floatInfos.find("animation") != position.floatInfos.end() )
        SetAnimation(position.floatInfos.find("animation")->second);

    //Compatibility with Game Develop 1.2.8522 and inferior
    if ( position.floatInfos.find("direction") != position.floatInfos.end() )
    {
        InitialPosition & updatePosition = const_cast<InitialPosition&>(position);
        updatePosition.angle = position.floatInfos.find("direction")->second;
        if (    position.floatInfos.find("animation") != position.floatInfos.end()
            &&  GetAnimation(position.floatInfos.find("animation")->second).typeNormal )
        {
            updatePosition.angle *= 45;
        }

        updatePosition.floatInfos.erase(updatePosition.floatInfos.find("direction"));
    }

    SetAngle(position.angle);

    return true;
}

void SpriteObject::ExposeResources(ArbitraryResourceWorker & worker)
{
    for ( unsigned int j = 0; j < GetAnimationsNumber();j++ )
    {
        for ( unsigned int k = 0;k < GetAnimation( j ).GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < GetAnimation( j ).GetDirection(k).GetSpritesNumber();l++ )
                worker.ExposeImage(GetAnimation( j ).GetDirectionToModify(k).GetSprite(l).GetImageName());
        }
    }
}

/**
 * Render object at runtime
 */
bool SpriteObject::Draw( sf::RenderTarget & renderTarget )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    if ( !optionalShader )
        renderTarget.Draw( GetCurrentSFMLSprite() );
    else
        renderTarget.Draw( GetCurrentSFMLSprite(), *optionalShader );


    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool SpriteObject::DrawEdittime( sf::RenderTarget & renderTarget )
{

    if ( !optionalShader )
        renderTarget.Draw( GetCurrentSFMLSprite() );
    else
        renderTarget.Draw( GetCurrentSFMLSprite(), *optionalShader );

    return true;
}

bool SpriteObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    //Generate a thumbnail from the first animation
    if ( !HasNoAnimations() && !GetAnimation(0).HasNoDirections() && !GetAnimation(0).GetDirection(0).HasNoSprites() )
    {
        std::string imageName = GetAnimation(0).GetDirection(0).GetSprite(0).GetImageName();

        if ( game.resourceManager.HasResource(imageName) && wxFileExists(game.resourceManager.GetResource(imageName).GetFile()) )
        {
            thumbnail = wxBitmap( game.resourceManager.GetResource(imageName).GetFile(), wxBITMAP_TYPE_ANY);

            wxImage thumbImage = thumbnail.ConvertToImage();
            thumbnail = wxBitmap(thumbImage.Scale(24, 24));

            return true;
        }
    }

    return false;
}

void SpriteObject::EditObject( wxWindow* parent, Game & game, MainEditorCommand & mainEditorCommand )
{
    EditorObjet dialog( parent, game, *this, mainEditorCommand );
    dialog.ShowModal();
}

wxPanel * SpriteObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    SpriteInitialPositionPanel * panel = new SpriteInitialPositionPanel(parent);

    panel->DirectionEdit->ChangeValue(ToString( position.angle ));

    for (unsigned int i = 0;i<GetAnimationsNumber();i++ )
        panel->AnimationCombo->Append(ToString(i));

    if ( position.floatInfos.find("animation") != position.floatInfos.end())
        panel->AnimationCombo->SetSelection(position.floatInfos.find("animation")->second);

    return panel;
}

void SpriteObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    SpriteInitialPositionPanel * spritePanel = dynamic_cast<SpriteInitialPositionPanel*>(panel);
    if (spritePanel == NULL) return;

    position.angle = ToInt(string(spritePanel->DirectionEdit->GetValue().mb_str()));
    position.floatInfos["animation"] = ToInt(string(spritePanel->AnimationCombo->GetValue().mb_str()));
}

void SpriteObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Animation");     value = ToString(GetCurrentAnimation());}
    else if ( propertyNb == 1 ) {name = _("Direction");     value = ToString(GetCurrentDirection());}
    else if ( propertyNb == 2 ) {name = _("Image");         value = ToString(GetSpriteNb());}
    else if ( propertyNb == 3 ) {name = _("Opacité");       value = ToString(GetOpacity());}
    else if ( propertyNb == 4 ) {name = _("Méthode d'affichage");   if ( blendMode == 0) value = "0 (Alpha)";
                                                                    else if ( blendMode == 1) value = "1 (Add)";
                                                                    else if ( blendMode == 2) value = "2 (Multiply)";
                                                                    else if ( blendMode == 3) value = "3 (None)";}
    else if ( propertyNb == 5 ) {name = _("Echelle X de la taille");       value = ToString(GetScaleX());}
    else if ( propertyNb == 6 ) {name = _("Echelle Y de la taille");       value = ToString(GetScaleY());}
}

bool SpriteObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if ( propertyNb == 0 ) { return SetAnimation(ToInt(newValue)); }
    else if ( propertyNb == 1 ) {return GetAnimation( currentAnimation ).typeNormal ? SetDirection(ToInt(newValue)) : SetAngle(ToFloat(newValue)); }
    else if ( propertyNb == 2 ) { return SetSprite(ToInt(newValue)); }
    else if ( propertyNb == 3 ) { SetOpacity(ToFloat(newValue)); }
    else if ( propertyNb == 4 ) { SetBlendMode(ToInt(newValue)); }
    else if ( propertyNb == 5 ) {SetScaleX(ToFloat(newValue));}
    else if ( propertyNb == 6 ) {SetScaleY(ToFloat(newValue));}

    return true;
}

unsigned int SpriteObject::GetNumberOfProperties() const
{
    return 7;
}
#endif

/**
 * Get the real X position of the sprite
 */
float SpriteObject::GetDrawableX() const
{
    //FIXME (The not commented code is correct but not optimal)
    //Bad placement when origine of sf::Sprite is changed ( for automatic Rotation for example )
    //return GetCurrentSFMLSprite().GetPosition().x;
    return X - GetCurrentSprite().GetOrigine().GetX() + (GetCurrentSFMLSprite().GetSubRect().Width)*(1-scaleX)/2;
}

/**
 * Get the real Y position of the sprite
 */
float SpriteObject::GetDrawableY() const
{
    //return GetCurrentSFMLSprite().GetPosition().y;
    return Y - GetCurrentSprite().GetOrigine().GetY() + (GetCurrentSFMLSprite().GetSubRect().Height)*(1-scaleY)/2;
}

/**
 * Get the width of the current sprite.
 */
float SpriteObject::GetWidth() const
{
    return GetCurrentSFMLSprite().GetSize().x;
}

/**
 * Get the height of the current sprite.
 */
float SpriteObject::GetHeight() const
{
    return GetCurrentSFMLSprite().GetSize().y;
}

void SpriteObject::SetWidth(float newWidth)
{
    if ( newWidth > 0 )
    {
        scaleX = newWidth/(GetCurrentSFMLSprite().GetSubRect().Width);
        needUpdateCurrentSprite = true;
    }
}

void SpriteObject::SetHeight(float newHeight)
{
    if ( newHeight > 0 )
    {
        scaleY = newHeight/(GetCurrentSFMLSprite().GetSubRect().Height);
        needUpdateCurrentSprite = true;
    }
}

void SpriteObject::SetOriginalSize()
{
    scaleX = 1;
    scaleY = 1;
    needUpdateCurrentSprite = true;
}

/**
 * X center is computed with the current sprite
 */
float SpriteObject::GetCenterX() const
{
    //Just need to multiply by the scale as it is the center
    return GetCurrentSprite().GetCentre().GetX()*scaleX;
}

/**
 * Y center is computed with the current sprite
 */
float SpriteObject::GetCenterY() const
{
    //Just need to multiply by the scale as it is the center
    return GetCurrentSprite().GetCentre().GetY()*scaleY;
}

float SpriteObject::GetPointX(const std::string & point) const
{
    if ( !point.empty() )
    {
        return GetCurrentSFMLSprite().TransformToGlobal(
                    sf::Vector2f(
                        !isFlippedX ? GetCurrentSprite().GetPoint(point).GetX() : GetCurrentSprite().GetSFMLSprite().GetSize().x/2-GetCurrentSprite().GetPoint(point).GetX(),
                        !isFlippedY ? GetCurrentSprite().GetPoint(point).GetY() : GetCurrentSprite().GetSFMLSprite().GetSize().y/2-GetCurrentSprite().GetPoint(point).GetY()
                    )).x;
    }

    return GetX();
}

float SpriteObject::GetPointY(const std::string & point) const
{
    if ( !point.empty() )
    {
        return GetCurrentSFMLSprite().TransformToGlobal(
                    sf::Vector2f(
                        !isFlippedX ? GetCurrentSprite().GetPoint(point).GetX() : GetCurrentSprite().GetSFMLSprite().GetSize().x/2-GetCurrentSprite().GetPoint(point).GetX(),
                        !isFlippedY ? GetCurrentSprite().GetPoint(point).GetY() : GetCurrentSprite().GetSFMLSprite().GetSize().y/2-GetCurrentSprite().GetPoint(point).GetY()
                    )).y;
    }

    return GetY();
}

void SpriteObject::ChangeScale(double newScale, const std::string & operatorStr)
{
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

void SpriteObject::CopyImageOnImageOfCurrentSprite(RuntimeScene & scene, const std::string & imageName, float xPosition, float yPosition, bool useTransparency)
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    ptrToCurrentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    boost::shared_ptr<SFMLTextureWrapper> dest = ptrToCurrentSprite->GetSFMLTexture();

    //Make sure the coordinates are correct.
    if ( xPosition < 0 || static_cast<unsigned>(xPosition) >= dest->texture.GetWidth()) return;
    if ( yPosition < 0 || static_cast<unsigned>(yPosition) >= dest->texture.GetWidth()) return;

    //Update texture and pixel perfect collision mask
    dest->image.Copy(scene.game->imageManager->GetSFMLTexture(imageName)->image, xPosition, yPosition, sf::IntRect(0, 0, 0, 0), useTransparency);
    dest->texture.LoadFromImage(dest->image);
}

void SpriteObject::MakeColorTransparent( const std::string & colorStr )
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    ptrToCurrentSprite->MakeSpriteOwnsItsImage(); //We want to modify only the image of the object, not all objects which have the same image.
    boost::shared_ptr<SFMLTextureWrapper> dest = ptrToCurrentSprite->GetSFMLTexture();

    vector < string > colors = SplitString <string> (colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    //Update texture and pixel perfect collision mask
    dest->image.CreateMaskFromColor(  sf::Color( ToInt(colors[0]), ToInt(colors[1]), ToInt(colors[2])));
    dest->texture.LoadFromImage(dest->image);
}

void SpriteObject::SetColor(const std::string & colorStr)
{
    vector < string > colors = SplitString<string>(colorStr, ';');

    if ( colors.size() < 3 ) return; //La couleur est incorrecte

    SetColor(  ToInt(colors[0]),
               ToInt(colors[1]),
               ToInt(colors[2]) );
}

void SpriteObject::TurnTowardPosition(float Xposition, float Yposition)
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
void SpriteObject::UpdateCurrentSprite() const
{
    if ( currentAnimation >= GetAnimationsNumber() )
        ptrToCurrentSprite = &badSpriteDatas;
    else
    {
        Animation & currentAnim = animations[currentAnimation].GetNonConst();

        if ( currentAnim.typeNormal )
        {
            //Update sprite pointer
            if ( currentDirection >= currentAnim.GetDirectionsNumber() || currentSprite >= currentAnim.GetDirection(currentDirection).GetSpritesNumber() )
                ptrToCurrentSprite = &badSpriteDatas;
            else
                ptrToCurrentSprite = &currentAnim.GetDirectionToModify( currentDirection ).GetSprite( currentSprite );

            ptrToCurrentSprite->GetSFMLSprite().SetX( X - ptrToCurrentSprite->GetOrigine().GetX() + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Width)*(1-scaleX)/2 );
            ptrToCurrentSprite->GetSFMLSprite().SetY( Y - ptrToCurrentSprite->GetOrigine().GetY() + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Height)*(1-scaleY)/2 );
        }
        else
        {
            //Update sprite pointer
            if ( currentAnim.HasNoDirections() || currentSprite >= currentAnim.GetDirection(0).GetSpritesNumber() )
                ptrToCurrentSprite = &badSpriteDatas;
            else
                ptrToCurrentSprite = &currentAnim.GetDirectionToModify(0).GetSprite( currentSprite );

            ptrToCurrentSprite->GetSFMLSprite().SetX( X  + ptrToCurrentSprite->GetCentre().GetX()*scaleX - ptrToCurrentSprite->GetOrigine().GetX()
                                                + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Width)*(1-scaleX)/2);
            ptrToCurrentSprite->GetSFMLSprite().SetY( Y  + ptrToCurrentSprite->GetCentre().GetY()*scaleY - ptrToCurrentSprite->GetOrigine().GetY()
                                                + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Height)*(1-scaleY)/2);

            ptrToCurrentSprite->GetSFMLSprite().SetOrigin(   ptrToCurrentSprite->GetCentre().GetX(),
                                                    ptrToCurrentSprite->GetCentre().GetY() );
            ptrToCurrentSprite->GetSFMLSprite().SetRotation( currentAngle );
        }
    }

    ptrToCurrentSprite->GetSFMLSprite().SetScale( scaleX, scaleY );
    ptrToCurrentSprite->GetSFMLSprite().SetColor( sf::Color( colorR, colorV, colorB, opacity ) );
    ptrToCurrentSprite->GetSFMLSprite().FlipX(isFlippedX);
    ptrToCurrentSprite->GetSFMLSprite().FlipY(isFlippedY);
    if ( blendMode == 0 ) ptrToCurrentSprite->GetSFMLSprite().SetBlendMode(sf::Blend::Alpha);
    else if ( blendMode == 1 ) ptrToCurrentSprite->GetSFMLSprite().SetBlendMode(sf::Blend::Add);
    else if ( blendMode == 2 ) ptrToCurrentSprite->GetSFMLSprite().SetBlendMode(sf::Blend::Multiply);
    else if ( blendMode == 3 ) ptrToCurrentSprite->GetSFMLSprite().SetBlendMode(sf::Blend::None);

    needUpdateCurrentSprite = false;
}


/**
 * Update the time elpased on the current sprite, and change this latter if needed.
 */
void SpriteObject::UpdateTime(float elapsedTime)
{
    if ( animationStopped ) return;

    timeElapsedOnCurrentSprite += elapsedTime;
    float delay = GetAnimation(currentAnimation).GetDirection( currentDirection ).GetTimeBetweenFrames();

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
    if ( currentSprite >= GetAnimation(currentAnimation).GetDirection( currentDirection ).GetSpritesNumber() )
    {
        if ( GetAnimation(currentAnimation).GetDirection( currentDirection ).IsLooping() )
            currentSprite = 0;
        else
            currentSprite = GetAnimation(currentAnimation).GetDirection( currentDirection ).GetSpritesNumber() - 1;
    }

    needUpdateCurrentSprite = true;
}

/**
 * Get the SFML sprite
 */
const sf::Sprite & SpriteObject::GetCurrentSFMLSprite() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return ptrToCurrentSprite->GetSFMLSprite();
}

/**
 * Get the ( Game Develop ) sprite
 */
const Sprite & SpriteObject::GetCurrentSprite() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return *ptrToCurrentSprite;
}

/**
 * Get object hit box(es)
 */
std::vector<RotatedRectangle> SpriteObject::GetHitBoxes() const
{
    std::vector<RotatedRectangle> boxes = GetCurrentSprite().GetCollisionMask();
    for (unsigned int i = 0;i<boxes.size();++i)
    {
        sf::Vector2f newCenter = GetCurrentSFMLSprite().TransformToGlobal(
                    sf::Vector2f(
                        !isFlippedX ? boxes[i].center.x : GetCurrentSprite().GetSFMLSprite().GetSize().x/2-boxes[i].center.x,
                        !isFlippedY ? boxes[i].center.y : GetCurrentSprite().GetSFMLSprite().GetSize().y/2-boxes[i].center.y
                    ));

        boxes[i].center = newCenter;
        boxes[i].halfSize.x *= scaleX;
        boxes[i].halfSize.y *= scaleY;
        boxes[i].angle += GetAngle()*3.14159f/180.0f;
    }

    return boxes;
}

/**
 * Change the number of the current sprite
 */
bool SpriteObject::SetSprite( unsigned int nb )
{
    if ( currentAnimation >= GetAnimationsNumber() ||
        currentDirection >= GetAnimation( currentAnimation ).GetDirectionsNumber() ||
        nb >= GetAnimation( currentAnimation ).GetDirection( currentDirection ).GetSpritesNumber() ) return false;

    currentSprite = nb;
    timeElapsedOnCurrentSprite = 0;

    needUpdateCurrentSprite = true;
    return true;
}

/**
 * Change the number of the current animation
 */
bool SpriteObject::SetAnimation( unsigned int nb )
{
    if ( nb >= GetAnimationsNumber() ) return false;

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
bool SpriteObject::SetDirection( float nb )
{
    if ( currentAnimation >= GetAnimationsNumber() ) return false;

    if ( !GetAnimation( currentAnimation ).typeNormal )
    {
        currentAngle = nb;

        needUpdateCurrentSprite = true;
        return true;
    }
    else
    {
        if ( nb >= GetAnimation( currentAnimation ).GetDirectionsNumber() ||
            GetAnimation( currentAnimation ).GetDirection( nb ).HasNoSprites() ) return false;

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
bool SpriteObject::SetAngle(float newAngle)
{
    if ( currentAnimation >= GetAnimationsNumber() ) return false;

    if ( !GetAnimation( currentAnimation ).typeNormal )
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
float SpriteObject::GetAngle() const
{
    if ( !GetAnimation( currentAnimation ).typeNormal )
        return currentAngle;
    else
        return currentDirection*45;
}

float SpriteObject::GetCurrentDirectionOrAngle() const
{
    if ( currentAnimation >= GetAnimationsNumber() ) return 0;

    if ( GetAnimation( currentAnimation ).typeNormal )
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
    cacheAnimationSizeNeedUpdate = true;
}

/**
 * Remove an animation from the object
 */
bool SpriteObject::RemoveAnimation(unsigned int nb)
{
    if ( nb >= GetAnimationsNumber() )
        return false;

    cacheAnimationSizeNeedUpdate = true;
    needUpdateCurrentSprite = true;
    animations.erase( animations.begin() + nb );
    return true;
}

/**
 * Return the number of animations the object has.
 */
unsigned int SpriteObject::GetAnimationsNumber() const
{
    if ( cacheAnimationSizeNeedUpdate )
    {
        cacheAnimationsSize = animations.size();
        cacheAnimationSizeNeedUpdate = false;
    }

    return cacheAnimationsSize;
}


/**
 * Change the opacity of the object
 */
void SpriteObject::SetOpacity( float val )
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
void SpriteObject::SetColor( unsigned int r, unsigned int v, unsigned int b )
{
    colorR = r;
    colorV = v;
    colorB = b;
    needUpdateCurrentSprite = true;
}

bool SpriteObject::CursorOnObject( RuntimeScene & scene, bool accurate )
{
    for (unsigned int cameraIndex = 0;cameraIndex < scene.GetLayer(layer).GetCamerasNumber();++cameraIndex)
    {
        int mouseXInTheLayer = scene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*scene.renderWindow).x, sf::Mouse::GetPosition(*scene.renderWindow).y, scene.GetLayer(layer).GetCamera(cameraIndex).GetSFMLView()).x;
        int mouseYInTheLayer = scene.renderWindow->ConvertCoords(sf::Mouse::GetPosition(*scene.renderWindow).x, sf::Mouse::GetPosition(*scene.renderWindow).y, scene.GetLayer(layer).GetCamera(cameraIndex).GetSFMLView()).y;

        if  ( GetDrawableX() < mouseXInTheLayer &&
            ( GetDrawableX() + GetWidth() ) > mouseXInTheLayer &&
              GetDrawableY() < mouseYInTheLayer &&
            ( GetDrawableY() + GetHeight() ) > mouseYInTheLayer )
        {
            int ClicX = static_cast<int>( mouseXInTheLayer - GetDrawableX() );
            int ClicY = static_cast<int>( mouseYInTheLayer - GetDrawableY() );

            return ( !accurate || GetCurrentSprite().GetSFMLTexture()->image.GetPixel( ClicX , ClicY ).a != 0 );
        }
    }

    return false;
}

void SpriteObject::TurnTowardObject( std::string, Object * object )
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


void OpenPoint(Point & point, const TiXmlElement * elemPoint)
{
    if ( elemPoint->Attribute( "nom" ) != NULL ) { point.SetName(elemPoint->Attribute( "nom" ));}
    else { cout <<( "Les informations concernant le nom d'un point d'un sprite manquent." ); }

    if ( elemPoint->Attribute( "X" ) != NULL ) { int value; elemPoint->QueryIntAttribute("X", &value); point.SetX(value);}
    else { cout <<( "Les informations concernant la coordonnée X d'un point d'un sprite manquent." ); }

    if ( elemPoint->Attribute( "Y" ) != NULL ) { int value; elemPoint->QueryIntAttribute("Y", &value); point.SetY(value);}
    else { cout <<( "Les informations concernant la coordonnée Y d'un point d'un sprite manquent." ); }

}

void OpenPointsSprites(vector < Point > & points, const TiXmlElement * elem)
{
    const TiXmlElement * elemPoint = elem->FirstChildElement("Point");
    while ( elemPoint )
    {
        Point point("");

        OpenPoint(point, elemPoint);

        points.push_back(point);
        elemPoint = elemPoint->NextSiblingElement();
    }
}

void OpenSpritesDirection(vector < Sprite > & sprites, const TiXmlElement * elem)
{
    const TiXmlElement * elemSprite = elem->FirstChildElement("Sprite");
    while ( elemSprite )
    {
        Sprite sprite;
        if ( elemSprite->Attribute( "image" ) != NULL ) { sprite.SetImageName(elemSprite->Attribute( "image" ));}
        else { cout <<( "Les informations concernant l'image d'un sprite manquent." ); }

        const TiXmlElement * elemPoints = elemSprite->FirstChildElement("Points");
        if ( elemPoints != NULL )
            OpenPointsSprites(sprite.GetAllNonDefaultPoints(), elemPoints);
        else
            cout <<( "Les points d'un sprite manque." );

        const TiXmlElement * elemPointOrigine = elemSprite->FirstChildElement("PointOrigine");
        if ( elemPointOrigine != NULL )
            OpenPoint(sprite.GetOrigine(), elemPointOrigine);
        else
            cout <<( "Le point origine d'un sprite manque." );

        const TiXmlElement * elemPointCentre = elemSprite->FirstChildElement("PointCentre");
        if ( elemPointCentre != NULL )
        {
            OpenPoint(sprite.GetCentre(), elemPointCentre);

            if (    elemPointCentre->Attribute( "automatic" ) != NULL &&
                    string (elemPointCentre->Attribute( "automatic" )) == "false" )
            {
                sprite.SetCentreAutomatic(false);
            }
            else
            {
                sprite.SetCentreAutomatic(true);
            }
        }

        const TiXmlElement * customCollisionMaskElem= elemSprite->FirstChildElement("CustomCollisionMask");
        if ( customCollisionMaskElem )
        {
            bool customCollisionMask = false;
            if ( customCollisionMaskElem->Attribute("custom") && string (customCollisionMaskElem->Attribute("custom")) == "true")
                customCollisionMask = true;

            sprite.SetCollisionMaskAutomatic(!customCollisionMask);

            if ( customCollisionMask )
            {
                std::vector<RotatedRectangle> boxes;
                const TiXmlElement * rectangleElem = customCollisionMaskElem->FirstChildElement("Rectangle");
                while ( rectangleElem )
                {
                    RotatedRectangle rectangle;
                    rectangle.angle = 0;

                    if ( rectangleElem->Attribute("centerX") ) rectangleElem->QueryFloatAttribute("centerX", &rectangle.center.x);
                    if ( rectangleElem->Attribute("centerY") ) rectangleElem->QueryFloatAttribute("centerY", &rectangle.center.y);
                    if ( rectangleElem->Attribute("halfSizeX") ) rectangleElem->QueryFloatAttribute("halfSizeX", &rectangle.halfSize.x);
                    if ( rectangleElem->Attribute("halfSizeY") ) rectangleElem->QueryFloatAttribute("halfSizeY", &rectangle.halfSize.y);
                    if ( rectangleElem->Attribute("angle") ) rectangleElem->QueryFloatAttribute("angle", &rectangle.angle);

                    boxes.push_back(rectangle);
                    rectangleElem = rectangleElem->NextSiblingElement();
                }
                sprite.SetCustomCollisionMask(boxes);
            }

        }

        sprites.push_back(sprite);
        elemSprite = elemSprite->NextSiblingElement();
    }
}

void SpriteObject::LoadFromXml(const TiXmlElement * elemScene)
{
    if ( elemScene->FirstChildElement( "Animations" ) == NULL )
    {
        cout << "Les informations concernant les animations de l'objet manquent.";
    }
    else
    {
        const TiXmlElement * elemObjetScene = elemScene->FirstChildElement( "Animations" )->FirstChildElement();

        //Pour chaque animation
        while ( elemObjetScene )
        {
            Animation AnimToAdd;

            //Direction
            const TiXmlElement *elemObjetDirecScene = elemObjetScene->FirstChildElement();

            if ( elemObjetScene->Attribute( "typeNormal" )  != NULL )
            {
                if ( strcmp( elemObjetScene->Attribute( "typeNormal" ), "false" ) == 0 )
                {
                    AnimToAdd.typeNormal = false;
                }
                else {  AnimToAdd.typeNormal = true ; }
            }
            else { cout << "Les informations sur le type des directions manquent"; }

            //Passage en revue de chaque direction
            unsigned int directionNb = 0;
            while ( elemObjetDirecScene )
            {
                AnimToAdd.SetDirectionsNumber(AnimToAdd.GetDirectionsNumber()+1);
                Direction direction;

                //Compatibilité avec Game Develop 1.0.4599 et inférieur
                if ( elemObjetDirecScene->Attribute( "Images" )  != NULL )
                {
                    string sprites = elemObjetDirecScene->Attribute("Images");
                    vector < string > imgs = SplitString<string>(sprites, ';'); //Imgs contiendra toutes les images de la direction de l'animation.
                    for (unsigned int spriteID = 0;spriteID < imgs.size() ;++spriteID)
                    {
                        Sprite sprite;
                        sprite.SetImageName(imgs.at(spriteID));
                        direction.AddSprite(sprite);
                    }
                }

                const TiXmlElement * elemSprites = elemObjetDirecScene;
                elemSprites = elemObjetDirecScene->FirstChildElement("Sprites");

                if ( elemSprites != NULL ) { OpenSpritesDirection(direction.GetSpritesToModify(), elemSprites); }

                float value = 0;
                if ( elemObjetDirecScene->Attribute( "tempsEntre" )  != NULL ) { elemObjetDirecScene->QueryFloatAttribute( "tempsEntre" , &value );  }
                else { cout << ( "Les informations le \"temps entre\" de la direction manquent" ); }
                direction.SetTimeBetweenFrames( value );

                direction.SetLoop( false );
                if ( elemObjetDirecScene->Attribute( "boucle" )  != NULL )
                {
                    if ( strcmp( elemObjetDirecScene->Attribute( "boucle" ), "true" ) == 0 )
                        direction.SetLoop( true );
                }
                else { cout << ( "Les informations sur le bouclage de la direction manquent" ); }

                AnimToAdd.SetDirection(direction, directionNb);

                directionNb++;
                elemObjetDirecScene = elemObjetDirecScene->NextSiblingElement();
            }

            AddAnimation( AnimToAdd );

            elemObjetScene = elemObjetScene->NextSiblingElement();
        }
    }
}

void SavePoint(const Point & point, TiXmlElement * elem)
{
    if ( elem == NULL ) return;

    elem->SetAttribute("nom", point.GetName().c_str());
    elem->SetDoubleAttribute("X", point.GetX());
    elem->SetDoubleAttribute("Y", point.GetY());
}

void SavePointsSprites(const vector < Point > & points, TiXmlElement * elem)
{
    for (unsigned int i = 0;i<points.size();++i)
    {
        TiXmlElement * point = new TiXmlElement( "Point" );
        elem->LinkEndChild( point );

        SavePoint(points.at(i), point);
    }
}

void SaveSpritesDirection(const vector < Sprite > & sprites, TiXmlElement * elemSprites)
{
    for (unsigned int i = 0;i<sprites.size();++i)
    {
        TiXmlElement * sprite = new TiXmlElement( "Sprite" );
        elemSprites->LinkEndChild( sprite );

        sprite->SetAttribute("image", sprites.at(i).GetImageName().c_str());

        TiXmlElement * points = new TiXmlElement( "Points" );
        sprite->LinkEndChild( points );
        SavePointsSprites(sprites.at(i).GetAllNonDefaultPoints(), points);

        TiXmlElement * pointOrigine = new TiXmlElement( "PointOrigine" );
        sprite->LinkEndChild( pointOrigine );
        SavePoint(sprites.at(i).GetOrigine(), pointOrigine);

        TiXmlElement * pointCentre = new TiXmlElement( "PointCentre" );
        sprite->LinkEndChild( pointCentre );
        SavePoint(sprites.at(i).GetCentre(), pointCentre);
        if ( sprites.at(i).IsCentreAutomatic() )
            pointCentre->SetAttribute("automatic", "true");
        else
            pointCentre->SetAttribute("automatic", "false");

        TiXmlElement * customCollisionMask = new TiXmlElement( "CustomCollisionMask" );
        sprite->LinkEndChild( customCollisionMask );

        customCollisionMask->SetAttribute("custom", "false");
        if ( !sprites.at(i).IsCollisionMaskAutomatic() )
        {
            customCollisionMask->SetAttribute("custom", "true");
            std::vector<RotatedRectangle> boxes = sprites.at(i).GetCollisionMask();
            for (unsigned int i = 0;i<boxes.size();++i)
            {
                TiXmlElement * box = new TiXmlElement( "Rectangle" );
                box->SetDoubleAttribute("centerX", boxes[i].center.x);
                box->SetDoubleAttribute("centerY", boxes[i].center.y);
                box->SetDoubleAttribute("halfSizeX", boxes[i].halfSize.x);
                box->SetDoubleAttribute("halfSizeY", boxes[i].halfSize.y);
                box->SetDoubleAttribute("angle", boxes[i].angle);
                customCollisionMask->LinkEndChild( box );
            }
        }
    }
}
#if defined(GD_IDE_ONLY)
void SpriteObject::SaveToXml(TiXmlElement * objet)
{
    //Animations
    TiXmlElement * animations = new TiXmlElement( "Animations" );
    objet->LinkEndChild( animations );
    TiXmlElement * animation;

    for ( unsigned int k = 0;k < GetAnimationsNumber();k++ )
    {
        animation = new TiXmlElement( "Animation" );
        animations->LinkEndChild( animation );


        if ( GetAnimation( k ).typeNormal )
        {
            animation->SetAttribute( "typeNormal", "true" );
        }
        else { animation->SetAttribute( "typeNormal", "false" ); }

        TiXmlElement * direction;
        for ( unsigned int l = 0;l < GetAnimation( k ).GetDirectionsNumber();l++ )
        {
            direction = new TiXmlElement( "Direction" );
            animation->LinkEndChild( direction );

            //Paramètres de la direction
            if ( GetAnimation( k ).GetDirection( l ).IsLooping() )
            {
                direction->SetAttribute( "boucle", "true" );
            }
            else { direction->SetAttribute( "boucle", "false" ); }

            direction->SetDoubleAttribute( "tempsEntre", GetAnimation( k ).GetDirection( l ).GetTimeBetweenFrames() );

            //Sprites de la direction
            TiXmlElement* sprites = new TiXmlElement( "Sprites" );
            direction->LinkEndChild( sprites );
            SaveSpritesDirection(GetAnimation( k ).GetDirection( l ).GetSprites(),sprites);

        }
    }
}
#endif

SpriteObject::AnimationProxy::AnimationProxy() :
    animation(new Animation)
{
}
SpriteObject::AnimationProxy::~AnimationProxy()
{
    delete animation;
}

SpriteObject::AnimationProxy::AnimationProxy(const Animation & animation_) :
    animation(new Animation(animation_))
{
}

SpriteObject::AnimationProxy::AnimationProxy(const SpriteObject::AnimationProxy & proxy) :
    animation(new Animation(proxy.Get()))
{
}
SpriteObject::AnimationProxy & SpriteObject::AnimationProxy::operator=(const AnimationProxy & rhs)
{
    *animation = Animation(rhs.Get());

    return *this;
}

/**
 * Function destroying an extension Object.
 * Game Develop does not delete directly extension object
 * to avoid overloaded new/delete conflicts.
 */
void DestroySpriteObject(Object * object)
{
    delete object;
}

/**
 * Function creating an extension Object.
 * Game Develop can not directly create an extension object
 */
Object * CreateSpriteObject(std::string name)
{
    return new SpriteObject(name);
}
