/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef POINT_H
#define POINT_H
#include <string>

using namespace std;

/**
 * Named point used for Sprites.
 */
class GD_API Point
{
    public:
        Point(const string & name_);
        virtual ~Point();

        inline void SetName(string name_) { name = name_; }
        inline string GetName() const { return name; }

        inline void SetXY(int x_, int y_) { x = x_;y = y_; }
        inline void SetX(int x_) { x = x_; }
        inline void SetY(int y_) { y = y_; }
        inline int GetX() const { return x; }
        inline int GetY() const { return y; }

    private:
        string name;
        int x;
        int y;
};

#endif // POINT_H
