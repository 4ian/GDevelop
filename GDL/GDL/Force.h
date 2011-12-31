/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef FORCE_H_INCLUDED
#define FORCE_H_INCLUDED

/**
 * \brief Represents a force to be applied on an object.
 * Can have an X/Y component or an angle/length.
 */
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

#endif // FORCE_H_INCLUDED
