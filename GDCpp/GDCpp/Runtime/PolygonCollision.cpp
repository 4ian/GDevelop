/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include "GDCpp/Runtime/PolygonCollision.h"
#include "GDCpp/Runtime/Polygon2d.h"
#include <cmath>
#include <cfloat>

namespace
{

void normalise(sf::Vector2f& v)
{
    float length = sqrt(v.x*v.x + v.y*v.y);

    if (length != 0.0f)
    {
        v.x /= length;
        v.y /= length;
    }
    else return;
}

float dotProduct(const sf::Vector2f a, const sf::Vector2f b)
{
    float dp = a.x*b.x + a.y*b.y;

    return dp;
}

void project(const sf::Vector2f axis, const Polygon2d & p, float& min, float& max)
{
    float dp = dotProduct(axis, p.vertices[0]);

    min = dp;
    max = dp;

    for (std::size_t i = 1; i < p.vertices.size(); i++)
    {
        dp = dotProduct(axis, p.vertices[i]);

        if (dp < min)
            min = dp;
        else if (dp > max)
            max = dp;
    }
}

float distance(float minA, float maxA, float minB, float maxB)
{
    if (minA < minB) return minB - maxA;
    else return minA - maxB;
}

}

CollisionResult GD_API PolygonCollisionTest(Polygon2d & p1, Polygon2d & p2)
{
    if(p1.vertices.size() < 3 || p2.vertices.size() < 3)
    {
        CollisionResult result;
        result.collision = false;
        result.move_axis.x = 0.0f;
        result.move_axis.y = 0.0f;
        return result;
    }

    p1.ComputeEdges();
    p2.ComputeEdges();

    sf::Vector2f edge;
    sf::Vector2f move_axis(0,0);
    sf::Vector2f mtd(0,0);

    float min_dist = FLT_MAX;

    CollisionResult result;

    //Iterate over all the edges composing the polygons
    for (std::size_t i = 0; i < p1.vertices.size() + p2.vertices.size(); i++)
    {
        if (i < p1.vertices.size()) // or <=
        {
            edge = p1.edges[i];
        }
        else
        {
            edge = p2.edges[i - p1.vertices.size()];
        }

        sf::Vector2f axis(-edge.y, edge.x); //Get the axis to which polygons will be projected
        normalise(axis);

        float minA = 0;
        float minB = 0;
        float maxA = 0;
        float maxB = 0;

        project(axis, p1, minA, maxA);
        project(axis, p2, minB, maxB);

        if (distance(minA, maxA, minB, maxB) > 0.0f) //If the projections on the axis do not overlap, then their is no collision
        {
            result.collision = false;
            result.move_axis.x = 0.0f;
            result.move_axis.y = 0.0f;

            return result;
        }

        float dist = distance(minA, maxA, minB, maxB);
        dist = std::abs(dist);

        if (dist < min_dist)
        {
            min_dist = dist;
            move_axis = axis;
        }
    }

    result.collision = true;

    sf::Vector2f d = p1.ComputeCenter() - p2.ComputeCenter();
    if (dotProduct(d, move_axis) < 0.0f) move_axis = -move_axis;
    result.move_axis = move_axis * min_dist;

    return result;
}

bool GD_API IsPointInsidePolygon(Polygon2d & poly, float x, float y)
{
    bool inside = false;
    sf::Vector2f vi, vj;

    for (std::size_t i = 0, j = poly.vertices.size()-1; i < poly.vertices.size(); j = i++)
    {
        vi = poly.vertices[i];
        vj = poly.vertices[j];
        if ( ((vi.y>y) != (vj.y>y)) && (x < (vj.x-vi.x) * (y-vi.y) / (vj.y-vi.y) + vi.x) )
            inside = !inside;
    }
    
    return inside;
}