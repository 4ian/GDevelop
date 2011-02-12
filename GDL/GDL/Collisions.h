/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef COLLISIONS_H_INCLUDED
#define COLLISIONS_H_INCLUDED

#include <iostream>
#include <vector>
#include <string>
#include "GDL/SpriteObject.h"
#include <cmath>

bool GD_API CheckCollision( const boost::shared_ptr<const SpriteObject> objet1, const boost::shared_ptr<const SpriteObject> objet2);

#endif // COLLISIONS_H_INCLUDED
