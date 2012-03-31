/** \file
 *  Game Develop
 *  2008-2012 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef COMMONTOOLS_H
#define COMMONTOOLS_H
#include <string>
#include <sstream>
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
 * \ingroup CommonProgrammingTools
 */
template<>
std::string GD_CORE_API ToString( const wxString & value );

}

#endif // COMMONTOOLS_H
