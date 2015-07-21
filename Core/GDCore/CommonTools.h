/*
 * GDevelop Core
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef COMMONTOOLS_H
#define COMMONTOOLS_H
#include <algorithm>
#include <cmath>
#include <iterator>
#include <sstream>
#include <string>
#include <vector>
#include "Utf8/utf8.h"
#include <SFML/System/String.hpp>

#ifdef __GNUC__
    #define GD_DEPRECATED    __attribute__((deprecated))
#else
    #define GD_DEPRECATED
#endif

class wxString;

namespace gd
{

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
 * Example:
 * \code
 * std::string five = gd::ToString(5);
 * \endcode
 * \ingroup CommonProgrammingTools
 */
template<typename T>
std::string ToString( const T & value )
{
    std::ostringstream oss;
    oss << value;
    return oss.str();
}

/**
 * Convert anything to an integer.
 * Example:
 * \code
 * std::string five = "5";
 * int number = ToInt(five);
 * \endcode
 * \ingroup CommonProgrammingTools
 */
template<typename T>
int ToInt( const T & value )
{
    int i;
    std::istringstream oss(value);
    oss >> i;
    return i;
}

/**
 * Convert anything to a float
 * \ingroup CommonProgrammingTools
 */
template<typename T>
float ToFloat( const T & value )
{
    float f;
    std::istringstream oss(value);
    oss >> f;
    return f;
}

/**
 * Specialization for converting wxString to a std::string
 * \deprecated Use ToLocaleString to convert a wxString to a locale std::string or gd::utf8::FromWxString to convert to an UTF8 std::string instead. If used, this function will produce a warning at runtime as it might cause problems with UTF8 strings.
 * \ingroup CommonProgrammingTools
 */
template<>
std::string GD_CORE_API ToString( const wxString & value ) GD_DEPRECATED;

inline double Pi()
{
    return 3.141592653589793238;
}

#ifdef __GNUC__
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline int Round(float x)
{
    return round(x);
}
#else
/**
 * Round the number to the nearest integer
 * \ingroup CommonProgrammingTools
 */
inline double Round( double d )
{
    return ( d >= 0 ? floor(d+0.5) : ceil(d-0.5) );
}
#endif

}

#endif // COMMONTOOLS_H
