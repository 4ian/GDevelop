/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#include "GDCpp/Direction.h"
#include <SFML/Graphics.hpp>
#include <string>
#include <vector>
#include <iostream>
#include "GDCpp/tinyxml/tinyxml.h"
#include "GDCpp/CommonTools.h"

using namespace std;

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
    return sprites[nb];
}

Sprite & Direction::GetSprite(unsigned int nb)
{
    return sprites[nb];
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

    if ( elemPoint->Attribute( "X" ) != NULL ) { int value; elemPoint->QueryIntAttribute("X", &value); point.SetX(value);}

    if ( elemPoint->Attribute( "Y" ) != NULL ) { int value; elemPoint->QueryIntAttribute("Y", &value); point.SetY(value);}

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
                    std::vector<Polygon2d> mask;
                    //-- Compatibility code with Game Develop 2.1.10904 and inferior
                    const TiXmlElement * rectangleElem = customCollisionMaskElem->FirstChildElement("Rectangle");
                    while ( rectangleElem )
                    {
                        if ( rectangleElem->Attribute("centerX") && rectangleElem->Attribute("centerY") && rectangleElem->Attribute("halfSizeX") && rectangleElem->Attribute("halfSizeY") )
                        {
                            float centerX = ToFloat(rectangleElem->Attribute("centerX"));
                            float centerY = ToFloat(rectangleElem->Attribute("centerY"));
                            float halfSizeX = ToFloat(rectangleElem->Attribute("halfSizeX"));
                            float halfSizeY = ToFloat(rectangleElem->Attribute("halfSizeY"));

                            Polygon2d polygon;
                            polygon.vertices.push_back(sf::Vector2f(centerX-halfSizeX, centerY-halfSizeY));
                            polygon.vertices.push_back(sf::Vector2f(centerX+halfSizeX, centerY-halfSizeY));
                            polygon.vertices.push_back(sf::Vector2f(centerX+halfSizeX, centerY+halfSizeY));
                            polygon.vertices.push_back(sf::Vector2f(centerX-halfSizeX, centerY+halfSizeY));
                            mask.push_back(polygon);
                        }

                        rectangleElem = rectangleElem->NextSiblingElement();
                    }
                    //-- End of compatibility code

                    const TiXmlElement * polygonElem = customCollisionMaskElem->FirstChildElement("Polygon");
                    while ( polygonElem )
                    {
                        Polygon2d polygon;

                        const TiXmlElement * pointElem = polygonElem->FirstChildElement("Point");
                        while ( pointElem )
                        {
                            if ( pointElem->Attribute("x") && pointElem->Attribute("y") )
                                polygon.vertices.push_back(sf::Vector2f(ToFloat(pointElem->Attribute("x")),ToFloat(pointElem->Attribute("y"))));

                            pointElem = pointElem->NextSiblingElement();
                        }

                        mask.push_back(polygon);
                        polygonElem = polygonElem->NextSiblingElement();
                    }

                    sprite.SetCustomCollisionMask(mask);
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
            std::vector<Polygon2d> polygons = sprites.at(i).GetCollisionMask();
            for (unsigned int i = 0;i<polygons.size();++i)
            {
                TiXmlElement * polygon = new TiXmlElement( "Polygon" );
                customCollisionMask->LinkEndChild(polygon);

                for (unsigned int j = 0;j<polygons[i].vertices.size();++j)
                {
                    TiXmlElement * point = new TiXmlElement( "Point" );
                    polygon->LinkEndChild(point);

                    point->SetAttribute("x", ToString(polygons[i].vertices[j].x).c_str());
                    point->SetAttribute("y", ToString(polygons[i].vertices[j].y).c_str());
                }
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

