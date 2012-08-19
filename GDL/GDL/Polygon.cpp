/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include <cmath>
#include <SFML/System.hpp>
#include "Polygon.h"

void Polygon2d::Rotate(float angle)
{
    float t,
          cosa = cos(angle),
          sina = sin(angle);

    for (unsigned int i = 0;i<vertices.size();++i)
    {
        t = vertices[i].x;
        vertices[i].x = t*cosa + vertices[i].y*sina;
        vertices[i].y = -t*sina + vertices[i].y*cosa;
    }
}

void Polygon2d::Move(float x, float y)
{
    for (unsigned int i = 0; i < vertices.size(); i++)
    {
        vertices[i].x += x;
        vertices[i].y += y;
    }
    ComputeEdges();
}

void Polygon2d::ComputeEdges()
{
    sf::Vector2f v1, v2;
    edges.clear();

    for (unsigned int i = 0; i < vertices.size(); i++)
    {
        v1 = vertices[i];
        if ((i + 1) >= vertices.size()) v2 = vertices[0];
        else v2 = vertices[i + 1];

        edges.push_back(v2 - v1);
    }
}

sf::Vector2f Polygon2d::ComputeCenter() const
{
    sf::Vector2f center;

    for (unsigned int i = 0; i < vertices.size(); i++)
    {
        center.x += vertices[i].x;
        center.y += vertices[i].y;
    }
    center.x /= vertices.size();
    center.y /= vertices.size();

    return center;
}

Polygon2d Polygon2d::CreateRectangle(float width, float height)
{
    Polygon2d rect;
    rect.vertices.push_back(sf::Vector2f(-width/2.0f, -height/2.0f));
    rect.vertices.push_back(sf::Vector2f(+width/2.0f, -height/2.0f));
    rect.vertices.push_back(sf::Vector2f(+width/2.0f, +height/2.0f));
    rect.vertices.push_back(sf::Vector2f(-width/2.0f, +height/2.0f));

    return rect;
}
