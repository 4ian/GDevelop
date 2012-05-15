/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef POINT_H
#define POINT_H
#include <string>

using namespace std;

/**
 * \brief Named point used by Sprite.
 *
 * \ingroup SpriteObjectExtension
 */
class GD_API Point
{
    public:
        Point(const string & name_);
        virtual ~Point() {};

        /**
         * Change point name
         */
        inline void SetName(string name_) { name = name_; }

        /**
         * Get point name
         */
        inline string GetName() const { return name; }

        /**
         * Change point position.
         */
        inline void SetXY(int x_, int y_) { x = x_;y = y_; }

        /**
         * Change point X position.
         */
        inline void SetX(int x_) { x = x_; }

        /**
         * Change point Y position.
         */
        inline void SetY(int y_) { y = y_; }

        /**
         * Get point X position.
         */
        inline int GetX() const { return x; }

        /**
         * Get point Y position.
         */
        inline int GetY() const { return y; }

    private:
        string name;
        int x;
        int y;
};

#endif // POINT_H
