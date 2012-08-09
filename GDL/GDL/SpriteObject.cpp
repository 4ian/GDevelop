/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#if defined(GD_IDE_ONLY)
#include <wx/wx.h> //Must be placed first, otherwise we get nice errors relative to "cannot convert 'const TCHAR*'..." in wx/msw/winundef.h
#endif
#include <SFML/Graphics.hpp>
#include "GDL/SpriteObject.h"
#include "GDL/RuntimeGame.h"
#include "GDL/Object.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/Position.h"
#include "GDL/CommonTools.h"
#include "GDL/RuntimeScene.h"
#include "GDL/Direction.h"
#include "GDL/Sprite.h"
#include "GDL/ShaderManager.h"

#if defined(GD_IDE_ONLY)
#include "GDCore/IDE/ArbitraryResourceWorker.h"
#include "GDL/CommonTools.h"
#include "GDCore/IDE/Dialogs/MainFrameWrapper.h"
#include "GDL/IDE/Dialogs/SpriteObjectEditor.h"
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
    for ( unsigned int j = 0; j < GetAnimationCount();j++ )
    {
        for ( unsigned int k = 0;k < GetAnimation( j ).GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < GetAnimation( j ).GetDirection(k).GetSpriteCount();l++ )
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
        SetCurrentAnimation(position.floatInfos.find("animation")->second);

    return true;
}

/**
 * Render object at runtime
 */
bool SpriteObject::Draw( sf::RenderTarget & renderTarget )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    renderTarget.Draw( GetCurrentSFMLSprite() );

    /* Debug code to display hitboxes
    std::vector<RotatedRectangle> boxes = GetHitBoxes();
    for (unsigned int i = 0;i<boxes.size();++i)
    {
        sf::Shape rect = sf::Shape::Rectangle(0,0, boxes[i].halfSize.x*2, boxes[i].halfSize.y*2, sf::Color(255,30,30));
        rect.SetRotation(boxes[i].angle*180.0f/3.14159f);
        rect.SetOrigin(boxes[i].halfSize.x, boxes[i].halfSize.y);
        rect.SetPosition(boxes[i].center.x, boxes[i].center.y);

        renderTarget.Draw(rect);
    }*/

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool SpriteObject::DrawEdittime( sf::RenderTarget & renderTarget )
{
    renderTarget.Draw( GetCurrentSFMLSprite() );

    return true;
}

