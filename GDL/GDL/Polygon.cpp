/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#include "Polygon.h"

void Polygon::Move(float x, float y)
{
    for (unsigned int i = 0; i < vertices.size(); i++)
    {
        vertices[i].x += x;
        vertices[i].y += y;
    }
    ComputeEdges();
}

void Polygon::ComputeEdges()
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

sf::Vector2f Polygon::ComputeCenter()
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
