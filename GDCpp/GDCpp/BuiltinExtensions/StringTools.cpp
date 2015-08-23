/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/String.h"

using namespace std;

namespace GDpriv
{
namespace StringTools
{

/**
 * Expression function for getting a substring from a string
 */
gd::String GD_API SubStr(const gd::String & str, size_t start, size_t length )
{
    if ( start < str.size() )
        return str.substr(start, length);

    return "";
}

/**
 * Expression function for getting a character from a string
 */
gd::String GD_API StrAt(const gd::String & str, size_t pos )
{
    if ( pos < str.size() )
        return str.substr(pos, 1);

    return "";
}

/**
 * Expression function for getting a character from its codepoint
 */
gd::String GD_API FromCodePoint(int32_t codepoint)
{
    return gd::String::FromUTF32( std::u32string( 1, static_cast<char32_t>(codepoint) ) );
}

/**
 * Expression function for getting the uppercased version of a string
 */
gd::String GD_API ToUpperCase(const gd::String & str)
{
    return str.UpperCase();
}

/**
 * Expression function for getting the uppercased version of a string
 */
gd::String GD_API ToLowerCase(const gd::String & str)
{
    return str.LowerCase();
}

/**
 * Expression function for getting a substring from a string
 */
std::size_t GD_API StrLen(const gd::String & str)
{
    return str.size();
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrFind(const gd::String & str, const gd::String & findwhat)
{
    size_t pos = str.find(findwhat);

    if ( pos != gd::String::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrRFind(const gd::String & str, const gd::String & findwhat)
{
    size_t pos = str.rfind(findwhat);

    if ( pos != gd::String::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrFindFrom(const gd::String & str, const gd::String & findwhat, std::size_t start)
{
    size_t pos = str.find(findwhat, start);

    if ( pos != gd::String::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrRFindFrom(const gd::String & str, const gd::String & findwhat, std::size_t start)
{
    size_t pos = str.rfind(findwhat, start);

    if ( pos != gd::String::npos ) return pos;
    return -1;
}

gd::String GD_API NewLine()
{
    return "\n";
};

}
}
