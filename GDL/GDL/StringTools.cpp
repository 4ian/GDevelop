/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#include <string>
#include "GDL/RuntimeScene.h"

/**
 * Expression function for getting a substring from a string
 */
string GD_API GDExpSubStr(const std::string & str, size_t start, size_t length )
{
    if ( start < str.length() )
        return str.substr(start, length);

    return "";
}

/**
 * Expression function for getting a character from a string
 */
string GD_API GDExpStrAt(const std::string & str, size_t pos )
{
    if ( pos < str.length() )
        return str.substr(pos, 1);

    return "";
}

/**
 * Expression function for getting a substring from a string
 */
unsigned int GD_API GDExpStrLen(const std::string & str)
{
    return str.length();
}

/**
 * Expression function for finding a string in another
 */
int GD_API GDExpStrFind(const std::string & str, const std::string & findwhat)
{
    size_t pos = str.find(findwhat);

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API GDExpStrRFind(const std::string & str, const std::string & findwhat)
{
    size_t pos = str.rfind(findwhat);

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API GDExpStrFindFrom(const std::string & str, const std::string & findwhat, unsigned int start)
{
    size_t pos = str.find(findwhat, start);

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API GDExpStrRFindFrom(const std::string & str, const std::string & findwhat, unsigned int start)
{
    size_t pos = str.rfind(findwhat, start);

    if ( pos != string::npos ) return pos;
    return -1;
}
