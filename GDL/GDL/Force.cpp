/**
 *  Game Develop
 *      Player
 *
 *  Par Florian "4ian" Rival
 *
 */
/**
 *  Force.cpp
 *
 *  Classe pour décrire une force sur un objet ( ou autre )
 *  Permet de calculer aussi un angle/longueur depuis ses coordonées
 *  ou l'inverse.
 */

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDL/Log.h"
#include "GDL/Event.h"
#include "GDL/gpl.h"
#include "GDL/Force.h"

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
        length = gpl::sqrt( X*X + Y*Y );
        ALneedUpdate = false;
    }

    return angle;
}
float Force::GetLength() const
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
