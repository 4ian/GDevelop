/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDL/Log.h"
#include "GDL/Force.h"

float const Force::PI = 3.14159265;

Force::Force() :
X(0),
Y(0),
angle(0),
length(0),
clearing(0),
ALneedUpdate(false),
XYneedUpdate(false)
{
}

float Force::GetX() const
{
    if ( XYneedUpdate )
    {
        X = length * ( cos( angle * PI / 180 ) );
        Y = length * ( sin( angle * PI / 180 ) );
        XYneedUpdate = false;
    }

    return X;
}

float Force::GetY() const
{
    if ( XYneedUpdate )
    {
        X = length * ( cos( angle * PI / 180 ) );
        Y = length * ( sin( angle * PI / 180 ) );
        XYneedUpdate = false;
    }

    return Y;
}
float Force::GetAngle() const
{
    if ( ALneedUpdate )
    {
        angle = atan2(Y,X)*180/PI;
        length = sqrt( X*X + Y*Y );
        ALneedUpdate = false;
    }

    return angle;
}
float Force::GetLength() const
{
    if ( ALneedUpdate )
    {
        angle = atan2(Y,X)*180/PI;
        length = sqrt( X*X + Y*Y );
        ALneedUpdate = false;
    }

    return length;
}
float Force::GetClearing() const
{
    return clearing;
}

void Force::SetX(float x_)
{
    if ( X != x_ )
    {
        ALneedUpdate = true;
        X = x_;
    }
}
void Force::SetY(float y_)
{
    if ( Y != y_ )
    {
        ALneedUpdate = true;
        Y = y_;
    }
}
void Force::SetAngle(float angle_)
{
    if ( angle != angle_ )
    {
        XYneedUpdate = true;
        angle = angle_;
    }
}
void Force::SetLength(float length_)
{
    if ( length != length_ )
    {
        XYneedUpdate = true;
        length = length_;
    }
}
void Force::SetClearing(float clearing_)
{
    clearing = clearing_;
}

