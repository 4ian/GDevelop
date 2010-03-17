#include "GDL/SpriteObject.h"
#include "GDL/Object.h"
#include "GDL/Access.h"
#include "GDL/ImageManager.h"
#include "GDL/tinyxml.h"
#include "GDL/Position.h"
#include "GDL/StdAlgo.h"
#include <SFML/Graphics.hpp>

#ifdef GDE
#include <wx/wx.h>
#include "GDL/StdAlgo.h"
#include "GDL/MainEditorCommand.h"
#include "GDL/EditorObjet.h"
#include "GDL/SpriteInitialPositionPanel.h"
#endif

sf::Sprite SpriteObject::badSprite;
Animation SpriteObject::badAnimation;
Sprite SpriteObject::badSpriteDatas;

SpriteObject::SpriteObject(std::string name_) :
Object(name_),
m_animCourant( 0 ),
m_direcCourant( 0 ),
m_spriteCourant( 0 ),
animationStopped(false),
timeElapsedOnCurrentSprite(0),
currentSprite( NULL ),
needUpdateCurrentSprite(true),
cacheAnimationSizeNeedUpdate(true),
opacity( 255 ),
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
        if ( elemSprite->Attribute( "image" ) != NULL ) { sprite.SetImage(elemSprite->Attribute( "image" ));}
        else { cout <<( "Les informations concernant l'image d'un sprite manquent." ); }

        const TiXmlElement * elemPoints = elemSprite->FirstChildElement("Points");
        if ( elemPoints != NULL )
            OpenPointsSprites(sprite.ModNonDefaultPoints(), elemPoints);
        else
            cout <<( "Les points d'un sprite manquent." );

        const TiXmlElement * elemPointOrigine = elemSprite->FirstChildElement("PointOrigine");
        if ( elemPointOrigine != NULL )
            OpenPoint(sprite.ModOrigine(), elemPointOrigine);
        else
            cout <<( "Le point origine d'un sprite manquent." );

        const TiXmlElement * elemPointCentre = elemSprite->FirstChildElement("PointCentre");
        if ( elemPointCentre != NULL )
        {
            OpenPoint(sprite.ModCentre(), elemPointCentre);

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
                        sprite.SetImage(imgs.at(spriteID));
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

        sprite->SetAttribute("image", sprites.at(i).GetImage().c_str());

        TiXmlElement * points = new TiXmlElement( "Points" );
        sprite->LinkEndChild( points );
        SavePointsSprites(sprites.at(i).GetNonDefaultPoints(), points);

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
    }
}

