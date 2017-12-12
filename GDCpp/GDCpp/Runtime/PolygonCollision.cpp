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
    if(p1.vertices.size() < 2 || p2.vertices.size() < 2)
    {
        CollisionResult result;
        result.collision = false;
        result.move_axis.x = 0.0f;
        result.move_axis.y = 0.0f;
        return result;
    }

    // If one of the "polygons" is a circle, use the right function
    if ( p1.vertices.size() == 2 || p2.vertices.size() == 2 )
    {
        if ( p1.vertices.size() != 2 ) {
            return PolygonCircleCollisionTest(p1, p2);
        } else if ( p2.vertices.size() != 2 ) {
            CollisionResult result = PolygonCircleCollisionTest(p2, p1);
            result.move_axis = -result.move_axis; // Invert the moving direction, p1 is moving
            return result;
        } else {
            return CircleCircleCollisionTest(p1, p2);
        }
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

        if (distance(minA, maxA, minB, maxB) > 0.0f) //If the projections on the axis do not overlap, then there is no collision
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

CollisionResult GD_API PolygonCircleCollisionTest(Polygon2d & poly, Polygon2d & circle)
{
    poly.ComputeEdges();

    sf::Vector2f edge;
    sf::Vector2f move_axis(0,0);
    CollisionResult result;
    float minDist = FLT_MAX;

    float circleX = circle.vertices[0].x;
    float circleY = circle.vertices[0].y;
    float radius = sqrt((circle.vertices[1].x - circleX)*(circle.vertices[1].x - circleX) +
                        (circle.vertices[1].y - circleY)*(circle.vertices[1].y - circleY)); 
    
    for (int i = 0; i < poly.vertices.size() + 1; i++) {
        if ( i < poly.vertices.size() ) {
            edge = poly.edges[i];
        } else { // The last "edge" to test is the circle center -> closest vertex
            float closestSqDist = FLT_MAX;
            int closestVertex = -1;
            for (int j = 0; j < poly.vertices.size(); j++) {
                float sqDist = (circleX - poly.vertices[j].x)*(circleX - poly.vertices[j].x) +
                               (circleY - poly.vertices[j].y)*(circleY - poly.vertices[j].y);
                if ( sqDist < closestSqDist ) {
                    closestSqDist = sqDist;
                    closestVertex = j;
                }
            }

            if ( closestVertex != -1 ) {
                edge.x = circleY - poly.vertices[closestVertex].y;
                edge.y = poly.vertices[closestVertex].x - circleX;
            }
        }

        sf::Vector2f axis(-edge.y, edge.x);
        normalise(axis);

        float minA = 0;
        float maxA = 0;
        project(axis, poly, minA, maxA);

        float dp = dotProduct(axis, circle.vertices[0]);
        float minB = dp - radius;
        float maxB = dp + radius;

        if ( distance(minA, maxA, minB, maxB) > 0.0f ) {
            result.collision = false;
            result.move_axis.x = 0.0f;
            result.move_axis.y = 0.0f;

            return result;
        }

        float dist = distance(minA, maxA, minB, maxB);
        dist = std::abs(dist);

        if ( dist < minDist )
        {
            minDist = dist;
            move_axis = axis;
        }
    }

    result.collision = true;

    sf::Vector2f d = poly.ComputeCenter() - circle.vertices[0];
    if (dotProduct(d, move_axis) < 0.0f) move_axis = -move_axis;
    result.move_axis = move_axis * minDist;

    return result;
}

CollisionResult GD_API CircleCircleCollisionTest(Polygon2d & c1, Polygon2d & c2)
{
    CollisionResult result;

    float x1 = c1.vertices[0].x;
    float y1 = c1.vertices[0].y;
    float x2 = c2.vertices[0].x;
    float y2 = c2.vertices[0].y;
    float radius1 = sqrt((c1.vertices[1].x-x1)*(c1.vertices[1].x-x1) + 
                         (c1.vertices[1].y-y1)*(c1.vertices[1].y-y1));
    float radius2 = sqrt((c2.vertices[1].x-x2)*(c2.vertices[1].x-x2) + 
                         (c2.vertices[1].y-y2)*(c2.vertices[1].y-y2));

    float sqDist = (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1);

    if ( sqDist > (radius1+radius2)*(radius1+radius2) ){
        result.collision = false;
        result.move_axis.x = 0.0f;
        result.move_axis.y = 0.0f;

        return result;
    }

    float moveDist = radius1 + radius2 - sqrt(sqDist);
    sf::Vector2f moveDir(x1-x2, y1-y2);
    normalise(moveDir);
    result.collision = true;
    result.move_axis.x = moveDir.x * moveDist;
    result.move_axis.y = moveDir.y * moveDist;

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
