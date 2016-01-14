/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef GDCORE_POLYGON_H
#define GDCORE_POLYGON_H
#include <vector>
#include <SFML/System/Vector2.hpp>

/**
 * \brief Represents a polygon. Usually used for collisions masks.
 *
 * This class stores the vertices of the polygon.
 * It can also compute and store the edges ( needed by some collisions algorithms ) if ComputeEdges is called.
 *
 * \ingroup GameEngine
 */
class GD_CORE_API Polygon2d
{
public:
    Polygon2d() {};
    virtual ~Polygon2d() {};

    std::vector<sf::Vector2f> vertices; ///< The vertices composing the polygon
    mutable std::vector<sf::Vector2f> edges; ///< Edges. Can be computed from vertices using ComputeEdges()

    /**
     * Moves each vertices from the given amount.
     *
     * \note Edges are updated, there is no need to call ComputeEdges after calling Move.
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

#endif // GDCORE_POLYGON_H
