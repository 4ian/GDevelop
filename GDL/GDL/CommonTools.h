/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef STDALGO_H_INCLUDED
#define STDALGO_H_INCLUDED

#include <string>
#include <sstream>
#include <iostream>
#include <vector>
#include "GDL/Image.h"
#include <cmath>
#if defined(GD_IDE_ONLY)
#include <wx/string.h>
#endif

using namespace std;

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

/**
 * Convert anything to an integer.
 * Example :
 * \code
 * std::string five = 5;
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

#if defined(GD_IDE_ONLY)
/**
 * Specialization for converting wxString to a std::string
 * \ingroup CommonProgrammingTools
 */
template<>
std::string GD_API ToString( const wxString & value );
#endif

/**
 * Replace all spaces by tildes in a string
 */
std::string ReplaceSpacesByTildes(std::string text);

int Spliter(string Tableau[] , string chaine, char separateur, int longueur = -1);
int SpliterV(vector <string> *Tableau , string chaine, char separateur);
int SpliterVInt(vector <int> *Tableau , string chaine, char separateur);

template <typename T>
vector <T> SpliterStringToVector( const string & str, char separator )
{
    istringstream iss( str );
    string token;
    vector <T> array;

    unsigned int i = 0;
    while ( std::getline( iss, token, separator ) )
    {
        array.push_back( T(token) );
        ++i;
    }

    return array;
}

/**
 * Functor testing if a string is empty
 */
struct StringEmpty
{
   bool operator ()(const string & a) const
   {
      return a.empty();
   }
};

#endif // STDALGO_H_INCLUDED
