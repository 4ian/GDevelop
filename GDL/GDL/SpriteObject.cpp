#include "GDL/SpriteObject.h"
#include "GDL/Object.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/Position.h"
#include "GDL/CommonTools.h"
#include <SFML/Graphics.hpp>

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
blendMode(sf::Blend::Alpha),
isFlippedX(false),
isFlippedY(false),
scaleX( 1 ),
scaleY( 1 ),
colorR( 255 ),
colorV( 255 ),
colorB( 255 )
{
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
            cout <<( "Les points d'un sprite manquent." );

        const TiXmlElement * elemPointOrigine = elemSprite->FirstChildElement("PointOrigine");
        if ( elemPointOrigine != NULL )
            OpenPoint(sprite.GetOrigine(), elemPointOrigine);
        else
            cout <<( "Le point origine d'un sprite manquent." );

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
                    vector < string > imgs; //Imgs contiendra toutes les images de la direction de l'animation.
                    SpliterV( &imgs, sprites, ';' );
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

bool SpriteObject::LoadResources(const RuntimeScene & scene, const ImageManager & imageMgr )
{
    for ( unsigned int j = 0; j < GetAnimationsNumber();j++ )
    {
        for ( unsigned int k = 0;k < GetAnimation( j ).GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < GetAnimation( j ).GetDirection(k).GetSpritesNumber();l++ )
            {
                Sprite & sprite = GetAnimation( j ).GetDirectionToModify(k).GetSprite(l);

                sprite.LoadImage(imageMgr.GetSFMLImage(sprite.GetImageName()));
            }
        }
    }

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

/**
 * Render object at runtime
 */
bool SpriteObject::Draw( sf::RenderWindow& window )
{
    //Don't draw anything if hidden
    if ( hidden ) return true;

    window.Draw( GetCurrentSFMLSprite() );

    return true;
}

#if defined(GD_IDE_ONLY)
/**
 * Render object at edittime
 */
bool SpriteObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    renderWindow.Draw( GetCurrentSFMLSprite() );

    return true;
}

bool SpriteObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    //Generate a thumbnail from the first animation
    if ( !HasNoAnimations() && !GetAnimation(0).HasNoDirections() && !GetAnimation(0).GetDirection(0).HasNoSprites() )
    {
        int idImage = FindImage(game.images, GetAnimation(0).GetDirection(0).GetSprite(0).GetImageName());
        if ( idImage != -1 )
        {
            if ( !wxFileExists(game.images.at( idImage ).file) ) return false;

            thumbnail = wxBitmap( game.images.at( idImage ).file, wxBITMAP_TYPE_ANY);

            wxImage image = thumbnail.ConvertToImage();
            thumbnail = wxBitmap(image.Scale(24, 24));

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
    else if ( propertyNb == 4 )
    {
        int blendModeRequested = ToInt(newValue);
        if ( blendModeRequested == 0 ) SetBlendMode(sf::Blend::Alpha);
        else if ( blendModeRequested == 1 ) SetBlendMode(sf::Blend::Add);
        else if ( blendModeRequested == 2 ) SetBlendMode(sf::Blend::Multiply);
        else if ( blendModeRequested == 3 ) SetBlendMode(sf::Blend::None);
    }
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

/**
 * Prepare the current sprite
 */
void SpriteObject::UpdateCurrentSprite() const
{
    if ( currentAnimation >= GetAnimationsNumber() )
        ptrToCurrentSprite = &badSpriteDatas;
    else
    {
        if ( animations[currentAnimation].typeNormal )
        {
            //Update sprite pointer
            if ( currentDirection >= animations[currentAnimation].GetDirectionsNumber() || currentSprite >= animations[currentAnimation].GetDirection(currentDirection).GetSpritesNumber() )
                ptrToCurrentSprite = &badSpriteDatas;
            else
                ptrToCurrentSprite = &animations[currentAnimation].GetDirectionToModify( currentDirection ).GetSprite( currentSprite );

            ptrToCurrentSprite->GetSFMLSprite().SetX( X - ptrToCurrentSprite->GetOrigine().GetX() + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Width)*(1-scaleX)/2 );
            ptrToCurrentSprite->GetSFMLSprite().SetY( Y - ptrToCurrentSprite->GetOrigine().GetY() + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Height)*(1-scaleY)/2 );
        }
        else
        {
            //Update sprite pointer
            if ( animations[currentAnimation].HasNoDirections() || currentSprite >= animations[currentAnimation].GetDirection(0).GetSpritesNumber() )
                ptrToCurrentSprite = &badSpriteDatas;
            else
                ptrToCurrentSprite = &animations[currentAnimation].GetDirectionToModify(0).GetSprite( currentSprite );

            ptrToCurrentSprite->GetSFMLSprite().SetX( X  + ptrToCurrentSprite->GetCentre().GetX()*scaleX - ptrToCurrentSprite->GetOrigine().GetX()
                                                + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Width)*(1-scaleX)/2);
            ptrToCurrentSprite->GetSFMLSprite().SetY( Y  + ptrToCurrentSprite->GetCentre().GetY()*scaleY - ptrToCurrentSprite->GetOrigine().GetY()
                                                + (ptrToCurrentSprite->GetSFMLSprite().GetSubRect().Height)*(1-scaleY)/2);

            ptrToCurrentSprite->GetSFMLSprite().SetOrigin(   ptrToCurrentSprite->GetCentre().GetX(),
                                                    ptrToCurrentSprite->GetCentre().GetY() );
            ptrToCurrentSprite->GetSFMLSprite().SetRotation( -currentAngle );
        }
    }

    ptrToCurrentSprite->GetSFMLSprite().SetScale( scaleX, scaleY );
    ptrToCurrentSprite->GetSFMLSprite().SetColor( sf::Color( colorR, colorV, colorB, opacity ) );
    ptrToCurrentSprite->GetSFMLSprite().SetBlendMode( blendMode );
    ptrToCurrentSprite->GetSFMLSprite().FlipX(isFlippedX);
    ptrToCurrentSprite->GetSFMLSprite().FlipY(isFlippedY);

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
 * Change the value of the current direction
 */
bool SpriteObject::SetDirection( unsigned int nb )
{
    if ( currentAnimation >= GetAnimationsNumber() ||
        nb >= GetAnimation( currentAnimation ).GetDirectionsNumber() ||
        GetAnimation( currentAnimation ).GetDirection( nb ).HasNoSprites() ) return false;

    if ( nb == currentDirection ) return true;

    currentDirection = nb;
    currentSprite = 0;
    timeElapsedOnCurrentSprite = 0;

    needUpdateCurrentSprite = true;
    return true;
}

/**
 * Set the angle of a sprite object, which corresponds to its direction.
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

/**
 * Add an animation
 */
void SpriteObject::AddAnimation(const Animation & animation)
{
    animations.push_back(animation);
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
