/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef COLLISIONS_H_INCLUDED
#define COLLISIONS_H_INCLUDED
#include "GDCpp/Runtime/RuntimeSpriteObject.h"

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
