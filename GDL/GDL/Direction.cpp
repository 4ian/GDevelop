/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDL/Direction.h"
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
#include <iostream>
#include "GDL/tinyxml/tinyxml.h"
#include "GDL/CommonTools.h"

using namespace std;

Sprite Direction::badSprite;

Direction::Direction() :
loop(false),
timeBetweenFrame(1)
{
    //ctor
}

void Direction::SetLoop( bool loop_ )
{
    loop = loop_;
}

void  Direction::SetTimeBetweenFrames( float time )
{
    timeBetweenFrame = time;
}

void Direction::AddSprite( const Sprite & sprite )
{
    sprites.push_back(sprite);
}

const Sprite & Direction::GetSprite(unsigned int nb) const
{
    if ( nb < sprites.size() )
        return sprites[nb];

    return badSprite;
}

Sprite & Direction::GetSprite(unsigned int nb)
{
    if ( nb < sprites.size() )
        return sprites[nb];

    return badSprite;
}

void Direction::RemoveSprite(unsigned int index)
{
    if ( index < sprites.size() )
        sprites.erase(sprites.begin()+index);
}

void Direction::SwapSprites(unsigned int firstSpriteIndex, unsigned int secondSpriteIndex)
{
    if ( firstSpriteIndex < sprites.size() && secondSpriteIndex < sprites.size() && firstSpriteIndex != secondSpriteIndex)
        swap(sprites[firstSpriteIndex], sprites[secondSpriteIndex]);
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

void Direction::LoadFromXml(const TiXmlElement * element)
{
    if (element == NULL) return;

    float value = 0;
    if ( element->Attribute( "tempsEntre" )  != NULL ) { element->QueryFloatAttribute( "tempsEntre" , &value );  }
    else { cout << ( "Les informations le \"temps entre\" de la direction manquent" ); }
    SetTimeBetweenFrames( value );

    SetLoop( element->Attribute( "boucle" )  != NULL && ToString(element->Attribute( "boucle" )) == "true" );

    if ( element->FirstChildElement("Sprites") != NULL )
    {
        const TiXmlElement * elemSprite = element->FirstChildElement("Sprites")->FirstChildElement("Sprite");
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

                sprite.SetCentreAutomatic( !(elemPointCentre->Attribute( "automatic" ) != NULL && string (elemPointCentre->Attribute( "automatic" )) == "false") );
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
}

#if defined(GD_IDE_ONLY)
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

void Direction::SaveToXml(TiXmlElement * direction) const
{
    if ( direction == NULL ) return;

    direction->SetAttribute( "boucle", IsLooping() ? "true" : "false" );
    direction->SetDoubleAttribute( "tempsEntre", GetTimeBetweenFrames() );

    TiXmlElement* spritesElem = new TiXmlElement( "Sprites" );
    direction->LinkEndChild( spritesElem );
    SaveSpritesDirection(sprites,spritesElem);

}
#endif
