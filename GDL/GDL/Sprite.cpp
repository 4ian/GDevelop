#include "GDL/Sprite.h"
#include <SFML/Graphics.hpp>
#include <iostream>

using namespace std;

Point Sprite::badPoint("");

Sprite::Sprite() :
uniqueImage(),
hasItsOwnImage(false),
origine("origine"),
automaticCentre(true),
centre("centre")
{
    //ctor
}

Sprite::~Sprite()
{
    //dtor
}

void Sprite::AddPoint( const Point & point )
{
    if ( !HasPoint(point.GetName()))
        points.push_back(point);
}

void Sprite::DelPoint( const string & name )
{
    for (unsigned int i = 0;i<points.size();++i)
    {
    	if ( name == points.at(i).GetName() )
            points.erase(points.begin() + i);
    }
}

bool Sprite::HasPoint( const string & name ) const
{
    if ( name == "Origin") return true;
    if ( name == "Centre") return true;

    for (unsigned int i = 0;i<points.size();++i)
    {
    	if ( name == points.at(i).GetName() )
            return true;
    }

    return false;
}

const Point & Sprite::GetPoint( const string & name) const
{
    if ( name == "Origin") return origine;
    if ( name == "Centre") return centre;

    for (unsigned int i = 0;i<points.size();++i)
    {
    	if ( name == points.at(i).GetName() )
            return points.at(i);
    }

    return badPoint;
}

Point & Sprite::ModPoint(const string & name)
{
    if ( name == "Origin") return origine;
    if ( name == "Centre") return centre;

    for (unsigned int i = 0;i<points.size();++i)
    {
    	if ( name == points.at(i).GetName() )
            return points.at(i);
    }

    return badPoint;
}

void Sprite::SetSprite(const sf::Sprite & sprite_)
{
    sfmlSprite = sprite_;
    hasItsOwnImage = false;

    if ( automaticCentre )
        centre.SetXY(sfmlSprite.GetSubRect().Width/2, sfmlSprite.GetSubRect().Height/2);
}

bool Sprite::SetCentreAutomatic(bool enabled)
{
    automaticCentre = enabled;

    if ( automaticCentre )
        centre.SetXY(sfmlSprite.GetSubRect().Width/2, sfmlSprite.GetSubRect().Height/2);

    return true;
}

void Sprite::MakeSpriteOwnsItsImage()
{
    if ( !hasItsOwnImage )
    {
        const sf::Image * sfmlImage = sfmlSprite.GetImage();
        if ( sfmlImage == NULL) return;

        uniqueImage = *sfmlImage;
        sfmlSprite.SetImage(uniqueImage);

        hasItsOwnImage = true;
    }
}
