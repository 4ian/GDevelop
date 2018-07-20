/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights
 * reserved. This project is released under the MIT License.
 */
#ifndef COMMONINSTRUCTIONS_H
#define COMMONINSTRUCTIONS_H

#include <string>
#include "GDCpp/Runtime/String.h"

namespace GDpriv {

namespace CommonInstructions {

/**
 * Generate a random integer between 0 and max
 */
double GD_API Random(int max);

/**
 * Generate a random integer between min and max
 */
double GD_API RandomInRange(int min, int max);

/**
 * Generate a random float between 0 and max
 */
double GD_API RandomFloat(float max);

/**
 * Generate a random float between min and max
 */
double GD_API RandomFloatInRange(float min, float max);

/**
 * Generate a random number between min and max in steps
 */
double GD_API RandomWithStep(float min, float max, float step);

/**
 * Logical negation
 * \return !param
 */
bool GD_API LogicalNegation(bool param);

/**
 * Convert the string to a double.
 * \warning This function is meant to be used only in GD events generated code.
 */
double GD_API ToDouble(const gd::String& str);

/**
 * Convert the double to a string.
 * \warning This function is meant to be used only in GD events generated code.
 */
gd::String GD_API ToString(double number);

/**
 * Convert the double to a string, disabling scientific notation.
 * \warning This function is meant to be used only in GD events generated code.
 */
gd::String GD_API LargeNumberToString(double number);

/**
 * Convert the angle from degrees to radians
 * \warning This function is meant to be used only in GD events generated code.
 */
double GD_API ToRad(double angle);

/**
 * Convert the angle from radians to degrees.
 * \warning This function is meant to be used only in GD events generated code.
 */
double GD_API ToDeg(double angle);

}  // namespace CommonInstructions

}  // namespace GDpriv
#endif  // COMMONINSTRUCTIONS_H
