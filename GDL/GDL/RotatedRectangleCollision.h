/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef ROTATEDRECTANGLECOLLISION_H
#define ROTATEDRECTANGLECOLLISION_H

class RotatedRectangle;

/**
 * \brief Perform a collision test between the two RotatedRectangle.
 * \ingroup GameEngine
 */
int GD_API RotatedRectanglesCollisionTest(RotatedRectangle * rr1, RotatedRectangle * rr2);

#endif // ROTATEDRECTANGLECOLLISION_H
