/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDCpp/Runtime/Log.h"
#include "GDCpp/Runtime/Force.h"

float const Force::PI = 3.14159265;


Force::Force() :
    x(0),
    y(0),
    angle(0),
    length(0),
    clearing(0),
    isDirty(false)
{
}

Force::Force(const Force & other) :
    x(other.x),
    y(other.y),
    angle(other.angle),
    length(other.length),
    clearing(other.clearing),
    isDirty(other.isDirty)
{
}

Force::Force(float x_, float y_, float clearing_) :
    x(x_),
    y(y_),
    clearing(clearing_),
    isDirty(true)
{

}

float Force::GetAngle() const
{
    if ( isDirty )
    {
        angle = atan2(y,x)*180.0/PI;
        length = sqrt( x*x + y*y );
        isDirty = false;
    }

    return angle;
}
float Force::GetLength() const
{
    if ( isDirty )
    {
        angle = atan2(y,x)*180.0/PI;
        length = sqrt( x*x + y*y );
        isDirty = false;
    }

    return length;
}

void Force::SetX(float x_)
{
    if ( x != x_ )
    {
        isDirty = true;
        x = x_;
    }
}
void Force::SetY(float y_)
{
    if ( y != y_ )
    {
        isDirty = true;
        y = y_;
    }
}
void Force::SetAngle(float angle_)
{
    if ( isDirty )
    {
        length = sqrt( x*x + y*y );
        isDirty = false;
    }

    angle = angle_;

    x = cos(angle/180.0*PI)*length;
    y = sin(angle/180.0*PI)*length;
}
void Force::SetLength(float length_)
{
    if ( isDirty )
    {
        angle = atan2(y,x)*180/PI;
        isDirty = false;
    }

    length = length_;

    x = cos(angle/180.0*PI)*length;
    y = sin(angle/180.0*PI)*length;
}
void Force::SetClearing(float clearing_)
{
    clearing = clearing_;
}

