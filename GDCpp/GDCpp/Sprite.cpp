#include "GDCpp/Sprite.h"
#include "GDCpp/ImageManager.h"
#include <iostream>
#if defined(EMSCRIPTEN)
#include <SFML/Graphics.hpp>
#endif

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


bool Sprite::SetCentreAutomatic(bool enabled)
{
    automaticCentre = enabled;

#if !defined(EMSCRIPTEN)
    if ( automaticCentre )
        centre.SetXY(sfmlSprite.getLocalBounds().width/2, sfmlSprite.getLocalBounds().height/2);
#else
    std::cout << "WARNING: Unable to set the center point as we have no info about the sprite size!" << std::endl;
#endif

    return true;
}

#if !defined(EMSCRIPTEN)
std::vector<Polygon2d> Sprite::GetCollisionMask() const
{
    if ( automaticCollisionMask )
    {
        std::vector<Polygon2d> mask;

        Polygon2d rectangle;
        rectangle.vertices.push_back(sf::Vector2f(0, 0));
        rectangle.vertices.push_back(sf::Vector2f(sfmlSprite.getLocalBounds().width, 0));
        rectangle.vertices.push_back(sf::Vector2f(sfmlSprite.getLocalBounds().width, sfmlSprite.getLocalBounds().height));
        rectangle.vertices.push_back(sf::Vector2f(0, sfmlSprite.getLocalBounds().height));

        mask.push_back(rectangle);
        return mask;
    }

    return customCollisionMask;
}

void Sprite::LoadImage(boost::shared_ptr<SFMLTextureWrapper> image_)
{
    sfmlImage = image_;
    sfmlSprite.setTexture(sfmlImage->texture, true);
    hasItsOwnImage = false;

    if ( automaticCentre )
        centre.SetXY(sfmlSprite.getLocalBounds().width/2, sfmlSprite.getLocalBounds().height/2);
}

void Sprite::MakeSpriteOwnsItsImage()
{
    if ( !hasItsOwnImage || sfmlImage == boost::shared_ptr<SFMLTextureWrapper>() )
    {
        sfmlImage = boost::shared_ptr<SFMLTextureWrapper>(new SFMLTextureWrapper(sfmlImage->texture)); //Copy the texture.
        sfmlSprite.setTexture(sfmlImage->texture);
        hasItsOwnImage = true;
    }
}
#endif