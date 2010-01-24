#ifndef COLLISIONS_H_INCLUDED
#define COLLISIONS_H_INCLUDED

#include <iostream>
#include <vector>
#include <string>
#include "GDL/SpriteObject.h"
#include <cmath>

bool GD_API CheckCollision( const boost::shared_ptr<const SpriteObject> objet1, const boost::shared_ptr<const SpriteObject> objet2);
bool GD_API CheckCollisionNP(const boost::shared_ptr<const SpriteObject> objet1, const boost::shared_ptr<const SpriteObject> objet2 );
sf::Image GD_API GetImageFromSprite( const sf::Sprite & source );
sf::Image GD_API RotateSprite( const sf::Image & origine, float angle_radian, int rapport );

#endif // COLLISIONS_H_INCLUDED
