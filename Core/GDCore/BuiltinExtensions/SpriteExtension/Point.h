/** \file
 *  Game Develop
 *  2008-2014 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef GDCORE_POINT_H
#define GDCORE_POINT_H
#include <string>

/**
 * \brief Named point used by Sprite.
 *
 * \ingroup SpriteObjectExtension
 */
class GD_CORE_API Point
{
public:
    Point(const std::string & name_);
    virtual ~Point() {};

    /**
     * Change point name
     */
    void SetName(const std::string & name_) { name = name_; }

    /**
     * Get point name
     */
    const std::string & GetName() const { return name; }

    /**
     * Change point position.
     */
    void SetXY(int x_, int y_) { x = x_;y = y_; }

    /**
     * Change point X position.
     */
    void SetX(int x_) { x = x_; }

    /**
     * Change point Y position.
     */
    void SetY(int y_) { y = y_; }

    /**
     * Get point X position.
     */
    int GetX() const { return x; }

    /**
     * Get point Y position.
     */
    int GetY() const { return y; }

private:
    std::string name;
    int x;
    int y;
};

#endif // GDCORE_POINT_H