void SpriteObject::SaveToXml(TiXmlElement * objet)
{
    //Animations
    TiXmlElement * animations = new TiXmlElement( "Animations" );
    objet->LinkEndChild( animations );
    TiXmlElement * animation;

    if ( !HasNoAnimations() )
    {
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
}

bool SpriteObject::LoadResources(const ImageManager & imageMgr )
{
    for ( unsigned int j = 0; j < GetAnimationsNumber();j++ )
    {
        for ( unsigned int k = 0;k < GetAnimation( j ).GetDirectionsNumber();k++ )
        {
            for ( unsigned int l = 0;l < GetAnimation( j ).GetDirection(k).GetSpritesNumber();l++ )
            {
                Sprite & sprite = GetAnimation( j ).GetDirectionToModify(k).ModSprite(l);

                if ( imageMgr.images.find(sprite.GetImage()) != imageMgr.images.end() )
                    sprite.SetSprite(sf::Sprite(imageMgr.images.find(sprite.GetImage())->second));
                else
                {
                    cout << "L'image \"" + sprite.GetImage() +  "\" pour l'objet nommé \"" + GetName() + "\" n'a pas pu être trouvée.";
                    sprite.SetSprite(sf::Sprite(imageMgr.imageVide));
                }
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
        SetAnim(position.floatInfos.find("animation")->second);

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

    window.Draw( GetCurrentSprite() );

    //Debug Code
    /*sf::Shape circle = sf::Shape::Circle(GetDrawableX()+GetCenterX(), GetDrawableY()+GetCenterY(), 10, sf::Color(0,255,0));
    window.Draw(circle);

    sf::Shape origineD = sf::Shape::Circle(GetDrawableX(), GetDrawableY(), 10, sf::Color(255,0,0));
    window.Draw(origineD);

    sf::Shape origine = sf::Shape::Circle(GetX(), GetY(), 10, sf::Color(0,0,255));
    window.Draw(origine);*/

    return true;
}

#ifdef GDE
/**
 * Render object at edittime
 */
bool SpriteObject::DrawEdittime(sf::RenderWindow& renderWindow)
{
    renderWindow.Draw( GetCurrentSprite() );

    return true;
}

bool SpriteObject::GenerateThumbnail(const Game & game, wxBitmap & thumbnail)
{
    //Generate a thumbnail from the first animation
    if ( IsValid(0,0,0) )
    {
        int idImage = ChercherNomImage(game.images, GetAnimation(0).GetDirection(0).GetSprite(0).GetImage());
        if ( idImage != -1 )
        {
            if ( !wxFileExists(game.images.at( idImage ).fichier) ) return false;

            thumbnail = wxBitmap( game.images.at( idImage ).fichier, wxBITMAP_TYPE_ANY);

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

    panel->DirectionEdit->SetValue(ToString( position.angle ));

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

    position.angle = toInt(string(spritePanel->DirectionEdit->GetValue().mb_str()));
    position.floatInfos["animation"] = toInt(string(spritePanel->AnimationCombo->GetValue().mb_str()));
}

void SpriteObject::GetPropertyForDebugger(unsigned int propertyNb, string & name, string & value) const
{
    if      ( propertyNb == 0 ) {name = _("Animation");     value = toString(GetAnimationNb());}
    else if ( propertyNb == 1 ) {name = _("Direction");     value = toString(GetDirectionNb());}
    else if ( propertyNb == 2 ) {name = _("Image");         value = toString(GetSpriteNb());}
    else if ( propertyNb == 3 ) {name = _("Opacité");       value = toString(GetOpacity());}
    else if ( propertyNb == 4 ) {name = _("Echelle X de la taille");       value = toString(GetScaleX());}
    else if ( propertyNb == 5 ) {name = _("Echelle Y de la taille");       value = toString(GetScaleY());}
}

bool SpriteObject::ChangeProperty(unsigned int propertyNb, string newValue)
{
    if ( propertyNb == 0 ) { return SetAnim(toInt(newValue)); }
    else if ( propertyNb == 1 ) {return SetDirec(toInt(newValue)); }
    else if ( propertyNb == 2 ) { return SetSprite(toInt(newValue)); }
    else if ( propertyNb == 3 ) { SetOpacity(toInt(newValue)); }
    else if ( propertyNb == 4 ) {SetScaleX(toInt(newValue));}
    else if ( propertyNb == 5 ) {SetScaleY(toInt(newValue));}

    return true;
}

unsigned int SpriteObject::GetNumberOfProperties() const
{
    return 6;
}
#endif

/**
 * Get the real X position of the sprite
 */
float SpriteObject::GetDrawableX() const
{
    //FIXME (The not commented code is correct but not optimal)
    //Bad placement when origine of sf::Sprite is changed ( for automatic Rotation for example )
    //return GetCurrentSprite().GetPosition().x;
    return X - GetCurrentSpriteDatas().GetOrigine().GetX() + (currentSprite->ModSprite().GetSubRect().GetSize().x)*(1-scaleX)/2;
}

/**
 * Get the real Y position of the sprite
 */
float SpriteObject::GetDrawableY() const
{
    //return GetCurrentSprite().GetPosition().y;
    return Y - GetCurrentSpriteDatas().GetOrigine().GetY() + (currentSprite->ModSprite().GetSubRect().GetSize().y)*(1-scaleY)/2;
}

/**
 * Get the width of the current sprite.
 */
float SpriteObject::GetWidth() const
{
    return GetCurrentSprite().GetSize().x;
}

/**
 * Get the height of the current sprite.
 */
float SpriteObject::GetHeight() const
{
    return GetCurrentSprite().GetSize().y;
}

void SpriteObject::SetWidth(float newWidth)
{
    if ( newWidth > 0 )
    {
        scaleX = newWidth/(GetCurrentSprite().GetSubRect().GetSize().x);
        needUpdateCurrentSprite = true;
    }
}

void SpriteObject::SetHeight(float newHeight)
{
    if ( newHeight > 0 )
    {
        scaleY = newHeight/(GetCurrentSprite().GetSubRect().GetSize().y);
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
    return GetCurrentSpriteDatas().GetCentre().GetX()*scaleX;
}

/**
 * Y center is computed with the current sprite
 */
float SpriteObject::GetCenterY() const
{
    //Just need to multiply by the scale as it is the center
    return GetCurrentSpriteDatas().GetCentre().GetY()*scaleY;
}

/**
 * Prepare the current sprite
 */
void SpriteObject::UpdateCurrentSprite() const
{
    //Mise à jour du pointeur vers le sprite SFML
    if ( m_animCourant >= GetAnimationsNumber() )
    {
        cout << "Impossible d'accéder à l'animation "<<m_animCourant;
        currentSprite = &badSpriteDatas;
    }
    else
        currentSprite = &animations[m_animCourant].GetDirectionToModify( m_direcCourant ).ModSprite( m_spriteCourant );

    //Mise à jour du sprite SFML avec les propriétés de l'objet
    currentSprite->ModSprite().SetScale( scaleX, scaleY );
    currentSprite->ModSprite().SetColor( sf::Color( colorR, colorV, colorB, opacity ) );

    if ( GetAnimation(m_animCourant).typeNormal )
    {
        currentSprite->ModSprite().SetX( X - currentSprite->GetOrigine().GetX() + (currentSprite->ModSprite().GetSubRect().GetSize().x)*(1-scaleX)/2 );
        currentSprite->ModSprite().SetY( Y - currentSprite->GetOrigine().GetY() + (currentSprite->ModSprite().GetSubRect().GetSize().y)*(1-scaleY)/2 );
    }
    else
    {
        currentSprite->ModSprite().SetX( X  + currentSprite->GetCentre().GetX()*scaleX - currentSprite->GetOrigine().GetX()
                                            + (currentSprite->ModSprite().GetSubRect().GetSize().x)*(1-scaleX)/2);
        currentSprite->ModSprite().SetY( Y  + currentSprite->GetCentre().GetY()*scaleY - currentSprite->GetOrigine().GetY()
                                            + (currentSprite->ModSprite().GetSubRect().GetSize().y)*(1-scaleY)/2);

        currentSprite->ModSprite().SetOrigin(   currentSprite->GetCentre().GetX(),
                                                currentSprite->GetCentre().GetY() );
        currentSprite->ModSprite().SetRotation( -m_direcCourant );
    }

    needUpdateCurrentSprite = false;
}


/**
 * Update the time elpased on the current sprite, and change this latter if needed.
 */
void SpriteObject::UpdateTime(float elapsedTime)
{
    if ( animationStopped ) return;

    timeElapsedOnCurrentSprite += elapsedTime;
    float delay = GetAnimation(m_animCourant).GetDirection( m_direcCourant ).GetTimeBetweenFrames();

    //On gère l'avancement du sprite actuel suivant le temps entre chaque sprite
    if ( timeElapsedOnCurrentSprite > delay )
    {
        if ( delay != 0 )
        {
            unsigned int frameCount = static_cast<unsigned int>( timeElapsedOnCurrentSprite / delay );
            m_spriteCourant += frameCount;
        }
        else m_spriteCourant++;

        timeElapsedOnCurrentSprite = 0;
    }
    if ( m_spriteCourant >= GetAnimation(m_animCourant).GetDirection( m_direcCourant ).GetSpritesNumber() )
    {
        if ( GetAnimation(m_animCourant).GetDirection( m_direcCourant ).IsLooping() )
            m_spriteCourant = 0;
        else
            m_spriteCourant = GetAnimation(m_animCourant).GetDirection( m_direcCourant ).GetSpritesNumber() - 1;
    }

    needUpdateCurrentSprite = true;
}


/**
 * Add a sprite to an animation
 */
bool SpriteObject::AddSprite( const sf::Sprite & sprite, int animation, int direction )
{
    return GetAnimation( animation ).AddSpriteToDirection( sprite, direction );
}

/**
 * Test if an animation/direction/sprite number is valid
 */
bool SpriteObject::IsValid( int anim, int direc, int sprite ) const
{
    if ( anim != -1 )
    {
        //Vérification de l'animation
        if ( anim < 0 )
        {
            std::ostringstream renvoinum;
            renvoinum << anim;
            std::string renvoistr = renvoinum.str();


            if ( errors != NULL )
                errors->Add( "L'animation n°" + renvoistr + " pour l'objet nommé " + name + " est invalide ( Inférieur à 0 )", "", name, -1, 1 );

            return false;
        }
        if ( static_cast<unsigned>( anim ) >= GetAnimationsNumber() )
        {
            std::ostringstream renvoinum;
            renvoinum << anim;
            std::string renvoistr = renvoinum.str();

            if ( errors != NULL )
                errors->Add( "L'animation n°" + renvoistr + " pour l'objet nommé " + name + " est invalide ( ce numéro n'existe pas pour cet objet )", "", name, -1, 1 );

            return false;
        }
    }

    if ( direc != -1 )
    {
        //Vérification des directions ( uniquement pour les animations à 8 directions )
        if ( animations[anim].typeNormal && static_cast<unsigned>( direc ) >= GetAnimation( anim ).GetDirectionsNumber() )
        {
            std::ostringstream renvoinum;
            renvoinum << direc;
            std::string renvoistr = renvoinum.str();


            if ( errors != NULL )
                errors->Add( "La direction n°" + renvoistr + " pour l'objet nommé " + name + " est invalide ( Supérieur au nombre de directions autorisées )", "", name, -1, 1 );

            return false;
        }
        if ( animations[anim].typeNormal &&  direc < 0 )
        {
            std::ostringstream renvoinum;
            renvoinum << direc;
            std::string renvoistr = renvoinum.str();


            if ( errors != NULL )
                errors->Add( "La direction n°" + renvoistr + " pour l'objet nommé " + name + " est invalide ( Inférieure à 0 )", "", name, -1, 1 );

            return false;
        }
        if ( animations[anim].GetDirection( direc ).HasNoSprites() )
        {
            std::ostringstream renvoinum;
            renvoinum << direc;
            std::string renvoistr = renvoinum.str();

            if ( errors != NULL )
                errors->Add( "La direction n°" + renvoistr + " pour l'objet nommé " + name + " ne contient pas d'images", "", name, -1, 1 );

            return false;
        }
    }

    if ( sprite != -1 )
    {
        int direction = direc;
        if ( ! animations[anim].typeNormal )
            direction = 0;

        //Vérifications des images
        if ( static_cast<unsigned>( sprite ) >= animations[anim].GetDirection( direction ).GetSpritesNumber() )
        {
            std::ostringstream renvoinum;
            renvoinum << sprite;
            std::string renvoistr = renvoinum.str();


            if ( errors != NULL )
                errors->Add( "L'image n°" + renvoistr + " pour l'objet nommé " + name + " est invalide ( Supérieur au nombres d'image que contient la direction )", "", name, -1, 1 );

            return false;
        }
        if ( sprite < 0 )
        {
            std::ostringstream renvoinum;
            renvoinum << sprite;
            std::string renvoistr = renvoinum.str();


            if ( errors != NULL )
                errors->Add( "L'image n°" + renvoistr + " pour l'objet nommé " + name + " est invalide ( Inférieure à 0 )", "", name, -1, 1 );

            return false;
        }
    }

    return true;
}

/**
 * Get the SFML sprite
 */
const sf::Sprite & SpriteObject::GetCurrentSprite() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return currentSprite->ModSprite();
}

/**
 * Get the ( Game Develop ) sprite
 */
const Sprite & SpriteObject::GetCurrentSpriteDatas() const
{
    if ( needUpdateCurrentSprite ) UpdateCurrentSprite();

    return *currentSprite;
}

/**
 * Change the number of the current sprite
 */
bool SpriteObject::SetSprite( int nb )
{
    if ( nb < 0 ) return false;

    if ( IsValid( m_animCourant, m_direcCourant, nb ) )
    {
        m_spriteCourant = nb;
        needUpdateCurrentSprite = true;
        timeElapsedOnCurrentSprite = 0;
        return true;
    }
    return false;
}

/**
 * Change the number of the current animation
 */
bool SpriteObject::SetAnim( int nb )
{
    if ( nb < 0 ) return false;

    if ( static_cast<unsigned>( nb ) == m_animCourant )
    {
        if ( IsValid( nb, -1, -1 ) )
            return true;

        return false;
    }

    int direc = m_direcCourant;
    if ( IsValid( nb, -1, -1 ) && !GetAnimation( nb ).typeNormal )
    {
        direc = 0; //Rotation automatique, direction 0;
    }

    //Peut on changer l'animation ?
    if ( IsValid( nb, direc, 0 ) )
    {
        m_animCourant = nb;
        m_spriteCourant = 0;
        timeElapsedOnCurrentSprite = 0;
        needUpdateCurrentSprite = true;
        return true;
    }

    return false;
}

/**
 * Change the value of the current direction
 */
bool SpriteObject::SetDirec( int nb )
{
    if ( nb < 0 && GetAnimation( m_animCourant ).typeNormal ) return false;

    if ( m_direcCourant == nb )
        return true;

    //Si on les directions sont des rotations automatiques
    if ( IsValid( m_animCourant, -1, -1 ) && !GetAnimation( m_animCourant ).typeNormal )
    {
        m_direcCourant = nb;
        needUpdateCurrentSprite = true;
        //Pas de remise à zéro du sprite car c'est la rotation automatique
        return true;
    }

    //Peut on changer la direction
    if ( IsValid( m_animCourant, nb, 0 ) )
    {
        m_direcCourant = nb;
        m_spriteCourant = 0;
        needUpdateCurrentSprite = true;
    }

    return true;
}

/**
 * Set the angle of a sprite object, which corresponds to its direction.
 */
void SpriteObject::SetAngle(float newAngle)
{
    if ( !GetAnimation( m_animCourant ).typeNormal )
        SetDirec(newAngle);
    else
        SetDirec(static_cast<int>(gdRound((static_cast<int>(newAngle)%360)/45.f))%8);
}

/**
 * Get the angle of a sprite object, which corresponds to its direction.
 */
float SpriteObject::GetAngle() const
{
    if ( !GetAnimation( m_animCourant ).typeNormal )
        return m_direcCourant;
    else
        return m_direcCourant*45;
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
    {
        cout << "Impossible de suppriemr l'animation "<<nb;
        return false;
    }

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
void SpriteObject::SetOpacity( int val )
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

/**
 * Function creating an extension Object from another.
 * Game Develop can not directly create an extension object.
 *
 * Note that it is safe to do the static cast, as this function
 * is called owing to the typeId of the object to copy.
 */
Object * CreateSpriteObjectByCopy(Object * object)
{
    return new SpriteObject(*static_cast<SpriteObject *>(object));
}
