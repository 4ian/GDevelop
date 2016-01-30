/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef FORCE_H_INCLUDED
#define FORCE_H_INCLUDED

/**
 * \brief Represents a force to be applied on an object.
 *
 * \ingroup GameEngine
 */
class GD_API Force
{
public:

    Force();
    Force(const Force & other);
    Force(float x, float y, float clearing);

    float GetX() const { return x; };
    float GetY() const { return y; };
    float GetAngle() const;
    float GetLength() const;
    float GetClearing() const { return clearing; };

    void SetX(float x_);
    void SetY(float y_);
    void SetAngle(float angle_);
    void SetLength(float length_);
    void SetClearing(float clearing_);

private:

    float x;
    float y;
    mutable float angle;
    mutable float length;
    float clearing;

    mutable bool isDirty;

    static const float PI;
};

#endif // FORCE_H_INCLUDED

