/*
 * GDevelop C++ Platform
 * Copyright 2008-2015 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#include <string>
#include "GDCpp/RuntimeScene.h"
#include "GDCpp/Utf8Tools.h"

using namespace std;

namespace GDpriv
{
namespace StringTools
{

/**
 * Expression function for getting a substring from a string
 */
string GD_API SubStr(const std::string & str, size_t start, size_t length )
{
    if ( start < gd::utf8::StrLength(str) )
        return gd::utf8::SubStr(str, start, length);

    return "";
}

/**
 * Expression function for getting a character from a string
 */
string GD_API StrAt(const std::string & str, size_t pos )
{
    if ( pos < gd::utf8::StrLength(str) )
        return gd::utf8::SubStr(str, pos, 1);

    return "";
}

/**
 * Expression function for getting a substring from a string
 */
unsigned int GD_API StrLen(const std::string & str)
{
    return gd::utf8::StrLength(str);
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrFind(const std::string & str, const std::string & findwhat)
{
    size_t pos = gd::utf8::Find(str, findwhat);

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrRFind(const std::string & str, const std::string & findwhat)
{
    size_t pos = gd::utf8::RFind(str, findwhat);

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrFindFrom(const std::string & str, const std::string & findwhat, unsigned int start)
{
    size_t pos = gd::utf8::Find(str, findwhat, start);

    if ( pos != string::npos ) return pos;
    return -1;
}

/**
 * Expression function for finding a string in another
 */
int GD_API StrRFindFrom(const std::string & str, const std::string & findwhat, unsigned int start)
{
    size_t pos = gd::utf8::RFind(str, findwhat, start);

    if ( pos != string::npos ) return pos;
    return -1;
}

std::string GD_API NewLine()
{
    return "\n";
};

}
}
