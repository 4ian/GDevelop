/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 *
 * This header is automatically include in CommonTools.
 * When writing code that will not be exposed to GD events generated code, you can use CommonTools.h
 * When writing code that will be exposed to GD events generated code, use this header.
 * GD events generated code will use this file : Include as few function as possible to keep the header lightweight.
 */

#ifndef LIGHTWEIGHTCOMMONTOOLS_H_INCLUDED
#define LIGHTWEIGHTCOMMONTOOLS_H_INCLUDED
#include <sstream>
#include <cmath>

/**
 * Convert anything to a double
 * \ingroup CommonProgrammingTools
 */
template<typename T>
double ToDouble( const T & value )
{
    double d;
    std::istringstream oss(value);
    oss >> d;
    return d;
}

/**
 * Convert anything to a std::string
 * \ingroup CommonProgrammingTools
 */
template<typename T>
std::string ToString( const T & value )
{
    std::ostringstream oss;
    oss << value;
    return oss.str();
}


#ifdef __GNUC__
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline int GDRound(float x)
{
    return round(x);
}
#else
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline double GDRound( double d )
{
return floor( d + 0.5 );
}
#endif

#endif // LIGHTWEIGHTCOMMONTOOLS_H_INCLUDED
