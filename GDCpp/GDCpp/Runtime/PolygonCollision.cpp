/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#include "GDCpp/Runtime/PolygonCollision.h"
#include <algorithm>
#include <cfloat>
#include <cmath>
#include "GDCpp/Runtime/Polygon2d.h"

namespace {

void normalise(sf::Vector2f& v) {
  float length = sqrt(v.x * v.x + v.y * v.y);

  if (length != 0.0f) {
    v.x /= length;
    v.y /= length;
  } else
    return;
}

float dotProduct(const sf::Vector2f a, const sf::Vector2f b) {
  float dp = a.x * b.x + a.y * b.y;

  return dp;
}

float crossProduct(const sf::Vector2f a, const sf::Vector2f b) {
  float cp = a.x * b.y - a.y * b.x;

  return cp;
}

void project(const sf::Vector2f axis,
             const Polygon2d& p,
             float& min,
             float& max) {
  float dp = dotProduct(axis, p.vertices[0]);

  min = dp;
  max = dp;

  for (std::size_t i = 1; i < p.vertices.size(); i++) {
    dp = dotProduct(axis, p.vertices[i]);

    if (dp < min)
      min = dp;
    else if (dp > max)
      max = dp;
  }
}

float distance(float minA, float maxA, float minB, float maxB) {
  if (minA < minB)
    return minB - maxA;
  else
    return minA - maxB;
}

}  // namespace

CollisionResult GD_API PolygonCollisionTest(Polygon2d& p1,
                                            Polygon2d& p2,
                                            bool ignoreTouchingEdges) {
  if (p1.vertices.size() < 3 || p2.vertices.size() < 3) {
    CollisionResult result;
    result.collision = false;
    result.move_axis.x = 0.0f;
    result.move_axis.y = 0.0f;
    return result;
  }

  p1.ComputeEdges();
  p2.ComputeEdges();

  sf::Vector2f edge;
  sf::Vector2f move_axis(0, 0);
  sf::Vector2f mtd(0, 0);

  float min_dist = FLT_MAX;

  CollisionResult result;

  // Iterate over all the edges composing the polygons
  for (std::size_t i = 0; i < p1.vertices.size() + p2.vertices.size(); i++) {
    if (i < p1.vertices.size())  // or <=
    {
      edge = p1.edges[i];
    } else {
      edge = p2.edges[i - p1.vertices.size()];
    }

    sf::Vector2f axis(
        -edge.y, edge.x);  // Get the axis to which polygons will be projected
    normalise(axis);

    float minA = 0;
    float minB = 0;
    float maxA = 0;
    float maxB = 0;

    project(axis, p1, minA, maxA);
    project(axis, p2, minB, maxB);

    float dist = distance(minA, maxA, minB, maxB);
    if (dist > 0.0f || (dist == 0.0 && ignoreTouchingEdges)) {
      // If the projections on the axis do not overlap, then
      // there is no collision
      result.collision = false;
      result.move_axis.x = 0.0f;
      result.move_axis.y = 0.0f;

      return result;
    }

    float absDist = std::abs(dist);

    if (absDist < min_dist) {
      min_dist = absDist;
      move_axis = axis;
    }
  }

  result.collision = true;

  sf::Vector2f d = p1.ComputeCenter() - p2.ComputeCenter();
  if (dotProduct(d, move_axis) < 0.0f) move_axis = -move_axis;
  result.move_axis = move_axis * min_dist;

  return result;
}

RaycastResult GD_API PolygonRaycastTest(
    Polygon2d& poly, float startX, float startY, float endX, float endY) {
  RaycastResult result;
  result.collision = false;

  if (poly.vertices.size() < 2) {
    return result;
  }

  poly.ComputeEdges();
  sf::Vector2f p, q, r, s;
  float minSqDist = FLT_MAX;

  // Ray segment: p + t*r, with p = start and r = end - start
  p.x = startX;
  p.y = startY;
  r.x = endX - startX;
  r.y = endY - startY;

  for (int i = 0; i < poly.edges.size(); i++) {
    // Edge segment: q + u*s
    q = poly.vertices[i];
    s = poly.edges[i];
    sf::Vector2f deltaQP = q - p;
    float crossRS = crossProduct(r, s);
    float t = crossProduct(deltaQP, s) / crossRS;
    float u = crossProduct(deltaQP, r) / crossRS;

    // Collinear
    if (abs(crossRS) <= 0.0001 && abs(crossProduct(deltaQP, r)) <= 0.0001) {
      // Project the ray and the edge to work on floats, keeping linearity
      // through t
      sf::Vector2f axis(r.x, r.y);
      normalise(axis);
      float rayA = 0.0f;
      float rayB = dotProduct(axis, r);
      float edgeA = dotProduct(axis, deltaQP);
      float edgeB = dotProduct(axis, deltaQP + s);
      // Get overlapping range
      float minOverlap = std::max(std::min(rayA, rayB), std::min(edgeA, edgeB));
      float maxOverlap = std::min(std::max(rayA, rayB), std::max(edgeA, edgeB));
      if (minOverlap > maxOverlap) {
        return result;
      }
      result.collision = true;
      // Zero distance ray
      if (rayB == 0.0f) {
        result.closePoint = p;
        result.closeSqDist = 0.0f;
        result.farPoint = p;
        result.farSqDist = 0.0f;
      }
      float t1 = minOverlap / abs(rayB);
      float t2 = maxOverlap / abs(rayB);
      result.closePoint = p + t1 * r;
      result.closeSqDist = t1 * t1 * (r.x * r.x + r.y * r.y);
      result.farPoint = p + t2 * r;
      result.farSqDist = t2 * t2 * (r.x * r.x + r.y * r.y);

      return result;
    } else if (crossRS != 0 && 0 <= t && t <= 1 && 0 <= u && u <= 1) {
      sf::Vector2f point = p + t * r;

      float sqDist = (point.x - startX) * (point.x - startX) +
                     (point.y - startY) * (point.y - startY);
      if (sqDist < minSqDist) {
        if (!result.collision) {
          result.farPoint = point;
          result.farSqDist = sqDist;
        }
        minSqDist = sqDist;
        result.closePoint = point;
        result.closeSqDist = sqDist;
        result.collision = true;
      } else {
        result.farPoint = point;
        result.farSqDist = sqDist;
      }
    }
  }

  return result;
}

bool GD_API IsPointInsidePolygon(Polygon2d& poly, float x, float y) {
  bool inside = false;
  sf::Vector2f vi, vj;

  for (std::size_t i = 0, j = poly.vertices.size() - 1;
       i < poly.vertices.size();
       j = i++) {
    vi = poly.vertices[i];
    vj = poly.vertices[j];
    if (((vi.y > y) != (vj.y > y)) &&
        (x < (vj.x - vi.x) * (y - vi.y) / (vj.y - vi.y) + vi.x))
      inside = !inside;
  }

  return inside;
}