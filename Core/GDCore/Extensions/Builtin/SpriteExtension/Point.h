/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_POINT_H
#define GDCORE_POINT_H
#include "GDCore/String.h"

/**
 * \brief Named point used by Sprite.
 *
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API Point
{
public:
    Point(const gd::String & name_);
    virtual ~Point() {};

    /**
     * Change point name
     */
    void SetName(const gd::String & name_) { name = name_; }

    /**
     * Get point name
     */
    const gd::String & GetName() const { return name; }

    /**
     * Change point position.
     */
    void SetXY(float x_, float y_) { x = x_;y = y_; }

    /**
     * Change point X position.
     */
    void SetX(float x_) { x = x_; }

    /**
     * Change point Y position.
     */
    void SetY(float y_) { y = y_; }

    /**
     * Get point X position.
     */
    float GetX() const { return x; }

    /**
     * Get point Y position.
     */
    float GetY() const { return y; }

private:
    gd::String name;
    float x;
    float y;
};

#endif // GDCORE_POINT_H

