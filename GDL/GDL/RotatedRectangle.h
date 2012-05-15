/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ROTATEDRECTANGLE_H
#define ROTATEDRECTANGLE_H
#include <SFML/System.hpp>

/**
 * \brief Defines a rotated rectangle. Mainly used to define hit boxes of Object.
 *
 * \see Object
 * \ingroup GameEngine
 */
class RotatedRectangle
{
public:
    sf::Vector2f center;
    sf::Vector2f halfSize;
    float angle;
};


#endif // ROTATEDRECTANGLE_H
