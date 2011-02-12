/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ROTATEDRECTANGLE_H
#define ROTATEDRECTANGLE_H

/**
 * \brief Defines a rotated rectangle. Mainly used to define hit boxes.
 */
class RotatedRectangle
{
public:
    sf::Vector2f center;
    sf::Vector2f halfSize;
    float angle;
};


#endif // ROTATEDRECTANGLE_H
