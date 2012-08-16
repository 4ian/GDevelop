/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef POLYGON_H
#define POLYGON_H
#include <vector>
namespace sf
{
    class Vector2f;
}

/**
 * \brief Represents a polygon.
 *
 * Usually used for collisions masks.
 * \ingroup GameEngine
 */
class Polygon
{
public:
    Polygon() {};
    virtual ~Polygon() {};

    /**
     * Moves each vertices from the given amount.
     */
    Move(float x, float y);

    /**
     * Automatically fill edges using vertices.
     */
    ComputeEdges();

    /**
     * Return the position of the center of the polygon
     */
    sf::Vector2f ComputeCenter();

    std::vector<Vector2f> vertices;
    std::vector<Vector2f> edges; ///< Can be computed from vertices using CalcEdges()

};

#endif // POLYGON_H
