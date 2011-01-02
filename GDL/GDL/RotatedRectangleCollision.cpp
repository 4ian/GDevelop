/**
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <SFML/Graphics.hpp>
#include "RotatedRectangleCollision.h"
#include "RotatedRectangle.h"
#include <iostream>

inline void RotateVector2DClockwise(sf::Vector2f * v, float angle)
{
    float t,
          cosa = cos(angle),
          sina = sin(angle);
    t = v->x;
    v->x = t*cosa + v->y*sina;
    v->y = -t*sina + v->y*cosa;
}

// Rotated Rectangles Collision Detection, Oren Becker, 2001
int GD_API RotatedRectanglesCollisionTest(RotatedRectangle * rr1, RotatedRectangle * rr2)
{
    sf::Vector2f A, B,   // vertices of the rotated rr2
              center,      // center of rr2
              BL, TR; // vertices of rr2 (bottom-left, top-right)

    float angle = rr1->angle - rr2->angle, // orientation of rotated rr1
          cosa = cos(angle),           // precalculated trigonometic -
          sina = sin(angle);           // - values for repeated use

    float t, x, a;      // temporary variables for various uses
    float dx;           // deltaX for linear equations
    float ext1, ext2;   // min/max vertical values

// move rr2 to make rr1 cannonic
    center = rr2->center;
    center -= rr1->center;

// rotate rr2 clockwise by rr2->angle to make rr2 axis-aligned
    RotateVector2DClockwise(&center, rr2->angle);

// calculate vertices of (moved and axis-aligned := 'ma') rr2
    BL = TR = center;
    BL -= rr2->size;
    TR += rr2->size;

// calculate vertices of (rotated := 'r') rr1
    A.x = -rr1->size.y*sina;
    B.x = A.x;
    t = rr1->size.x*cosa;
    A.x += t;
    B.x -= t;
    A.y =  rr1->size.y*cosa;
    B.y = A.y;
    t = rr1->size.x*sina;
    A.y += t;
    B.y -= t;

    t = sina*cosa;

// verify that A is vertical min/max, B is horizontal min/max
    if (t < 0)
    {
        t = A.x;
        A.x = B.x;
        B.x = t;
        t = A.y;
        A.y = B.y;
        B.y = t;
    }

// verify that B is horizontal minimum (leftest-vertex)
    if (sina < 0)
    {
        B.x = -B.x;
        B.y = -B.y;
    }

// if rr2(ma) isn't in the horizontal range of
// colliding with rr1(r), collision is impossible
    if (B.x > TR.x || B.x > -BL.x) return 0;

// if rr1(r) is axis-aligned, vertical min/max are easy to get
    if (t == 0)
    {
        ext1 = A.y;
        ext2 = -ext1;
    }
// else, find vertical min/max in the range [BL.x, TR.x]
    else
    {
        x = BL.x-A.x;
        a = TR.x-A.x;
        ext1 = A.y;
        // if the first vertical min/max isn't in (BL.x, TR.x), then
        // find the vertical min/max on BL.x or on TR.x
        if (a*x > 0)
        {
            dx = A.x;
            if (x < 0)
            {
                dx -= B.x;
                ext1 -= B.y;
                x = a;
            }
            else
            {
                dx += B.x;
                ext1 += B.y;
            }
            ext1 *= x;
            ext1 /= dx;
            ext1 += A.y;
        }

        x = BL.x+A.x;
        a = TR.x+A.x;
        ext2 = -A.y;
        // if the second vertical min/max isn't in (BL.x, TR.x), then
        // find the local vertical min/max on BL.x or on TR.x
        if (a*x > 0)
        {
            dx = -A.x;
            if (x < 0)
            {
                dx -= B.x;
                ext2 -= B.y;
                x = a;
            }
            else
            {
                dx += B.x;
                ext2 += B.y;
            }
            ext2 *= x;
            ext2 /= dx;
            ext2 -= A.y;
        }
    }

// check whether rr2(ma) is in the vertical range of colliding with rr1(r)
// (for the horizontal range of rr2)
    return !((ext1 < BL.y && ext2 < BL.y) ||
             (ext1 > TR.y && ext2 > TR.y));
}

