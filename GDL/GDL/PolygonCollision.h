/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef POLYGONCOLLISION_H
#define POLYGONCOLLISION_H
#include <SFML/System.hpp>

class Polygon;

/**
 * \brief Contains the result of PolygonCollisionTest.
 * \see PolygonCollisionTest
 * \ingroup GameEngine
 */
struct CollisionResult
{
    bool collision;
    sf::Vector2f move_axis;
};

/**
 * Do a collision test between the two polygons.
 * \warning Polygons must convexes.
 *
 * Uses Separating Axis Theorem ( http://en.wikipedia.org/wiki/Hyperplane_separation_theorem )
 * Based on http://www.codeproject.com/Articles/15573/2D-Polygon-Collision-Detection
 * and http://stackoverflow.com/questions/5742329/problem-with-collision-response-sat
 *
 * \return true if polygons are overlapping
 *
 * \ingroup GameEngine
 */
CollisionResult PolygonCollisionTest(const Polygon & p1, const Polygon & p2);

#endif // POLYGONCOLLISION_H
