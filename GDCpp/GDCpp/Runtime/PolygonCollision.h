/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef POLYGONCOLLISION_H
#define POLYGONCOLLISION_H
#include <SFML/System.hpp>
class Polygon2d;

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
CollisionResult GD_API PolygonCollisionTest(Polygon2d & p1, Polygon2d & p2);

#endif // POLYGONCOLLISION_H

