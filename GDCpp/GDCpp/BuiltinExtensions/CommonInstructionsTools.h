/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef COMMONINSTRUCTIONS_H
#define COMMONINSTRUCTIONS_H

#include <string>
#include "GDCpp/String.h"

namespace GDpriv
{

namespace CommonInstructions
{

/**
 * Generate a random number between 0 and max
 */
double GD_API Random(int max);

/**
 * Logical negation
 * \return !param
 */
bool GD_API LogicalNegation(bool param);

/**
 * Convert the string to a double.
 * \warning This function is meant to be used only in GD events generated code.
 */
double GD_API ToDouble( const gd::String & str );

/**
 * Convert the double to a string.
 * \warning This function is meant to be used only in GD events generated code.
 */
gd::String GD_API ToString( double number );

/**
 * Convert the double to a string, disabling scientific notation.
 * \warning This function is meant to be used only in GD events generated code.
 */
gd::String GD_API LargeNumberToString( double number );

/**
 * Convert the angle from degrees to radians
 * \warning This function is meant to be used only in GD events generated code.
 */
double GD_API ToRad( double angle );

/**
 * Convert the angle from radians to degrees.
 * \warning This function is meant to be used only in GD events generated code.
 */
double GD_API ToDeg( double angle );

}

}
#endif // COMMONINSTRUCTIONS_H
