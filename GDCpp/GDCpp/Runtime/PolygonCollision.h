/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
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
struct CollisionResult {
  bool collision;
  sf::Vector2f move_axis;
};

struct RaycastResult {
  bool collision;
  sf::Vector2f closePoint;
  float closeSqDist;
  sf::Vector2f farPoint;
  float farSqDist;
};

/**
 * Do a collision test between the two polygons.
 * \warning Polygons must convexes.
 *
 * Uses Separating Axis Theorem (
 * http://en.wikipedia.org/wiki/Hyperplane_separation_theorem ) Based on
 * http://www.codeproject.com/Articles/15573/2D-Polygon-Collision-Detection and
 * http://stackoverflow.com/questions/5742329/problem-with-collision-response-sat
 *
 * \param p1 The first polygon
 * \param p2 The second polygon
 * \param ignoreTouchingEdges If true, then edges that are touching each other,
 * without the polygons actually overlapping, won't be considered in collision.
 *
 * \return true if polygons are overlapping
 *
 * \ingroup GameEngine
 */
CollisionResult GD_API PolygonCollisionTest(Polygon2d& p1,
                                            Polygon2d& p2,
                                            bool ignoreTouchingEdges = false);

/**
 * Do a raycast test.
 * \warning Polygon must be convex.
 * For some theory check "Find the Intersection Point of Two Line Segments"
 * (https://www.codeproject.com/Tips/862988/Find-the-Intersection-Point-of-Two-Line-Segments)
 *
 * \return A raycast result with the contact points and distances
 *
 * \ingroup GameEngine
 */
RaycastResult GD_API PolygonRaycastTest(
    Polygon2d& poly, float startX, float startY, float endX, float endY);

/**
 * Check if a point is inside a polygon.
 *
 * Uses PNPOLY by W. Randolph Franklin
 * (https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html)
 *
 * \return true if the point is inside the polygon
 *
 * \ingroup GameEngine
 */
bool GD_API IsPointInsidePolygon(Polygon2d& poly, float x, float y);

#endif  // POLYGONCOLLISION_H
