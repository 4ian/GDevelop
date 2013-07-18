/** \file
 *  Game Develop
 *  2008-2013 Florian Rival (Florian.Rival@gmail.com)
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

std::string GD_API SubStr(const std::string & str, size_t start, size_t length );
std::string GD_API StrAt(const std::string & str, size_t pos );
std::string GD_API NewLine() { return "\n"; };
unsigned int GD_API StrLen(const std::string & str);
int GD_API StrFind(const std::string & str, const std::string & findwhat);
int GD_API StrRFind(const std::string & str, const std::string & findwhat);
int GD_API StrFindFrom(const std::string & str, const std::string & findwhat, unsigned int start);
int GD_API StrRFindFrom(const std::string & str, const std::string & findwhat, unsigned int start);

}

}
#endif // STRINGEXPRESSIONS_H

