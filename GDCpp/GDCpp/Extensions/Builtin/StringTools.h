/*
 * GDevelop C++ Platform
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
#ifndef STRINGEXPRESSIONS_H
#define STRINGEXPRESSIONS_H

#include <string>
class RuntimeScene;

namespace GDpriv
{

/**
 * \brief Tools only meant to be used by GD events generated code
 */
namespace StringTools
{

gd::String GD_API SubStr(const gd::String & str, size_t start, size_t length );
gd::String GD_API StrAt(const gd::String & str, size_t pos );
gd::String GD_API NewLine();
gd::String GD_API FromCodePoint(int32_t codepoint);
gd::String GD_API ToUpperCase(const gd::String & str);
gd::String GD_API ToLowerCase(const gd::String & str);
std::size_t GD_API StrLen(const gd::String & str);
int GD_API StrFind(const gd::String & str, const gd::String & findwhat);
int GD_API StrRFind(const gd::String & str, const gd::String & findwhat);
int GD_API StrFindFrom(const gd::String & str, const gd::String & findwhat, std::size_t start);
int GD_API StrRFindFrom(const gd::String & str, const gd::String & findwhat, std::size_t start);

}

}
#endif // STRINGEXPRESSIONS_H