bool SpriteObject::GenerateThumbnail(const gd::Project & project, wxBitmap & thumbnail)
{
    try
    {
        const Game & game = dynamic_cast<const Game &>(project);

        //Generate a thumbnail from the first animation
        if ( !HasNoAnimations() && !GetAnimation(0).HasNoDirections() && !GetAnimation(0).GetDirection(0).HasNoSprites() )
        {
            std::string imageName = GetAnimation(0).GetDirection(0).GetSprite(0).GetImageName();

            if ( game.resourceManager.HasResource(imageName) && wxFileExists(game.resourceManager.GetResource(imageName).GetAbsoluteFile(game)) )
            {
                thumbnail = wxBitmap( game.resourceManager.GetResource(imageName).GetAbsoluteFile(game), wxBITMAP_TYPE_ANY);

                wxImage thumbImage = thumbnail.ConvertToImage();
                thumbnail = wxBitmap(thumbImage.Scale(24, 24));

                return true;
            }
        }
    }
    catch(...)
    {
        std::cout << "Error during thumbnail generation: Probably the project passed in argument is not a GD C++ Platform project" << std::endl;
    }

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

void SpriteObject::EditObject( wxWindow* parent, Game & game, gd::MainFrameWrapper & mainFrameWrapper )
{
    SpriteObjectEditor dialog( parent, game, *this, mainFrameWrapper );
    dialog.ShowModal();
}

wxPanel * SpriteObject::CreateInitialPositionPanel( wxWindow* parent, const Game & game_, const Scene & scene_, const InitialPosition & position )
{
    SpriteInitialPositionPanel * panel = new SpriteInitialPositionPanel(parent);

    panel->DirectionEdit->ChangeValue(ToString( position.GetAngle() ));

    for (unsigned int i = 0;i<GetAnimationCount();i++ )
        panel->AnimationCombo->Append(ToString(i));

    if ( position.floatInfos.find("animation") != position.floatInfos.end())
        panel->AnimationCombo->SetSelection(position.floatInfos.find("animation")->second);
    else
        panel->AnimationCombo->SetSelection(0);

    return panel;
}

void SpriteObject::UpdateInitialPositionFromPanel(wxPanel * panel, InitialPosition & position)
{
    SpriteInitialPositionPanel * spritePanel = dynamic_cast<SpriteInitialPositionPanel*>(panel);
    if (spritePanel == NULL) return;

    position.SetAngle(ToInt(string(spritePanel->DirectionEdit->GetValue().mb_str())));
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
    if ( propertyNb == 0 ) { return SetCurrentAnimation(ToInt(newValue)); }
    else if ( propertyNb == 1 ) {return GetAnimation( currentAnimation ).useMultipleDirections ? SetDirection(ToInt(newValue)) : SetAngle(ToFloat(newValue)); }
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
                        !isFlippedX ? GetCurrentSprite().GetPoint(point).GetX() : GetCurrentSprite().GetSFMLSprite().GetSize().x-GetCurrentSprite().GetPoint(point).GetX(),
                        !isFlippedY ? GetCurrentSprite().GetPoint(point).GetY() : GetCurrentSprite().GetSFMLSprite().GetSize().y-GetCurrentSprite().GetPoint(point).GetY()
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
                        !isFlippedX ? GetCurrentSprite().GetPoint(point).GetX() : GetCurrentSprite().GetSFMLSprite().GetSize().x-GetCurrentSprite().GetPoint(point).GetX(),
                        !isFlippedY ? GetCurrentSprite().GetPoint(point).GetY() : GetCurrentSprite().GetSFMLSprite().GetSize().y-GetCurrentSprite().GetPoint(point).GetY()
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
    if ( currentAnimation >= GetAnimationCount() )
        ptrToCurrentSprite = &badSpriteDatas;
    else
    {
        Animation & currentAnim = animations[currentAnimation].GetNonConst();

        if ( currentAnim.useMultipleDirections )
        {
            //Update sprite pointer
            if ( currentDirection >= currentAnim.GetDirectionsNumber() || currentSprite >= currentAnim.GetDirection(currentDirection).GetSpriteCount() )
                ptrToCurrentSprite = &badSpriteDatas;
            else
                ptrToCurrentSprite = &currentAnim.GetDirectionToModify( currentDirection ).GetSprite( currentSprite );

            ptrToCurrentSprite->GetSFMLSprite().SetX( X - ptrToCurrentSprite->GetOrigine().GetX() + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Width)*(1-scaleX)/2 );
            ptrToCurrentSprite->GetSFMLSprite().SetY( Y - ptrToCurrentSprite->GetOrigine().GetY() + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Height)*(1-scaleY)/2 );
        }
        else
        {
            //Update sprite pointer
            if ( currentAnim.HasNoDirections() || currentSprite >= currentAnim.GetDirection(0).GetSpriteCount() )
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

    const Direction & direction = GetAnimation(currentAnimation).GetDirection( currentDirection );

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
    if ( currentAnimation >= GetAnimationCount() )
    {
        std::vector<RotatedRectangle> boxes; //Invalid animation, bail out.
        return boxes;
    }

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
        if ( !GetAnimation( currentAnimation ).useMultipleDirections )
            boxes[i].angle += GetAngle()*3.14159f/180.0f;
    }

    return boxes;
}

/**
 * Change the number of the current sprite
 */
bool SpriteObject::SetSprite( unsigned int nb )
{
    if ( currentAnimation >= GetAnimationCount() ||
        currentDirection >= GetAnimation( currentAnimation ).GetDirectionsNumber() ||
        nb >= GetAnimation( currentAnimation ).GetDirection( currentDirection ).GetSpriteCount() ) return false;

    currentSprite = nb;
    timeElapsedOnCurrentSprite = 0;

    needUpdateCurrentSprite = true;
    return true;
}

/**
 * Change the number of the current animation
 */
bool SpriteObject::SetCurrentAnimation( unsigned int nb )
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
bool SpriteObject::SetDirection( float nb )
{
    if ( currentAnimation >= GetAnimationCount() ) return false;

    if ( !GetAnimation( currentAnimation ).useMultipleDirections )
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
    if ( currentAnimation >= GetAnimationCount() ) return false;

    if ( !GetAnimation( currentAnimation ).useMultipleDirections )
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
    if ( !GetAnimation( currentAnimation ).useMultipleDirections )
        return currentAngle;
    else
        return currentDirection*45;
}

float SpriteObject::GetCurrentDirectionOrAngle() const
{
    if ( currentAnimation >= GetAnimationCount() ) return 0;

    if ( GetAnimation( currentAnimation ).useMultipleDirections )
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
    if ( nb >= GetAnimationCount() )
        return false;

    cacheAnimationSizeNeedUpdate = true;
    needUpdateCurrentSprite = true;
    animations.erase( animations.begin() + nb );
    return true;
}

/**
 * Return the number of animations the object has.
 */
unsigned int SpriteObject::GetAnimationCount() const
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
    for (unsigned int cameraIndex = 0;cameraIndex < scene.GetLayer(layer).GetCameraCount();++cameraIndex)
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

void SpriteObject::TurnTowardObject( const std::string &, Object * object )
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


void SpriteObject::LoadFromXml(const TiXmlElement * elemScene)
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
void SpriteObject::SaveToXml(TiXmlElement * objet)
{
    //Animations
    TiXmlElement * animations = new TiXmlElement( "Animations" );
    objet->LinkEndChild( animations );
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
