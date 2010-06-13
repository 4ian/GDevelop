/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDL/Log.h"
#include "GDL/Event.h"
#include "GDL/gpl.h"
#include "GDL/Force.h"

const float Force::PI = 3.14159265;
/*
Force::Force() :
X(0),
Y(0),
angle(0),
length(0),
clearing(0),
ALneedUpdate(false),
XYneedUpdate(false)
{
}*/
/*
////////////////////////////////////////////////////////////
/// Calcul de X et Y en fonction de l'angle et la longueur de la force
////////////////////////////////////////////////////////////
void Force::CalculXY()
{
    X = length * ( cos( angle * PI / 180 ) );
    Y = length * ( sin( angle * PI / 180 ) );

    return;
}

////////////////////////////////////////////////////////////
/// Calcul de l'angle et la longueur de la force en fonction de X et Y
////////////////////////////////////////////////////////////
void Force::CalculAL()
{
    angle = atan2(Y,X);
    angle *= 180 / PI;
    length = gpl::sqrt( X*X + Y*Y );

    return;
}

int Force::GetX() const
{
    if ( XYneedUpdate )
    {
        X = length * ( cos( angle * PI / 180 ) );
        Y = length * ( sin( angle * PI / 180 ) );
        XYneedUpdate = false;
    }

    return X;
}

int Force::GetY() const
{
    if ( XYneedUpdate )
    {
        X = length * ( cos( angle * PI / 180 ) );
        Y = length * ( sin( angle * PI / 180 ) );
        XYneedUpdate = false;
    }

    return Y;
}
int Force::GetAngle() const
{
    if ( ALneedUpdate )
    {
        angle = atan2(Y,X)*180/PI;
        length = gpl::sqrt( X*X + Y*Y );
        ALneedUpdate = false;
    }

    return angle;
}
int Force::GetLength() const
{
    if ( ALneedUpdate )
    {
        angle = atan2(Y,X)*180/PI;
        length = gpl::sqrt( X*X + Y*Y );
        ALneedUpdate = false;
    }

    return length;
}
float Force::GetClearing() const
{
    return clearing;
}

void Force::SetX(int x_)
{
    if ( X != x_ )
    {
        ALneedUpdate = true;
        X = x_;
    }
}
void Force::SetY(int y_)
{
    if ( Y != y_ )
    {
        ALneedUpdate = true;
        Y = y_;
    }
}
void Force::SetAngle(int angle_)
{
    if ( angle != angle_ )
    {
        XYneedUpdate = true;
        angle = angle_;
    }
}
void Force::SetLength(int length_)
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
}*/
