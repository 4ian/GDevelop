/**

GDevelop - Function Extension
Copyright (c) 2008-2015 Florian Rival (Florian.Rival@gmail.com)
This project is released under the MIT License.
*/
#include "FunctionTools.h"
#include "GDCpp/profile.h"

namespace GDpriv
{
namespace FunctionTools
{

std::string GD_EXTENSION_API GetSafelyStringFromVector(std::vector<std::string> & list, unsigned int index )
{
    if (index < list.size()) return list[index];
    return "";
}

}
}

