/** \file
 *  Game Develop
 *  2008-2011 Florian Rival (Florian.Rival@gmail.com)
 */

#ifndef STRINGEXPRESSIONS_H
#define STRINGEXPRESSIONS_H

#include <string>
class RuntimeScene;

string GD_API GDExpSubStr(const std::string & str, size_t start, size_t length );
string GD_API GDExpStrAt(const std::string & str, size_t pos );
unsigned int GD_API GDExpStrLen(const std::string & str);
int GD_API GDExpStrFind(const std::string & str, const std::string & findwhat);
int GD_API GDExpStrRFind(const std::string & str, const std::string & findwhat);
int GD_API GDExpStrFindFrom(const std::string & str, const std::string & findwhat, unsigned int start);
int GD_API GDExpStrRFindFrom(const std::string & str, const std::string & findwhat, unsigned int start);
#endif // STRINGEXPRESSIONS_H
