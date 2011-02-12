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

using namespace std;

/**
 * Find an image in a list
 */
int GD_API FindImage( const vector < Image > & vector, const string & name );

#ifdef __GNUC__
/**
 * Round the number to the nearest integer
 * \ingroup Common programming tools
 */
inline int GDRound(float x)
{
    return round(x);
}
#else
/**
 * Round the number to the nearest integer
 * \ingroup Common programming tools
 */
inline double GDRound( double d )
{
return floor( d + 0.5 );
}
#endif

/**
 * Convert anything to an integer
 * \ingroup Common programming tools
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
 * \ingroup Common programming tools
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
 * \ingroup Common programming tools
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
 * \ingroup Common programming tools
 */
template<typename T>
std::string ToString( const T & value )
{
    std::ostringstream oss;
    oss << value;
    return oss.str();
}

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
