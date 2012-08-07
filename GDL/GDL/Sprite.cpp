#include "GDL/Sprite.h"
#include <SFML/Graphics.hpp>
#include "GDL/ImageManager.h"
#include <iostream>

using namespace std;

Point Sprite::badPoint("");

Sprite::Sprite() :
hasItsOwnImage(false),
automaticCollisionMask(true),
origine("origine"),
centre("centre"),
automaticCentre(true)
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

void Sprite::DelPoint( const std::string & name )
{
    for (unsigned int i = 0;i<points.size();++i)
    {
    	if ( name == points.at(i).GetName() )
            points.erase(points.begin() + i);
    }
}

bool Sprite::HasPoint( const std::string & name ) const
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

const Point & Sprite::GetPoint( const std::string & name) const
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

Point & Sprite::GetPoint(const std::string & name)
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

void Sprite::LoadImage(boost::shared_ptr<SFMLTextureWrapper> image_)
{
    sfmlImage = image_;
    sfmlSprite.SetTexture(sfmlImage->texture, true);
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
    if ( !hasItsOwnImage || sfmlImage == boost::shared_ptr<SFMLTextureWrapper>() )
    {
        sfmlImage = boost::shared_ptr<SFMLTextureWrapper>(new SFMLTextureWrapper(sfmlImage->texture)); //Copy the texture.
        sfmlSprite.SetTexture(sfmlImage->texture);
        hasItsOwnImage = true;
    }
}

std::vector<RotatedRectangle> Sprite::GetCollisionMask() const
{
    if ( automaticCollisionMask )
    {
        std::vector<RotatedRectangle> boxes;

        RotatedRectangle rectangle;
        rectangle.center.x = sfmlSprite.GetSubRect().Width/2;
        rectangle.center.y = sfmlSprite.GetSubRect().Height/2;
        rectangle.halfSize.x = sfmlSprite.GetSubRect().Width/2;
        rectangle.halfSize.y = sfmlSprite.GetSubRect().Height/2;
        rectangle.angle = 0;

        boxes.push_back(rectangle);
        return boxes;
    }

    return customCollisionMask;
}
