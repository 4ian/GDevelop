/**
 *  Game Develop
 *  2008-2010 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef FORCE_H_INCLUDED
#define FORCE_H_INCLUDED

#include <iostream>
#include <vector>
#include <string>
#include <cmath>
#include "GDL/Log.h"
#include "GDL/Event.h"

class GD_API Force
{
    public:

    Force();

    float GetX() const;
    float GetY() const;
    float GetAngle() const;
    float GetLength() const;
    float GetClearing() const;

    void SetX(float x_);
    void SetY(float y_);
    void SetAngle(float angle_);
    void SetLength(float length_);
    void SetClearing(float clearing_);

    private:

    mutable float X;
    mutable float Y;
    mutable float angle;
    mutable float length;
    float clearing;

    mutable bool ALneedUpdate;
    mutable bool XYneedUpdate;

    static const float PI;

};

struct ForceNulle
{
    bool operator ()( const Force &A ) const
    {
        return A.GetLength() == 0;
    }
};


#endif // FORCE_H_INCLUDED
