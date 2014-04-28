/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef COLLISIONS_H_INCLUDED
#define COLLISIONS_H_INCLUDED
#include "GDCpp/RuntimeSpriteObject.h"

/**
 * \brief Pixel perfect collision test between two sprite objects
 * Alpha transparency, rotation and zooms are taken into account.
 *
 * \return true if the sprite are overlapping
 *
 * \ingroup GameEngine
 * \ingroup SpriteObjectExtension
 */
bool GD_API CheckCollision( const RuntimeSpriteObject* const objet1, const RuntimeSpriteObject* const objet2);

#endif // COLLISIONS_H_INCLUDED