/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */
#ifndef POLYGON_H
#define POLYGON_H
#include <vector>
#include <SFML/System.hpp>

/**
 * \brief Represents a polygon. Usually used for collisions masks.
 *
 * This class stores the vertices of the polygon.
 * It can also compute and store the edges ( needed by some collisions algorithms ) if ComputeEdges is called.
 *
 * \ingroup GameEngine
 */
class GD_API Polygon2d
{
public:
    Polygon2d() {};
    virtual ~Polygon2d() {};

    std::vector<sf::Vector2f> vertices; ///< The vertices composing the polygon
    mutable std::vector<sf::Vector2f> edges; ///< Can be computed from vertices using ComputeEdges()

    /**
     * Moves each vertices from the given amount.
     *
     * \warning edges vector is not updated, you have to call ComputeEdges if needed.
     */
    void Move(float x, float y);

    /**
     * Rotate the polygon.
     * \param angle Angle in radians
     *
     * \warning Rotation is made clockwise
     * \warning edges vector is not updated, you have to call ComputeEdges if needed.
     */
    void Rotate(float angle);

    /**
     * Automatically fill edges vector using vertices.
     */
    void ComputeEdges() const;

    /**
     * Check if the polygon is convex.
     * \return true if the polygon is convex
     */
    bool IsConvex() const;

    /**
     * Return the position of the center of the polygon
     */
    sf::Vector2f ComputeCenter() const;

    /** \name Tools
     * Tool functions
     */
    ///@{
    /**
     * Create a rectangle
     */
    static Polygon2d CreateRectangle(float width, float height);
    ///@}
};

#endif // POLYGON_H
