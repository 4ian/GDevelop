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
#include <complex>
#include "GDL/Log.h"
#include "GDL/Event.h"

/**
 * A force is a simple vector with also a "Clearing" member.
 */
class GD_API Force
{
    public:

    Force() : internalComplex(0.0f,0.0f), clearing(0) {}

    inline float GetX() const
    {
        return internalComplex.real();
    }

    inline float GetY() const
    {
        return internalComplex.imag();
    }

    inline float GetAngle() const
    {
        return -arg(internalComplex)*180/PI;
    }

    inline float GetLength() const
    {
        return abs(internalComplex);
    }

    inline float GetClearing() const
    {
        return clearing;
    }

    inline void SetX(float x_)
    {
        internalComplex = std::complex<float>(x_ , internalComplex.imag());
    }

    inline void SetY(float y_)
    {
        internalComplex = std::complex<float>(internalComplex.real() , y_);
    }

    inline void SetAngle(float angle_)
    {
        internalComplex = polar(abs(internalComplex) , angle_*PI/180);
    }

    inline void SetLength(float length_)
    {
        internalComplex = polar(length_, arg(internalComplex));
    }

    void SetClearing(float clearing_)
    {
        clearing = clearing_;
    }

    private:

    std::complex<float> internalComplex;
    float clearing;

    /*mutable bool ALneedUpdate;
    mutable bool XYneedUpdate;

    void CalculXY();
    void CalculAL();*/

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
