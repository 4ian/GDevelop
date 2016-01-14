/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCore/Extensions/Builtin/SpriteExtension/Polygon2d.h"
#include "GDCore/Extensions/Builtin/SpriteExtension/Sprite.h"
#include "GDCore/Project/ImageManager.h"
#include <SFML/Graphics/Sprite.hpp>
#include <iostream>

using namespace std;

namespace gd
{

Point Sprite::badPoint("");

Sprite::Sprite() :
#if !defined(EMSCRIPTEN)
    hasItsOwnImage(false),
#endif
    automaticCollisionMask(true),
    origine("origine"),
    centre("centre"),
    automaticCentre(true)
{
}

Sprite::~Sprite()
{
};

void Sprite::AddPoint( const Point & point )
{
    if ( !HasPoint(point.GetName()))
        points.push_back(point);
}

void Sprite::DelPoint( const gd::String & name )
{
    for (std::size_t i = 0;i<points.size();++i)
    {
    	if ( name == points[i].GetName() )
            points.erase(points.begin() + i);
    }
}

bool Sprite::HasPoint( const gd::String & name ) const
{
    if (name == "Origin") return true;
    if (name == "Centre" || name == "Center") return true;

    for (std::size_t i = 0;i<points.size();++i)
    {
    	if ( name == points[i].GetName() )
            return true;
    }

    return false;
}

const Point & Sprite::GetPoint( const gd::String & name) const
{
    if (name == "Origin") return origine;
    if (name == "Centre" || name == "Center") return centre;

    for (std::size_t i = 0;i<points.size();++i)
    {
    	if ( name == points[i].GetName() )
            return points[i];
    }

    return badPoint;
}

Point & Sprite::GetPoint(const gd::String & name)
{
    if (name == "Origin") return origine;
    if (name == "Centre" || name == "Center") return centre;

    for (std::size_t i = 0;i<points.size();++i)
    {
    	if ( name == points[i].GetName() )
            return points[i];
    }

    return badPoint;
}


bool Sprite::SetDefaultCenterPoint(bool enabled)
{
    automaticCentre = enabled;

    #if !defined(EMSCRIPTEN)
    if ( automaticCentre )
        centre.SetXY(sfmlSprite.getLocalBounds().width/2, sfmlSprite.getLocalBounds().height/2);
    #endif

    return true;
}

std::vector<Polygon2d> Sprite::GetCollisionMask() const
{
#if !defined(EMSCRIPTEN)
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
#endif

    return customCollisionMask;
}

void Sprite::SetCustomCollisionMask(const std::vector<Polygon2d> & collisionMask)
{
    customCollisionMask = collisionMask;
}

#if !defined(EMSCRIPTEN)
void Sprite::LoadImage(std::shared_ptr<SFMLTextureWrapper> image_)
{
    sfmlImage = image_;
    sfmlSprite.setTexture(sfmlImage->texture, true);
    hasItsOwnImage = false;

    if ( automaticCentre )
        centre.SetXY(sfmlSprite.getLocalBounds().width/2, sfmlSprite.getLocalBounds().height/2);
}

void Sprite::MakeSpriteOwnsItsImage()
{
    if ( !hasItsOwnImage || sfmlImage == std::shared_ptr<SFMLTextureWrapper>() )
    {
        sfmlImage = std::shared_ptr<SFMLTextureWrapper>(new SFMLTextureWrapper(sfmlImage->texture)); //Copy the texture.
        sfmlSprite.setTexture(sfmlImage->texture);
        hasItsOwnImage = true;
    }
}
#endif

}
